import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { uploadBuffer, cloudinaryConfigured } from "@/lib/cloudinary";
import { imageUrl, videoUrl } from "@/lib/media";
import { DESIGN_FEE_PAISE, formatFee } from "@/lib/jewellery";
import {
  sendMail,
  mailConfigured,
  atelierInbox,
  commissionEmail,
  commissionAckEmail,
} from "@/lib/mail";

/** Customer-sent references live apart from studio artwork. */
const COMMISSION_FOLDER = "sanskar/commissions";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = /\.(jpe?g|png|webp|avif|heic|heif|gif|mov|mp4|m4v|webm)$/i;

/**
 * Only the contact details are required.
 *
 * Everything else is triage: a half-filled brief is still a commission worth
 * several lakhs, and refusing it because someone skipped the budget dropdown
 * would be the most expensive validation rule on the site.
 */
const schema = z.object({
  name: z.string().min(2, "Please tell us your name").max(80),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
  brief: z.string().max(2000).optional(),
  metal: z.string().max(60).optional(),
  stones: z.string().max(60).optional(),
  budget: z.string().max(60).optional(),
  wearDate: z.string().max(80).optional(),
});

const blank = (s?: string) => {
  const t = s?.trim();
  // The selects default to "Not sure yet" / "Rather not say", which carries
  // no more information than an empty field and should not reach the bench
  // looking like an answer.
  if (!t || /^(not sure yet|rather not say)$/i.test(t)) return null;
  return t;
};

/**
 * Pick the next free reference.
 *
 * Reads the highest issued number rather than counting rows: a deleted
 * commission must never let a later one reuse a reference a customer has
 * already been given in writing.
 */
async function nextReference(): Promise<string> {
  const last = await prisma.commission.findFirst({
    where: { reference: { startsWith: "SK-C-" } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const n = last ? Number(last.reference.slice(5)) : 0;
  return `SK-C-${String((Number.isFinite(n) ? n : 0) + 1).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Could not read the form" }, { status: 400 });
  }

  const text = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : undefined;
  };

  const parsed = schema.safeParse({
    name: text("name") ?? "",
    email: text("email") ?? "",
    phone: text("phone") ?? "",
    brief: text("brief"),
    metal: text("metal"),
    stones: text("stones"),
    budget: text("budget"),
    wearDate: text("wearDate"),
  });

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "Please check the form", fields }, { status: 422 });
  }

  const d = parsed.data;

  // ---- the attachment, if there is one ----
  //
  // Upload failures are deliberately not fatal. The brief plus a phone number
  // is already a lead worth having; losing it because Cloudinary was down
  // would be the wrong trade.
  let publicId: string | null = null;
  let mediaKind: "IMAGE" | "VIDEO" = "IMAGE";
  let uploadError: string | null = null;

  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `That file is over the ${MAX_BYTES / 1048576}MB limit` },
        { status: 413 },
      );
    }
    if (!ALLOWED.test(file.name)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPEG, PNG, HEIC, MP4 or MOV." },
        { status: 415 },
      );
    }
    if (!cloudinaryConfigured()) {
      uploadError = "Cloudinary is not configured, so the attachment was dropped";
      console.warn(`[commission] ${uploadError}`);
    } else {
      try {
        const up = await uploadBuffer(
          Buffer.from(await file.arrayBuffer()),
          file.name,
          COMMISSION_FOLDER,
        );
        publicId = up.publicId;
        mediaKind = up.kind;
      } catch (err) {
        uploadError = err instanceof Error ? err.message : "Attachment upload failed";
        console.error(`[commission] attachment upload failed: ${uploadError}`);
      }
    }
  }

  // ---- the row, before anything that can fail ----
  let commission;
  for (let attempt = 0; ; attempt++) {
    try {
      commission = await prisma.commission.create({
        data: {
          reference: await nextReference(),
          name: d.name.trim(),
          email: d.email.trim().toLowerCase(),
          phone: d.phone.trim(),
          brief: blank(d.brief),
          metal: blank(d.metal),
          stones: blank(d.stones),
          budget: blank(d.budget),
          wearDate: blank(d.wearDate),
          publicId,
          mediaKind,
          feePaise: DESIGN_FEE_PAISE,
        },
      });
      break;
    } catch (err) {
      // Two briefs landing in the same instant race for the same reference.
      // Retrying re-reads the maximum, so the second one simply takes the
      // next number.
      const clash =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!clash || attempt >= 4) throw err;
    }
  }

  // ---- notify, best-effort ----
  let notified = false;
  let notifyError: string | null = uploadError;

  if (!mailConfigured()) {
    notifyError = [uploadError, "Email not configured — saved to the admin list only"]
      .filter(Boolean)
      .join(" · ");
    console.warn(`[commission] ${commission.reference} saved but not emailed`);
  } else {
    const inbox = atelierInbox();
    const referenceUrl = publicId
      ? mediaKind === "VIDEO"
        ? videoUrl(publicId, { width: 1280 })
        : imageUrl(publicId, { width: 1600 })
      : null;

    const toAtelier = inbox
      ? await sendMail({
          to: inbox,
          subject: `Commission ${commission.reference} — ${d.name}`,
          html: commissionEmail({ ...commission, referenceUrl }),
          replyTo: commission.email,
        })
      : ({ ok: false, error: "No ATELIER_EMAIL / MAIL_FROM set" } as const);

    if (toAtelier.ok) {
      notified = true;
      void sendMail({
        to: commission.email,
        subject: `Your commission ${commission.reference} — Sanskar & Kabir`,
        html: commissionAckEmail({
          reference: commission.reference,
          name: commission.name,
          fee: formatFee(commission.feePaise),
        }),
      }).then((r) => {
        if (!r.ok) console.warn(`[commission] ack to visitor failed: ${r.error}`);
      });
    } else {
      notifyError = [uploadError, toAtelier.error].filter(Boolean).join(" · ");
      console.error(`[commission] ${commission.reference} notify failed: ${notifyError}`);
    }
  }

  if (notified || notifyError) {
    await prisma.commission.update({
      where: { id: commission.id },
      data: { notified, notifyError },
    });
  }

  return NextResponse.json({
    ok: true,
    reference: commission.reference,
    message:
      "Someone from the bench will call you within two working days to talk it through. Nothing has been charged.",
  });
}
