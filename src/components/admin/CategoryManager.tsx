"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  Star,
  Trash2,
} from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker, type PickedAsset } from "./MediaPicker";
import { cn } from "@/lib/utils";
import { NoImage } from "@/components/ui/NoImage";

export type CatNode = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageId: string;
  position: number;
  isActive: boolean;
  featured: boolean;
  parentId: string | null;
  productCount: number;
  children: CatNode[];
};

type Draft = Omit<CatNode, "children" | "productCount" | "id"> & { id?: string };

export function CategoryManager({ tree }: { tree: CatNode[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>(tree.map((t) => t.id));

  const parents = tree.map((t) => ({ id: t.id, name: t.name }));

  async function patch(id: string, body: Record<string, unknown>, message: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      toast(data.error ?? "Could not update", "error");
      return;
    }
    toast(message);
    router.refresh();
  }

  async function remove(node: CatNode) {
    if (!confirm(`Delete "${node.name}" from the navigation?`)) return;
    setBusyId(node.id);
    const res = await fetch(`/api/admin/categories/${node.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      toast(data.error ?? "Could not delete", "error");
      return;
    }
    toast("Removed from the navigation");
    router.refresh();
  }

  /**
   * Move a row one place within its own level, then persist the whole order.
   * Sending the full list (rather than a swap) keeps positions contiguous.
   */
  async function reorder(siblings: CatNode[], index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= siblings.length) return;

    const next = [...siblings];
    [next[index], next[target]] = [next[target], next[index]];

    setBusyId(siblings[index].id);
    const res = await fetch("/api/admin/catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        op: "reorder",
        kind: "category",
        ids: next.map((n) => n.id),
      }),
    });
    setBusyId(null);

    if (!res.ok) {
      toast("Could not reorder", "error");
      return;
    }
    toast("Menu order updated");
    router.refresh();
  }

  const blank = (parentId: string | null): Draft => ({
    name: "",
    slug: "",
    description: "",
    imageId: "",
    position: 0,
    isActive: true,
    featured: false,
    parentId,
  });

  const Row = ({
    node,
    depth,
    siblings,
    index,
  }: {
    node: CatNode;
    depth: number;
    siblings: CatNode[];
    index: number;
  }) => {
    const open = expanded.includes(node.id);
    return (
      <>
        <li
          className={cn(
            // flex-wrap: the action cluster is a fixed 158px and cannot
            // shrink, so on a narrow phone it wrapped off the right edge.
            // Letting the row wrap drops it onto its own line instead.
            "flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink/[0.07] px-4 py-3",
            depth > 0 && "bg-bone-warm/40",
          )}
          style={{ paddingLeft: `${16 + depth * 28}px` }}
        >
          <span className="flex shrink-0 flex-col">
            <button
              type="button"
              onClick={() => reorder(siblings, index, -1)}
              disabled={index === 0 || busyId === node.id}
              aria-label={`Move ${node.name} up`}
              className="p-0.5 text-ink-mute/45 transition-colors hover:text-ink disabled:opacity-20"
            >
              <ArrowUp className="h-3 w-3" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => reorder(siblings, index, 1)}
              disabled={index === siblings.length - 1 || busyId === node.id}
              aria-label={`Move ${node.name} down`}
              className="p-0.5 text-ink-mute/45 transition-colors hover:text-ink disabled:opacity-20"
            >
              <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </span>

          {node.children.length > 0 ? (
            <button
              type="button"
              onClick={() =>
                setExpanded((p) =>
                  p.includes(node.id) ? p.filter((x) => x !== node.id) : [...p, node.id],
                )
              }
              aria-expanded={open}
              className="p-0.5 text-ink-mute/50"
            >
              <ChevronRight
                className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
                strokeWidth={1.5}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="w-9 shrink-0">
            {node.imageId ? (
              <CldImage
                publicId={node.imageId}
                alt={node.name}
                ratio="3/4"
                widths={[120]}
                sizes="36px"
              />
            ) : (
              <NoImage label="No image" compact className="w-full" />
            )}
          </span>

          <span className="min-w-0 flex-1 basis-40">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "font-sans text-[13px]",
                  depth === 0 ? "text-ink" : "text-ink-mute",
                )}
              >
                {node.name}
              </span>
              {node.featured && (
                <Star className="h-3 w-3 text-gold" strokeWidth={1.5} fill="currentColor" />
              )}
            </span>
            <span className="label mt-0.5 block text-ink-mute/50">
              /collections/{node.slug} &#183; {node.productCount} product
              {node.productCount === 1 ? "" : "s"}
              {node.children.length ? ` · ${node.children.length} sub-options` : ""}
            </span>
          </span>

          <span
            className={cn(
              "label shrink-0 px-2 py-1",
              node.isActive ? "bg-ink text-bone" : "bg-bone-warm text-ink-mute/70",
            )}
          >
            {node.isActive ? "shown" : "hidden"}
          </span>

          <span className="ml-auto flex shrink-0 items-center gap-0.5">
            {depth === 0 && (
              <button
                type="button"
                onClick={() => setEditing(blank(node.id))}
                title="Add a sub-option"
                className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                patch(
                  node.id,
                  { featured: !node.featured },
                  node.featured ? "Un-highlighted" : "Highlighted in the nav",
                )
              }
              title="Highlight in the nav"
              className={cn(
                "p-2 transition-colors hover:text-gold",
                node.featured ? "text-gold" : "text-ink-mute/60",
              )}
            >
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setEditing({ ...node })}
              title="Edit"
              className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() =>
                patch(
                  node.id,
                  { isActive: !node.isActive },
                  node.isActive ? "Hidden from the nav" : "Shown in the nav",
                )
              }
              disabled={busyId === node.id}
              title={node.isActive ? "Hide" : "Show"}
              className="p-2 text-ink-mute/60 transition-colors hover:text-ink"
            >
              {busyId === node.id ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : node.isActive ? (
                <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
              ) : (
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={() => remove(node)}
              disabled={busyId === node.id}
              title="Delete"
              className="p-2 text-ink-mute/60 transition-colors hover:text-oxblood"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </span>
        </li>

        {open &&
          node.children.map((c, ci) => (
            <Row
              key={c.id}
              node={c}
              depth={depth + 1}
              siblings={node.children}
              index={ci}
            />
          ))}
      </>
    );
  };

  return (
    <div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing(blank(null))}
          className="btn-dark"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          New top-level option
        </button>
      </div>

      <ul className="mt-6 bg-bone">
        {tree.map((t, ti) => (
          <Row key={t.id} node={t} depth={0} siblings={tree} index={ti} />
        ))}
      </ul>

      <AnimatePresence>
        {editing && (
          <CategoryDialog
            draft={editing}
            parents={parents}
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

function CategoryDialog({
  draft,
  parents,
  onClose,
  onSaved,
}: {
  draft: Draft;
  parents: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [v, setV] = useState(draft);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(k: K, value: Draft[K]) =>
    setV((prev) => ({ ...prev, [k]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const res = await fetch(
      v.id ? `/api/admin/categories/${v.id}` : "/api/admin/categories",
      {
        method: v.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      },
    );
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save");
      setFields(data.fields ?? {});
      return;
    }
    toast(v.id ? "Navigation updated" : "Added to the navigation");
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
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-bone p-6"
      >
        <h2 className="display text-[24px] text-ink">
          {v.id ? `Edit “${draft.name}”` : v.parentId ? "New sub-option" : "New option"}
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="c-name" className="field-label">
              Name as it appears in the menu
            </label>
            <input
              id="c-name"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Lehengas"
              className="field"
            />
            {fields.name && <span className="field-error">{fields.name}</span>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-slug" className="field-label">
                URL slug{" "}
                <span className="normal-case tracking-normal">(auto if blank)</span>
              </label>
              <input
                id="c-slug"
                value={v.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="field"
              />
              {fields.slug && <span className="field-error">{fields.slug}</span>}
            </div>

            <div>
              <label htmlFor="c-parent" className="field-label">
                Sits under
              </label>
              <select
                id="c-parent"
                value={v.parentId ?? ""}
                onChange={(e) => set("parentId", e.target.value || null)}
                className="field"
              >
                <option value="">— top level —</option>
                {parents
                  .filter((p) => p.id !== v.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="c-desc" className="field-label">
              Blurb shown in the mega-menu and on the collection page
            </label>
            <textarea
              id="c-desc"
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="field resize-y"
            />
          </div>

          <div>
            <p className="field-label">Menu artwork</p>
            <div className="flex items-start gap-4">
              {v.imageId ? (
                <div className="w-24 shrink-0">
                  <CldImage
                    publicId={v.imageId}
                    alt={v.name || v.imageId}
                    ratio="3/4"
                    widths={[200]}
                    sizes="96px"
                  />
                </div>
              ) : (
                <NoImage label="No image" compact className="w-24 shrink-0" />
              )}
              <div>
                <p className="break-all font-sans text-[12px] text-ink-mute">
                  {v.imageId || "No artwork chosen"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="btn-outline !py-2.5"
                  >
                    <Images className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {v.imageId ? "Change" : "Choose"}
                  </button>
                  {v.imageId && (
                    <button
                      type="button"
                      onClick={() => set("imageId", "")}
                      className="label px-3 text-ink-mute hover:text-oxblood"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-position" className="field-label">
                Order in the menu
              </label>
              <input
                id="c-position"
                type="number"
                min={0}
                value={v.position}
                onChange={(e) => set("position", Number(e.target.value))}
                className="field"
              />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex cursor-pointer items-center gap-3 font-sans text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={v.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 accent-[#7A2116]"
                />
                Shown in the menu
              </label>
              <label className="flex cursor-pointer items-center gap-3 font-sans text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={v.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4 accent-[#7A2116]"
                />
                Highlight in gold
              </label>
            </div>
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

        <div className="mt-7 flex gap-2">
          <button type="submit" disabled={pending} className="btn-dark flex-1">
            {pending ? <Spinner /> : v.id ? "Save" : "Add to the menu"}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            Cancel
          </button>
        </div>

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(assets: PickedAsset[]) => {
            if (assets[0]) set("imageId", assets[0].publicId);
          }}
          selected={v.imageId ? [v.imageId] : []}
        />
      </motion.form>
    </motion.div>
  );
}
