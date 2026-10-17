"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  Package,
  Receipt,
  CreditCard,
  Images,
  GalleryHorizontal,
  FolderTree,
  Users,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { LogoutButton } from "@/components/site/LogoutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/catalogue", label: "Catalogue", icon: Library },
  { href: "/admin/products", label: "All products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/media", label: "Media library", icon: Images },
  { href: "/admin/banners", label: "Homepage banners", icon: GalleryHorizontal },
  { href: "/admin/categories", label: "Navigation", icon: FolderTree },
  { href: "/admin/users", label: "Customers", icon: Users },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Admin">
      <div className="px-6 py-7">
        <Link href="/admin" className="display block text-[21px] leading-none text-bone">
          Sanskar <span className="text-gold">&amp;</span> Kabir
        </Link>
        <p className="label mt-1.5 text-bone/35">Atelier console</p>
      </div>

      <ul className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 font-sans text-[13px] transition-colors duration-300",
                  active
                    ? "bg-bone/10 text-bone"
                    : "text-bone/55 hover:bg-bone/5 hover:text-bone/85",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="admin-active"
                    className="ml-auto h-4 w-px bg-gold"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="space-y-3 border-t border-bone/10 px-6 py-6">
        <p className="label text-bone/35">Signed in as</p>
        <p className="font-sans text-[13px] text-bone/80">{adminName}</p>
        <Link
          href="/"
          className="label flex items-center gap-1.5 text-bone/50 hover:text-bone"
        >
          View storefront
          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        </Link>
        <LogoutButton className="btn-outline-light w-full !py-3" />
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bone-warm">
      {/* ---- desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">{sidebar}</aside>

      {/* ---- mobile ---- */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="p-1 text-bone"
        >
          <Menu className="h-5 w-5" strokeWidth={1.25} />
        </button>
        <span className="display text-lg text-bone">Atelier console</span>
        <Link href="/" className="label text-bone/50">
          Store
        </Link>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] lg:hidden"
          >
            <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-72 bg-ink"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="absolute right-3 top-3 p-2 text-bone/60"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:py-12">{children}</div>
      </div>
    </div>
  );
}
