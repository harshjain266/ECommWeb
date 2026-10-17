"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { formatINR } from "@/lib/money";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  newest: "Newest first",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
};

export function CollectionToolbar({
  count,
  sort,
  min,
  max,
  floor,
  ceiling,
}: {
  count: number;
  sort: SortKey;
  min?: string;
  max?: string;
  floor: number;
  ceiling: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  /** Rewrite the query string, dropping empty values so URLs stay clean. */
  const apply = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  };

  const hasPriceFilter = Boolean(min || max);

  return (
    <div className="border-b border-ink/10 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label text-ink-mute">
          {count} {count === 1 ? "piece" : "pieces"}
          {pending && <span className="ml-2 opacity-50">updating…</span>}
        </p>

        <div className="flex items-center gap-2">
          {/* ---- price filter ---- */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterOpen((o) => !o);
                setSortOpen(false);
              }}
              aria-expanded={filterOpen}
              className="label flex items-center gap-2 border border-ink/20 px-4 py-3 transition-colors hover:border-ink"
            >
              Price
              {hasPriceFilter && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-300 ${
                  filterOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 top-full z-50 mt-2 w-72 border border-ink/15 bg-bone p-5 shadow-2xl"
                >
                  <p className="label text-ink-mute">Price range</p>
                  <p className="mt-1 font-sans text-xs text-ink-mute/70">
                    {formatINR(floor * 100)} — {formatINR(ceiling * 100)} in this edit
                  </p>

                  <form
                    className="mt-4 flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      apply({
                        min: String(fd.get("min") ?? ""),
                        max: String(fd.get("max") ?? ""),
                      });
                      setFilterOpen(false);
                    }}
                  >
                    <div className="flex-1">
                      <label htmlFor="min" className="field-label">
                        Min ₹
                      </label>
                      <input
                        id="min"
                        name="min"
                        type="number"
                        min={0}
                        defaultValue={min}
                        placeholder={String(floor)}
                        className="field"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="max" className="field-label">
                        Max ₹
                      </label>
                      <input
                        id="max"
                        name="max"
                        type="number"
                        min={0}
                        defaultValue={max}
                        placeholder={String(ceiling)}
                        className="field"
                      />
                    </div>
                    <button type="submit" className="btn-dark px-4 py-3">
                      Go
                    </button>
                  </form>

                  {hasPriceFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        apply({ min: null, max: null });
                        setFilterOpen(false);
                      }}
                      className="label mt-3 flex items-center gap-1.5 text-oxblood"
                    >
                      <X className="h-3 w-3" strokeWidth={1.5} />
                      Clear
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ---- sort ---- */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSortOpen((o) => !o);
                setFilterOpen(false);
              }}
              aria-expanded={sortOpen}
              className="label flex items-center gap-2 border border-ink/20 px-4 py-3 transition-colors hover:border-ink"
            >
              {SORT_LABELS[sort]}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-300 ${
                  sortOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 top-full z-50 mt-2 w-56 border border-ink/15 bg-bone py-1 shadow-2xl"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => {
                          apply({ sort: key === "featured" ? null : key });
                          setSortOpen(false);
                        }}
                        className={`label block w-full px-4 py-3 text-left transition-colors hover:bg-bone-warm ${
                          key === sort ? "text-gold" : "text-ink-mute"
                        }`}
                      >
                        {SORT_LABELS[key]}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ---- active filter chip ---- */}
      {hasPriceFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="label flex items-center gap-2 bg-bone-warm px-3 py-2 text-ink-mute">
            {min ? formatINR(Number(min) * 100) : formatINR(floor * 100)} —{" "}
            {max ? formatINR(Number(max) * 100) : formatINR(ceiling * 100)}
            <button
              type="button"
              onClick={() => apply({ min: null, max: null })}
              aria-label="Clear price filter"
            >
              <X className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
