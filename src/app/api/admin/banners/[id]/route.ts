import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { bannerSchema, fieldErrors } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  // A bare `{ isActive }` or `{ position }` is accepted for the inline toggles
  // in the banner list, without requiring the whole form.
  if (body && typeof body === "object" && !("title" in body)) {
    const data: { isActive?: boolean; position?: number } = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.position === "number") data.position = body.position;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
    }
    await prisma.banner.update({ where: { id }, data });
    return NextResponse.json({ ok: true, id });
  }

  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  const d = parsed.data;
  await prisma.banner.update({
    where: { id },
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
  return NextResponse.json({ ok: true, id });
});

export const DELETE = withAdmin(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
});
