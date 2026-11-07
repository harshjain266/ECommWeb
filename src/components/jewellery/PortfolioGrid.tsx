"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { imageUrl } from "@/lib/media";
import { CATEGORIES, type Category, type Piece } from "@/lib/jewellery";
import { TiltCard } from "./TiltCard";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The whole body of work, filterable, every tile a card that turns towards
 * the pointer.
 *
 * The rail above it shows one piece properly; this is the other half of the
 * argument — that there are fifty of them, and that they are not variations
 * on one idea. Hence the filter: a visitor who came for a ring should be able
 * to see only rings without losing the sense of the scale of it.
 */
export function PortfolioGrid({ pieces }: { pieces: Piece[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Category | "All">("All");
  const [open, setOpen] = useState<number | null>(null);

  const shown = useMemo(
    () => (filter === "All" ? pieces : pieces.filter((p) => p.category === filter)),
    [pieces, filter],
  );

  // Counts are computed once rather than written down, so adding a piece to
  // the module cannot leave a stale number on the chip.
  const counts = useMemo(() => {
    const m = new Map<Category, number>();
    for (const p of pieces) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [pieces]);

  const step = (by: number) =>
    setOpen((i) => (i === null ? null : (i + by + shown.length) % shown.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shown.length]);

  const current = open === null ? null : shown[open];

  return (
    <div>
      {/* ---- filter ---- */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip
          label="Everything"
          count={pieces.length}
          active={filter === "All"}
          onClick={() => {
            setFilter("All");
            setOpen(null);
          }}
        />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            count={counts.get(c) ?? 0}
            active={filter === c}
            onClick={() => {
              setFilter(c);
              setOpen(null);
            }}
          />
        ))}
      </div>

      {/* ---- the wall ---- */}
      <motion.div
        layout={!reduce}
        // Dense flow: the handful of letterbox pieces span two columns, and
        // without it each one leaves a hole in the row it could not finish.
        className="mt-8 grid auto-rows-auto grid-flow-row-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                // Stagger inside each row rather than across the whole wall:
                // a long list would otherwise finish arriving a minute after
                // the visitor got there.
                delay: reduce ? 0 : (i % 8) * 0.045,
                ease: EASE,
              }}
              className={p.shape === "wide" ? "sm:col-span-2" : undefined}
            >
              <TiltCard className="h-full">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group block w-full text-left outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  aria-label={`View ${p.title}`}
                >
                  <div
                    className="relative overflow-hidden rounded-xl bg-[#141010] ring-1 ring-bone/10"
                    style={{
                      aspectRatio:
                        p.shape === "wide"
                          ? "16/9"
                          : p.shape === "portrait"
                            ? "3/4"
                            : "4/5",
                    }}
                  >
                    <img
                      src={imageUrl(p.publicId, { width: 720 })}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="pointer-events-none absolute bottom-3 left-3 right-3 translate-y-2 font-display text-[15px] font-light text-bone opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {p.title}
                    </span>
                  </div>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ---- full size ---- */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[160] flex flex-col bg-black/96 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="label text-bone/50">{current.title}</span>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="p-2 text-bone/70 transition-colors hover:text-bone"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous piece"
                className="absolute left-1 z-10 p-3 text-bone/45 transition-colors hover:text-bone sm:left-4"
              >
                <ChevronLeft className="h-8 w-8" strokeWidth={1} />
              </button>

              <motion.img
                key={current.publicId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
                src={imageUrl(current.publicId, { width: 1600 })}
                alt={current.alt}
                className="max-h-full max-w-full rounded-xl object-contain"
              />

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next piece"
                className="absolute right-1 z-10 p-3 text-bone/45 transition-colors hover:text-bone sm:right-4"
              >
                <ChevronRight className="h-8 w-8" strokeWidth={1} />
              </button>
            </div>

            <p className="mx-auto max-w-2xl px-6 pb-7 text-center font-sans text-[13px] leading-relaxed text-bone/60">
              {current.alt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-sans text-[11.5px] uppercase tracking-[0.16em] transition-colors duration-300 ${
        active
          ? "border-gold/70 bg-gold/15 text-bone"
          : "border-bone/15 text-bone/50 hover:border-bone/35 hover:text-bone/80"
      }`}
    >
      {label}
      <span className="ml-2 text-bone/30">{count}</span>
    </button>
  );
}
