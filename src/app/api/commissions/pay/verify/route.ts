import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validators";
import { settleDesignFee } from "@/lib/commission-fee";

/**
 * Confirm a design-fee payment handed back by Razorpay Checkout.
 *
 * The browser is not trusted: the success payload is only accepted once its
 * HMAC verifies against our key secret. Without that, anyone could POST a
 * fabricated success and have a commission marked paid.
 */
export async function POST(req: Request) {
  const parsed = verifyPaymentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 422 });
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const commission = await prisma.commission.findUnique({
    where: { razorpayOrderId },
    select: { reference: true, feePaid: true },
  });
  if (!commission) {
    return NextResponse.json({ error: "Unknown payment" }, { status: 404 });
  }

  if (!verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    return NextResponse.json(
      { error: "We could not verify that payment" },
      { status: 400 },
    );
  }

  // The webhook may already have settled this one; treat it as idempotent.
  await settleDesignFee(razorpayOrderId, razorpayPaymentId);

  return NextResponse.json({ ok: true, reference: commission.reference });
}
