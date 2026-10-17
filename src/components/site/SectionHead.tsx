import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

export function SectionHead({
  eyebrow,
  title,
  blurb,
  href,
  hrefLabel,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  href?: string;
  hrefLabel?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="label text-gold">{eyebrow}</p>
        <h2
          className={`display mt-4 text-[clamp(2.2rem,5.5vw,4rem)] ${
            dark ? "text-bone" : "text-ink"
          }`}
        >
          <RevealWords text={title} />
        </h2>
        {blurb && (
          <Reveal delay={0.1}>
            <p
              className={`mt-4 max-w-xl text-pretty font-sans text-sm leading-relaxed ${
                dark ? "text-bone/55" : "text-ink-mute"
              }`}
            >
              {blurb}
            </p>
          </Reveal>
        )}
      </div>

      {href && hrefLabel && (
        <Link
          href={href}
          className={`label link-sweep group inline-flex shrink-0 items-center gap-2 ${
            dark ? "text-bone/70" : "text-ink-mute"
          }`}
        >
          {hrefLabel}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </Link>
      )}
    </div>
  );
}
