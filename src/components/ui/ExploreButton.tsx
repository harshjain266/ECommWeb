import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const OVERLAY_CLASS =
  "group inline-flex items-center gap-2 bg-bone/92 px-4 py-2.5 label text-ink backdrop-blur-sm transition-colors duration-300 hover:bg-ink hover:text-bone";

const Glyph = () => (
  <ArrowUpRight
    className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    strokeWidth={1.5}
  />
);

/**
 * The "Explore" affordance that sits on every image and video panel.
 *
 * `variant`:
 *   overlay — floats on top of media
 *   inline  — sits beneath it in the flow
 *
 * `interactive={false}` renders a <span> instead of a link. Use it whenever
 * the panel itself is already wrapped in a <Link>: an <a> inside an <a> is
 * invalid HTML and React will refuse to hydrate it.
 */
export function ExploreButton({
  href,
  label = "Explore",
  variant = "overlay",
  interactive = true,
  className,
}: {
  href: string;
  label?: string;
  variant?: "overlay" | "inline";
  interactive?: boolean;
  className?: string;
}) {
  if (variant === "inline") {
    const inlineClass = cn("btn-outline group !py-3 text-ink", className);
    if (!interactive) {
      return (
        <span className={inlineClass}>
          {label}
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
          />
        </span>
      );
    }
    return (
      <Link href={href} className={inlineClass}>
        {label}
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.5}
        />
      </Link>
    );
  }

  if (!interactive) {
    return (
      <span className={cn(OVERLAY_CLASS, className)}>
        {label}
        <Glyph />
      </span>
    );
  }

  return (
    <Link href={href} className={cn(OVERLAY_CLASS, className)}>
      {label}
      <Glyph />
    </Link>
  );
}
