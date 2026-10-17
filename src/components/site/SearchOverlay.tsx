"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { formatINR } from "@/lib/money";

type Hit = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageId: string | null;
  imageKind: "IMAGE" | "VIDEO";
  category: string | null;
};

/** Standing links, shown before anything is typed. */
const QUICK_LINKS = [
  { label: "Meet the Creative Directors", href: "/about/our-founders" },
  { label: "Store", href: "/contact" },
  { label: "Book an Appointment", href: "/atelier" },
  { label: "FAQ's", href: "/faqs" },
  { label: "Couture Process", href: "/craft" },
  { label: "Look Book", href: "/collections/new-collection" },
];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [top, setTop] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHits([]);
    // Autofocus after the panel has animated in.
    const t = setTimeout(() => inputRef.current?.focus(), 180);
    // Top sellers are the standing suggestion before anything is typed.
    void fetch("/api/search?top=1")
      .then((r) => r.json())
      .then((d) => setTop(d.results ?? []))
      .catch(() => {});
    return () => clearTimeout(t);
  }, [open]);

  // Debounced live search.
  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setHits(data.results ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const shown = query.trim() ? hits : top;
  const heading = query.trim()
    ? loading
      ? "Searching…"
      : `${hits.length} result${hits.length === 1 ? "" : "s"}`
    : "Top sellers";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130]"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[88vh] overflow-y-auto bg-bone"
          >
            <div className="shell py-8">
              {/* ---- field ---- */}
              <div className="flex items-center gap-4">
                <form
                  className="flex flex-1 items-center gap-3 border-b border-ink/25 pb-3 focus-within:border-gold"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!query.trim()) return;
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                >
                  <Search
                    className="h-4 w-4 shrink-0 text-ink-mute/60"
                    strokeWidth={1.5}
                  />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Find a product…"
                    aria-label="Search the collections"
                    className="w-full bg-transparent font-sans text-base text-ink outline-none placeholder:text-ink-mute/45"
                  />
                </form>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="p-2 text-ink-mute transition-colors hover:text-ink"
                >
                  <X className="h-5 w-5" strokeWidth={1.25} />
                </button>
              </div>

              {/* ---- quick links ---- */}
              <ul className="mt-7 flex flex-wrap gap-x-10 gap-y-3">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="label link-sweep text-ink-mute"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* ---- results ---- */}
              <p className="label mt-9 text-gold">{heading}</p>

              {shown.length === 0 && query.trim() && !loading ? (
                <p className="py-10 font-sans text-sm text-ink-mute">
                  Nothing matches “{query}”. Try a fabric or a craft — “zardozi”,
                  “benarasi”, “polki”.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 lg:grid-cols-6">
                  {shown.slice(0, 6).map((hit) => (
                    <Link
                      key={hit.id}
                      href={`/product/${hit.slug}`}
                      onClick={onClose}
                      className="group block"
                    >
                      {hit.imageId && (
                        <div className="overflow-hidden">
                          <CldImage
                            publicId={hit.imageId}
                            alt={hit.name}
                            ratio="3/4"
                            widths={[240, 400]}
                            sizes="(min-width:1024px) 16vw, 45vw"
                            fromVideo={hit.imageKind === "VIDEO"}
                            imgClassName="transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <p className="mt-2.5 font-display text-[16px] font-light leading-snug text-ink">
                        {hit.name}
                      </p>
                      <p className="label mt-1 text-ink-mute/70">
                        {formatINR(hit.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
