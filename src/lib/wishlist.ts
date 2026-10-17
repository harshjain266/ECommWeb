import "server-only";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

/** Product ids the signed-in visitor has saved. Empty when anonymous. */
export async function getWishlistIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function getWishlistCount(): Promise<number> {
  const session = await getSession();
  if (!session) return 0;
  return prisma.wishlistItem.count({ where: { userId: session.userId } });
}
