import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/catalog-cache";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CollectionToolbar, type SortKey } from "@/components/product/CollectionToolbar";
import { getWishlistIds } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "View all designs",
  description: "Every piece in the house — clothes and jewellery, in one place.",
};
export const dynamic = "force-dynamic";

const PER_PAGE = 12;

type SortableCard = { position: number; createdAt: Date; price: number };

const SORTS: Record<SortKey, (a: SortableCard, b: SortableCard) => number> = {
  featured: (a, b) => a.position - b.position,
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export default async function AllDesignsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; min?: string; max?: string; page?: string }>;
}) {
  const { sort, min, max, page } = await searchParams;

  const sortKey: SortKey = (
    ["featured", "newest", "price-asc", "price-desc"] as const
  ).includes(sort as SortKey)
    ? (sort as SortKey)
    : "featured";

  const current = Math.max(1, Number(page) || 1);

  const [all, wishlist] = await Promise.all([getAllProducts(), getWishlistIds()]);

  const prices = all.map((p) => p.price);
  const floor = prices.length ? Math.min(...prices) : 0;
  const ceiling = prices.length ? Math.max(...prices) : 0;

  const minPaise = min && Number.isFinite(Number(min)) ? Number(min) * 100 : null;
  const maxPaise = max && Number.isFinite(Number(max)) ? Number(max) * 100 : null;

  const matched = all
    .filter(
      (p) =>
        (minPaise === null || p.price >= minPaise) &&
        (maxPaise === null || p.price <= maxPaise),
    )
    .sort(SORTS[sortKey]);

  const total = matched.length;
  const products = matched.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  /** Keep the active filters when paging. */
  const hrefFor = (p: number) => {
    const qs = new URLSearchParams();
    if (sort) qs.set("sort", sort);
    if (min) qs.set("min", min);
    if (max) qs.set("max", max);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/collections/all?${s}` : "/collections/all";
  };

  // 1 … current-1, current, current+1 … last
  const windowed = [
    ...new Set(
      [1, current - 1, current, current + 1, pages].filter((p) => p >= 1 && p <= pages),
    ),
  ].sort((a, b) => a - b);

  return (
    <SiteChrome>
      <div className="shell py-12 lg:py-16">
        <div className="text-center">
          <p className="label text-gold">The full house</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.6rem)] text-ink">
            View all designs
          </h1>
        </div>

        <div className="mt-12">
          <CollectionToolbar
            count={total}
            sort={sortKey}
            min={min}
            max={max}
            floor={Math.floor(floor / 100)}
            ceiling={Math.ceil(ceiling / 100)}
          />
        </div>

        <div className="mt-12">
          <ProductGrid products={products} wishlist={wishlist} />
        </div>

        {pages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-16 flex items-center justify-center gap-2"
          >
            {windowed.map((p, i) => {
              const gap = i > 0 && p - windowed[i - 1] > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {gap && <span className="label text-ink-mute/40">…</span>}
                  <Link
                    href={hrefFor(p)}
                    aria-current={p === current ? "page" : undefined}
                    className={cn(
                      "label px-3 py-2 transition-colors",
                      p === current
                        ? "border-b border-ink text-ink"
                        : "text-ink-mute hover:text-ink",
                    )}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
            {current < pages && (
              <Link
                href={hrefFor(current + 1)}
                aria-label="Next page"
                className="label px-3 py-2 text-ink-mute hover:text-ink"
              >
                &rsaquo;
              </Link>
            )}
          </nav>
        )}
      </div>
    </SiteChrome>
  );
}
