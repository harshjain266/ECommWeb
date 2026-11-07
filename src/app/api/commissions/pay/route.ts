import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getRazorpay, publicKeyId, razorpayConfigured } from "@/lib/razorpay";
import { formatFee } from "@/lib/jewellery";

/**
 * Raise a Razorpay order for a commission's design fee.
 *
 * The amount is read from the commission row -- never from the request --
 * because `feePaise` is what that customer was quoted at the moment they sent
 * the brief, and a client that could name its own figure could pay ₹1.
 *
 * Reference plus email, rather than reference alone: references run in
 * sequence (SK-C-0007), so anyone could walk them. Nothing about a commission
 * is returned until the caller proves they know the address on it.
 */
const schema = z.object({
  reference: z.string().min(3).max(40),
  email: z.string().email(),
});

export async function POST(req: Request) {
  if (!razorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Payments are not switched on yet. Call the atelier and we will take it over the phone.",
      },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment request" }, { status: 422 });
  }

  const commission = await prisma.commission.findUnique({
    where: { reference: parsed.data.reference.trim().toUpperCase() },
  });

  // One message for "no such reference" and for "wrong email", so this cannot
  // be used to find out which references exist.
  if (
    !commission ||
    commission.email.toLowerCase() !== parsed.data.email.trim().toLowerCase()
  ) {
    return NextResponse.json(
      { error: "We could not find that commission against this email address." },
      { status: 404 },
    );
  }

  if (commission.feePaid) {
    return NextResponse.json(
      { error: `The ${formatFee(commission.feePaise)} design fee is already paid.`, paid: true },
      { status: 409 },
    );
  }

  try {
    const rzp = getRazorpay();

    // Reuse the order already raised for this commission if there is one: an
    // abandoned payment window is the normal case, and a fresh order per
    // attempt litters the Razorpay dashboard with phantom ₹999s.
    let razorpayOrderId = commission.razorpayOrderId;
    if (razorpayOrderId) {
      const existing = await rzp.orders.fetch(razorpayOrderId).catch(() => null);
      if (!existing || existing.status === "paid" || existing.amount !== commission.feePaise) {
        razorpayOrderId = null;
      }
    }

    if (!razorpayOrderId) {
      const created = await rzp.orders.create({
        // Razorpay speaks paise, which is what we store -- no conversion.
        amount: commission.feePaise,
        currency: "INR",
        receipt: commission.reference,
        notes: { kind: "design-fee", reference: commission.reference },
      });
      razorpayOrderId = created.id;
      await prisma.commission.update({
        where: { id: commission.id },
        data: { razorpayOrderId },
      });
    }

    return NextResponse.json({
      ok: true,
      keyId: publicKeyId(),
      razorpayOrderId,
      amount: commission.feePaise,
      currency: "INR",
      reference: commission.reference,
      prefill: {
        name: commission.name,
        email: commission.email,
        contact: commission.phone,
      },
    });
  } catch (err) {
    console.error("[commission] razorpay order creation failed", err);
    return NextResponse.json(
      { error: "Could not reach the payment provider. Please try again." },
      { status: 502 },
    );
  }
}
