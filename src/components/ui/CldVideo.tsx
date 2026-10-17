"use client";

import { useEffect, useRef, useState } from "react";
import { videoUrl, videoPosterUrl, blurUrlFor } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  publicId: string;
  /** Width of the mp4 rendition to request. */
  width?: number;
  ratio?: string;
  className?: string;
  videoClassName?: string;
  /** Start playing only once scrolled into view (default true). */
  lazy?: boolean;
  loop?: boolean;
  /** Pass false to render a paused first frame until something else plays it. */
  autoPlay?: boolean;
  priority?: boolean;
};

/**
 * A silent, looping Cloudinary clip.
 *
 * The source assets are HEVC-in-QuickTime, which Chrome and Firefox refuse, so
 * the URL always asks for an h264 .mp4 rendition. Playback is gated on an
 * IntersectionObserver: off-screen clips are paused and never fetched, which
 * matters a great deal on a page carrying a dozen of them.
 */
export function CldVideo({
  publicId,
  width = 1280,
  ratio,
  className,
  videoClassName,
  lazy = true,
  loop = true,
  autoPlay = true,
  priority = false,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(!lazy || priority);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          if (autoPlay) void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay]);

  const poster = videoPosterUrl(publicId, { width });

  return (
    <div
      className={cn("relative overflow-hidden bg-ink", className)}
      style={{
        ...(ratio ? { aspectRatio: ratio } : {}),
        backgroundImage: `url("${blurUrlFor(publicId, "VIDEO")}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <video
        ref={ref}
        // `src` is withheld until the clip is near the viewport so the browser
        // issues no request for media the visitor may never reach.
        src={active ? videoUrl(publicId, { width, mute: true }) : undefined}
        poster={poster}
        muted
        playsInline
        loop={loop}
        autoPlay={autoPlay && active}
        preload={priority ? "auto" : "none"}
        className={cn("h-full w-full object-cover", videoClassName)}
      />
    </div>
  );
}
