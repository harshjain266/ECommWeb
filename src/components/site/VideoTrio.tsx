"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { videoUrl, videoPosterUrl, blurUrlFor } from "@/lib/media";
import { ExploreButton } from "@/components/ui/ExploreButton";

export type TrioItem = { publicId: string; label: string; href: string };

/**
 * Three clips side by side. The centre one is the feature: it carries a
 * mute toggle, because autoplay is only permitted while muted — the viewer
 * has to opt into sound, and the other two stay silent throughout.
 */
export function VideoTrio({ items }: { items: TrioItem[] }) {
  if (items.length < 3) return null;

  return (
    <section className="bg-bone-warm py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-5 md:grid-cols-3 md:items-center">
          {items.slice(0, 3).map((item, i) => (
            <TrioPanel
              key={item.publicId}
              item={item}
              index={i}
              // The middle panel is taller and is the one with sound.
              feature={i === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrioPanel({
  item,
  index,
  feature,
}: {
  item: TrioItem;
  index: number;
  feature: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    const next = !muted;
    el.muted = next;
    setMuted(next);
    // Unmuting mid-playback can leave it paused in some browsers.
    if (!next) void el.play().catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={feature ? "md:-my-10" : ""}
    >
      <div className="group relative overflow-hidden bg-ink">
        <video
          ref={ref}
          // The feature clip keeps its audio track so it can be unmuted;
          // the flanking clips are stripped silent to save bandwidth.
          src={videoUrl(item.publicId, { width: 900, mute: !feature })}
          poster={videoPosterUrl(item.publicId, { width: 900 })}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          className="aspect-[3/4] w-full object-cover"
          style={{
            backgroundImage: `url("${blurUrlFor(item.publicId, "VIDEO")}")`,
            backgroundSize: "cover",
          }}
        />

        {feature && (
          <button
            type="button"
            onClick={toggle}
            aria-label={muted ? "Unmute this film" : "Mute this film"}
            aria-pressed={!muted}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bone/90 text-ink backdrop-blur-sm transition-colors hover:bg-bone"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="label text-bone">{item.label}</span>
          <ExploreButton
            href={item.href}
            className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>
      </div>
    </motion.div>
  );
}
