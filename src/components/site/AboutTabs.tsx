"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ABOUT_SECTIONS } from "@/lib/about";
import { cn } from "@/lib/utils";

/** The tab strip that sits under the About Us hero. */
export function AboutTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="About the house"
      className="no-scrollbar overflow-x-auto border-b border-ink/10 bg-bone"
    >
      <ul className="shell flex min-w-max justify-center gap-8 sm:gap-12">
        {ABOUT_SECTIONS.map((s) => {
          const href = s.slug ? `/about/${s.slug}` : "/about";
          const active = pathname === href;
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                className={cn(
                  "label block whitespace-nowrap py-5 transition-colors duration-300",
                  active ? "text-ink" : "text-ink-mute/60 hover:text-ink",
                )}
              >
                {s.tab}
              </Link>
              {active && (
                <motion.span
                  layoutId="about-tab"
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
