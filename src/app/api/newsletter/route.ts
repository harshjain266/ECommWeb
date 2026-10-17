import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

/**
 * Newsletter sign-up.
 *
 * Deliberately a stub: it validates and acknowledges, but does not store the
 * address, because the list belongs in whichever ESP the atelier uses
 * (Mailchimp, Klaviyo, Brevo). Drop that provider's call in here -- the form
 * already posts the right shape.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await req.json().catch(() => null)
    : Object.fromEntries((await req.formData()).entries());

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 422 });
  }

  console.info(`[newsletter] sign-up: ${parsed.data.email}`);

  // A plain <form> post lands back on the page it came from.
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(
      new URL("/?subscribed=1", process.env.NEXT_PUBLIC_SITE_URL || req.url),
      303,
    );
  }
  return NextResponse.json({ ok: true });
}
