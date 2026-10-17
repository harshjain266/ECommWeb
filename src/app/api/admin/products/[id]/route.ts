import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { productSchema, fieldErrors } from "@/lib/validators";
import { rupeesToPaise } from "@/lib/money";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const d = parsed.data;
  const base = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const slug = await uniqueSlug(base, id);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: d.name,
        slug,
        tagline: d.tagline || null,
        description: d.description,
        price: rupeesToPaise(d.price),
        compareAtPrice: d.compareAtPrice ? rupeesToPaise(d.compareAtPrice) : null,
        sku: d.sku,
        categoryId: d.categoryId || null,
        fabric: d.fabric || null,
        color: d.color || null,
        craft: d.craft || null,
        careNotes: d.careNotes || null,
        isActive: d.isActive,
        isFeatured: d.isFeatured,
        isNewArrival: d.isNewArrival,
        position: d.position,
      },
    });

    // Media is a full replace: the editor always submits the complete,
    // ordered list, so reconciling individual rows would be busywork.
    await tx.productMedia.deleteMany({ where: { productId: id } });
    if (d.media.length) {
      await tx.productMedia.createMany({
        data: d.media.map((m, i) => ({
          productId: id,
          publicId: m.publicId,
          kind: m.kind,
          alt: m.alt || null,
          position: i,
        })),
      });
    }

    // Variants are reconciled rather than replaced, because cart and order
    // lines reference variant ids -- deleting them would orphan history.
    const current = await tx.productVariant.findMany({ where: { productId: id } });
    const keptSizes = new Set(d.variants.map((v) => v.size));

    for (const [i, v] of d.variants.entries()) {
      const match = current.find((c) => c.size === v.size);
      if (match) {
        await tx.productVariant.update({
          where: { id: match.id },
          data: {
            stock: v.stock,
            priceDelta: rupeesToPaise(v.priceDelta),
            position: i,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            size: v.size,
            stock: v.stock,
            priceDelta: rupeesToPaise(v.priceDelta),
            position: i,
          },
        });
      }
    }

    for (const c of current) {
      if (!keptSizes.has(c.size)) {
        await tx.productVariant.delete({ where: { id: c.id } });
      }
    }
  });

  return NextResponse.json({ ok: true, id, slug });
});

/**
 * Soft delete by default: a product referenced by an order is deactivated
 * rather than removed, so order history keeps its link. `?hard=1` forces a
 * real delete when nothing references it.
 */
export const DELETE = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const hard = new URL(req.url).searchParams.get("hard") === "1";

  const orderLines = await prisma.orderItem.count({ where: { productId: id } });

  if (orderLines > 0 || !hard) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({
      ok: true,
      deactivated: true,
      reason:
        orderLines > 0
          ? `Appears in ${orderLines} order line(s), so it was hidden rather than deleted.`
          : "Hidden from the storefront.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
});

async function uniqueSlug(base: string, skipId?: string): Promise<string> {
  let slug = base || "piece";
  let n = 1;
  for (;;) {
    const clash = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash || clash.id === skipId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
