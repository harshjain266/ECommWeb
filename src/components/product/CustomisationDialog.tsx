"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

/**
 * "Inquire about customization".
 *
 * Deliberately the loud button on the page — in this business most enquiries
 * become commissions, and a commission is worth several times a ready sale.
 */
export function CustomisationDialog({
  productName,
  sku,
}: {
  productName: string;
  sku: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      occasion: String(fd.get("occasion") ?? ""),
      date: String(fd.get("date") ?? ""),
      message: `[Customisation — ${productName} (${sku})] ${fd.get("message") ?? ""}`,
    };

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send your enquiry");
      return;
    }
    setDone(data.message ?? "Thank you — we will be in touch.");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn w-full bg-oxblood text-bone transition-colors hover:bg-ink"
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
        Inquire about customization
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-bone p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 p-1.5 text-ink-mute hover:text-ink"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>

              {done ? (
                <div className="py-8 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink">
                    <Check className="h-5 w-5 text-gold-light" strokeWidth={1.5} />
                  </span>
                  <p className="display mt-5 text-[26px] text-ink">Enquiry sent</p>
                  <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
                    {done}
                  </p>
                </div>
              ) : (
                <>
                  <p className="label text-gold">Customisation</p>
                  <h2 className="display mt-3 text-[26px] leading-snug text-ink">
                    {productName}
                  </h2>
                  <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-mute">
                    Tell us what you would like changed — colour, neckline,
                    sleeve length, embroidery density, or a different fabric
                    entirely. Most of this piece can be re-made to order.
                  </p>

                  <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="c-name" className="field-label">
                          Your name
                        </label>
                        <input id="c-name" name="name" required className="field" />
                      </div>
                      <div>
                        <label htmlFor="c-phone" className="field-label">
                          Phone
                        </label>
                        <input
                          id="c-phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="+91 98100 00000"
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-email" className="field-label">
                        Email
                      </label>
                      <input
                        id="c-email"
                        name="email"
                        type="email"
                        required
                        className="field"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="c-occasion" className="field-label">
                          Occasion
                        </label>
                        <input
                          id="c-occasion"
                          name="occasion"
                          placeholder="Reception"
                          className="field"
                        />
                      </div>
                      <div>
                        <label htmlFor="c-date" className="field-label">
                          Date of the event
                        </label>
                        <input
                          id="c-date"
                          name="date"
                          placeholder="November 2026"
                          className="field"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-message" className="field-label">
                        What would you like changed?
                      </label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={4}
                        className="field resize-y"
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

                    <button type="submit" disabled={pending} className="btn-dark w-full">
                      {pending ? <Spinner /> : "Send enquiry"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
