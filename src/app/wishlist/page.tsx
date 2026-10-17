import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ProductGrid, cardSelect } from "@/components/product/ProductGrid";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getSession();

  const items = session
    ? await prisma.wishlistItem.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        select: { product: { select: cardSelect } },
      })
    : [];

  const products = items.map((i) => i.product).filter((p) => p !== null);

  return (
    <SiteChrome>
      <div className="shell py-14 lg:py-20">
        <div className="text-center">
          <p className="label text-gold">Saved pieces</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
            Wishlist
          </h1>
        </div>

        {!session ? (
          <div className="mt-14 border border-ink/10 py-20 text-center">
            <p className="font-display text-2xl font-light text-ink">
              Sign in to see your wishlist
            </p>
            <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
              Saved pieces are kept on your account, so they are still here next
              time — on any device.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login?next=%2Fwishlist" className="btn-dark">
                Sign in
              </Link>
              <Link href="/register?next=%2Fwishlist" className="btn-outline">
                Create an account
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-14">
            <ProductGrid
              products={products}
              wishlist={products.map((p) => p.id)}
              emptyTitle="No products found, please add some products"
              emptyBody="Tap the heart on any piece and it will be kept here."
            />
            {products.length === 0 && (
              <div className="mt-8 flex justify-center">
                <Link href="/collections/all" className="btn-dark">
                  Browse the collections
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </SiteChrome>
  );
}
