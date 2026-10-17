import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { productSchema, fieldErrors } from "@/lib/validators";
import { rupeesToPaise } from "@/lib/money";
import { slugify } from "@/lib/utils";

export const POST = withAdmin(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const d = parsed.data;
  const base = d.slug?.trim() ? slugify(d.slug) : slugify(d.name);
  const slug = await uniqueSlug(base);

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug,
      tagline: d.tagline || null,
      description: d.description,
      // The form collects rupees; storage is always paise.
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
      media: {
        create: d.media.map((m, i) => ({
          publicId: m.publicId,
          kind: m.kind,
          alt: m.alt || null,
          position: i,
        })),
      },
      variants: {
        create: d.variants.map((v, i) => ({
          size: v.size,
          stock: v.stock,
          priceDelta: rupeesToPaise(v.priceDelta),
          position: i,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true, id: product.id, slug: product.slug });
});

/** Append -2, -3 … until the slug is free. */
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

export { uniqueSlug };
