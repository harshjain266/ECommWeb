"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ExploreButton } from "@/components/ui/ExploreButton";

export type CarouselSlide = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
};

/** The festive carousel on the fourth homepage scroll. Arrow-driven, not timed. */
export function DiwaliCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i + step + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slide.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <MediaFrame
              publicId={slide.publicId}
              kind={slide.kind}
              alt={slide.title}
              sizes="100vw"
              width={1920}
              className="h-full w-full"
            />
            <div className="absolute inset-0 scrim-full" />

            <div className="absolute inset-0 flex items-center">
              <div className="shell">
                <div className="max-w-lg">
                  {slide.eyebrow && (
                    <p className="label text-gold-light">{slide.eyebrow}</p>
                  )}
                  <h2 className="display mt-4 text-[clamp(2rem,6vw,4.2rem)] text-bone">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-4 max-w-sm text-pretty font-sans text-[14px] leading-relaxed text-bone/70">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaHref && (
                    <div className="mt-7">
                      <ExploreButton
                        href={slide.ctaHref}
                        label={slide.ctaLabel ?? "Explore"}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bone/85 text-ink transition-colors hover:bg-bone"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-bone/85 text-ink transition-colors hover:bg-bone"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Go to ${s.title}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-7 bg-gold-light" : "w-1.5 bg-bone/45"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
