"use client";

import { motion } from "framer-motion";
import { CldVideo } from "@/components/ui/CldVideo";

/**
 * Horizontally scrolling band of clips -- the "in motion" reel. Native
 * scroll-snap on touch, drag on desktop, no carousel library.
 */
export function FilmStrip({ clips }: { clips: string[] }) {
  if (clips.length === 0) return null;

  return (
    <section className="overflow-hidden bg-ink py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-gold">In motion</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,5.5vw,4rem)] text-bone">
              Cloth, as it actually moves
            </h2>
          </div>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-bone/50">
            A still cannot tell you how a forty-two-panel organza falls. These
            can. Filmed on the atelier floor, unedited.
          </p>
        </div>
      </div>

      <motion.div
        className="no-scrollbar mt-12 flex cursor-grab gap-4 overflow-x-auto px-5 pb-4 active:cursor-grabbing sm:px-8 lg:px-12"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {clips.map((id, i) => (
          <motion.div
            key={`${id}-${i}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              delay: Math.min(i, 5) * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-[70vw] shrink-0 sm:w-[42vw] lg:w-[23vw]"
            style={{ scrollSnapAlign: "start" }}
          >
            <CldVideo publicId={id} ratio="9/16" width={640} className="w-full" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
