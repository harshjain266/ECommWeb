import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getCategoryProducts } from "@/lib/catalog-cache";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { CollectionToolbar, type SortKey } from "@/components/product/CollectionToolbar";
import { getWishlistIds } from "@/lib/wishlist";

export const revalidate = 60;

type Params = { slug: string };
type Search = { sort?: string; min?: string; max?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection not found" };
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

type SortableCard = { position: number; createdAt: Date; price: number };

const SORTS: Record<SortKey, (a: SortableCard, b: SortableCard) => number> = {
  featured: (a, b) => a.position - b.position,
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { sort, min, max } = await searchParams;

  const category = await getCategory(slug);
  if (!category || !category.isActive) notFound();

  const sortKey: SortKey = (
    ["featured", "newest", "price-asc", "price-desc"] as const
  ).includes(sort as SortKey)
    ? (sort as SortKey)
    : "featured";

  // A top-level category shows everything beneath it; a leaf shows its own.
  const categoryIds = category.children.length
    ? category.children.map((c) => c.id)
    : [category.id];

  // One cached read for the shelf, then sort and filter in memory. A round
  // trip to the database costs far more than sorting a few dozen rows, and
  // this way the cache holds one entry per shelf rather than one per
  // combination of sort order and price range.
  const [all, wishlist] = await Promise.all([
    getCategoryProducts(categoryIds),
    getWishlistIds(),
  ]);

  const prices = all.map((p) => p.price);
  const floor = prices.length ? Math.min(...prices) : 0;
  const ceiling = prices.length ? Math.max(...prices) : 0;

  const minPaise = min && Number.isFinite(Number(min)) ? Number(min) * 100 : null;
  const maxPaise = max && Number.isFinite(Number(max)) ? Number(max) * 100 : null;

  const products = all
    .filter(
      (p) =>
        (minPaise === null || p.price >= minPaise) &&
        (maxPaise === null || p.price <= maxPaise),
    )
    .sort(SORTS[sortKey]);

  return (
    <SiteChrome>
      {/* ---- header band ---- */}
      <section className="relative bg-ink">
        {category.imageId && (
          <>
            {category.imageKind === "VIDEO" ? (
              <CldVideo
                publicId={category.imageId}
                width={1920}
                priority
                lazy={false}
                className="absolute inset-0 h-full w-full rounded-none"
                videoClassName="opacity-80"
              />
            ) : (
              <CldImage
                publicId={category.imageId}
                alt={category.name}
                priority
                sizes="100vw"
                className="absolute inset-0 h-full w-full rounded-none"
                imgClassName="opacity-80"
              />
            )}
            <div className="absolute inset-0 scrim-full" />
          </>
        )}

        <div className="shell relative py-20 lg:py-28">
          <nav aria-label="Breadcrumb" className="label flex items-center gap-2 text-bone/50">
            <Link href="/" className="hover:text-bone">
              Home
            </Link>
            <span aria-hidden>/</span>
            {category.parent && (
              <>
                <Link
                  href={`/collections/${category.parent.slug}`}
                  className="hover:text-bone"
                >
                  {category.parent.name}
                </Link>
                <span aria-hidden>/</span>
              </>
            )}
            <span className="text-bone/80">{category.name}</span>
          </nav>

          <h1 className="display mt-6 text-[clamp(2.6rem,8vw,6rem)] text-bone">
            <RevealWords text={category.name} />
          </h1>

          {category.description && (
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/65">
                {category.description}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---- sub-options, when this is a top-level category ---- */}
      {category.children.length > 0 && (
        <section className="border-b border-ink/10 bg-bone-warm py-14">
          <div className="shell">
            <p className="label text-ink-mute/60">
              {category.children.length} edits within {category.name}
            </p>
            <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2">
              {category.children.map((child, i) => (
                <Link
                  key={child.id}
                  href={`/collections/${child.slug}`}
                  className="group w-[62vw] shrink-0 sm:w-[30vw] lg:w-[17vw]"
                >
                  {child.imageId && (
                    <div className="overflow-hidden">
                      <CldImage
                        publicId={child.imageId}
                        // A shelf whose art is a clip still needs a still
                        // here -- asking Cloudinary for a video id down the
                        // image route 404s, and the tile comes back blank.
                        fromVideo={child.imageKind === "VIDEO"}
                        alt={child.name}
                        ratio="4/5"
                        sizes="(min-width:1024px) 17vw, 50vw"
                        widths={[400, 640]}
                        priority={i < 3}
                        imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                  )}
                  <p className="mt-3 font-display text-[19px] font-light text-ink transition-colors group-hover:text-oxblood">
                    {child.name}
                  </p>
                  {child.description && (
                    <p className="mt-0.5 font-sans text-[12px] leading-relaxed text-ink-mute/70">
                      {child.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- the grid ---- */}
      <section className="bg-bone py-14 lg:py-20">
        <div className="shell">
          <CollectionToolbar
            count={products.length}
            sort={sortKey}
            min={min}
            max={max}
            floor={Math.floor(floor / 100)}
            ceiling={Math.ceil(ceiling / 100)}
          />
          <div className="mt-12">
            <ProductGrid products={products} wishlist={wishlist} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
