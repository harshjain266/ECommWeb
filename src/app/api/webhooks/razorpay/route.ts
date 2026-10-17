import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay webhook receiver.
 *
 * This is the authoritative settlement path: the browser callback can be lost
 * (tab closed, network dropped mid-redirect), but the webhook still arrives,
 * so an order can be completed without the buyer ever coming back.
 *
 * The body is read as raw text -- the signature is computed over the exact
 * bytes Razorpay sent, so parsing and re-serialising would break it.
 *
 * Configure in the Razorpay dashboard:
 *   URL    <site>/api/webhooks/razorpay
 *   events payment.captured, payment.failed, refund.processed
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(raw, signature)) {
    // 400, not 401: a bad signature is a malformed delivery, and we do not
    // want Razorpay retrying a forged payload forever.
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, any> };
      refund?: { entity?: Record<string, any> };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  const name = event.event ?? "";
  const entity = event.payload?.payment?.entity;

  try {
    if (name === "payment.captured" && entity) {
      await settleCaptured(entity);
    } else if (name === "payment.failed" && entity) {
      await settleFailed(entity);
    } else if (name === "refund.processed") {
      const refund = event.payload?.refund?.entity;
      if (refund?.payment_id) await settleRefund(String(refund.payment_id), refund);
    }
  } catch (err) {
    console.error(`webhook ${name} failed`, err);
    // 500 asks Razorpay to retry, which is what we want for a transient fault.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  // Always acknowledge recognised-but-unhandled events, so they are not retried.
  return NextResponse.json({ ok: true, event: name });
}

async function settleCaptured(entity: Record<string, any>) {
  const razorpayOrderId = String(entity.order_id ?? "");
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return;

  // Idempotency: the client verify route may have got here first.
  if (payment.status === "CAPTURED") return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        razorpayPaymentId: String(entity.id ?? ""),
        method: entity.method ? String(entity.method) : null,
        raw: entity,
      },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });
    for (const item of payment.order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });
}

async function settleFailed(entity: Record<string, any>) {
  const razorpayOrderId = String(entity.order_id ?? "");
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
  if (!payment || payment.status === "CAPTURED") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      razorpayPaymentId: entity.id ? String(entity.id) : null,
      method: entity.method ? String(entity.method) : null,
      errorCode: entity.error_code ? String(entity.error_code) : null,
      errorDescription: entity.error_description
        ? String(entity.error_description)
        : null,
      raw: entity,
    },
  });
}

async function settleRefund(razorpayPaymentId: string, refund: Record<string, any>) {
  const payment = await prisma.payment.findFirst({ where: { razorpayPaymentId } });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", raw: refund },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "REFUNDED" },
    });
  });
}
