"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Eye,
  EyeOff,
  Images,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker, type PickedAsset } from "./MediaPicker";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { NoImage } from "@/components/ui/NoImage";

type Variant = { id: string; size: string; stock: number };

type Row = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  isActive: boolean;
  orderCount: number;
  image: { publicId: string; kind: "IMAGE" | "VIDEO" } | null;
  variants: Variant[];
};

type Child = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  menuGroup: string | null;
  productCount: number;
};

type Top = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  productCount: number;
  children: Child[];
};

export function CatalogueManager({
  tree,
  selected,
  products,
  allCategories,
}: {
  tree: Top[];
  selected: { id: string; name: string; slug: string; parentName: string | null } | null;
  products: Row[];
  allCategories: { id: string; label: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [rows, setRows] = useState<Row[]>(products);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>(tree.map((t) => t.id));
  const [addOpen, setAddOpen] = useState(false);

  // The server is the source of truth; re-sync when the category changes.
  useEffect(() => setRows(products), [products]);

  const select = (id: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("cat", id);
    router.push(`/admin/catalogue?${next.toString()}`);
  };

  async function call(payload: Record<string, unknown>, okMessage?: string) {
    const res = await fetch("/api/admin/catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error ?? data.detail ?? "Could not complete that", "error");
      return null;
    }
    if (okMessage) toast(okMessage);
    return data;
  }

  /** Move a piece one place up or down, then persist the whole order. */
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    // Optimistic: swap locally first so the list does not jump.
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setBusy(rows[index].id);

    const result = await call({
      op: "reorder",
      kind: "product",
      ids: next.map((r) => r.id),
    });
    setBusy(null);

    if (!result) {
      setRows(rows); // roll back
      return;
    }
    router.refresh();
  }

  async function setStock(variantId: string, stock: number) {
    setBusy(variantId);
    const result = await call({ op: "stock", variantId, stock });
    setBusy(null);
    if (!result) return;

    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        variants: r.variants.map((v) =>
          v.id === variantId ? { ...v, stock } : v,
        ),
      })),
    );
  }

  async function addVariant(productId: string, size: string) {
    if (!size.trim()) return;
    setBusy(productId);
    const result = await call(
      { op: "addVariant", productId, size: size.trim(), stock: 0 },
      `Added size ${size.trim()}`,
    );
    setBusy(null);
    if (result) router.refresh();
  }

  async function removeVariant(variantId: string, size: string) {
    if (!confirm(`Remove size ${size}?`)) return;
    setBusy(variantId);
    const result = await call({ op: "deleteVariant", variantId }, `Removed ${size}`);
    setBusy(null);
    if (result) router.refresh();
  }

  async function moveToCategory(productId: string, categoryId: string) {
    setBusy(productId);
    const result = await call({ op: "move", productId, categoryId }, "Moved");
    setBusy(null);
    if (result) router.refresh();
  }

  async function toggleActive(row: Row) {
    // Publishing requires a full record (description, media, price), so a
    // hidden piece goes to the editor rather than flipping a flag here.
    if (!row.isActive) {
      router.push(`/admin/products/${row.id}`);
      return;
    }
    if (!confirm(`Hide "${row.name}" from the storefront?`)) return;

    setBusy(row.id);
    const res = await fetch(`/api/admin/products/${row.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);

    if (!res.ok) {
      toast(data.error ?? "Could not hide the piece", "error");
      return;
    }
    toast(data.reason ?? "Hidden from the storefront");
    router.refresh();
  }

  return (
    // minmax(0,1fr) rather than 1fr: a 1fr track floors at min-content, so a
    // wide item row widens the grid past a phone viewport instead of shrinking.
    <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ================= categories ================= */}
      <aside className="min-w-0 bg-bone">
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4">
          <h2 className="label text-ink-mute">Categories</h2>
          <Link href="/admin/categories" className="label link-sweep text-ink-mute/70">
            Edit menu
          </Link>
        </div>

        <ul className="max-h-[70vh] overflow-y-auto py-1">
          {tree.map((top) => {
            const open = expanded.includes(top.id);
            return (
              <li key={top.id}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((p) =>
                        p.includes(top.id)
                          ? p.filter((x) => x !== top.id)
                          : [...p, top.id],
                      )
                    }
                    aria-expanded={open}
                    aria-label={`${open ? "Collapse" : "Expand"} ${top.name}`}
                    className="p-2 text-ink-mute/50"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        open && "rotate-90",
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => select(top.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 pr-3 text-left font-sans text-[13px] transition-colors",
                      selected?.id === top.id
                        ? "text-ink"
                        : "text-ink-mute hover:text-ink",
                    )}
                  >
                    <span className="truncate">{top.name}</span>
                    <span className="label shrink-0 text-ink-mute/40">
                      {top.productCount}
                    </span>
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      {top.children.map((child) => (
                        <li key={child.id}>
                          <button
                            type="button"
                            onClick={() => select(child.id)}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 py-2 pl-9 pr-3 text-left font-sans text-[12.5px] transition-colors",
                              selected?.id === child.id
                                ? "bg-bone-warm text-ink"
                                : "text-ink-mute/80 hover:bg-bone-warm/50 hover:text-ink",
                            )}
                          >
                            <span className="truncate">
                              {child.name}
                              {!child.isActive && (
                                <span className="label ml-1.5 text-ink-mute/40">
                                  hidden
                                </span>
                              )}
                            </span>
                            <span className="label shrink-0 text-ink-mute/40">
                              {child.productCount}
                            </span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ================= pieces ================= */}
      <section className="min-w-0 bg-bone">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 className="font-display text-[22px] font-light text-ink">
              {selected?.name ?? "Pick a category"}
            </h2>
            <p className="label mt-0.5 text-ink-mute/60">
              {selected?.parentName ? `${selected.parentName} · ` : ""}
              {rows.length} {rows.length === 1 ? "piece" : "pieces"}
              {selected ? ` · /collections/${selected.slug}` : ""}
            </p>
          </div>

          {selected && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="btn-dark !py-2.5"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Add piece
              </button>
              <Link href="/admin/products/new" className="btn-outline !py-2.5">
                Full editor
              </Link>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-16 text-center font-sans text-sm text-ink-mute">
            No pieces in this category yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink/[0.07]">
            {rows.map((row, i) => (
              <ProductRow
                key={row.id}
                row={row}
                index={i}
                total={rows.length}
                busy={busy}
                categories={allCategories}
                currentCategoryId={selected?.id ?? null}
                onMove={move}
                onStock={setStock}
                onAddVariant={addVariant}
                onRemoveVariant={removeVariant}
                onMoveCategory={moveToCategory}
                onToggleActive={toggleActive}
              />
            ))}
          </ul>
        )}
      </section>

      {selected && (
        <QuickAddDialog
          open={addOpen}
          categoryId={selected.id}
          categoryName={selected.name}
          onClose={() => setAddOpen(false)}
          onCreated={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ProductRow({
  row,
  index,
  total,
  busy,
  categories,
  currentCategoryId,
  onMove,
  onStock,
  onAddVariant,
  onRemoveVariant,
  onMoveCategory,
  onToggleActive,
}: {
  row: Row;
  index: number;
  total: number;
  busy: string | null;
  categories: { id: string; label: string }[];
  currentCategoryId: string | null;
  onMove: (index: number, dir: -1 | 1) => void;
  onStock: (variantId: string, stock: number) => void;
  onAddVariant: (productId: string, size: string) => void;
  onRemoveVariant: (variantId: string, size: string) => void;
  onMoveCategory: (productId: string, categoryId: string) => void;
  onToggleActive: (row: Row) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newSize, setNewSize] = useState("");

  const totalStock = row.variants.reduce((s, v) => s + v.stock, 0);

  return (
    <li className={cn("px-5 py-3", !row.isActive && "opacity-60")}>
      <div className="flex items-center gap-3">
        {/* ---- aage / peeche ---- */}
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0 || busy === row.id}
            aria-label={`Move ${row.name} up`}
            className="p-1 text-ink-mute/50 transition-colors hover:text-ink disabled:opacity-20"
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1 || busy === row.id}
            aria-label={`Move ${row.name} down`}
            className="p-1 text-ink-mute/50 transition-colors hover:text-ink disabled:opacity-20"
          >
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <span className="label w-5 shrink-0 text-ink-mute/35">{index + 1}</span>

        <span className="w-10 shrink-0">
          {row.image ? (
            <CldImage
              publicId={row.image.publicId}
              alt={row.name}
              ratio="3/4"
              widths={[120]}
              sizes="40px"
              fromVideo={row.image.kind === "VIDEO"}
            />
          ) : (
            <NoImage label="No image" compact className="w-full" />
          )}
        </span>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <span className="block truncate font-sans text-[13px] text-ink">
            {row.name}
          </span>
          <span className="label mt-0.5 block text-ink-mute/60">
            {row.sku} · {formatINR(row.price)} ·{" "}
            <span className={totalStock === 0 ? "text-oxblood" : ""}>
              {totalStock} in stock
            </span>
            {row.orderCount > 0 ? ` · ${row.orderCount} sold` : ""}
          </span>
        </button>

        <span
          className={cn(
            "label hidden shrink-0 px-2 py-1 sm:inline-block",
            row.isActive ? "bg-ink text-bone" : "bg-bone-warm text-ink-mute/70",
          )}
        >
          {row.isActive ? "live" : "hidden"}
        </span>

        <span className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            title="Sizes & stock"
            className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
          >
            <ChevronRight
              className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
              strokeWidth={1.5}
            />
          </button>
          <Link
            href={`/admin/products/${row.id}`}
            title="Edit"
            className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => onToggleActive(row)}
            disabled={busy === row.id}
            title={row.isActive ? "Hide" : "Publish"}
            className="p-2 text-ink-mute/60 transition-colors hover:text-oxblood"
          >
            {busy === row.id ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : row.isActive ? (
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
        </span>
      </div>

      {/* ---- sizes, stock and category move ---- */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-bone-warm p-4">
              <p className="label text-ink-mute">Sizes &amp; stock</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {row.variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 border border-ink/15 bg-bone px-2.5 py-2"
                  >
                    <span className="label text-ink">{v.size}</span>
                    <input
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (next !== v.stock) onStock(v.id, next);
                      }}
                      aria-label={`Stock for ${v.size}`}
                      className="w-14 border-0 bg-transparent p-0 text-center font-sans text-[13px] text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveVariant(v.id, v.size)}
                      aria-label={`Remove size ${v.size}`}
                      className="text-ink-mute/40 transition-colors hover:text-oxblood"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddVariant(row.id, newSize);
                    setNewSize("");
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="New size"
                    aria-label="Add a size"
                    className="w-24 border border-dashed border-ink/25 bg-transparent px-2.5 py-2 font-sans text-[12px] text-ink outline-none placeholder:text-ink-mute/45 focus:border-ink"
                  />
                  <button
                    type="submit"
                    disabled={!newSize.trim()}
                    aria-label="Add size"
                    className="border border-ink/20 p-2 text-ink-mute transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </form>
              </div>

              <p className="mt-2 font-sans text-[11px] text-ink-mute/70">
                Stock saves when you click away from the box. A size used by an
                order can&apos;t be deleted — set it to 0 instead.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                <label
                  htmlFor={`move-${row.id}`}
                  className="label text-ink-mute"
                >
                  Move to
                </label>
                <select
                  id={`move-${row.id}`}
                  defaultValue={currentCategoryId ?? ""}
                  onChange={(e) => {
                    if (e.target.value && e.target.value !== currentCategoryId) {
                      onMoveCategory(row.id, e.target.value);
                    }
                  }}
                  className="field !w-auto !py-2 text-[12px]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <Link
                  href={`/product/${row.slug}`}
                  target="_blank"
                  className="label link-sweep ml-auto text-ink-mute"
                >
                  View on storefront
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ------------------------------------------------------------------ */

function QuickAddDialog({
  open,
  categoryId,
  categoryName,
  onClose,
  onCreated,
}: {
  open: boolean;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [asset, setAsset] = useState<PickedAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        op: "quickAdd",
        categoryId,
        name: String(fd.get("name") ?? ""),
        price: Number(fd.get("price") ?? 0),
        sku: String(fd.get("sku") ?? ""),
        sizePreset: String(fd.get("sizePreset") ?? "WOMEN"),
        publicId: asset?.publicId,
        kind: asset?.kind ?? "IMAGE",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? data.detail ?? "Could not add the piece");
      return;
    }
    toast("Piece added as a draft");
    onCreated();
    // A quick-add is a stub, so go straight to the full editor to finish it.
    router.push(`/admin/products/${data.id}`);
  }

  return (
    <AnimatePresence>
      {open && (
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
            onSubmit={submit}
            className="relative w-full max-w-md bg-bone p-6"
          >
            <h2 className="display text-[23px] text-ink">Add a piece</h2>
            <p className="label mt-1 text-ink-mute/60">into {categoryName}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="qa-name" className="field-label">
                  Name
                </label>
                <input id="qa-name" name="name" required className="field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qa-price" className="field-label">
                    Price ₹
                  </label>
                  <input
                    id="qa-price"
                    name="price"
                    type="number"
                    min={1}
                    required
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="qa-sku" className="field-label">
                    SKU{" "}
                    <span className="normal-case tracking-normal">(auto)</span>
                  </label>
                  {/* The label already says "(auto)", but the box looked
                      like a required field, so references were being typed
                      in by hand and colliding. */}
                  <input
                    id="qa-sku"
                    name="sku"
                    className="field"
                    placeholder="Leave blank — next one is assigned"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="qa-sizes" className="field-label">
                  Size set
                </label>
                <select id="qa-sizes" name="sizePreset" className="field">
                  <option value="WOMEN">Women — XS to XL + Custom Tailored</option>
                  <option value="MEN">Men — 38&quot; to 46&quot; + Custom Tailored</option>
                  <option value="ONE">One size</option>
                  <option value="JEWEL">Jewellery — Standard + Made to Order</option>
                </select>
              </div>

              <div>
                <p className="field-label">Cover image</p>
                <div className="flex items-center gap-3">
                  {asset ? (
                    <div className="w-14 shrink-0">
                      <CldImage
                        publicId={asset.publicId}
                        alt="Cover"
                        ratio="3/4"
                        widths={[120]}
                        sizes="56px"
                        fromVideo={asset.kind === "VIDEO"}
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="btn-outline !py-2.5"
                  >
                    <Images className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {asset ? "Change" : "Choose"}
                  </button>
                  {asset && (
                    <button
                      type="button"
                      onClick={() => setAsset(null)}
                      className="label text-ink-mute hover:text-oxblood"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 bg-bone-warm px-4 py-3 font-sans text-[11px] leading-relaxed text-ink-mute">
              The piece is created hidden, with a placeholder description. You
              will land in the full editor to finish it before it goes live.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 font-sans text-sm text-oxblood"
              >
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button type="submit" disabled={pending} className="btn-dark flex-1">
                {pending ? <Spinner /> : "Add piece"}
              </button>
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
            </div>

            <MediaPicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onPick={(assets) => setAsset(assets[0] ?? null)}
              selected={asset ? [asset.publicId] : []}
            />
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
