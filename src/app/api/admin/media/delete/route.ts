import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { cloudinaryConfigured, destroyAsset } from "@/lib/cloudinary";

const schema = z.object({
  publicId: z.string().min(1),
  kind: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
});

/**
 * Permanently remove an asset from Cloudinary.
 *
 * Refuses while anything still points at it — deleting an in-use asset would
 * leave broken images on the storefront, and Cloudinary deletion cannot be
 * undone. Detach it from the product, banner or category first.
 */
export const POST = withAdmin(async (req) => {
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { publicId, kind } = parsed.data;

  const [inProducts, inBanners, inCategories] = await Promise.all([
    prisma.productMedia.findMany({
      where: { publicId },
      select: { product: { select: { name: true } } },
    }),
    prisma.banner.findMany({ where: { publicId }, select: { title: true } }),
    prisma.category.findMany({ where: { imageId: publicId }, select: { name: true } }),
  ]);

  const usedBy = [
    ...inProducts.map((p) => p.product.name),
    ...inBanners.map((b) => `Banner: ${b.title}`),
    ...inCategories.map((c) => `Nav: ${c.name}`),
  ];

  if (usedBy.length > 0) {
    return NextResponse.json(
      {
        error: `Still in use by ${usedBy.length} item(s): ${usedBy
          .slice(0, 3)
          .join(", ")}${usedBy.length > 3 ? "…" : ""}. Detach it first.`,
        usedBy,
      },
      { status: 409 },
    );
  }

  await destroyAsset(publicId, kind);
  return NextResponse.json({ ok: true, deleted: publicId });
});
