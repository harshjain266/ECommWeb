"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { imageUrl } from "@/lib/media";
import type { Piece } from "@/lib/jewellery";

/** How long each piece holds the centre before the rail advances. */
const DWELL = 4200;

/** How many cards either side of the centre are kept in the DOM. */
const WING = 2;

/**
 * The portfolio rail.
 *
 * One piece at a time, lit on black, advancing on its own — these are shot as
 * objects rather than as a catalogue, so they earn more from being presented
 * one at a time than from being tiled.
 *
 * The transport is deliberately two arrows and nothing else: a counter and a
 * pause button on a rail that already stops when you touch it were reading as
 * instrumentation, not as a gallery.
 */
export function PortfolioRail({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (to: number) => setActive(((to % pieces.length) + pieces.length) % pieces.length),
    [pieces.length],
  );
  const step = useCallback((by: number) => go(active + by), [active, go]);

  // Auto-advance. Paused while the lightbox is up, while the visitor is
  // hovering the rail, and whenever reduced motion is asked for.
  useEffect(() => {
    if (hold || lightbox || reduce) return;
    const t = setTimeout(() => go(active + 1), DWELL);
    return () => clearTimeout(t);
  }, [hold, lightbox, reduce, active, go]);

  // Keep the active thumbnail in view as the rail moves on its own.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  const piece = pieces[active];

  return (
    <div
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
    >
      {/* ---- the stage ---- */}
      <div className="relative">
        <div
          className="relative flex h-[clamp(300px,52vh,540px)] items-center justify-center"
          style={{ perspective: 1600 }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Portfolio"
        >
          {pieces.map((p, i) => {
            // Shortest signed distance around the loop, so stepping past the
            // end slides forward rather than rewinding through the whole rail.
            let offset = i - active;
            if (offset > pieces.length / 2) offset -= pieces.length;
            if (offset < -pieces.length / 2) offset += pieces.length;
            if (Math.abs(offset) > WING) return null;

            const centre = offset === 0;
            return (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => (centre ? setLightbox(true) : go(i))}
                aria-label={centre ? `View larger: ${p.alt}` : `Go to ${p.title}`}
                aria-hidden={!centre}
                tabIndex={centre ? 0 : -1}
                className="absolute rounded-2xl outline-none focus-visible:ring-1 focus-visible:ring-gold"
                initial={false}
                animate={{
                  x: `${offset * 64}%`,
                  scale: centre ? 1 : 0.74 - (Math.abs(offset) - 1) * 0.1,
                  rotateY: offset * -26,
                  opacity: centre ? 1 : 0.45 - (Math.abs(offset) - 1) * 0.2,
                  zIndex: 10 - Math.abs(offset),
                  filter: centre ? "blur(0px)" : "blur(2px)",
                }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
                }
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={imageUrl(p.publicId, { width: 1000 })}
                  alt={centre ? p.alt : ""}
                  loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-[clamp(260px,46vh,470px)] w-auto max-w-[82vw] rounded-2xl object-cover shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] ring-1 ring-bone/10"
                />
                {/* A thin gold hairline that only lights the centre card. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 transition-colors duration-700 ${
                    centre ? "ring-gold/35" : "ring-transparent"
                  }`}
                />
              </motion.button>
            );
          })}
        </div>

        {/* ---- the transport: two arrows, nothing else ---- */}
        <RailArrow side="left" label="Previous piece" onClick={() => step(-1)} />
        <RailArrow side="right" label="Next piece" onClick={() => step(1)} />
      </div>

      {/* ---- thumbnails, which double as the position indicator ---- */}
      <div
        ref={stripRef}
        className="no-scrollbar mt-8 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {pieces.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(i)}
            aria-label={p.title}
            aria-current={i === active}
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-all duration-500 sm:h-[68px] sm:w-[68px] ${
              i === active
                ? "border-gold/70 opacity-100"
                : "border-bone/10 opacity-40 hover:opacity-80"
            }`}
          >
            <img
              src={imageUrl(p.publicId, { width: 180 })}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* ---- the piece at full size ---- */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[160] flex flex-col bg-black/96 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={piece.alt}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="label text-bone/50">{piece.title}</span>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                aria-label="Close"
                className="p-2 text-bone/70 transition-colors hover:text-bone"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
              <motion.img
                key={piece.publicId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                src={imageUrl(piece.publicId, { width: 1600 })}
                alt={piece.alt}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </div>

            <p className="mx-auto max-w-2xl px-6 pb-7 text-center font-sans text-[13px] leading-relaxed text-bone/60">
              {piece.alt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-20 -translate-y-1/2 p-3 text-bone/45 transition-colors hover:text-bone ${
        side === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2"
      }`}
    >
      <Icon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1} />
    </button>
  );
}
