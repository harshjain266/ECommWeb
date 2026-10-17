"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Film, Image as ImageIcon, Search, Trash2, Upload } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { imageUrl, videoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Asset = {
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  usedBy: string[];
  uploaded?: boolean;
};

export function MediaLibrary({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [counts, setCounts] = useState({ total: 0, images: 0, videos: 0, uploaded: 0 });
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [preview, setPreview] = useState<Asset | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(data.error ?? "Could not load the library", "error");
      return;
    }
    setAssets(data.assets ?? []);
    setCounts(data.counts ?? { total: 0, images: 0, videos: 0, uploaded: 0 });
    setCloudError(data.cloudError ?? null);
  }

  async function remove(asset: Asset) {
    if (
      !confirm(
        `Permanently delete ${asset.publicId} from Cloudinary? This cannot be undone.`,
      )
    ) {
      return;
    }
    const res = await fetch("/api/admin/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId: asset.publicId, kind: asset.kind }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error ?? "Could not delete the asset", "error");
      return;
    }
    toast("Asset deleted");
    setPreview(null);
    void load();
  }

  async function upload(files: FileList) {
    setUploading(true);
    let added = 0;
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? `Could not upload ${file.name}`, "error");
        continue;
      }
      added += 1;
    }
    setUploading(false);
    if (added) {
      toast(`Uploaded ${added} file${added === 1 ? "" : "s"}`);
      void load();
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

  const copy = async (asset: Asset) => {
    const url =
      asset.kind === "VIDEO"
        ? videoUrl(asset.publicId, { width: 1280, mute: true })
        : imageUrl(asset.publicId, { width: 1600 });
    try {
      await navigator.clipboard.writeText(url);
      toast("Delivery URL copied");
    } catch {
      toast("Could not copy — your browser blocked it", "error");
    }
  };

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute/50"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name or where it is used"
            className="field pl-9"
          />
        </div>

        <div className="flex">
          {(
            [
              ["ALL", `All ${counts.total}`],
              ["IMAGE", `Stills ${counts.images}`],
              ["VIDEO", `Clips ${counts.videos}`],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "label border px-3.5 py-3 transition-colors",
                filter === f
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/20 text-ink-mute hover:border-ink",
              )}
            >
              {label}
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
          onClick={() => fileInput.current?.click()}
          title={
            uploadsEnabled
              ? "Upload new assets"
              : "Add Cloudinary API keys to .env to enable uploads"
          }
          className="btn-dark"
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

      {cloudError && (
        <p className="mt-4 border-l-2 border-oxblood bg-oxblood/5 px-5 py-3.5 font-sans text-sm leading-relaxed text-oxblood">
          Could not list the Cloudinary folder ({cloudError}). Showing known
          assets only — check your API key and secret.
        </p>
      )}

      {!uploadsEnabled && (
        <p className="mt-4 border-l-2 border-gold bg-gold/5 px-5 py-3.5 font-sans text-sm leading-relaxed text-ink-mute">
          Uploading needs <code className="text-ink">CLOUDINARY_API_KEY</code> and{" "}
          <code className="text-ink">CLOUDINARY_API_SECRET</code> in{" "}
          <code className="text-ink">.env</code>. Browsing and attaching existing
          assets works without them.
        </p>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4]" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((asset, i) => (
            <motion.div
              key={asset.publicId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i, 12) * 0.02,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group bg-bone"
            >
              <button
                type="button"
                onClick={() => setPreview(asset)}
                className="block w-full text-left"
              >
                <div className="relative">
                  <CldImage
                    publicId={asset.publicId}
                    alt={asset.publicId}
                    ratio="3/4"
                    widths={[240, 400]}
                    sizes="(min-width:1024px) 20vw, 50vw"
                    fromVideo={asset.kind === "VIDEO"}
                  />
                  {asset.uploaded && (
                    <span className="label absolute right-2 top-2 bg-gold px-1.5 py-1 text-ink">
                      uploaded
                    </span>
                  )}
                  <span className="absolute left-2 top-2 flex items-center gap-1 bg-ink/75 px-1.5 py-1 text-bone">
                    {asset.kind === "VIDEO" ? (
                      <Film className="h-3 w-3" strokeWidth={1.5} />
                    ) : (
                      <ImageIcon className="h-3 w-3" strokeWidth={1.5} />
                    )}
                    <span className="label">{asset.kind === "VIDEO" ? "mp4" : "img"}</span>
                  </span>
                </div>
              </button>

              <div className="p-3">
                <p className="truncate font-sans text-[11px] text-ink">
                  {asset.publicId}
                </p>
                <p className="label mt-1 truncate text-ink-mute/60">
                  {asset.usedBy.length
                    ? `${asset.usedBy.length} use${asset.usedBy.length === 1 ? "" : "s"}`
                    : "unused"}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => copy(asset)}
                    className="label flex items-center gap-1.5 text-ink-mute/70 transition-colors hover:text-ink"
                  >
                    <Copy className="h-3 w-3" strokeWidth={1.5} />
                    Copy URL
                  </button>
                  {uploadsEnabled && asset.usedBy.length === 0 && (
                    <button
                      type="button"
                      onClick={() => remove(asset)}
                      className="label flex items-center gap-1.5 text-ink-mute/70 transition-colors hover:text-oxblood"
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ---- preview ---- */}
      {preview && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <div className="absolute inset-0 bg-ink/80" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-full w-full max-w-3xl overflow-y-auto bg-bone p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-sm text-ink">{preview.publicId}</p>
                <p className="label mt-1 text-ink-mute/60">
                  {preview.kind === "VIDEO"
                    ? "Delivered as h264 mp4"
                    : "Delivered as WebP / AVIF"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="label text-ink-mute"
              >
                Close
              </button>
            </div>

            <div className="mt-5 mx-auto max-w-sm">
              {preview.kind === "VIDEO" ? (
                <CldVideo publicId={preview.publicId} ratio="3/4" width={1280} lazy={false} />
              ) : (
                <CldImage
                  publicId={preview.publicId}
                  alt={preview.publicId}
                  ratio="3/4"
                  priority
                  sizes="384px"
                />
              )}
            </div>

            {preview.usedBy.length > 0 && (
              <>
                <p className="label mt-6 text-ink-mute">Used by</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {preview.usedBy.map((u) => (
                    <li key={u} className="label bg-bone-warm px-2.5 py-1.5 text-ink-mute">
                      {u}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
