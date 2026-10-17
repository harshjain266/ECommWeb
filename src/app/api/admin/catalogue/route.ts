import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { rupeesToPaise } from "@/lib/money";
import { slugify } from "@/lib/utils";

/**
 * Catalogue operations used by the per-category manager.
 *
 * Reordering sends the whole ordered list of ids rather than a swap: the
 * server then writes `position = index`, which is idempotent and cannot drift
 * out of step if two edits race.
 */
const reorderSchema = z.object({
  op: z.literal("reorder"),
  kind: z.enum(["product", "category"]),
  /** Ids in their new display order. */
  ids: z.array(z.string().min(1)).min(1).max(500),
});

const stockSchema = z.object({
  op: z.literal("stock"),
  variantId: z.string().min(1),
  stock: z.coerce.number().int().min(0).max(100000),
});

const moveSchema = z.object({
  op: z.literal("move"),
  productId: z.string().min(1),
  categoryId: z.string().min(1).nullable(),
});

const quickAddSchema = z.object({
  op: z.literal("quickAdd"),
  categoryId: z.string().min(1),
  name: z.string().min(2).max(140),
  /** Rupees. */
  price: z.coerce.number().min(1),
  sku: z.string().min(2).max(60).optional(),
  publicId: z.string().min(1).optional(),
  kind: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  sizePreset: z.enum(["WOMEN", "MEN", "ONE", "JEWEL"]).default("WOMEN"),
});

const addVariantSchema = z.object({
  op: z.literal("addVariant"),
  productId: z.string().min(1),
  size: z.string().min(1).max(40),
  stock: z.coerce.number().int().min(0).default(0),
});

const deleteVariantSchema = z.object({
  op: z.literal("deleteVariant"),
  variantId: z.string().min(1),
});

const body = z.discriminatedUnion("op", [
  reorderSchema,
  stockSchema,
  moveSchema,
  quickAddSchema,
  addVariantSchema,
  deleteVariantSchema,
]);

const SIZE_PRESETS: Record<string, { size: string; stock: number }[]> = {
  WOMEN: [
    { size: "XS", stock: 0 },
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 },
    { size: "Custom Tailored", stock: 99 },
  ],
  MEN: [
    { size: '38"', stock: 0 },
    { size: '40"', stock: 0 },
    { size: '42"', stock: 0 },
    { size: '44"', stock: 0 },
    { size: '46"', stock: 0 },
    { size: "Custom Tailored", stock: 99 },
  ],
  ONE: [{ size: "One Size", stock: 0 }],
  JEWEL: [
    { size: "Standard", stock: 0 },
    { size: "Made to Order", stock: 99 },
  ],
};

export const POST = withAdmin(async (req) => {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.issues[0]?.message },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // ---- reorder: write position = index, in one transaction ----
  if (data.op === "reorder") {
    await prisma.$transaction(
      data.ids.map((id, index) =>
        data.kind === "product"
          ? prisma.product.update({ where: { id }, data: { position: index } })
          : prisma.category.update({ where: { id }, data: { position: index } }),
      ),
    );
    return NextResponse.json({ ok: true, reordered: data.ids.length });
  }

  // ---- inline stock edit ----
  if (data.op === "stock") {
    const variant = await prisma.productVariant.update({
      where: { id: data.variantId },
      data: { stock: data.stock },
      select: { id: true, stock: true, size: true },
    });
    return NextResponse.json({ ok: true, variant });
  }

  // ---- move a piece into another category ----
  if (data.op === "move") {
    await prisma.product.update({
      where: { id: data.productId },
      data: { categoryId: data.categoryId },
    });
    return NextResponse.json({ ok: true });
  }

  // ---- add a size to an existing piece ----
  if (data.op === "addVariant") {
    const clash = await prisma.productVariant.findFirst({
      where: { productId: data.productId, size: data.size },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: `"${data.size}" already exists on this piece` },
        { status: 409 },
      );
    }
    const last = await prisma.productVariant.findFirst({
      where: { productId: data.productId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        size: data.size,
        stock: data.stock,
        position: (last?.position ?? -1) + 1,
      },
    });
    return NextResponse.json({ ok: true, variant });
  }

  // ---- remove a size ----
  if (data.op === "deleteVariant") {
    // Refuse if it is referenced by an order line, which would orphan history.
    const used = await prisma.orderItem.count({
      where: { variantId: data.variantId },
    });
    if (used > 0) {
      return NextResponse.json(
        {
          error: `That size appears in ${used} order line(s). Set its stock to 0 instead of deleting it.`,
        },
        { status: 409 },
      );
    }
    await prisma.productVariant.delete({ where: { id: data.variantId } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  // ---- quick-add a piece straight into a category ----
  const base = slugify(data.name) || "piece";
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${base}-${n}`;
  }

  const sku =
    data.sku?.trim() ||
    `SK-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const last = await prisma.product.findFirst({
    where: { categoryId: data.categoryId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      sku,
      description:
        "Draft piece — add the full description, fabric and craft notes before publishing.",
      price: rupeesToPaise(data.price),
      categoryId: data.categoryId,
      position: (last?.position ?? -1) + 1,
      // Created hidden on purpose: a quick-add is a stub, not a listing.
      isActive: false,
      variants: {
        create: (SIZE_PRESETS[data.sizePreset] ?? SIZE_PRESETS.WOMEN).map(
          (s, i) => ({ size: s.size, stock: s.stock, position: i }),
        ),
      },
      ...(data.publicId
        ? {
            media: {
              create: [{ publicId: data.publicId, kind: data.kind, position: 0 }],
            },
          }
        : {}),
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json({ ok: true, ...product });
});
