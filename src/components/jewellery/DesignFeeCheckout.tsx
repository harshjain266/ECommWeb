"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { loadRazorpay, RAZORPAY_THEME } from "@/lib/load-razorpay";
import { formatFee } from "@/lib/jewellery";

type Mode =
  /** Straight after the brief was sent: we already know who this is. */
  | { kind: "known"; reference: string; email: string }
  /** A customer coming back later, who has to identify the commission. */
  | { kind: "lookup" };

/**
 * Taking the design fee, through Razorpay.
 *
 * Deliberately never the only way forward. The atelier's promise on this page
 * is that nothing is charged until someone has spoken to you, and that is
 * worth more than a marginally faster conversion — so this is an opt-in for
 * people who already know what they want, sitting beside an equally plain
 * "wait for our call".
 *
 * Nothing here is trusted: the amount comes from the commission row on the
 * server, and the success payload is only believed once its signature has
 * been verified server-side.
 */
export function DesignFeeCheckout({
  mode,
  feePaise,
  tone = "light",
}: {
  mode: Mode;
  feePaise?: number;
  tone?: "light" | "dark";
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState<string | null>(null);
  const [reference, setReference] = useState(
    mode.kind === "known" ? mode.reference : "",
  );
  const [email, setEmail] = useState(mode.kind === "known" ? mode.email : "");

  const dark = tone === "dark";
  // `.field` is built for the cream page; on the dark panel it needs the
  // ground and the text swapped or it reads as a white hole.
  const fieldCls = dark
    ? "field mt-2 border-bone/20 bg-white/5 text-bone placeholder:text-bone/30 focus:bg-white/10"
    : "field mt-2";
  const labelCls = dark ? "field-label text-bone/50" : "field-label";

  async function pay(e?: React.FormEvent) {
    e?.preventDefault();
    setPending(true);
    setError(null);

    // 1. Raise the Razorpay order, server-priced from the commission row.
    const res = await fetch("/api/commissions/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, email }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setPending(false);
      if (data.paid) setPaid(reference);
      else setError(data.error ?? "Could not start the payment. Please try again.");
      return;
    }

    // 2. Hand off to Razorpay Checkout.
    const ready = await loadRazorpay();
    if (!ready || !window.Razorpay) {
      setPending(false);
      setError("Could not open the payment window. Check your connection and retry.");
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Sanskar Gupta Fine Jewellery",
      description: `Design fee — commission ${data.reference}`,
      order_id: data.razorpayOrderId,
      prefill: data.prefill,
      notes: { reference: data.reference, kind: "design-fee" },
      theme: RAZORPAY_THEME,
      modal: {
        ondismiss: () => {
          setPending(false);
          setError("Payment cancelled. Your brief is still with us either way.");
        },
      },
      // 3. Verify the handback server-side before believing any of it.
      handler: async (response: Record<string, string>) => {
        const verify = await fetch("/api/commissions/pay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const result = await verify.json().catch(() => ({}));
        setPending(false);

        if (!verify.ok) {
          setError(
            result.error ??
              "Your payment went through but we could not confirm it here. Please call the atelier — nothing is lost.",
          );
          return;
        }
        setPaid(result.reference ?? reference);
      },
    });

    rzp.open();
  }

  if (paid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`rounded-xl border p-6 text-center ${
          dark ? "border-gold/35 bg-white/5" : "border-gold/40 bg-bone"
        }`}
      >
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink">
          <Check className="h-5 w-5 text-gold-light" strokeWidth={1.5} />
        </span>
        <p className={`display mt-4 text-[22px] ${dark ? "text-bone" : "text-ink"}`}>
          Design fee received
        </p>
        <p
          className={`mx-auto mt-2 max-w-sm font-sans text-[13px] leading-relaxed ${
            dark ? "text-bone/60" : "text-ink-mute"
          }`}
        >
          Commission {paid} is on the bench. Razorpay has emailed you the receipt,
          and your three renders are due within about a week.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      {mode.kind === "lookup" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fee-ref" className={labelCls}>
              Commission reference
            </label>
            <input
              id="fee-ref"
              className={fieldCls}
              value={reference}
              onChange={(ev) => setReference(ev.target.value)}
              placeholder="SK-C-0042"
              required
            />
          </div>
          <div>
            <label htmlFor="fee-email" className={labelCls}>
              The email on the brief
            </label>
            <input
              id="fee-email"
              type="email"
              className={fieldCls}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>
      )}

      {error && (
        <p className={dark ? "field-error text-oxblood-light" : "field-error"}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !reference || !email}
        className={dark ? "btn-light w-full" : "btn-dark w-full"}
      >
        {pending ? <Spinner /> : <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />}
        {pending ? "Opening the payment window" : `Pay the ${formatFee(feePaise)} design fee`}
      </button>

      <p
        className={`flex items-center justify-center gap-2 font-sans text-[12px] ${
          dark ? "text-bone/45" : "text-ink-mute"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        UPI, card, netbanking or wallet, through Razorpay. We never see your card
        details.
      </p>
    </form>
  );
}
