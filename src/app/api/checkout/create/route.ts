import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findCart, toCartView } from "@/lib/cart";
import { getSession } from "@/lib/session";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";
import { checkoutSchema, fieldErrors } from "@/lib/validators";
import { nextOrderNumber } from "@/lib/orders";

/**
 * Begin a checkout.
 *
 * Creates our Order (PENDING) plus a matching Razorpay order, and returns
 * everything the browser needs to open Razorpay Checkout. The amount is taken
 * from the server-side cart -- never from the request body -- so a tampered
 * client cannot set its own price.
 */
export async function POST(req: Request) {
  if (!razorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the delivery details", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const session = await getSession();
  const rawCart = await findCart();
  const cart = toCartView(rawCart);

  if (!rawCart || cart.lines.length === 0) {
    return NextResponse.json({ error: "Your bag is empty" }, { status: 409 });
  }

  // Re-check stock at the moment of checkout: the bag may have sat for days.
  for (const line of cart.lines) {
    if (line.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: line.variantId },
        select: { stock: true, size: true },
      });
      if (!variant || variant.stock < line.quantity) {
        return NextResponse.json(
          {
            error: `${line.name}${
              line.size ? ` (${line.size})` : ""
            } is no longer available in that quantity. Please adjust your bag.`,
          },
          { status: 409 },
        );
      }
    }
  }

  const d = parsed.data;
  const shipAddress = {
    fullName: d.fullName,
    phone: d.phone,
    line1: d.line1,
    line2: d.line2 || null,
    city: d.city,
    state: d.state,
    pincode: d.pincode,
    country: d.country || "India",
  };

  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await nextOrderNumber(tx);

    // Persist an address book entry for signed-in buyers so they need not
    // retype it next time.
    let addressId: string | null = null;
    if (session) {
      const existingCount = await tx.address.count({
        where: { userId: session.userId },
      });
      const addr = await tx.address.create({
        data: { ...shipAddress, userId: session.userId, isDefault: existingCount === 0 },
      });
      addressId = addr.id;
    }

    return tx.order.create({
      data: {
        orderNumber,
        userId: session?.userId ?? null,
        addressId,
        status: "PENDING",
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        total: cart.total,
        email: d.email,
        phone: d.phone,
        notes: d.notes || null,
        shipAddress,
        items: {
          create: cart.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            name: l.name,
            size: l.size,
            imageId: l.imageId,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
        },
      },
    });
  });

  try {
    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({
      // Razorpay speaks paise, which is what we store -- no conversion.
      amount: order.total,
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        status: "CREATED",
        amount: order.total,
        currency: "INR",
      },
    });

    return NextResponse.json({
      ok: true,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: order.total,
      currency: "INR",
      orderId: order.id,
      orderNumber: order.orderNumber,
      prefill: { name: d.fullName, email: d.email, contact: d.phone },
    });
  } catch (err) {
    console.error("razorpay order creation failed", err);
    // Leave no orphan PENDING order the buyer cannot act on.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", notes: "Razorpay order creation failed" },
    });
    return NextResponse.json(
      { error: "Could not reach the payment provider. Please try again." },
      { status: 502 },
    );
  }
}
