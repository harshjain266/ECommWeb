import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateCart, findCart, toCartView } from "@/lib/cart";
import { addToCartSchema, updateCartSchema, fieldErrors } from "@/lib/validators";

export async function GET() {
  return NextResponse.json(toCartView(await findCart()));
}

/** Add a line, or increment it when the same product+size is already in the bag. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { productId, variantId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, variants: { select: { id: true, stock: true } } },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "That piece is not available" }, { status: 404 });
  }

  // A product with sizes must be added with one chosen, otherwise the order
  // line would have no size to cut to.
  if (product.variants.length > 0 && !variantId) {
    return NextResponse.json({ error: "Please choose a size" }, { status: 422 });
  }

  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : undefined;
  if (variantId && !variant) {
    return NextResponse.json({ error: "That size is not available" }, { status: 422 });
  }

  const cart = await getOrCreateCart();

  // Matched with findFirst rather than the compound unique key: `variantId`
  // is nullable (a product may have no sizes at all), and Prisma's compound
  // unique input cannot express null.
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId ?? null },
  });

  const desired = (existing?.quantity ?? 0) + quantity;
  if (variant && desired > variant.stock) {
    return NextResponse.json(
      {
        error:
          variant.stock === 0
            ? "That size is sold out"
            : `Only ${variant.stock} left in that size`,
      },
      { status: 409 },
    );
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: desired },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId: variantId ?? null, quantity },
    });
  }

  return NextResponse.json(toCartView(await findCart()));
}

/** Set a line's quantity. Zero removes it. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = updateCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { itemId, quantity } = parsed.data;
  const cart = await findCart();
  if (!cart) return NextResponse.json({ error: "No cart" }, { status: 404 });

  // Scope the lookup to this cart so one visitor cannot edit another's line.
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return NextResponse.json({ error: "Item not in your bag" }, { status: 404 });

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    const stock = item.variant?.stock;
    if (typeof stock === "number" && quantity > stock) {
      return NextResponse.json(
        { error: `Only ${stock} left in that size` },
        { status: 409 },
      );
    }
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  return NextResponse.json(toCartView(await findCart()));
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const cart = await findCart();
  if (!cart) return NextResponse.json({ error: "No cart" }, { status: 404 });

  if (itemId) {
    if (!cart.items.some((i) => i.id === itemId)) {
      return NextResponse.json({ error: "Item not in your bag" }, { status: 404 });
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json(toCartView(await findCart()));
}
