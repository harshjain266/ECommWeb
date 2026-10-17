import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { NavItem } from "@/lib/nav-shared";
import { Monogram } from "./Wordmark";

const ABOUT_LINKS = [
  { label: "About the House", href: "/about" },
  { label: "Our Founders", href: "/about/our-founders" },
  { label: "Our Philosophy", href: "/about/our-philosophy" },
  { label: "Book an Appointment", href: "/atelier" },
  { label: "Couture Process", href: "/craft" },
  { label: "FAQ's", href: "/faqs" },
  { label: "Look Book", href: "/collections/new-collection" },
];

const LEGAL_LINKS = [
  { label: "Privacy & Cookies", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Fees and Payments", href: "/shipping" },
  { label: "Returns & Exchanges Policy", href: "/returns" },
  { label: "Size & Measurement Guide", href: "/size-guide" },
  { label: "Care for Hand Embroidery", href: "/care" },
];

const WHATSAPP = "919870196806";

/** lucide v1 dropped brand marks, so these three are inlined. */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}
      strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}
      strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <path d="M7 10v7M7 7.2v.1M11.5 17v-4a2.2 2.2 0 0 1 4.4 0v4" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}
      strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
      <path d="M3.5 20.5 4.8 16A8.2 8.2 0 1 1 8 19.2l-4.5 1.3Z" />
      <path d="M9 9.2c.3 1.6 1.2 3 2.5 4 .6.4 1.3.8 2 1 .5.2 1-.1 1.2-.5l.3-.7-1.8-.9-.6.7a5.6 5.6 0 0 1-1.9-1.9l.7-.6-.9-1.8-.7.3c-.5.2-.8.7-.8 1.2Z" />
    </svg>
  );
}

export function Footer({ nav }: { nav: NavItem[] }) {
  const shopColumns = nav.filter((n) => n.children.length > 0).slice(0, 2);

  return (
    <footer className="bg-ink text-bone">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ---- brand + newsletter ---- */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <Monogram className="h-9 w-9 text-gold" />
              <p
                className="label text-[17px] leading-none text-bone"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.2em" }}
              >
                SANSKAR <span className="text-gold">&amp;</span> KABIR
              </p>
            </div>

            <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-bone/55">
              A couture atelier in New Delhi. Clothes by Kabir, jewellery by
              Sanskar — cut, embroidered and set by hand in our own studio.
            </p>

            <form className="mt-8 max-w-sm" action="/api/newsletter" method="post">
              <label htmlFor="newsletter" className="label block text-bone/45">
                The invitation list
              </label>
              <div className="mt-3 flex border-b border-bone/25 focus-within:border-gold">
                <input
                  id="newsletter"
                  type="email"
                  name="email"
                  required
                  placeholder="your@email.com"
                  className="w-full bg-transparent py-3 font-sans text-sm text-bone outline-none placeholder:text-bone/30"
                />
                <button type="submit" className="label shrink-0 px-2 text-gold">
                  Join
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-5 text-bone/55">
              <a
                href="https://instagram.com/sanskarandkabir"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-gold"
                aria-label="Sanskar & Kabir on Instagram"
              >
                <InstagramGlyph />
              </a>
              <a
                href="https://www.linkedin.com/company/sanskarandkabir"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-gold"
                aria-label="Sanskar & Kabir on LinkedIn"
              >
                <LinkedInGlyph />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-gold"
                aria-label="Message us on WhatsApp"
              >
                <WhatsAppGlyph />
              </a>
            </div>
          </div>

          {/* ---- shop ---- */}
          {shopColumns.map((col) => (
            <div key={col.slug} className="lg:col-span-2">
              <p className="label text-bone/45">{col.name}</p>
              <ul className="mt-5 space-y-2.5">
                {col.children
                  .filter((c) => c.group === "CATEGORY")
                  .slice(0, 6)
                  .map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/collections/${child.slug}`}
                        className="link-sweep font-sans text-[13px] text-bone/70 hover:text-bone"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {/* ---- about us ---- */}
          <div className="lg:col-span-2">
            <p className="label text-bone/45">About Us</p>
            <ul className="mt-5 space-y-2.5">
              {ABOUT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-sweep font-sans text-[13px] text-bone/70 hover:text-bone"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- legal + contact ---- */}
          <div className="lg:col-span-2">
            <p className="label text-bone/45">Legal</p>
            <ul className="mt-5 space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-sweep font-sans text-[13px] text-bone/70 hover:text-bone"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="label mt-8 text-bone/45">Contact Us</p>
            <ul className="mt-5 space-y-2.5">
              <li>
                <a
                  href="tel:+919870196806"
                  className="flex items-center gap-2 font-sans text-[13px] text-bone/70 hover:text-bone"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.25} />
                  +91 98701 96806
                </a>
              </li>
              <li>
                <a
                  href="mailto:atelier@sanskarandkabir.com"
                  className="flex items-center gap-2 break-all font-sans text-[13px] text-bone/70 hover:text-bone"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.25} />
                  atelier@sanskarandkabir.com
                </a>
              </li>
              <li className="font-sans text-[13px] leading-relaxed text-bone/55">
                Shahpur Jat, New Delhi 110049
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-bone/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-bone/35">
            &copy; {new Date().getFullYear()} Sanskar &amp; Kabir. All rights reserved.
          </p>
          <p className="label text-bone/35">
            Cards, UPI, netbanking &amp; wallets &#183; secured by Razorpay
          </p>
        </div>
      </div>
    </footer>
  );
}
