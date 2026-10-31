"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { imageUrl } from "@/lib/media";
import type { Piece } from "@/lib/jewellery";

/** How long each piece holds the centre before the rail advances. */
const DWELL = 3600;

/** How many cards either side of the centre are kept in the DOM. */
const WING = 2;

/**
 * The portfolio rail.
 *
 * One piece at a time, lit on black, advancing on its own — the pieces are
 * shot as objects rather than as a catalogue, so they earn more from being
 * presented one at a time than from being tiled.
 *
 * The cut-out PNGs do the heavy lifting: with the velvet and the shop counter
 * removed, the card has no edges and the piece simply floats, which is what
 * makes the reflection underneath read as a surface rather than as a trick.
 */
export function PortfolioRail({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
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
    if (!playing || lightbox || reduce) return;
    const t = setTimeout(() => go(active + 1), DWELL);
    return () => clearTimeout(t);
  }, [playing, lightbox, reduce, active, go]);

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
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
      onBlurCapture={() => setPlaying(true)}
    >
      {/* ---- the stage ---- */}
      <div
        className="relative flex h-[clamp(300px,52vh,520px)] items-center justify-center"
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
              key={p.cut}
              type="button"
              onClick={() => (centre ? setLightbox(true) : go(i))}
              aria-label={centre ? `View larger: ${p.alt}` : `Go to ${p.alt}`}
              aria-hidden={!centre}
              tabIndex={centre ? 0 : -1}
              className="absolute outline-none focus-visible:ring-1 focus-visible:ring-gold"
              initial={false}
              animate={{
                x: `${offset * 58}%`,
                scale: centre ? 1 : 0.62 - (Math.abs(offset) - 1) * 0.12,
                rotateY: offset * -22,
                opacity: centre ? 1 : 0.4 - (Math.abs(offset) - 1) * 0.18,
                zIndex: 10 - Math.abs(offset),
                filter: centre ? "blur(0px)" : "blur(1.5px)",
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
              }
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={imageUrl(p.cut, { width: 760 })}
                alt={centre ? p.alt : ""}
                loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                decoding="async"
                className="h-[clamp(240px,42vh,440px)] w-auto max-w-[78vw] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.9)]"
                style={{
                  // A mirrored copy below the piece, faded out. WebKit-only;
                  // where it is unsupported the piece simply sits on black,
                  // which is the design minus one flourish.
                  WebkitBoxReflect:
                    "below 4px linear-gradient(transparent 58%, rgba(255,255,255,0.18))",
                }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* ---- caption + transport ---- */}
      <div className="mt-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={piece.cut}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-md font-display text-[17px] font-light leading-snug text-bone/75"
            aria-live="polite"
          >
            {piece.alt}
          </motion.p>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-center gap-3">
          <RailButton label="Previous piece" onClick={() => step(-1)}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </RailButton>

          <span className="label w-20 text-bone/45">
            {String(active + 1).padStart(2, "0")} / {pieces.length}
          </span>

          <RailButton label="Next piece" onClick={() => step(1)}>
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </RailButton>

          <RailButton
            label={playing ? "Pause the rail" : "Play the rail"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </RailButton>
        </div>
      </div>

      {/* ---- thumbnails, which double as the position indicator ---- */}
      <div
        ref={stripRef}
        className="no-scrollbar mt-9 flex gap-3 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {pieces.map((p, i) => (
          <button
            key={p.cut}
            type="button"
            onClick={() => go(i)}
            aria-label={p.alt}
            aria-current={i === active}
            className={`relative h-16 w-16 shrink-0 rounded-lg border transition-all duration-500 sm:h-20 sm:w-20 ${
              i === active
                ? "border-gold/70 opacity-100"
                : "border-bone/10 opacity-45 hover:opacity-80"
            }`}
          >
            <img
              src={imageUrl(p.cut, { width: 160 })}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1.5"
            />
          </button>
        ))}
      </div>

      {/* ---- the original shot, on velvet, at full size ---- */}
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
              <span className="label text-bone/50">
                {active + 1} / {pieces.length}
              </span>
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

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-full border border-bone/15 p-2.5 text-bone/60 transition-colors hover:border-gold/50 hover:text-bone"
    >
      {children}
    </button>
  );
}
