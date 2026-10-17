import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ProductGrid, cardSelect } from "@/components/product/ProductGrid";
import { getWishlistIds } from "@/lib/wishlist";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  // Search across the fields a customer would actually type: the name, the
  // hook, the fabric and the craft ("zardozi", "benarasi", "velvet").
  const products = term
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { tagline: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { fabric: { contains: term, mode: "insensitive" } },
            { color: { contains: term, mode: "insensitive" } },
            { craft: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        },
        orderBy: { position: "asc" },
        take: 48,
        select: cardSelect,
      })
    : [];

  const wishlist = await getWishlistIds();

  return (
    <SiteChrome>
      <div className="shell py-12 lg:py-16">
        <p className="label text-gold">Search</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
          {term ? `“${term}”` : "What are you looking for?"}
        </h1>

        <form className="mt-8 max-w-xl" role="search">
          <label htmlFor="q" className="sr-only">
            Search the collections
          </label>
          <div className="flex border-b border-ink/25 focus-within:border-gold">
            <input
              id="q"
              name="q"
              defaultValue={term}
              autoFocus
              placeholder="Try “zardozi”, “benarasi”, “sherwani”, “velvet”"
              className="w-full bg-transparent py-4 font-sans text-base text-ink outline-none placeholder:text-ink-mute/50"
            />
            <button type="submit" className="label shrink-0 px-3 text-gold">
              Search
            </button>
          </div>
        </form>

        {term && (
          <p className="label mt-8 text-ink-mute">
            {products.length} {products.length === 1 ? "piece" : "pieces"} found
          </p>
        )}

        <div className="mt-8">
          {term ? (
            <ProductGrid products={products} wishlist={wishlist} />
          ) : (
            <p className="py-16 text-center font-sans text-sm text-ink-mute">
              Search by piece, fabric, colour or craft.
            </p>
          )}
        </div>
      </div>
    </SiteChrome>
  );
}
