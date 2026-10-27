"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronRight } from "lucide-react";
import type { NavItem } from "@/lib/nav-shared";
import { groupChildren } from "@/lib/nav-shared";
import { CldImage } from "@/components/ui/CldImage";
import { Wordmark } from "./Wordmark";
import { SearchOverlay } from "./SearchOverlay";
import { cn } from "@/lib/utils";

/** Header entries that are pages rather than shoppable categories. */
const STATIC_LINKS = [
  { name: "Wishlist", href: "/wishlist" },
  { name: "About Us", href: "/about" },
];

type Props = {
  nav: NavItem[];
  cartCount: number;
  wishlistCount: number;
  user: { name: string; role: "ADMIN" | "CUSTOMER" } | null;
  /** Pages with a full-bleed hero start transparent, light-on-dark. */
  overHero?: boolean;
};

export function Header({
  nav,
  cartCount,
  wishlistCount,
  user,
  overHero = false,
}: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenSlug(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenSlug(null);
      setMobileOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** A grace period on leave, so crossing the gap to the panel is forgiving. */
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSlug(null), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const panelOpen = openSlug !== null;
  const light = overHero && !scrolled && !panelOpen;
  const active = nav.find((n) => n.slug === openSlug) ?? null;
  const columns = active ? groupChildren(active.children) : [];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-couture",
          light
            ? "bg-transparent text-bone"
            : "bg-bone/96 text-ink shadow-[0_1px_0_0_rgba(62,37,22,0.1)] backdrop-blur-xl",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="shell">
          {/* ---- row 1: wordmark + icons ---- */}
          <div className="flex h-[62px] items-center justify-between gap-4 lg:h-[68px]">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            </button>

            {/* keeps the wordmark optically centred on desktop */}
            <div className="hidden flex-1 lg:block" />

            <Wordmark />

            <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2.5 transition-opacity hover:opacity-60"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2.5 transition-opacity hover:opacity-60"
                aria-label={`Wishlist, ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {wishlistCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] leading-none text-ink">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative p-2.5 transition-opacity hover:opacity-60"
                aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-oxblood px-1 font-sans text-[10px] leading-none text-bone"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <Link
                href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
                className="p-2.5 transition-opacity hover:opacity-60"
                aria-label={user ? "Your account" : "Sign in"}
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </Link>
            </div>
          </div>

          {/* ---- row 2: the options ---- */}
          <nav
            className="hidden items-center justify-center gap-8 border-t border-current/10 py-3 lg:flex"
            aria-label="Main"
          >
            {nav.map((item) => (
              <div
                key={item.slug}
                onMouseEnter={() => {
                  cancelClose();
                  setOpenSlug(item.children.length ? item.slug : null);
                }}
              >
                <Link
                  href={`/collections/${item.slug}`}
                  className={cn(
                    "label link-sweep py-1 transition-colors duration-300",
                    item.featured && "text-gold",
                    openSlug === item.slug && "opacity-60",
                  )}
                  aria-expanded={openSlug === item.slug}
                  aria-haspopup={item.children.length > 0}
                >
                  {item.name}
                </Link>
              </div>
            ))}

            {STATIC_LINKS.map((link) => (
              <div key={link.href} onMouseEnter={() => setOpenSlug(null)}>
                <Link
                  href={link.href}
                  className={cn(
                    "label link-sweep py-1",
                    pathname.startsWith(link.href) && "text-gold",
                  )}
                >
                  {link.name}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* ---- mega menu ---- */}
        <AnimatePresence>
          {active && columns.length > 0 && (
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-t border-ink/10 bg-bone/98 backdrop-blur-xl lg:block"
              onMouseEnter={cancelClose}
            >
              <div className="shell flex items-start gap-10 py-10">
                {/* the grouped columns */}
                {columns.map((col, ci) => (
                  <div key={col.group} className="w-52 shrink-0">
                    <p className="label text-ink-mute/60">{col.label}</p>
                    <ul className="mt-4 space-y-2">
                      {col.items.map((child, i) => (
                        <motion.li
                          key={child.slug}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.03 + ci * 0.04 + i * 0.02,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <Link
                            href={`/collections/${child.slug}`}
                            className="group block font-sans text-[13px] leading-snug text-ink-mute transition-colors duration-300 hover:text-oxblood"
                          >
                            {child.name}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* editorial tile */}
                {active.imageId && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-auto w-[clamp(300px,32vw,520px)] shrink-0"
                  >
                    <Link
                      href={`/collections/${active.slug}`}
                      className="group block overflow-hidden"
                    >
                      <CldImage
                        publicId={active.imageId}
                        fromVideo={active.imageKind === "VIDEO"}
                        alt={active.name}
                        ratio="4/3"
                        // The shelf art is portrait studio photography; a
                        // centred crop into a landscape box cuts the head and
                        // the collar off, which is the half worth seeing.
                        focus="center 22%"
                        sizes="(min-width:1024px) 32vw, 420px"
                        widths={[400, 640, 800]}
                        imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                      <span className="label mt-3 flex items-center gap-1.5 text-ink-mute">
                        Explore {active.name}
                        <ChevronRight className="h-3 w-3 text-gold" strokeWidth={1.5} />
                      </span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileNav nav={nav} user={user} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MobileNav({
  nav,
  user,
  onClose,
}: {
  nav: NavItem[];
  user: { name: string; role: "ADMIN" | "CUSTOMER" } | null;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(nav[0]?.slug ?? null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] lg:hidden"
    >
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 flex w-[90%] max-w-sm flex-col bg-bone"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <Wordmark size="sm" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="h-5 w-5" strokeWidth={1.25} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-3" aria-label="Mobile">
          {nav.map((item) => {
            const open = expanded === item.slug;
            const columns = groupChildren(item.children);
            return (
              <div key={item.slug} className="border-b border-ink/[0.07]">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : item.slug)}
                  className="flex w-full items-center justify-between py-3.5 text-left"
                  aria-expanded={open}
                >
                  <span
                    className={cn(
                      "font-display text-[22px] font-light",
                      item.featured && "text-gold",
                    )}
                  >
                    {item.name}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-ink-mute transition-transform duration-300",
                      open && "rotate-90",
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <Link
                        href={`/collections/${item.slug}`}
                        onClick={onClose}
                        className="label block py-2 text-gold"
                      >
                        All {item.name}
                      </Link>
                      {columns.map((col) => (
                        <div key={col.group} className="pb-2">
                          <p className="label pt-2 text-ink-mute/50">{col.label}</p>
                          <ul>
                            {col.items.map((child) => (
                              <li key={child.slug}>
                                <Link
                                  href={`/collections/${child.slug}`}
                                  onClick={onClose}
                                  className="block py-2 font-sans text-[14px] text-ink-mute"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {STATIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block border-b border-ink/[0.07] py-3.5 font-display text-[22px] font-light"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-ink/10 px-6 py-5">
          <Link
            href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
            onClick={onClose}
            className="btn-dark w-full"
          >
            {user ? (user.role === "ADMIN" ? "Admin dashboard" : "Your account") : "Sign in"}
          </Link>
          <Link href="/atelier" onClick={onClose} className="btn-outline w-full">
            Book an appointment
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
