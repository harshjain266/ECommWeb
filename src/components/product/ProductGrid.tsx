import { ProductCard, type CardProduct } from "./ProductCard";

export function ProductGrid({
  products,
  sizes,
  wishlist = [],
  emptyTitle = "Nothing in this edit yet",
  emptyBody = "Pieces are added as they come off the atelier floor. Do check back.",
}: {
  products: CardProduct[];
  sizes?: string;
  /** Product ids the signed-in visitor has saved. */
  wishlist?: string[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-ink/10 py-24 text-center">
        <p className="font-display text-2xl font-light text-ink">{emptyTitle}</p>
        <p className="mt-2 font-sans text-sm text-ink-mute">{emptyBody}</p>
      </div>
    );
  }

  const saved = new Set(wishlist);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          index={i}
          sizes={sizes}
          saved={saved.has(p.id)}
        />
      ))}
    </div>
  );
}

/** Shared Prisma selection so every grid gets exactly the fields a card needs. */
export const cardSelect = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  price: true,
  compareAtPrice: true,
  isNewArrival: true,
  category: { select: { name: true, slug: true } },
  media: {
    orderBy: { position: "asc" },
    take: 3,
    select: { publicId: true, kind: true },
  },
} as const;
