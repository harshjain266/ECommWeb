"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ArrowRight } from "lucide-react";
import type { CartView as CartData } from "@/lib/cart";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/money";

export function CartView({ initial }: { initial: CartData }) {
  const router = useRouter();
  const toast = useToast();
  const [cart, setCart] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function mutate(
    body: RequestInit,
    url = "/api/cart",
    id: string | null = null,
  ) {
    setBusyId(id);
    const res = await fetch(url, body);
    const data = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      toast(data.error ?? "Could not update your bag", "error");
      return;
    }
    setCart(data);
    router.refresh();
  }

  const setQty = (itemId: string, quantity: number) =>
    mutate(
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      },
      "/api/cart",
      itemId,
    );

  const remove = (itemId: string) =>
    mutate({ method: "DELETE" }, `/api/cart?itemId=${itemId}`, itemId);

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-24 text-center lg:py-32">
        <p className="label text-gold">Your bag</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
          Nothing here yet
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
          When you find a piece you would like to be measured for, it will
          appear here.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/collections/bridal" className="btn-dark">
            Browse bridal
          </Link>
          <Link href="/collections/new-arrivals" className="btn-outline">
            New arrivals
          </Link>
        </div>
      </div>
    );
  }

  const toFreeShipping = FREE_SHIPPING_THRESHOLD - cart.subtotal;

  return (
    <div className="shell py-12 lg:py-16">
      <p className="label text-gold">Your bag</p>
      <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
        {cart.count} {cart.count === 1 ? "piece" : "pieces"}
      </h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        {/* ---- lines ---- */}
        <ul>
          <AnimatePresence initial={false}>
            {cart.lines.map((line) => (
              <motion.li
                key={line.id}
                layout
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-5 overflow-hidden border-b border-ink/10 py-6 first:pt-0"
              >
                <Link href={`/product/${line.slug}`} className="w-24 shrink-0 sm:w-28">
                  {line.imageId && (
                    <CldImage
                      publicId={line.imageId}
                      alt={line.name}
                      ratio="3/4"
                      widths={[200, 320]}
                      sizes="112px"
                      fromVideo={line.imageKind === "VIDEO"}
                    />
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/product/${line.slug}`}>
                        <h2 className="font-display text-[20px] font-light leading-snug text-ink">
                          {line.name}
                        </h2>
                      </Link>
                      <p className="shrink-0 font-sans text-sm text-ink">
                        {formatINR(line.lineTotal)}
                      </p>
                    </div>
                    {line.size && (
                      <p className="label mt-1.5 text-ink-mute/70">Size {line.size}</p>
                    )}
                    <p className="mt-1 font-sans text-[12px] text-ink-mute/60">
                      {formatINR(line.unitPrice)} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center border border-ink/20">
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.quantity - 1)}
                        disabled={busyId === line.id || line.quantity <= 1}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="px-3.5 py-2.5 font-sans text-sm disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-sans text-sm">
                        {busyId === line.id ? <Spinner className="h-3 w-3" /> : line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.quantity + 1)}
                        disabled={
                          busyId === line.id ||
                          (line.stock !== null && line.quantity >= line.stock)
                        }
                        aria-label={`Increase quantity of ${line.name}`}
                        className="px-3.5 py-2.5 font-sans text-sm disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      disabled={busyId === line.id}
                      className="label flex items-center gap-1.5 text-ink-mute/60 transition-colors hover:text-oxblood"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {/* ---- summary ---- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-bone-warm p-7">
            <p className="label text-ink-mute">Summary</p>

            <dl className="mt-6 space-y-3 font-sans text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-mute">Subtotal</dt>
                <dd className="text-ink">{formatINR(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-mute">Shipping</dt>
                <dd className="text-ink">
                  {cart.shipping === 0 ? "Complimentary" : formatINR(cart.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink/15 pt-3">
                <dt className="label self-center text-ink">Total</dt>
                <dd className="display text-[26px] text-ink">
                  {formatINR(cart.total)}
                </dd>
              </div>
            </dl>

            {toFreeShipping > 0 && (
              <p className="mt-5 bg-bone px-4 py-3 font-sans text-xs leading-relaxed text-ink-mute">
                Add {formatINR(toFreeShipping)} more for complimentary shipping.
              </p>
            )}

            <Link href="/checkout" className="btn-dark group mt-6 w-full">
              Proceed to checkout
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </Link>

            <p className="mt-4 text-center font-sans text-[11px] leading-relaxed text-ink-mute/70">
              Duties and taxes included. Secured by Razorpay.
            </p>
          </div>

          <Link
            href="/collections/new-arrivals"
            className="label link-sweep mt-6 inline-block text-ink-mute"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
