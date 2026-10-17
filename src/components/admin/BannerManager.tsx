"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Images, Plus, Trash2, Pencil, Eye, EyeOff, Film } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker, type PickedAsset } from "./MediaPicker";
import { cn } from "@/lib/utils";

export type BannerValues = {
  id?: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  ctaLabel: string;
  ctaHref: string;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  slot: "HERO" | "MARQUEE" | "EDITORIAL";
  position: number;
  isActive: boolean;
};

const BLANK: BannerValues = {
  title: "",
  subtitle: "",
  eyebrow: "",
  ctaLabel: "",
  ctaHref: "",
  publicId: "",
  kind: "IMAGE",
  slot: "HERO",
  position: 0,
  isActive: true,
};

const SLOTS = [
  { value: "HERO", label: "Hero carousel", hint: "Full-bleed, above the fold" },
  { value: "EDITORIAL", label: "Editorial panel", hint: "Split image / text section" },
  { value: "MARQUEE", label: "Marquee", hint: "Reserved for the ticker" },
] as const;

export function BannerManager({ initial }: { initial: BannerValues[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<BannerValues | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(b: BannerValues) {
    if (!b.id) return;
    setBusyId(b.id);
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    setBusyId(null);
    if (!res.ok) {
      toast("Could not update the banner", "error");
      return;
    }
    toast(b.isActive ? "Banner hidden" : "Banner shown");
    router.refresh();
  }

  async function remove(b: BannerValues) {
    if (!b.id) return;
    if (!confirm(`Delete the "${b.title}" banner? This cannot be undone.`)) return;
    setBusyId(b.id);
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      toast("Could not delete the banner", "error");
      return;
    }
    toast("Banner deleted");
    router.refresh();
  }

  const bySlot = (slot: string) => initial.filter((b) => b.slot === slot);

  return (
    <div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing({ ...BLANK, position: initial.length })}
          className="btn-dark"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New banner
        </button>
      </div>

      {SLOTS.map((slot) => {
        const rows = bySlot(slot.value);
        return (
          <section key={slot.value} className="mt-8">
            <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
              <h2 className="label text-ink-mute">{slot.label}</h2>
              <p className="font-sans text-xs text-ink-mute/60">{slot.hint}</p>
            </div>

            {rows.length === 0 ? (
              <p className="py-8 text-center font-sans text-sm text-ink-mute">
                Nothing in this slot.
              </p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((b) => (
                  <li key={b.id} className="bg-bone">
                    <div className="relative">
                      <CldImage
                        publicId={b.publicId}
                        alt={b.title}
                        ratio="16/9"
                        widths={[400, 640]}
                        sizes="(min-width:1280px) 25vw, 50vw"
                        fromVideo={b.kind === "VIDEO"}
                      />
                      {b.kind === "VIDEO" && (
                        <span className="label absolute left-2 top-2 flex items-center gap-1 bg-ink/75 px-1.5 py-1 text-bone">
                          <Film className="h-3 w-3" strokeWidth={1.5} />
                          clip
                        </span>
                      )}
                      <span
                        className={cn(
                          "label absolute right-2 top-2 px-2 py-1",
                          b.isActive ? "bg-ink text-bone" : "bg-bone/90 text-ink-mute",
                        )}
                      >
                        {b.isActive ? "live" : "hidden"}
                      </span>
                    </div>

                    <div className="p-4">
                      {b.eyebrow && (
                        <p className="label text-gold">{b.eyebrow}</p>
                      )}
                      <p className="mt-1 font-display text-[20px] font-light text-ink">
                        {b.title}
                      </p>
                      {b.subtitle && (
                        <p className="mt-1.5 line-clamp-2 font-sans text-[12px] leading-relaxed text-ink-mute">
                          {b.subtitle}
                        </p>
                      )}
                      <p className="label mt-2 text-ink-mute/50">
                        position {b.position}
                        {b.ctaHref ? ` · → ${b.ctaHref}` : ""}
                      </p>

                      <div className="mt-4 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(b)}
                          className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggle(b)}
                          disabled={busyId === b.id}
                          className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
                          title={b.isActive ? "Hide" : "Show"}
                        >
                          {busyId === b.id ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : b.isActive ? (
                            <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                          ) : (
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(b)}
                          disabled={busyId === b.id}
                          className="p-2 text-ink-mute/60 transition-colors hover:text-oxblood"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <AnimatePresence>
        {editing && (
          <BannerDialog
            values={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BannerDialog({
  values,
  onClose,
  onSaved,
}: {
  values: BannerValues;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [v, setV] = useState(values);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BannerValues>(k: K, value: BannerValues[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!v.publicId) {
      setError("Choose an image or clip from the library");
      return;
    }
    setPending(true);
    setError(null);

    const res = await fetch(
      v.id ? `/api/admin/banners/${v.id}` : "/api/admin/banners",
      {
        method: v.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      },
    );
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save the banner");
      return;
    }
    toast(v.id ? "Banner saved" : "Banner created");
    onSaved();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink/70" onClick={onClose} />
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 14 }}
        onSubmit={save}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-bone p-6"
      >
        <h2 className="display text-[24px] text-ink">
          {v.id ? "Edit banner" : "New banner"}
        </h2>

        {/* ---- artwork ---- */}
        <div className="mt-5">
          <p className="field-label">Artwork</p>
          {v.publicId ? (
            <div className="flex items-start gap-4">
              <div className="w-40 shrink-0">
                <CldImage
                  publicId={v.publicId}
                  alt={v.title || v.publicId}
                  ratio="16/9"
                  widths={[400]}
                  sizes="160px"
                  fromVideo={v.kind === "VIDEO"}
                />
              </div>
              <div>
                <p className="break-all font-sans text-[12px] text-ink">{v.publicId}</p>
                <p className="label mt-1 text-ink-mute/60">
                  {v.kind === "VIDEO" ? "clip · autoplays silently" : "still"}
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="btn-outline mt-3 !py-2.5"
                >
                  <Images className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Change
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full flex-col items-center gap-2 border border-dashed border-ink/25 py-12 transition-colors hover:border-ink/50"
            >
              <Images className="h-5 w-5 text-ink-mute/50" strokeWidth={1.25} />
              <span className="label text-ink-mute">Choose from the library</span>
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="b-title" className="field-label">
              Headline
            </label>
            <input
              id="b-title"
              value={v.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="Gulnaar"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="b-eyebrow" className="field-label">
              Eyebrow
            </label>
            <input
              id="b-eyebrow"
              value={v.eyebrow}
              onChange={(e) => set("eyebrow", e.target.value)}
              placeholder="Bridal 2026"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="b-slot" className="field-label">
              Slot
            </label>
            <select
              id="b-slot"
              value={v.slot}
              onChange={(e) => set("slot", e.target.value as BannerValues["slot"])}
              className="field"
            >
              {SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="b-subtitle" className="field-label">
              Supporting line
            </label>
            <textarea
              id="b-subtitle"
              value={v.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              rows={3}
              className="field resize-y"
            />
          </div>

          <div>
            <label htmlFor="b-ctaLabel" className="field-label">
              Button text
            </label>
            <input
              id="b-ctaLabel"
              value={v.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              placeholder="Enter the bridal studio"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="b-ctaHref" className="field-label">
              Button link
            </label>
            <input
              id="b-ctaHref"
              value={v.ctaHref}
              onChange={(e) => set("ctaHref", e.target.value)}
              placeholder="/collections/bridal-lehengas"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="b-position" className="field-label">
              Position
            </label>
            <input
              id="b-position"
              type="number"
              min={0}
              value={v.position}
              onChange={(e) => set("position", Number(e.target.value))}
              className="field"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 self-end font-sans text-[13px] text-ink">
            <input
              type="checkbox"
              checked={v.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 accent-[#7A2116]"
            />
            Live on the homepage
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-2">
          <button type="submit" disabled={pending} className="btn-dark flex-1">
            {pending ? <Spinner /> : v.id ? "Save banner" : "Create banner"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            Cancel
          </button>
        </div>

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(assets: PickedAsset[]) => {
            const first = assets[0];
            if (!first) return;
            set("publicId", first.publicId);
            set("kind", first.kind);
            setError(null);
          }}
          selected={v.publicId ? [v.publicId] : []}
        />
      </motion.form>
    </motion.div>
  );
}
