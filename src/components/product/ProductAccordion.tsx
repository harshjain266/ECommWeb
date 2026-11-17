"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type Panel = {
  label: string;
  /** Free prose. Blank lines break it into paragraphs. */
  body?: string;
  /**
   * Named details -- fabric, colour, craft and so on -- each on its own line
   * under the prose. They used to be flattened into the body joined by middots,
   * which read as one long run-on sentence and buried the reference number at
   * the end of it.
   */
  specs?: [label: string, value: string][];
};

/** Description / Delivery Timelines / Disclaimer / Washcare. */
export function ProductAccordion({ panels }: { panels: Panel[] }) {
  // Several panels may stand open at once, and the first one -- the
  // description -- is open on arrival: it is the copy the piece is sold on,
  // and a shut panel asks the visitor to work for it.
  const [open, setOpen] = useState<string[]>(() =>
    panels.length ? [panels[0].label] : [],
  );

  const toggle = (label: string) =>
    setOpen((cur) =>
      cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label],
    );

  return (
    <div className="border-t border-ink/10">
      {panels.map((panel) => {
        const isOpen = open.includes(panel.label);
        const paragraphs = (panel.body ?? "")
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean);

        return (
          <div key={panel.label} className="border-b border-ink/10">
            <button
              type="button"
              onClick={() => toggle(panel.label)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="label text-ink">{panel.label}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-mute transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3.5 pb-5 font-sans text-[13px] leading-[1.8] text-ink-mute">
                    {paragraphs.map((text, i) => (
                      <p key={i} className="text-pretty">
                        {text}
                      </p>
                    ))}

                    {panel.specs && panel.specs.length > 0 && (
                      <dl className="space-y-2.5">
                        {panel.specs.map(([key, value]) => (
                          <div key={key} className="flex flex-wrap gap-x-1.5">
                            <dt className="text-ink">{key} :</dt>
                            <dd className="text-ink-mute">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
