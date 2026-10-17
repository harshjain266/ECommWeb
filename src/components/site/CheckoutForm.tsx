"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { CartView } from "@/lib/cart";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/money";

type Prefill = {
  email: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Load Razorpay Checkout on demand rather than on every page view. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  cart,
  prefill,
  paymentsReady,
}: {
  cart: CartView;
  prefill: Prefill;
  paymentsReady: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());

    // 1. Create our order + a Razorpay order, server-side and server-priced.
    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Could not start checkout");
      setFields(data.fields ?? {});
      setPending(false);
      return;
    }

    // 2. Hand off to Razorpay Checkout.
    const ready = await loadRazorpay();
    if (!ready || !window.Razorpay) {
      setError("Could not load the payment window. Check your connection and retry.");
      setPending(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Sanskar & Kabir",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: data.prefill,
      notes: { orderNumber: data.orderNumber },
      theme: { color: "#3E2516" },
      modal: {
        ondismiss: () => {
          setPending(false);
          toast("Payment cancelled — your bag is still here", "error");
        },
      },
      // 3. Verify the handback server-side before trusting it.
      handler: async (response: Record<string, string>) => {
        const verify = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const result = await verify.json().catch(() => ({}));

        if (!verify.ok) {
          setPending(false);
          setError(
            result.error ??
              "Your payment went through but we could not confirm it. Please contact the atelier.",
          );
          return;
        }
        router.push(`/order/${result.orderId}`);
        router.refresh();
      },
    });

    rzp.open();
  }

  return (
    <div className="shell py-12 lg:py-16">
      <p className="label text-gold">Checkout</p>
      <h1 className="display mt-4 text-[clamp(2.2rem,6vw,3.4rem)] text-ink">
        Delivery details
      </h1>

      {!paymentsReady && (
        <p className="mt-6 max-w-2xl border-l-2 border-gold bg-gold/5 px-5 py-4 font-sans text-sm leading-relaxed text-ink-mute">
          <strong className="font-medium text-ink">Payments are not live yet.</strong>{" "}
          Add your Razorpay test keys to <code className="text-ink">.env</code> (
          <code className="text-ink">RAZORPAY_KEY_ID</code>,{" "}
          <code className="text-ink">RAZORPAY_KEY_SECRET</code>,{" "}
          <code className="text-ink">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>) and restart
          the server. The form below is fully wired and will work the moment they
          are present.
        </p>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {/* ---- form ---- */}
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={prefill.email}
              autoComplete="email"
              className="field"
            />
            {fields.email && <span className="field-error">{fields.email}</span>}
            <span className="mt-1.5 block font-sans text-xs text-ink-mute/70">
              Your receipt and fitting schedule go here.
            </span>
          </div>

          <div className="hairline" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="field-label">
                Recipient's full name
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                defaultValue={prefill.fullName}
                autoComplete="name"
                className="field"
              />
              {fields.fullName && <span className="field-error">{fields.fullName}</span>}
            </div>
            <div>
              <label htmlFor="phone" className="field-label">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={prefill.phone}
                autoComplete="tel"
                placeholder="+91 98100 00000"
                className="field"
              />
              {fields.phone && <span className="field-error">{fields.phone}</span>}
            </div>
          </div>

          <div>
            <label htmlFor="line1" className="field-label">
              Address
            </label>
            <input
              id="line1"
              name="line1"
              required
              defaultValue={prefill.line1}
              autoComplete="address-line1"
              placeholder="House / flat, street"
              className="field"
            />
            {fields.line1 && <span className="field-error">{fields.line1}</span>}
          </div>

          <div>
            <label htmlFor="line2" className="field-label">
              Area / landmark{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="line2"
              name="line2"
              defaultValue={prefill.line2}
              autoComplete="address-line2"
              className="field"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="field-label">
                City
              </label>
              <input
                id="city"
                name="city"
                required
                defaultValue={prefill.city}
                autoComplete="address-level2"
                className="field"
              />
              {fields.city && <span className="field-error">{fields.city}</span>}
            </div>
            <div>
              <label htmlFor="state" className="field-label">
                State
              </label>
              <input
                id="state"
                name="state"
                required
                defaultValue={prefill.state}
                autoComplete="address-level1"
                className="field"
              />
              {fields.state && <span className="field-error">{fields.state}</span>}
            </div>
            <div>
              <label htmlFor="pincode" className="field-label">
                PIN code
              </label>
              <input
                id="pincode"
                name="pincode"
                required
                inputMode="numeric"
                pattern="[1-9][0-9]{5}"
                defaultValue={prefill.pincode}
                autoComplete="postal-code"
                className="field"
              />
              {fields.pincode && <span className="field-error">{fields.pincode}</span>}
            </div>
          </div>

          <input type="hidden" name="country" value="India" />

          <div>
            <label htmlFor="notes" className="field-label">
              Notes for the atelier{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Wedding date, preferred fitting days, anything we should know."
              className="field resize-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood"
            >
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={pending || cart.lines.length === 0}
            whileTap={{ scale: 0.995 }}
            className="btn-dark w-full"
          >
            {pending ? (
              <Spinner />
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                Pay {formatINR(cart.total)}
              </>
            )}
          </motion.button>

          <p className="text-center font-sans text-[11px] leading-relaxed text-ink-mute/70">
            You will be taken to Razorpay to pay by card, UPI, netbanking or
            wallet. We never see your card details.
          </p>
        </form>

        {/* ---- order summary ---- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-bone-warm p-7">
            <p className="label text-ink-mute">
              Your order &#183; {cart.count} {cart.count === 1 ? "piece" : "pieces"}
            </p>

            <ul className="mt-6 space-y-4">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  {line.imageId && (
                    <div className="w-16 shrink-0">
                      <CldImage
                        publicId={line.imageId}
                        alt={line.name}
                        ratio="3/4"
                        widths={[160]}
                        sizes="64px"
                        fromVideo={line.imageKind === "VIDEO"}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-display text-[16px] font-light leading-snug text-ink">
                      {line.name}
                    </p>
                    <p className="label mt-1 text-ink-mute/60">
                      {line.size ? `${line.size} · ` : ""}Qty {line.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-sans text-[13px] text-ink">
                    {formatINR(line.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-7 space-y-3 border-t border-ink/15 pt-5 font-sans text-sm">
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
                <dd className="display text-[26px] text-ink">{formatINR(cart.total)}</dd>
              </div>
            </dl>
          </div>

          <Link href="/cart" className="label link-sweep mt-6 inline-block text-ink-mute">
            Edit your bag
          </Link>
        </div>
      </div>
    </div>
  );
}
