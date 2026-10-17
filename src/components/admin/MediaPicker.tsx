"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, Upload, X, Film, Image as ImageIcon } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export type PickedAsset = { publicId: string; kind: "IMAGE" | "VIDEO" };
type Asset = PickedAsset & { usedBy: string[] };

/**
 * Modal asset browser used everywhere an image or clip is chosen -- product
 * galleries, homepage banners and nav artwork all open this same picker.
 */
export function MediaPicker({
  open,
  onClose,
  onPick,
  multiple = false,
  selected = [],
}: {
  open: boolean;
  onClose: () => void;
  onPick: (assets: PickedAsset[]) => void;
  multiple?: boolean;
  selected?: string[];
}) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadsEnabled, setUploadsEnabled] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [chosen, setChosen] = useState<string[]>(selected);

  useEffect(() => {
    if (!open) return;
    setChosen(selected);
    void load();
    // `selected` is only an initial value for each opening of the modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error ?? "Could not load the media library", "error");
      return;
    }
    setAssets(data.assets ?? []);
    setUploadsEnabled(Boolean(data.uploadsEnabled));
  }

  async function upload(files: FileList) {
    setUploading(true);
    const added: Asset[] = [];

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? `Could not upload ${file.name}`, "error");
        continue;
      }
      added.push({ publicId: data.publicId, kind: data.kind, usedBy: [] });
    }

    setUploading(false);
    if (added.length) {
      setAssets((prev) => [...added, ...prev]);
      setChosen((prev) =>
        multiple ? [...prev, ...added.map((a) => a.publicId)] : [added[0].publicId],
      );
      toast(`Uploaded ${added.length} file${added.length === 1 ? "" : "s"}`);
    }
  }

  const visible = assets.filter((a) => {
    if (filter !== "ALL" && a.kind !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.publicId.toLowerCase().includes(q) ||
      a.usedBy.some((u) => u.toLowerCase().includes(q))
    );
  });

  const toggle = (asset: Asset) => {
    if (!multiple) {
      setChosen([asset.publicId]);
      return;
    }
    setChosen((prev) =>
      prev.includes(asset.publicId)
        ? prev.filter((p) => p !== asset.publicId)
        : [...prev, asset.publicId],
    );
  };

  const confirm = () => {
    // Preserve the order the admin clicked them in.
    const picked = chosen
      .map((id) => assets.find((a) => a.publicId === id))
      .filter((a): a is Asset => Boolean(a))
      .map(({ publicId, kind }) => ({ publicId, kind }));
    onPick(picked);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-ink/70" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[88vh] w-full max-w-5xl flex-col bg-bone shadow-2xl"
          >
            {/* ---- header ---- */}
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
              <div>
                <h2 className="display text-[22px] text-ink">Media library</h2>
                <p className="label mt-0.5 text-ink-mute/60">
                  {visible.length} of {assets.length} assets
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="p-1.5">
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            {/* ---- controls ---- */}
            <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-6 py-3.5">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute/50"
                  strokeWidth={1.5}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by file or where it is used"
                  className="field !py-2.5 pl-9"
                />
              </div>

              <div className="flex">
                {(["ALL", "IMAGE", "VIDEO"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "label border px-3.5 py-2.5 transition-colors",
                      filter === f
                        ? "border-ink bg-ink text-bone"
                        : "border-ink/20 text-ink-mute hover:border-ink",
                    )}
                  >
                    {f === "ALL" ? "All" : f === "IMAGE" ? "Stills" : "Clips"}
                  </button>
                ))}
              </div>

              <input
                ref={fileInput}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.mov,.mp4,.m4v,.webm"
                hidden
                onChange={(e) => {
                  if (e.target.files?.length) void upload(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={uploading || !uploadsEnabled}
                title={
                  uploadsEnabled
                    ? "Upload new assets"
                    : "Add Cloudinary API keys to .env to enable uploads"
                }
                onClick={() => fileInput.current?.click()}
                className="btn-dark !py-2.5"
              >
                {uploading ? (
                  <Spinner />
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Upload
                  </>
                )}
              </button>
            </div>

            {!uploadsEnabled && (
              <p className="border-b border-ink/10 bg-gold/5 px-6 py-2.5 font-sans text-xs text-ink-mute">
                Uploads need <code className="text-ink">CLOUDINARY_API_KEY</code> and{" "}
                <code className="text-ink">CLOUDINARY_API_SECRET</code> in{" "}
                <code className="text-ink">.env</code>. You can still browse and
                attach any existing asset.
              </p>
            )}

            {/* ---- grid ---- */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="skeleton aspect-[3/4]" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <p className="py-16 text-center font-sans text-sm text-ink-mute">
                  Nothing matches that search.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {visible.map((asset) => {
                    const on = chosen.includes(asset.publicId);
                    const order = chosen.indexOf(asset.publicId) + 1;
                    return (
                      <button
                        key={asset.publicId}
                        type="button"
                        onClick={() => toggle(asset)}
                        className={cn(
                          "group relative block overflow-hidden border-2 text-left transition-colors",
                          on ? "border-ink" : "border-transparent hover:border-ink/30",
                        )}
                      >
                        <CldImage
                          publicId={asset.publicId}
                          alt={asset.publicId}
                          ratio="3/4"
                          widths={[200, 320]}
                          sizes="160px"
                          fromVideo={asset.kind === "VIDEO"}
                        />

                        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 bg-ink/75 px-1.5 py-1 text-bone">
                          {asset.kind === "VIDEO" ? (
                            <Film className="h-3 w-3" strokeWidth={1.5} />
                          ) : (
                            <ImageIcon className="h-3 w-3" strokeWidth={1.5} />
                          )}
                        </span>

                        {on && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-bone">
                            {multiple ? (
                              <span className="font-sans text-[10px]">{order}</span>
                            ) : (
                              <Check className="h-3 w-3" strokeWidth={2} />
                            )}
                          </span>
                        )}

                        {asset.usedBy.length > 0 && (
                          <span className="absolute inset-x-0 bottom-0 truncate bg-bone/92 px-1.5 py-1 font-sans text-[9px] text-ink-mute">
                            {asset.usedBy[0]}
                            {asset.usedBy.length > 1 ? ` +${asset.usedBy.length - 1}` : ""}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ---- footer ---- */}
            <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-6 py-4">
              <p className="label text-ink-mute">
                {chosen.length} selected
                {multiple && chosen.length > 1 && " · numbers show gallery order"}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-outline !py-3">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={chosen.length === 0}
                  className="btn-dark !py-3"
                >
                  {multiple ? `Attach ${chosen.length}` : "Choose"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
