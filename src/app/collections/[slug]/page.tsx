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
      {/* ---- header band ----

           Full-bleed, but the artwork is *contained* rather than cropped.

           The shelf art is portrait almost without exception and this band is
           wide, so `object-cover` showed about a fifth of each image -- on a
           garment shot, a strip of brocade with no garment in it. Containing
           it instead shows the whole piece, scaled down, and the band is
           filled edge to edge by a blurred blow-up of the same asset. That is
           what keeps it a full-bleed banner with no letterbox bars, and no
           second image to art-direct.
      */}
      <section className="relative isolate flex min-h-[clamp(340px,42vw,540px)] items-end overflow-hidden bg-ink">
        {category.imageId && (
          <>
            {/* Ambient ground: the same asset again, blown up and thrown out
                of focus, so the band is filled edge to edge by the piece
                itself rather than by a flat panel of brown.

                A video shelf gets the moving clip here too, not its poster --
                a still ground behind a playing foreground reads as a bug. It
                is fetched at 480px because nothing survives the blur anyway,
                which keeps the second decode almost free. */}
            <div aria-hidden className="absolute inset-0 scale-125">
              {category.imageKind === "VIDEO" ? (
                <CldVideo
                  publicId={category.imageId}
                  // Wide enough to survive a lighter blur: at 480 the ground
                  // showed its own upscaling the moment the blur came down.
                  width={960}
                  priority
                  lazy={false}
                  className="h-full w-full rounded-none"
                  videoClassName="blur-lg saturate-125"
                />
              ) : (
                <CldImage
                  publicId={category.imageId}
                  alt=""
                  priority
                  sizes="100vw"
                  widths={[960, 1280]}
                  className="h-full w-full rounded-none"
                  imgClassName="blur-lg saturate-125"
                />
              )}
            </div>
            {/* Light enough that the ground still reads as the piece. */}
            <div className="absolute inset-0 bg-ink/20" />

            {/* The artwork itself, whole, and held to the right half on wide
                screens so the title has clean ground to sit on rather than
                being read against a garment. */}
            <div className="absolute inset-y-5 inset-x-0 lg:inset-y-7 lg:left-auto lg:right-0 lg:w-[56%]">
              {category.imageKind === "VIDEO" ? (
                <CldVideo
                  publicId={category.imageId}
                  width={1280}
                  priority
                  lazy={false}
                  posterAt={2}
                  fit="contain"
                  className="h-full w-full rounded-none"
                  videoClassName="drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)]"
                />
              ) : (
                <CldImage
                  publicId={category.imageId}
                  alt={category.name}
                  priority
                  fit="contain"
                  sizes="100vw"
                  widths={[640, 960, 1280, 1600]}
                  className="h-full w-full rounded-none"
                  imgClassName="drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)]"
                />
              )}
            </div>

            {/* Legibility, weighted hard to the left where the type sits and
                running out before it reaches the artwork. A flat scrim across
                the whole band would grey the garment out, which is the one
                thing on the page worth looking at. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/35 via-28% to-transparent to-55%" />
            {/* Narrow screens have no room to hold the art off to one side, so
                the type lands on top of it; there the scrim has to come up
                from the bottom instead. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/65 to-transparent lg:hidden" />
          </>
        )}

        <div className="shell relative py-10 lg:py-14">
          <nav aria-label="Breadcrumb" className="label flex items-center gap-2 text-bone/50">
            <Link href="/" className="hover:text-bone">
              Home
            </Link>
            <span aria-hidden>/</span>
            {category.parent && (
              <>
                {/* A switched-off parent still names where this shelf sits,
                    but its page 404s, so it is text rather than a link. */}
                {category.parent.isActive ? (
                  <Link
                    href={`/collections/${category.parent.slug}`}
                    className="hover:text-bone"
                  >
                    {category.parent.name}
                  </Link>
                ) : (
                  <span>{category.parent.name}</span>
                )}
                <span aria-hidden>/</span>
              </>
            )}
            <span className="text-bone/80">{category.name}</span>
          </nav>

          <h1 className="display mt-5 text-[clamp(2.4rem,6.5vw,4.8rem)] text-bone">
            <RevealWords text={category.name} />
          </h1>

          {category.description && (
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-md text-pretty font-sans text-[15px] leading-relaxed text-bone/70">
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
