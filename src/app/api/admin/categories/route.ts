import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { categorySchema, fieldErrors } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash) {
    return NextResponse.json(
      { error: "That URL slug is taken", fields: { slug: "Already in use" } },
      { status: 409 },
    );
  }

  const category = await prisma.category.create({
    data: {
      name: d.name,
      slug,
      description: d.description || null,
      parentId: d.parentId || null,
      imageId: d.imageId || null,
      imageKind: d.imageKind,
      position: d.position,
      isActive: d.isActive,
      featured: d.featured,
    },
  });
  return NextResponse.json({ ok: true, id: category.id });
});
