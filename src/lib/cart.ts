import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { CART_COOKIE, cookieOptions, MAX_AGE_SECONDS } from "@/lib/session";
import { shippingFor } from "@/lib/money";

export type CartLine = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  size: string | null;
  imageId: string | null;
  imageKind: "IMAGE" | "VIDEO";
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number | null;
};

export type CartView = {
  id: string | null;
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
};

export const EMPTY_CART: CartView = {
  id: null,
  lines: [],
  count: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
};

const cartInclude = {
  items: {
    orderBy: { id: "asc" },
    include: {
      variant: true,
      product: {
        include: { media: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  },
} as const;

/**
 * Find the active cart without creating one. Signed-in users own a cart keyed
 * by userId; anonymous visitors get one keyed by an httpOnly cookie token.
 */
export async function findCart() {
  const session = await getSession();
  if (session) {
    const byUser = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: cartInclude,
    });
    if (byUser) return byUser;
  }
  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  if (!token) return null;
  return prisma.cart.findUnique({ where: { token }, include: cartInclude });
}

/** Same as findCart, but creates the cart (and cookie) when absent. */
export async function getOrCreateCart() {
  const existing = await findCart();
  if (existing) return existing;

  const session = await getSession();
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomBytes(24).toString("hex");
    jar.set(CART_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE_SECONDS });
  }

  return prisma.cart.create({
    data: { token, userId: session?.userId ?? null },
    include: cartInclude,
  });
}

/**
 * Called right after sign-in: fold an anonymous cookie cart into the user's
 * cart so items added before logging in are not lost.
 */
export async function mergeAnonymousCart(userId: string): Promise<void> {
  const jar = await cookies();
  const token = jar.get(CART_COOKIE)?.value;
  if (!token) return;

  const anon = await prisma.cart.findUnique({
    where: { token },
    include: { items: true },
  });
  if (!anon || anon.userId === userId) return;

  const userCart = await prisma.cart.findUnique({ where: { userId } });

  if (!userCart) {
    // No destination cart -- just claim the anonymous one.
    await prisma.cart.update({ where: { id: anon.id }, data: { userId } });
    return;
  }

  for (const item of anon.items) {
    // `variantId` is nullable, and Prisma's compound-unique `where` cannot
    // express NULL -- so the no-variant case is matched with findFirst.
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: item.quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }
  await prisma.cart.delete({ where: { id: anon.id } });
}

type RawCart = Awaited<ReturnType<typeof getOrCreateCart>>;

/** Project a cart row into the shape the UI renders, with totals computed. */
export function toCartView(cart: RawCart | null): CartView {
  if (!cart) return EMPTY_CART;

  const lines: CartLine[] = cart.items
    .filter((i) => i.product.isActive)
    .map((i) => {
      const unitPrice = i.product.price + (i.variant?.priceDelta ?? 0);
      const media = i.product.media[0];
      return {
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        name: i.product.name,
        slug: i.product.slug,
        size: i.variant?.size ?? null,
        imageId: media?.publicId ?? null,
        imageKind: (media?.kind ?? "IMAGE") as "IMAGE" | "VIDEO",
        unitPrice,
        quantity: i.quantity,
        lineTotal: unitPrice * i.quantity,
        stock: i.variant?.stock ?? null,
      };
    });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = shippingFor(subtotal);

  return {
    id: cart.id,
    lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export async function getCartView(): Promise<CartView> {
  return toCartView(await findCart());
}
