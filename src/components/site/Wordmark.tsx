import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The house wordmark, with the SK monogram alongside it.
 *
 * The monogram is drawn here as inline SVG so it inherits `currentColor` and
 * works on both the beige and the chocolate grounds. To use the studio's own
 * artwork instead, drop it at `public/logo-sk.svg` and swap the <svg> for an
 * <img src="/logo-sk.svg" />.
 */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-hidden
      focusable="false"
    >
      {/* S */}
      <path
        d="M62 20c-6-6-16-8-24-5-9 3-14 11-13 19 1 9 8 14 17 18l9 4c7 3 11 7 11 13 0 8-7 13-16 13-8 0-15-4-19-10"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* K */}
      <path
        d="M66 34v46M92 34 66 60l26 24"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const type = {
    sm: "text-[17px]",
    md: "text-[21px] sm:text-[24px]",
    lg: "text-[26px] sm:text-[30px]",
  }[size];

  return (
    <Link
      href="/"
      aria-label="Sanskar & Kabir, home"
      className={cn("group block text-center", className)}
    >
      <span
        className={cn(
          "label block leading-none tracking-[0.3em] transition-opacity duration-300 group-hover:opacity-70",
          type,
        )}
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.22em" }}
      >
        SANSKAR <span className="text-gold">&amp;</span> KABIR
      </span>
    </Link>
  );
}
