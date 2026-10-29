"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

const OCCASIONS = [
  "Bridal commission",
  "Groom commission",
  "Sangeet / Mehendi",
  "Reception",
  "Festive",
  "Something else",
];

/**
 * `piece` arrives from the "Book a fitting" action on a product card, via
 * `/atelier?piece=<slug>`. It is shown back to the visitor and sent with the
 * request so the atelier knows which piece prompted the enquiry rather than
 * having to ask.
 */
export function AppointmentForm({ piece }: { piece?: string | null }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send the request");
      setFields(data.fields ?? {});
      return;
    }
    setDone(data.message ?? "Thank you — we will be in touch.");
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bone-warm p-8 text-center"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink">
          <Check className="h-5 w-5 text-gold-light" strokeWidth={1.5} />
        </span>
        <p className="display mt-5 text-[26px] text-ink">Request received</p>
        <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
          {done}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {piece && (
        <div className="border-l-2 border-gold bg-gold/10 px-4 py-3">
          <p className="label text-ink-mute/70">Enquiring about</p>
          <p className="mt-1 font-display text-[17px] font-light text-ink">{piece}</p>
          <input type="hidden" name="piece" value={piece} />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="a-name" className="field-label">
            Your name
          </label>
          <input id="a-name" name="name" required className="field" />
          {fields.name && <span className="field-error">{fields.name}</span>}
        </div>
        <div>
          <label htmlFor="a-phone" className="field-label">
            Phone
          </label>
          <input
            id="a-phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98100 00000"
            className="field"
          />
          {fields.phone && <span className="field-error">{fields.phone}</span>}
        </div>
      </div>

      <div>
        <label htmlFor="a-email" className="field-label">
          Email
        </label>
        <input id="a-email" name="email" type="email" required className="field" />
        {fields.email && <span className="field-error">{fields.email}</span>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="a-occasion" className="field-label">
            What for
          </label>
          <select
            id="a-occasion"
            name="occasion"
            defaultValue={piece ? "Groom commission" : OCCASIONS[0]}
            className="field"
          >
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-date" className="field-label">
            Date of the event{" "}
            <span className="normal-case tracking-normal">(if known)</span>
          </label>
          <input id="a-date" name="date" placeholder="November 2026" className="field" />
        </div>
      </div>

      <div>
        <label htmlFor="a-message" className="field-label">
          Anything you would like us to know
        </label>
        <textarea
          id="a-message"
          name="message"
          rows={4}
          placeholder="Colours you have in mind, pieces you have seen, how many outfits you are planning."
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
        {pending ? <Spinner /> : "Request an appointment"}
      </button>

      <p className="font-sans text-[11px] leading-relaxed text-ink-mute/70">
        Consultations run Tuesday to Saturday, 11am to 7pm, at our Chanakyapuri
        studio. Bridal slots for a given season usually close nine months ahead.
      </p>
    </form>
  );
}
