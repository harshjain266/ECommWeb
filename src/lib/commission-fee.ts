import "server-only";
import { prisma } from "@/lib/db";
import { sendMail, mailConfigured, atelierInbox, esc } from "@/lib/mail";
import { formatFee } from "@/lib/jewellery";

/**
 * Mark a commission's design fee as paid.
 *
 * Shared by the two paths that can learn about a capture -- the browser
 * handback (`/api/commissions/pay/verify`) and the Razorpay webhook -- which
 * race each other by design: the webhook is the one that still arrives when
 * the customer closes the tab mid-payment. Hence the early return on an
 * already-paid row: whichever gets here second must be a no-op, not a second
 * receipt in the atelier's inbox.
 *
 * Returns the commission when this call was the one that settled it, and
 * `null` when there was nothing to do.
 */
export async function settleDesignFee(
  razorpayOrderId: string,
  razorpayPaymentId: string,
) {
  const commission = await prisma.commission.findUnique({
    where: { razorpayOrderId },
  });
  if (!commission || commission.feePaid) return null;

  const updated = await prisma.commission.update({
    where: { id: commission.id },
    data: {
      feePaid: true,
      feePaidAt: new Date(),
      razorpayPaymentId,
      // A paid fee means the brief has been agreed; NEW understates it.
      status: commission.status === "NEW" ? "REVIEWING" : commission.status,
    },
  });

  void notifyFeePaid(updated);
  return updated;
}

/** Best-effort: a failed notification must never fail a settled payment. */
async function notifyFeePaid(c: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  feePaise: number;
  razorpayPaymentId: string | null;
}) {
  if (!mailConfigured()) return;
  const inbox = atelierInbox();
  if (!inbox) return;

  const r = await sendMail({
    to: inbox,
    subject: `Design fee paid — ${c.reference} (${c.name})`,
    html: `
      <p><strong>${esc(c.name)}</strong> has paid the ${formatFee(c.feePaise)} design fee.</p>
      <p>
        Commission <strong>${esc(c.reference)}</strong><br />
        ${esc(c.email)} · ${esc(c.phone)}<br />
        Razorpay payment ${esc(c.razorpayPaymentId ?? "—")}
      </p>
      <p>The bench can start. The renders are due within about a week.</p>
    `,
  });
  if (!r.ok) console.warn(`[commission] fee receipt to atelier failed: ${r.error}`);
}
