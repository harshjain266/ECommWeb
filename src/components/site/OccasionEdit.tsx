import Link from "next/link";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ExploreButton } from "@/components/ui/ExploreButton";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

export type EditTile = {
  label: string;
  href: string;
  publicId: string;
  kind: "IMAGE" | "VIDEO";
};

/**
 * The second homepage scroll: the house statement, then three full-height
 * occasion panels with their own Explore buttons.
 */
export function OccasionEdit({ tiles }: { tiles: EditTile[] }) {
  return (
    <section className="bg-bone">
      {/* ---- statement ---- */}
      <div className="shell py-20 text-center lg:py-28">
        <p className="label text-gold">Sanskar &amp; Kabir</p>
        <h2 className="display mx-auto mt-6 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] text-ink">
          <RevealWords text="Where individuality meets contemporary Indian craft." />
        </h2>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-ink-mute">
            Sanskar &amp; Kabir creates effortless occasionwear, made to be seen,
            felt, and remembered.
          </p>
          <p className="label mt-8 text-ink">
            This isn&apos;t just fashion. It&apos;s a tradition.
          </p>
        </Reveal>
      </div>

      {/* ---- the occasion edit ---- */}
      <div className="border-y border-ink/10 bg-bone-warm py-10 text-center">
        <p className="label text-ink">The Occasion Edit</p>
        <p className="mt-2 font-display text-[19px] font-light text-ink-mute">
          Where every occasion finds its outfit
        </p>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-3 md:gap-5 md:p-5">
        {tiles.map((tile, i) => (
          <Reveal key={tile.href} delay={i * 0.08} y={0}>
            <Link href={tile.href} className="group relative block overflow-hidden">
              <MediaFrame
                publicId={tile.publicId}
                kind={tile.kind}
                alt={tile.label}
                ratio="3/4"
                sizes="(min-width:768px) 33vw, 100vw"
                width={900}
                className="h-full w-full"
              />
              <span className="absolute inset-0 bg-ink/15 transition-colors duration-500 group-hover:bg-ink/35" />

              <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-7">
                <span className="label border-b border-bone/70 pb-1.5 text-bone">
                  {tile.label}
                </span>
                {/* presentational: the whole tile is already the link */}
                <ExploreButton
                  href={tile.href}
                  interactive={false}
                  className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
