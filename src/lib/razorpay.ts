import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Razorpay is only constructed when keys exist, so the rest of the app
 * (browsing, cart, admin) still runs on a fresh clone with no keys set.
 * Call `assertRazorpay()` at the start of any payment route.
 */
let client: Razorpay | null = null;

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay(): Razorpay {
  if (!razorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
    );
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

/**
 * Verify the checkout handback. Razorpay signs
 * `${razorpay_order_id}|${razorpay_payment_id}` with the key secret; a
 * mismatch means the client-side success payload was forged and the order
 * must NOT be marked paid.
 */
export function verifyPaymentSignature(args: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, args.signature);
}

/**
 * Verify a webhook delivery. Webhooks are signed with the *webhook* secret
 * over the raw request body -- so the route must read `await req.text()` and
 * never `req.json()`, since re-serializing would change the bytes.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
