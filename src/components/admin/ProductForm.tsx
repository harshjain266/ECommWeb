"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { GripVertical, Images, Plus, Trash2, X, Film } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker, type PickedAsset } from "./MediaPicker";
import { paiseToRupees } from "@/lib/money";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  /** In paise, as stored; converted to rupees for the form. */
  price: number;
  compareAtPrice: number | null;
  sku: string;
  categoryId: string | null;
  fabric: string;
  color: string;
  craft: string;
  careNotes: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  position: number;
  media: { publicId: string; kind: "IMAGE" | "VIDEO"; alt: string }[];
  variants: { size: string; stock: number; priceDelta: number }[];
};

export type CategoryOption = { id: string; label: string };

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  sku: "",
  categoryId: null,
  fabric: "",
  color: "",
  craft: "",
  careNotes: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: true,
  position: 0,
  media: [],
  variants: [
    { size: "XS", stock: 0, priceDelta: 0 },
    { size: "S", stock: 0, priceDelta: 0 },
    { size: "M", stock: 0, priceDelta: 0 },
    { size: "L", stock: 0, priceDelta: 0 },
    { size: "XL", stock: 0, priceDelta: 0 },
    { size: "Bespoke", stock: 99, priceDelta: 0 },
  ],
};

export function ProductForm({
  initial,
  categories,
}: {
  initial?: ProductFormValues;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(initial?.id);

  // Money is held in rupees inside the form and converted on submit.
  const [v, setV] = useState<ProductFormValues>(() => {
    const base = initial ?? EMPTY;
    return {
      ...base,
      price: base.price ? paiseToRupees(base.price) : 0,
      compareAtPrice: base.compareAtPrice ? paiseToRupees(base.compareAtPrice) : null,
      variants: base.variants.map((x) => ({
        ...x,
        priceDelta: x.priceDelta ? paiseToRupees(x.priceDelta) : 0,
      })),
    };
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  function attach(assets: PickedAsset[]) {
    setV((prev) => {
      const have = new Set(prev.media.map((m) => m.publicId));
      const added = assets
        .filter((a) => !have.has(a.publicId))
        .map((a) => ({ publicId: a.publicId, kind: a.kind, alt: "" }));
      return { ...prev, media: [...prev.media, ...added] };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const payload = {
      ...v,
      // Media order is the gallery order; the server re-derives `position`.
      media: v.media.map((m, i) => ({ ...m, position: i })),
      variants: v.variants
        .filter((x) => x.size.trim())
        .map((x, i) => ({ ...x, position: i })),
      compareAtPrice: v.compareAtPrice || null,
    };

    const res = await fetch(
      editing ? `/api/admin/products/${initial!.id}` : "/api/admin/products",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save");
      setFields(data.fields ?? {});
      return;
    }

    toast(editing ? "Product saved" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* ================= left column ================= */}
        <div className="space-y-8">
          {/* ---- basics ---- */}
          <section className="bg-bone p-6">
            <h2 className="label text-ink-mute">The piece</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Name
                </label>
                <input
                  id="name"
                  value={v.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className="field"
                />
                {fields.name && <span className="field-error">{fields.name}</span>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="sku" className="field-label">
                    SKU
                  </label>
                  <input
                    id="sku"
                    value={v.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    required
                    placeholder="SK-0023"
                    className="field"
                  />
                  {fields.sku && <span className="field-error">{fields.sku}</span>}
                </div>
                <div>
                  <label htmlFor="slug" className="field-label">
                    URL slug{" "}
                    <span className="normal-case tracking-normal">
                      (auto from name if blank)
                    </span>
                  </label>
                  <input
                    id="slug"
                    value={v.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tagline" className="field-label">
                  Tagline
                </label>
                <input
                  id="tagline"
                  value={v.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Nine hundred hours of hand-set zardozi"
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="description" className="field-label">
                  Description
                </label>
                <textarea
                  id="description"
                  value={v.description}
                  onChange={(e) => set("description", e.target.value)}
                  required
                  rows={7}
                  className="field resize-y"
                />
                {fields.description && (
                  <span className="field-error">{fields.description}</span>
                )}
              </div>
            </div>
          </section>

          {/* ---- gallery ---- */}
          <section className="bg-bone p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="label text-ink-mute">Gallery</h2>
                <p className="mt-1 font-sans text-xs text-ink-mute/70">
                  Drag to reorder. The first asset is the card image; a clip in
                  second place plays on hover.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="btn-outline !py-2.5"
              >
                <Images className="h-3.5 w-3.5" strokeWidth={1.5} />
                Choose media
              </button>
            </div>

            {v.media.length === 0 ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-5 flex w-full flex-col items-center gap-2 border border-dashed border-ink/25 py-14 transition-colors hover:border-ink/50"
              >
                <Images className="h-5 w-5 text-ink-mute/50" strokeWidth={1.25} />
                <span className="label text-ink-mute">No media attached</span>
                <span className="font-sans text-xs text-ink-mute/70">
                  Click to open the library
                </span>
              </button>
            ) : (
              <Reorder.Group
                axis="y"
                values={v.media}
                onReorder={(next) => set("media", next)}
                className="mt-5 space-y-2"
              >
                {v.media.map((m, i) => (
                  <Reorder.Item
                    key={m.publicId}
                    value={m}
                    className="flex items-center gap-3 border border-ink/10 bg-bone-warm p-2.5"
                  >
                    <GripVertical
                      className="h-4 w-4 shrink-0 cursor-grab text-ink-mute/40"
                      strokeWidth={1.5}
                    />
                    <span className="w-12 shrink-0">
                      <CldImage
                        publicId={m.publicId}
                        alt={m.alt || m.publicId}
                        ratio="3/4"
                        widths={[120]}
                        sizes="48px"
                        fromVideo={m.kind === "VIDEO"}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        {m.kind === "VIDEO" && (
                          <Film className="h-3 w-3 shrink-0 text-gold" strokeWidth={1.5} />
                        )}
                        <span className="truncate font-sans text-[12px] text-ink">
                          {i === 0 ? "Cover · " : ""}
                          {m.publicId}
                        </span>
                      </span>
                      <input
                        value={m.alt}
                        onChange={(e) => {
                          const alt = e.target.value;
                          setV((prev) => ({
                            ...prev,
                            media: prev.media.map((x, xi) =>
                              xi === i ? { ...x, alt } : x,
                            ),
                          }));
                        }}
                        placeholder="Alt text, for screen readers"
                        className="mt-1 w-full border-0 bg-transparent p-0 font-sans text-[11px] text-ink-mute outline-none placeholder:text-ink-mute/40"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setV((prev) => ({
                          ...prev,
                          media: prev.media.filter((_, xi) => xi !== i),
                        }))
                      }
                      aria-label={`Remove ${m.publicId}`}
                      className="shrink-0 p-1.5 text-ink-mute/50 transition-colors hover:text-oxblood"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </section>

          {/* ---- sizes ---- */}
          <section className="bg-bone p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="label text-ink-mute">Sizes &amp; stock</h2>
                <p className="mt-1 font-sans text-xs text-ink-mute/70">
                  A surcharge is added to the base price. Removing a size keeps
                  past orders intact.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  set("variants", [...v.variants, { size: "", stock: 0, priceDelta: 0 }])
                }
                className="btn-outline !py-2.5"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Add size
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-[1fr_90px_120px_36px] gap-2">
                <span className="label text-ink-mute/60">Size</span>
                <span className="label text-ink-mute/60">Stock</span>
                <span className="label text-ink-mute/60">Surcharge ₹</span>
                <span />
              </div>

              <AnimatePresence initial={false}>
                {v.variants.map((x, i) => (
                  <motion.div
                    key={i}
                    layout
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-[1fr_90px_120px_36px] items-center gap-2"
                  >
                    <input
                      value={x.size}
                      onChange={(e) => {
                        const size = e.target.value;
                        set(
                          "variants",
                          v.variants.map((y, yi) => (yi === i ? { ...y, size } : y)),
                        );
                      }}
                      placeholder='M or 42"'
                      className="field !py-2.5"
                    />
                    <input
                      type="number"
                      min={0}
                      value={x.stock}
                      onChange={(e) => {
                        const stock = Number(e.target.value);
                        set(
                          "variants",
                          v.variants.map((y, yi) => (yi === i ? { ...y, stock } : y)),
                        );
                      }}
                      className="field !py-2.5"
                    />
                    <input
                      type="number"
                      value={x.priceDelta}
                      onChange={(e) => {
                        const priceDelta = Number(e.target.value);
                        set(
                          "variants",
                          v.variants.map((y, yi) =>
                            yi === i ? { ...y, priceDelta } : y,
                          ),
                        );
                      }}
                      className="field !py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "variants",
                          v.variants.filter((_, yi) => yi !== i),
                        )
                      }
                      aria-label={`Remove size ${x.size || i + 1}`}
                      className="p-2 text-ink-mute/50 transition-colors hover:text-oxblood"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* ================= right column ================= */}
        <div className="space-y-8">
          {/* ---- publish ---- */}
          <section className="bg-bone p-6 lg:sticky lg:top-8">
            <h2 className="label text-ink-mute">Publishing</h2>

            <div className="mt-5 space-y-3">
              {(
                [
                  ["isActive", "Live on the storefront"],
                  ["isFeatured", "Show in “Chosen by the atelier”"],
                  ["isNewArrival", "Flag as a new arrival"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 font-sans text-[13px] text-ink"
                >
                  <input
                    type="checkbox"
                    checked={v[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="h-4 w-4 accent-[#7A2116]"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="categoryId" className="field-label">
                  Category
                </label>
                <select
                  id="categoryId"
                  value={v.categoryId ?? ""}
                  onChange={(e) => set("categoryId", e.target.value || null)}
                  className="field"
                >
                  <option value="">— none —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="field-label">
                    Price ₹
                  </label>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    step={1}
                    value={v.price}
                    onChange={(e) => set("price", Number(e.target.value))}
                    required
                    className="field"
                  />
                  {fields.price && <span className="field-error">{fields.price}</span>}
                </div>
                <div>
                  <label htmlFor="compareAtPrice" className="field-label">
                    Was ₹
                  </label>
                  <input
                    id="compareAtPrice"
                    type="number"
                    min={0}
                    step={1}
                    value={v.compareAtPrice ?? ""}
                    onChange={(e) =>
                      set(
                        "compareAtPrice",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="position" className="field-label">
                  Sort position
                </label>
                <input
                  id="position"
                  type="number"
                  min={0}
                  value={v.position}
                  onChange={(e) => set("position", Number(e.target.value))}
                  className="field"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood"
              >
                {error}
              </p>
            )}

            <div className="mt-6 space-y-2">
              <button type="submit" disabled={pending} className="btn-dark w-full">
                {pending ? <Spinner /> : editing ? "Save changes" : "Create product"}
              </button>
              <Link href="/admin/products" className="btn-outline w-full">
                Cancel
              </Link>
            </div>
          </section>

          {/* ---- craft details ---- */}
          <section className="bg-bone p-6">
            <h2 className="label text-ink-mute">Craft details</h2>
            <div className="mt-5 space-y-5">
              {(
                [
                  ["fabric", "Fabric", "Raw silk, tissue organza dupatta"],
                  ["color", "Colour", "Deep crimson, antique gold"],
                  ["craft", "Craft", "Zardozi, dabka, kora"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div key={key}>
                  <label htmlFor={key} className="field-label">
                    {label}
                  </label>
                  <input
                    id={key}
                    value={v[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="field"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="careNotes" className="field-label">
                  Care notes
                </label>
                <textarea
                  id="careNotes"
                  value={v.careNotes}
                  onChange={(e) => set("careNotes", e.target.value)}
                  rows={4}
                  className="field resize-y"
                />
              </div>
            </div>
          </section>
        </div>
      </form>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={attach}
        multiple
        selected={v.media.map((m) => m.publicId)}
      />
    </>
  );
}
