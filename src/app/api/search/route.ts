import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Live search for the header overlay.
 *
 * `?top=1` returns the featured pieces, which is what the panel shows as
 * "Top sellers" before anything has been typed.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const top = searchParams.get("top") === "1";

  const select = {
    id: true,
    name: true,
    slug: true,
    price: true,
    category: { select: { name: true } },
    media: { orderBy: { position: "asc" }, take: 1, select: { publicId: true, kind: true } },
  } as const;

  const products = await prisma.product.findMany({
    where: top
      ? { isActive: true, isFeatured: true }
      : q
        ? {
            isActive: true,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { tagline: { contains: q, mode: "insensitive" } },
              { fabric: { contains: q, mode: "insensitive" } },
              { color: { contains: q, mode: "insensitive" } },
              { craft: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : { isActive: true, isFeatured: true },
    orderBy: { position: "asc" },
    take: 12,
    select,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category?.name ?? null,
      imageId: p.media[0]?.publicId ?? null,
      imageKind: p.media[0]?.kind ?? "IMAGE",
    })),
  });
}
