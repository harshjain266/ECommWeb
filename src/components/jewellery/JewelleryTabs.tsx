"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const JEWELLERY_TABS = [
  { href: "/jewellery", label: "The House" },
  { href: "/jewellery/portfolio", label: "Portfolio" },
  { href: "/jewellery/customise", label: "Design Your Own" },
];

/** The strip under the jewellery hero. Mirrors AboutTabs deliberately. */
export function JewelleryTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Jewellery"
      className="no-scrollbar sticky top-[62px] z-30 overflow-x-auto border-b border-ink/10 bg-bone lg:top-[122px]"
    >
      <ul className="shell flex min-w-max justify-center gap-8 sm:gap-12">
        {JEWELLERY_TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href} className="relative">
              <Link
                href={t.href}
                className={cn(
                  "label block whitespace-nowrap py-5 transition-colors duration-300",
                  active ? "text-ink" : "text-ink-mute/60 hover:text-ink",
                )}
              >
                {t.label}
              </Link>
              {active && (
                <motion.span
                  layoutId="jewellery-tab"
                  className="absolute inset-x-0 bottom-0 h-px bg-gold"
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
