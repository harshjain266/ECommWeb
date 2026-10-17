"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { WishlistButton } from "./WishlistButton";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

export type Variant = {
  id: string;
  size: string;
  stock: number;
  priceDelta: number;
};

export function AddToCart({
  productId,
  basePrice,
  variants,
  savedToWishlist,
}: {
  productId: string;
  basePrice: number;
  variants: Variant[];
  savedToWishlist: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  // Preselect the first size actually in stock, so the common case needs
  // no interaction before adding to bag.
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState<"bag" | "buy" | null>(null);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const price = basePrice + (selected?.priceDelta ?? 0);
  const soldOut = variants.length > 0 && variants.every((v) => v.stock === 0);
  const maxQty = selected ? Math.min(selected.stock, 10) : 10;
  const isMadeToOrder = /custom|made to order|bespoke/i.test(selected?.size ?? "");

  async function add(mode: "bag" | "buy") {
    if (variants.length > 0 && !variantId) {
      toast("Please choose a size", "error");
      return;
    }
    setPending(mode);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(null);

    if (!res.ok) {
      toast(data.error ?? "Could not add to your bag", "error");
      return;
    }

    if (mode === "buy") {
      router.push("/checkout");
      return;
    }
    toast("Added to your bag");
    // The header bag count is a server component, so refresh to re-render it.
    router.refresh();
  }

  return (
    <div className="space-y-7">
      {/* ---- price ---- */}
      <div>
        <div className="flex items-baseline gap-3">
          <p className="display text-[30px] text-ink">{formatINR(price)}</p>
          {selected && selected.priceDelta !== 0 && (
            <span className="label text-ink-mute/70">
              incl. {selected.size.toLowerCase()}
            </span>
          )}
        </div>
        <p className="mt-1 font-sans text-[12px] text-ink-mute/70">Taxes included.</p>
      </div>

      {/* ---- sizes ---- */}
      {variants.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="label text-ink">
              Size: <span className="text-ink-mute">{selected?.size ?? "—"}</span>
            </p>
            <a href="/size-guide" className="label link-sweep text-ink-mute/70">
              Size chart
            </a>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock === 0;
              const on = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }}
                  aria-pressed={on}
                  className={cn(
                    "label relative min-w-[62px] border px-4 py-3 transition-all duration-300",
                    on
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/20 text-ink hover:border-ink",
                    out &&
                      "cursor-not-allowed border-ink/10 text-ink-mute/35 line-through hover:border-ink/10",
                  )}
                >
                  {v.size}
                </button>
              );
            })}
          </div>

          {selected && selected.stock > 0 && selected.stock <= 3 && !isMadeToOrder && (
            <p className="mt-3 font-sans text-xs text-oxblood">
              Only {selected.stock} left in {selected.size}.
            </p>
          )}
          {isMadeToOrder && (
            <p className="mt-3 font-sans text-xs leading-relaxed text-ink-mute">
              Cut to your measurements over three fittings. Allow eight to ten
              weeks.
            </p>
          )}
        </div>
      )}

      {/* ---- quantity ---- */}
      <div>
        <p className="label text-ink">Quantity</p>
        <div className="mt-3 inline-flex items-center border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="px-4 py-3 font-sans text-sm disabled:opacity-30"
          >
            −
          </button>
          <span className="w-10 text-center font-sans text-sm" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            aria-label="Increase quantity"
            className="px-4 py-3 font-sans text-sm disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* ---- actions ---- */}
      <div className="space-y-2.5">
        <div className="flex gap-2.5">
          <motion.button
            type="button"
            onClick={() => add("bag")}
            disabled={pending !== null || soldOut}
            whileTap={{ scale: 0.99 }}
            className="btn-outline flex-1"
          >
            {pending === "bag" ? (
              <Spinner />
            ) : soldOut ? (
              "Sold out"
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
                Add to cart
              </>
            )}
          </motion.button>

          <WishlistButton
            productId={productId}
            initiallySaved={savedToWishlist}
            className="shrink-0 !h-auto !w-14 !rounded-none border border-ink/20 bg-transparent hover:bg-bone-warm"
          />
        </div>

        <motion.button
          type="button"
          onClick={() => add("buy")}
          disabled={pending !== null || soldOut}
          whileTap={{ scale: 0.99 }}
          className="btn-dark w-full"
        >
          {pending === "buy" ? (
            <Spinner />
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" strokeWidth={1.5} />
              Buy it now
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
