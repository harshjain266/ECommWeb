import "server-only";

/**
 * Outbound email.
 *
 * Talks to Resend over plain HTTP rather than pulling in their SDK -- it is
 * one POST, and avoiding the dependency keeps the install small.
 *
 * Every send is best-effort and never throws: callers persist first and treat
 * notification as a nudge, so a missing key or a provider outage degrades to
 * "the row is in the admin list but nobody was emailed" rather than losing
 * the enquiry outright.
 */

export type MailResult = { ok: true } | { ok: false; error: string };

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/** Where atelier notifications land. Falls back to the from-address. */
export function atelierInbox(): string | undefined {
  return process.env.ATELIER_EMAIL || process.env.MAIL_FROM;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<MailResult> {
  if (!mailConfigured()) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY / MAIL_FROM)" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      // Do not let a slow provider hold the request open.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Email send failed" };
  }
}

/** Escape anything a visitor typed before it goes into an HTML email. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL = (title: string, rows: string) => `
<div style="font-family:Georgia,serif;background:#f5ede1;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:32px">
    <p style="font:600 11px/1 system-ui;letter-spacing:.18em;text-transform:uppercase;color:#a9834b;margin:0">
      Sanskar &amp; Kabir
    </p>
    <h1 style="font:300 26px/1.25 Georgia,serif;color:#3e2516;margin:14px 0 22px">${title}</h1>
    <table style="width:100%;border-collapse:collapse;font:14px/1.6 system-ui;color:#3e2516">
      ${rows}
    </table>
  </div>
</div>`;

const ROW = (k: string, v: string) => `
  <tr>
    <td style="padding:7px 12px 7px 0;color:#6f513b;white-space:nowrap;vertical-align:top">${k}</td>
    <td style="padding:7px 0;vertical-align:top">${v}</td>
  </tr>`;

/** The notification the atelier receives. */
export function appointmentEmail(a: {
  name: string;
  email: string;
  phone: string;
  occasion?: string | null;
  date?: string | null;
  piece?: string | null;
  message?: string | null;
}): string {
  return SHELL(
    "New consultation request",
    [
      ROW("Name", esc(a.name)),
      ROW("Phone", `<a href="tel:${esc(a.phone)}">${esc(a.phone)}</a>`),
      ROW("Email", `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>`),
      a.piece ? ROW("Piece", `<strong>${esc(a.piece)}</strong>`) : "",
      a.occasion ? ROW("Occasion", esc(a.occasion)) : "",
      a.date ? ROW("Event date", esc(a.date)) : "",
      a.message ? ROW("Message", esc(a.message).replace(/\n/g, "<br>")) : "",
    ].join(""),
  );
}

/** The acknowledgement the visitor receives. */
export function appointmentAckEmail(a: { name: string; piece?: string | null }): string {
  const first = a.name.split(/\s+/)[0] ?? a.name;
  return SHELL(
    `Thank you, ${esc(first)}`,
    ROW(
      "",
      `We have your request${a.piece ? ` about the <strong>${esc(a.piece)}</strong>` : ""}
       and will be in touch within two working days to confirm a slot.<br><br>
       Consultations run Tuesday to Saturday, 11am to 7pm, at our Chanakyapuri studio.`,
    ),
  );
}
