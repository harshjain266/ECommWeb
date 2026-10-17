"use client";

import { motion } from "framer-motion";
import { IndianRupee, Package, Receipt, Users, Images, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icons are selected by name rather than passed in as components: a server
 * component cannot hand a function across the client boundary, so the mapping
 * has to live on this side of it.
 */
const ICONS = {
  rupee: IndianRupee,
  package: Package,
  receipt: Receipt,
  users: Users,
  images: Images,
  card: CreditCard,
} as const;

export type StatIcon = keyof typeof ICONS;

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: StatIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warn";
}) {
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-bone p-6"
    >
      <div className="flex items-start justify-between">
        <p className="label text-ink-mute/70">{label}</p>
        <Icon className="h-4 w-4 text-gold" strokeWidth={1.4} />
      </div>
      <p className="display mt-4 text-[clamp(1.7rem,3vw,2.2rem)] text-ink">{value}</p>
      {sub && (
        <p
          className={cn(
            "mt-1.5 font-sans text-[12px]",
            tone === "warn" ? "text-oxblood" : "text-ink-mute/70",
          )}
        >
          {sub}
        </p>
      )}
    </motion.div>
  );
}
