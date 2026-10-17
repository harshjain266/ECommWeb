import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({ productId: z.string().min(1) });

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [], count: 0 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.userId },
    select: { productId: true },
  });
  return NextResponse.json({
    items: items.map((i) => i.productId),
    count: items.length,
  });
}

/** Toggle a piece in the wishlist. Requires an account, so it can persist. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to save pieces to your wishlist", needsAuth: true },
      { status: 401 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { productId } = parsed.data;
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Piece not found" }, { status: 404 });
    }
    await prisma.wishlistItem.create({ data: { userId: session.userId, productId } });
  }

  const count = await prisma.wishlistItem.count({ where: { userId: session.userId } });
  return NextResponse.json({ ok: true, saved: !existing, count });
}
