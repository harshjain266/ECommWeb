import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { bannerSchema, fieldErrors } from "@/lib/validators";

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const banner = await prisma.banner.create({
    data: {
      title: d.title,
      subtitle: d.subtitle || null,
      eyebrow: d.eyebrow || null,
      ctaLabel: d.ctaLabel || null,
      ctaHref: d.ctaHref || null,
      publicId: d.publicId,
      kind: d.kind,
      slot: d.slot,
      position: d.position,
      isActive: d.isActive,
    },
  });
  return NextResponse.json({ ok: true, id: banner.id });
});
