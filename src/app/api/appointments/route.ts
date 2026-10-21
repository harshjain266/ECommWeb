import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  sendMail,
  mailConfigured,
  atelierInbox,
  appointmentEmail,
  appointmentAckEmail,
} from "@/lib/mail";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  occasion: z.string().max(80).optional().or(z.literal("")),
  date: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  /// Name of the piece the visitor was looking at, when they came from a card.
  piece: z.string().max(140).optional().or(z.literal("")),
});

const blank = (s?: string) => (s && s.trim() ? s.trim() : null);

/**
 * Appointment request.
 *
 * Order matters here: the row is written before any email is attempted. Email
 * is the part most likely to fail -- no API key, a provider outage, an
 * unverified sending domain -- and a consultation request that reaches nobody
 * is a lost customer. So the database is the record of truth and the email is
 * only a nudge; a failed send is recorded on the row and surfaced in the admin
 * list rather than being reported to the visitor, who did nothing wrong.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "Please check the form", fields }, { status: 422 });
  }

  const d = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      name: d.name.trim(),
      email: d.email.trim().toLowerCase(),
      phone: d.phone.trim(),
      occasion: blank(d.occasion),
      date: blank(d.date),
      message: blank(d.message),
      piece: blank(d.piece),
    },
  });

  // ---- notify, best-effort ----
  let notified = false;
  let notifyError: string | null = null;

  if (!mailConfigured()) {
    notifyError = "Email not configured — request saved to the admin list only";
    console.warn(`[appointment] ${appointment.id} saved but not emailed: ${notifyError}`);
  } else {
    const inbox = atelierInbox();
    const toAtelier = inbox
      ? await sendMail({
          to: inbox,
          subject: d.piece
            ? `Fitting request — ${d.piece} — ${d.name}`
            : `Consultation request — ${d.name}`,
          html: appointmentEmail(appointment),
          // So the atelier can simply hit reply.
          replyTo: appointment.email,
        })
      : ({ ok: false, error: "No ATELIER_EMAIL / MAIL_FROM set" } as const);

    if (toAtelier.ok) {
      notified = true;
      // The visitor acknowledgement is a courtesy; its failure is not recorded
      // against the enquiry, because the atelier already has what it needs.
      void sendMail({
        to: appointment.email,
        subject: "We have your request — Sanskar & Kabir",
        html: appointmentAckEmail(appointment),
      }).then((r) => {
        if (!r.ok) console.warn(`[appointment] ack to visitor failed: ${r.error}`);
      });
    } else {
      notifyError = toAtelier.error;
      console.error(`[appointment] ${appointment.id} notify failed: ${notifyError}`);
    }
  }

  if (notified || notifyError) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { notified, notifyError },
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "Thank you — the atelier will be in touch within two working days to confirm a slot.",
  });
}
