"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { NavItem } from "@/lib/nav-shared";
import { CldImage } from "@/components/ui/CldImage";
import { cn } from "@/lib/utils";

/**
 * The homepage restatement of the navigation: the top-level options down the
 * left, and the selected option's sub-options revealed alongside. Hovering a
 * top-level row swaps both the sub-option list and the artwork.
 */
export function CategoryShowcase({ nav }: { nav: NavItem[] }) {
  const items = nav.filter((n) => n.children.length > 0);
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");
  const active = items.find((i) => i.slug === activeSlug) ?? items[0];

  if (!active) return null;

  return (
    <section className="bg-bone-warm py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-gold">The wardrobe</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,5.5vw,4rem)] text-ink">
              Where would you like to begin?
            </h2>
          </div>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-ink-mute">
            Six houses within the house. Choose a world on the left and its
            edits will open beside it.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ---- top-level options ---- */}
          <ul className="lg:col-span-5">
            {items.map((item, i) => {
              const isActive = item.slug === active.slug;
              return (
                <li key={item.slug} className="border-b border-ink/10">
                  <Link
                    href={`/collections/${item.slug}`}
                    onMouseEnter={() => setActiveSlug(item.slug)}
                    onFocus={() => setActiveSlug(item.slug)}
                    className="group flex items-center gap-5 py-5 lg:py-6"
                  >
                    <span className="label w-6 shrink-0 text-ink-mute/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "display flex-1 text-[clamp(1.9rem,4vw,2.9rem)] transition-colors duration-400",
                        isActive ? "text-ink" : "text-ink/35",
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="label shrink-0 text-ink-mute/40">
                      {item.children.length}
                    </span>
                    <ArrowUpRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-all duration-400",
                        isActive
                          ? "translate-x-0 text-gold opacity-100"
                          : "-translate-x-2 opacity-0",
                      )}
                      strokeWidth={1.25}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ---- sub-options for the active option ---- */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="label text-ink-mute/60">
                  {active.name} &#183; {active.children.length} edits
                </p>
                <ul className="mt-5 space-y-0.5">
                  {active.children.map((child, i) => (
                    <motion.li
                      key={child.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.035,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={`/collections/${child.slug}`}
                        className="group flex items-baseline justify-between gap-4 border-b border-ink/[0.07] py-3"
                      >
                        <span className="font-sans text-[14px] text-ink-mute transition-colors duration-300 group-hover:text-oxblood">
                          {child.name}
                        </span>
                        <span className="h-px w-5 shrink-0 bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---- artwork ---- */}
          <div className="hidden lg:col-span-3 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={`art-${active.slug}`}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {active.imageId && (
                  <CldImage
                    publicId={active.imageId}
                    alt={active.name}
                    ratio="3/4"
                    sizes="300px"
                    widths={[400, 640]}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
