import type { Metadata } from "next";
import { SiteChrome } from "@/components/site/SiteChrome";
import { CartView } from "@/components/site/CartView";
import { getCartView } from "@/lib/cart";

export const metadata: Metadata = { title: "Your bag" };
// The bag is per-visitor, so it must never be cached.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartView();
  return (
    <SiteChrome>
      <CartView initial={cart} />
    </SiteChrome>
  );
}
