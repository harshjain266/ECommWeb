import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  occasion: z.string().max(80).optional().or(z.literal("")),
  date: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
});

/**
 * Appointment request.
 *
 * Like the newsletter route this acknowledges rather than persists: bridal
 * consultations are booked by a person, so the natural destination is the
 * atelier's inbox or CRM. Wire an email send (Resend, Postmark, SES) here.
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
    return NextResponse.json(
      { error: "Please check the form", fields },
      { status: 422 },
    );
  }

  console.info("[appointment] request", parsed.data);

  return NextResponse.json({
    ok: true,
    message:
      "Thank you — the atelier will be in touch within two working days to confirm a slot.",
  });
}
