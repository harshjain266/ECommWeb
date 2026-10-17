"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: string;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  alt: string | null;
};

export function ProductGallery({
  items,
  name,
}: {
  items: GalleryItem[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  if (items.length === 0) return <div className="skeleton aspect-[3/4]" />;

  const current = items[Math.min(active, items.length - 1)];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* ---- thumbnails ---- */}
      {items.length > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
          {items.map((item, i) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View ${item.kind === "VIDEO" ? "clip" : "image"} ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block w-20 overflow-hidden border-2 transition-colors duration-300 lg:w-full",
                  i === active ? "border-ink" : "border-transparent hover:border-ink/30",
                )}
              >
                <CldImage
                  publicId={item.publicId}
                  alt={item.alt ?? `${name}, view ${i + 1}`}
                  ratio="3/4"
                  widths={[160, 240]}
                  sizes="96px"
                  fromVideo={item.kind === "VIDEO"}
                />
                {item.kind === "VIDEO" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
                    <Play className="h-4 w-4 text-bone" strokeWidth={1.5} fill="currentColor" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ---- stage ---- */}
      <div className="relative flex-1 overflow-hidden bg-bone-warm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {current.kind === "VIDEO" ? (
              <CldVideo
                publicId={current.publicId}
                ratio="3/4"
                width={1280}
                lazy={false}
                priority
              />
            ) : (
              <CldImage
                publicId={current.publicId}
                alt={current.alt ?? name}
                ratio="3/4"
                priority
                sizes="(min-width:1024px) 45vw, 100vw"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <p className="label absolute bottom-4 right-4 bg-bone/90 px-2.5 py-1.5 text-ink">
          {active + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}
