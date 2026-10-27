import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { categorySchema, fieldErrors } from "@/lib/validators";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);

  // Inline toggles from the list view.
  if (body && typeof body === "object" && !("name" in body)) {
    const data: { isActive?: boolean; featured?: boolean; position?: number } = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (typeof body.position === "number") data.position = body.position;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
    }
    await prisma.category.update({ where: { id }, data });
    return NextResponse.json({ ok: true, id });
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  const d = parsed.data;

  // A category cannot be its own parent, which would detach the subtree.
  if (d.parentId === id) {
    return NextResponse.json(
      { error: "A category cannot be its own parent" },
      { status: 422 },
    );
  }

  const slug = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash && clash.id !== id) {
    return NextResponse.json(
      { error: "That URL slug is taken", fields: { slug: "Already in use" } },
      { status: 409 },
    );
  }

  await prisma.category.update({
    where: { id },
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
  return NextResponse.json({ ok: true, id });
});

export const DELETE = withAdmin(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;

  const [children, products] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);

  // Refuse rather than silently orphaning a subtree or a shelf of products.
  if (children > 0) {
    return NextResponse.json(
      {
        error: `This has ${children} sub-categorie(s). Move or delete them first.`,
      },
      { status: 409 },
    );
  }
  if (products > 0) {
    return NextResponse.json(
      {
        error: `${products} product(s) sit in this category. Reassign them first.`,
      },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
});
