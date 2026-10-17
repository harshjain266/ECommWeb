"use client";

import { motion } from "framer-motion";
import { MediaFrame } from "@/components/ui/MediaFrame";

export type Testimonial = {
  id: string;
  author: string;
  occasion: string | null;
  quote: string;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
};

/**
 * "In their own words" — a continuously drifting rail.
 *
 * The list is rendered twice and the track translated -50%, which is what
 * makes the loop seamless; hovering pauses it so a quote can be read.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  const rail = [...items, ...items];

  return (
    <section className="overflow-hidden bg-bone py-20 lg:py-28">
      <div className="shell text-center">
        <p className="label text-gold">In their own words</p>
        <h2 className="display mt-4 text-[clamp(2rem,5vw,3.4rem)] text-ink">
          Made for moments
        </h2>
      </div>

      <div className="group relative mt-14">
        {/* edges fade the rail out rather than cutting it */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bone to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bone to-transparent sm:w-28" />

        <div
          className="flex w-max gap-5 pl-5 sm:pl-8"
          style={{
            animation: "marquee 54s linear infinite",
            animationPlayState: "running",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = "running";
          }}
        >
          {rail.map((t, i) => (
            <motion.figure
              key={`${t.id}-${i}`}
              className="w-[70vw] shrink-0 sm:w-[44vw] lg:w-[23vw]"
            >
              <MediaFrame
                publicId={t.publicId}
                kind={t.kind}
                alt={`${t.author}, ${t.occasion ?? "client"}`}
                ratio="4/5"
                sizes="(min-width:1024px) 23vw, 70vw"
                width={640}
              />
              <figcaption className="mt-4">
                <blockquote className="font-display text-[17px] font-light italic leading-snug text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="label mt-3 text-ink">{t.author}</p>
                {t.occasion && (
                  <p className="label mt-1 text-ink-mute/60">{t.occasion}</p>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
