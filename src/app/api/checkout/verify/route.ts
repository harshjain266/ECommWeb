import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validators";
import { findCart } from "@/lib/cart";

/**
 * Confirm a payment handed back by Razorpay Checkout.
 *
 * The browser is not trusted here: the success payload is only accepted once
 * its HMAC signature verifies against our key secret. Without that check,
 * anyone could POST a fabricated success and get a paid order.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 422 });
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) {
    return NextResponse.json({ error: "Unknown payment" }, { status: 404 });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    signature,
  });

  if (!valid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        razorpayPaymentId,
        errorCode: "SIGNATURE_MISMATCH",
        errorDescription: "Checkout signature did not verify",
      },
    });
    return NextResponse.json(
      { error: "We could not verify that payment" },
      { status: 400 },
    );
  }

  // The webhook may already have captured this one; treat it as idempotent.
  if (payment.status === "CAPTURED") {
    return NextResponse.json({
      ok: true,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        razorpayPaymentId,
        razorpaySignature: signature,
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });

    // Draw down stock only now that money has actually been taken.
    for (const item of payment.order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });

  // The bag has become an order; empty it.
  const cart = await findCart();
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({
    ok: true,
    orderId: payment.orderId,
    orderNumber: payment.order.orderNumber,
  });
}
