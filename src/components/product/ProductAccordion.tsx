"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type Panel = { label: string; body: string };

/** Product Information / Delivery Timelines / Disclaimer / Washcare. */
export function ProductAccordion({ panels }: { panels: Panel[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="border-t border-ink/10">
      {panels.map((panel) => {
        const isOpen = open === panel.label;
        return (
          <div key={panel.label} className="border-b border-ink/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : panel.label)}
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
                  <p className="pb-5 text-pretty font-sans text-[13px] leading-[1.8] text-ink-mute">
                    {panel.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
