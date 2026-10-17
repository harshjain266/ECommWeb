import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

type Props = {
  eyebrow?: string | null;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  /** Put the media on the right instead of the left. */
  flip?: boolean;
  tone?: "light" | "dark";
};

export function EditorialSplit({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  publicId,
  kind,
  flip = false,
  tone = "light",
}: Props) {
  const dark = tone === "dark";

  return (
    <section className={dark ? "bg-ink text-bone" : "bg-bone text-ink"}>
      <div className="grid lg:grid-cols-2">
        <div className={flip ? "lg:order-2" : "lg:order-1"}>
          <Reveal y={0}>
            <MediaFrame
              publicId={publicId}
              kind={kind}
              alt={title}
              ratio="4/5"
              sizes="(min-width:1024px) 50vw, 100vw"
              className="h-full w-full"
              width={1280}
            />
          </Reveal>
        </div>

        <div
          className={`flex items-center px-6 py-16 sm:px-12 lg:px-16 lg:py-24 ${
            flip ? "lg:order-1" : "lg:order-2"
          }`}
        >
          <div className="max-w-md">
            {eyebrow && (
              <p className="label flex items-center gap-3 text-gold">
                <span className="h-px w-10 bg-gold/50" aria-hidden />
                {eyebrow}
              </p>
            )}

            <h2 className="display mt-6 text-[clamp(2.1rem,4.6vw,3.6rem)]">
              <RevealWords text={title} />
            </h2>

            <Reveal delay={0.15}>
              <p
                className={`mt-6 text-pretty font-sans text-[15px] leading-relaxed ${
                  dark ? "text-bone/65" : "text-ink-mute"
                }`}
              >
                {body}
              </p>

              {ctaHref && ctaLabel && (
                <Link
                  href={ctaHref}
                  className={`${dark ? "btn-outline-light" : "btn-outline"} group mt-9`}
                >
                  {ctaLabel}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
