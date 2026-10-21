"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CldVideo } from "@/components/ui/CldVideo";
import { CldImage } from "@/components/ui/CldImage";

export type HeroSlide = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
};

const DURATION = 7600;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), DURATION);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
      {/* ---- media layer: crossfade, with a slow push-in on the active slide ---- */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            className="h-full w-full"
            initial={reduce ? undefined : { scale: 1.02 }}
            animate={reduce ? undefined : { scale: 1.14 }}
            transition={{ duration: DURATION / 1000 + 2, ease: "linear" }}
          >
            {slide.kind === "VIDEO" ? (
              <CldVideo
                publicId={slide.publicId}
                width={1920}
                priority
                lazy={false}
                className="h-full w-full"
              />
            ) : (
              <CldImage
                publicId={slide.publicId}
                alt={slide.title}
                priority
                sizes="100vw"
                className="h-full w-full"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ---- legibility scrim ---- */}
      <div className="absolute inset-0 scrim-full" />

      {/* ---- copy ---- */}
      <div className="absolute inset-0 flex items-end pb-24 sm:pb-28 lg:items-center lg:pb-0">
        <div className="shell w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${slide.id}`}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {slide.eyebrow && (
                  <p className="label mb-5 flex items-center gap-3 text-gold-light">
                    <span className="h-px w-10 bg-gold-light/60" aria-hidden />
                    {slide.eyebrow}
                  </p>
                )}

                <h1 className="display text-[clamp(3.2rem,11vw,8.5rem)] text-bone">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="mt-6 max-w-lg text-pretty font-sans text-[15px] leading-relaxed text-bone/70 sm:text-base">
                    {slide.subtitle}
                  </p>
                )}

                {slide.ctaHref && slide.ctaLabel && (
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link href={slide.ctaHref} className="btn-light group w-full sm:w-auto">
                      {slide.ctaLabel}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
                        strokeWidth={1.5}
                      />
                    </Link>
                    <Link
                      href="/atelier"
                      className="btn-outline-light w-full sm:w-auto"
                    >
                      Book an appointment
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ---- slide controls: progress bars doubling as buttons ---- */}
      {slides.length > 1 && (
        <div className="absolute bottom-7 left-0 right-0">
          <div className="shell flex items-end justify-between gap-6">
            <div className="flex flex-1 items-center gap-2.5 sm:max-w-sm">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className="group relative h-[2px] flex-1 bg-bone/25"
                >
                  {i === index && (
                    <motion.span
                      key={`bar-${s.id}-${index}`}
                      className="absolute inset-y-0 left-0 bg-gold-light"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: DURATION / 1000, ease: "linear" }}
                    />
                  )}
                  <span className="absolute -inset-y-3 inset-x-0" />
                </button>
              ))}
            </div>

            <p className="label hidden text-bone/40 sm:block">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      )}

      {/* ---- scroll cue ---- */}
      <motion.div
        aria-hidden
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 lg:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="label text-bone/35">Scroll</span>
      </motion.div>
    </section>
  );
}
