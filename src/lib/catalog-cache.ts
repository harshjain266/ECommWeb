import "server-only";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getNav as readNav } from "@/lib/nav";
import type { NavItem } from "@/lib/nav-shared";
import { cardSelect } from "@/components/product/ProductGrid";

/**
 * Cached reads for the catalogue.
 *
 * The database is a managed Postgres in another region, so a single round
 * trip costs roughly 400-550ms from here. A collection page was making about
 * ten of them -- the nav, the category (twice, because `generateMetadata` and
 * the page component each loaded it), the products, their media, and a price
 * aggregate -- which is why pages took three to five seconds whether or not
 * anything had changed.
 *
 * None of that data is per-visitor and almost none of it changes between
 * deploys, so it is cached in two layers:
 *
 *   `cache()`           de-duplicates within a single request, which is what
 *                       collapses the double category load.
 *   `unstable_cache()`  persists across requests, tagged so the admin can
 *                       invalidate precisely what it changed.
 *
 * Nothing that depends on the visitor (session, cart, wishlist) is cached
 * here -- those stay per-request, which is why they are absent from this file.
 */

export const TAGS = { nav: "nav", products: "products" } as const;

/**
 * Expire the entry outright rather than marking it stale.
 *
 * Next's named profiles ("max" and friends) are stale-while-revalidate: the
 * next request is still served the old value while a fresh one is fetched
 * behind it. For an admin that reads as the save having silently failed --
 * verified here, where a rename did not appear until the *following* edit.
 * `{ expire: 0 }` drops the entry, so the next read goes to the database and
 * the admin sees their own write. (`updateTag` would be the idiomatic fix but
 * is only callable from a Server Action, and these are route handlers.)
 */
const EXPIRE = { expire: 0 };

/** Drop the cached navigation. Call after any category write. */
export function invalidateNav() {
  revalidateTag(TAGS.nav, EXPIRE);
}

/** Drop the cached product listings. Call after any product write. */
export function invalidateProducts() {
  revalidateTag(TAGS.products, EXPIRE);
}

export const getNav = cache(
  unstable_cache(async (): Promise<NavItem[]> => readNav(), ["nav-tree"], {
    tags: [TAGS.nav],
    revalidate: 300,
  }),
);

export type CategoryDetail = Awaited<ReturnType<typeof readCategory>>;

async function readCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { name: true, slug: true } },
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageId: true,
          imageKind: true,
          menuGroup: true,
        },
      },
    },
  });
}

/**
 * One category with its parent and children.
 *
 * Wrapped in `cache()` as well as `unstable_cache()` on purpose: the page and
 * its `generateMetadata` both need it, and without the request-level memo that
 * is two full round trips before the page has rendered anything.
 */
export const getCategory = cache((slug: string) =>
  unstable_cache(() => readCategory(slug), ["category", slug], {
    tags: [TAGS.nav, `category:${slug}`],
    revalidate: 300,
  })(),
);

/**
 * Every active product on a shelf, unsorted and unfiltered.
 *
 * Sorting and price filtering are deliberately *not* part of the cache key:
 * the catalogue is small enough that doing both in memory is far cheaper than
 * a round trip, and it keeps one cached entry per shelf instead of one per
 * combination of sort and price range.
 */
export const getCategoryProducts = cache((categoryIds: string[]) => {
  const key = [...categoryIds].sort().join(",");
  return unstable_cache(
    () =>
      prisma.product.findMany({
        where: { isActive: true, categoryId: { in: categoryIds } },
        orderBy: { position: "asc" },
        // cardSelect plus the two fields the in-memory sorts need.
        select: { ...cardSelect, position: true, createdAt: true },
      }),
    ["category-products", key],
    { tags: [TAGS.products], revalidate: 300 },
  )();
});

/**
 * Everything the homepage needs that is not per-visitor, in one cached read.
 *
 * Previously these were eight separate queries on every request. They are
 * still eight queries, but now they run once per cache window instead of once
 * per visitor, and the whole set is fetched in parallel rather than awaited
 * one at a time.
 */
export const getHomeData = cache(
  unstable_cache(
    async () => {
      const [heroBanners, editorials, diwali, featured, newArrivals, testimonials, clipRows] =
        await Promise.all([
          prisma.banner.findMany({
            where: { slot: "HERO", isActive: true },
            orderBy: { position: "asc" },
          }),
          prisma.banner.findMany({
            where: { slot: "EDITORIAL", isActive: true },
            orderBy: { position: "asc" },
          }),
          prisma.banner.findMany({
            where: { slot: "DIWALI", isActive: true },
            orderBy: { position: "asc" },
          }),
          prisma.product.findMany({
            where: { isActive: true, isFeatured: true },
            orderBy: { position: "asc" },
            take: 8,
            select: cardSelect,
          }),
          prisma.product.findMany({
            where: { isActive: true, isNewArrival: true },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: cardSelect,
          }),
          prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { position: "asc" },
          }),
          prisma.productMedia.findMany({
            where: { kind: "VIDEO" },
            orderBy: { id: "asc" },
            take: 14,
            select: { publicId: true },
          }),
        ]);

      return { heroBanners, editorials, diwali, featured, newArrivals, testimonials, clipRows };
    },
    ["home-data"],
    { tags: [TAGS.nav, TAGS.products], revalidate: 300 },
  ),
);

async function readProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true, parent: { select: { name: true, slug: true } } },
      },
      media: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

/**
 * One product with its media and variants.
 *
 * Same double-load problem as `getCategory`: the product page and its
 * `generateMetadata` both need it.
 *
 * Note that variant stock rides along in this cache. That is acceptable
 * because stock is authoritative at checkout, not on the page -- the order
 * route re-reads and decrements it inside a transaction, so a stale "2 left"
 * on a cached page cannot oversell. It only means the number can lag by up to
 * the revalidate window, and an admin stock edit clears the tag immediately.
 */
export const getProduct = cache((slug: string) =>
  unstable_cache(() => readProduct(slug), ["product", slug], {
    tags: [TAGS.products, `product:${slug}`],
    revalidate: 300,
  })(),
);

/** "You may also like" -- same shelf, excluding the piece being viewed. */
export const getRelatedProducts = cache(
  (productId: string, categoryId: string | null, take = 4) =>
    unstable_cache(
      () =>
        prisma.product.findMany({
          where: {
            isActive: true,
            id: { not: productId },
            ...(categoryId ? { categoryId } : {}),
          },
          orderBy: { position: "asc" },
          take,
          select: cardSelect,
        }),
      ["related", productId, categoryId ?? "none", String(take)],
      { tags: [TAGS.products], revalidate: 300 },
    )(),
);

/**
 * Every active product in the house.
 *
 * "View all designs" paginates, sorts and price-filters this in memory for
 * the same reason the shelf pages do: the catalogue is small, and one cached
 * list beats three round trips (page, count, price aggregate) per view.
 * Revisit this if the catalogue ever grows past a few hundred pieces -- at
 * that point paginating in the database becomes the cheaper side of the
 * trade.
 */
export const getAllProducts = cache(
  unstable_cache(
    () =>
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { ...cardSelect, position: true, createdAt: true },
      }),
    ["all-products"],
    { tags: [TAGS.products], revalidate: 300 },
  ),
);
