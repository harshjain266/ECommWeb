"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { formatFee } from "@/lib/jewellery";

/** Mirrors the server cap. Checked here only so the error is instant. */
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = "image/*,.heic,.heif,video/mp4,video/quicktime";

const METALS = [
  "Not sure yet",
  "Yellow gold",
  "White gold",
  "Rose gold",
  "Platinum",
  "Silver",
];

const STONES = [
  "Not sure yet",
  "Diamonds",
  "Polki / uncut",
  "Coloured stones",
  "Pearls",
  "My own stones",
];

const BUDGETS = [
  "Rather not say",
  "Under ₹50,000",
  "₹50,000 – ₹1,50,000",
  "₹1,50,000 – ₹4,00,000",
  "₹4,00,000 – ₹10,00,000",
  "Above ₹10,00,000",
];

type Done = { reference: string; message: string };

/**
 * The commission brief.
 *
 * Only three fields are required — name, phone, email — because everything
 * else is a conversation we would rather have on the telephone than lose a
 * lead over. The triage fields are there so the first call starts informed,
 * not so the form can qualify anyone out of it.
 *
 * Submits as multipart because of the attachment; the whole thing goes to
 * one endpoint, which uploads to Cloudinary and writes the row together.
 */
export function CommissionForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs are a leak if they are not handed back.
  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function take(next: File | null) {
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_BYTES) {
      setError(`That file is ${(next.size / 1048576).toFixed(1)}MB — the limit is 20MB.`);
      return;
    }
    setFile(next);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const fd = new FormData(e.currentTarget);
    if (file) fd.set("file", file);
    else fd.delete("file");

    const res = await fetch("/api/commissions", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not send your brief. Please try again.");
      setFields(data.fields ?? {});
      return;
    }
    setDone({ reference: data.reference, message: data.message });
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-gold/30 bg-bone p-8 text-center sm:p-10"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink">
          <Check className="h-5 w-5 text-gold-light" strokeWidth={1.5} />
        </span>
        <p className="display mt-5 text-[28px] text-ink">Your brief is with us</p>
        <p className="label mt-4 text-gold">Reference {done.reference}</p>
        <p className="mx-auto mt-4 max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
          {done.message}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {/* ---- the attachment, first: it is the most useful thing we get ---- */}
      <div>
        <span className="field-label">The piece you have in mind</span>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            take(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`mt-2 rounded-xl border border-dashed p-5 transition-colors ${
            dragging ? "border-gold bg-gold/5" : "border-ink/25 bg-bone-warm/50"
          }`}
        >
          {file ? (
            <div className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-ink/10 font-sans text-[11px] text-ink-mute">
                  Clip
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[13px] text-ink">{file.name}</p>
                <p className="font-sans text-[12px] text-ink-mute">
                  {(file.size / 1048576).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => take(null)}
                className="shrink-0 p-2 text-ink-mute transition-colors hover:text-oxblood"
                aria-label="Remove attachment"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.25} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 py-3 text-center"
            >
              <ImagePlus className="h-6 w-6 text-ink-mute" strokeWidth={1.25} />
              <span className="font-sans text-[13px] text-ink">
                Attach a photograph, screenshot or sketch
              </span>
              <span className="font-sans text-[12px] text-ink-mute">
                Drag it here, or click to browse — JPEG, PNG, HEIC or a short
                clip, up to 20MB
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => take(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* ---- who you are ---- */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Your name" error={fields.name}>
          <input id="j-name" name="name" className="field" autoComplete="name" required />
        </Field>
        <Field name="phone" label="Contact number" error={fields.phone}>
          <input
            id="j-phone"
            name="phone"
            type="tel"
            className="field"
            autoComplete="tel"
            placeholder="+91 "
            required
          />
        </Field>
      </div>

      <Field name="email" label="Email" error={fields.email}>
        <input
          id="j-email"
          name="email"
          type="email"
          className="field"
          autoComplete="email"
          required
        />
      </Field>

      {/* ---- the brief ---- */}
      <Field name="brief" label="What would you like made?" error={fields.brief}>
        <textarea
          id="j-brief"
          name="brief"
          rows={4}
          className="field resize-none"
          placeholder="A rani haar like my mother's, but lighter. Or: re-set the stones from this ring into ear drops."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="metal" label="Metal">
          <select id="j-metal" name="metal" className="field" defaultValue={METALS[0]}>
            {METALS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field name="stones" label="Stones">
          <select id="j-stones" name="stones" className="field" defaultValue={STONES[0]}>
            {STONES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field name="budget" label="Budget range">
          <select id="j-budget" name="budget" className="field" defaultValue={BUDGETS[0]}>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field name="wearDate" label="When do you need it?">
          <input
            id="j-wearDate"
            name="wearDate"
            className="field"
            placeholder="February wedding, or a date"
          />
        </Field>
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" disabled={pending} className="btn-dark w-full">
        {pending ? <Spinner /> : null}
        {pending ? "Sending your brief" : "Send my brief"}
      </button>

      <p className="text-center font-sans text-[12px] leading-relaxed text-ink-mute">
        Sending this costs nothing. The {formatFee()} design fee is payable only
        after we have spoken and agreed what is being made.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`j-${name}`} className="field-label">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
