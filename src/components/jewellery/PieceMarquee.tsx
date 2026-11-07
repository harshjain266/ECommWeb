"use client";

import { useReducedMotion } from "framer-motion";
import { imageUrl } from "@/lib/media";
import type { Piece } from "@/lib/jewellery";

/**
 * An endless rail of pieces, sliding past.
 *
 * The list is rendered twice and the track translated by exactly -50%, which
 * is what makes the loop seamless: at the moment the animation restarts, the
 * second copy is sitting precisely where the first began.
 *
 * Pure CSS, so it keeps running while the main thread is busy and costs
 * nothing in React. Hovering holds it, which is the only way to actually look
 * at something that is moving.
 */
export function PieceMarquee({
  pieces,
  /** Seconds for one full pass. Longer reads as calmer. */
  duration = 60,
  reverse = false,
  tone = "light",
}: {
  pieces: Piece[];
  duration?: number;
  reverse?: boolean;
  tone?: "light" | "dark";
}) {
  const reduce = useReducedMotion();
  const run = [...pieces, ...pieces];

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        // Both ends feather out, so pieces enter and leave rather than being
        // chopped at the edge of the band.
        maskImage:
          "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
      }}
    >
      <div
        // `animate-marquee` rather than an inline `animation` shorthand: the
        // keyframes live in `@theme`, and Tailwind only emits them for a
        // stylesheet that actually references the utility.
        className={`flex w-max gap-4 group-hover:[animation-play-state:paused] ${
          reduce ? "" : "animate-marquee"
        }`}
        style={
          reduce
            ? undefined
            : {
                animationDuration: `${duration}s`,
                animationDirection: reverse ? "reverse" : "normal",
              }
        }
      >
        {run.map((p, i) => (
          <figure
            key={`${p.id}-${i}`}
            className="group/item relative w-[180px] shrink-0 sm:w-[228px]"
            aria-hidden={i >= pieces.length}
          >
            <img
              src={imageUrl(p.publicId, { width: 460 })}
              alt={i < pieces.length ? p.alt : ""}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-xl object-cover transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:scale-[1.04]"
            />
            <figcaption
              className={`mt-2.5 font-sans text-[11.5px] uppercase tracking-[0.16em] ${
                tone === "dark" ? "text-bone/45" : "text-ink-mute/70"
              }`}
            >
              {p.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
