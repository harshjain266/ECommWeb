import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioRail } from "@/components/jewellery/PortfolioRail";
import { PortfolioGrid } from "@/components/jewellery/PortfolioGrid";
import { TiltCard } from "@/components/jewellery/TiltCard";
import { CldImage } from "@/components/ui/CldImage";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { PORTFOLIO, RING_SHOWCASE, STUDIO, formatFee } from "@/lib/jewellery";

export const metadata: Metadata = {
  title: "Portfolio — Sanskar Gupta Fine Jewellery",
  description:
    "Pieces from our own bench: modelled, cast and set in Chanakyapuri. A crowned lion, a Nataraja, a portrait in gold.",
};

/**
 * Deliberately the one dark page on the site.
 *
 * Everything else is cream, because it is selling cloth. Jewellery is lit
 * against black in every window on Zaveri Bazaar for the same reason it is
 * lit against black here: metal and stones only read when there is nothing
 * else in the frame.
 */
export default function PortfolioPage() {
  return (
    <>
      <section className="bg-[#0a0807] pb-16 pt-16 lg:pb-24 lg:pt-20">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="label text-gold">The work</p>
            <h1 className="display mt-4 text-[clamp(2.4rem,6.5vw,4.4rem)] text-bone">
              <RevealWords text="Portfolio" />
            </h1>
            <Reveal delay={0.1}>
              <p className="mt-5 text-pretty font-sans text-[15px] leading-relaxed text-bone/60">
                {PORTFOLIO.length} pieces, each made once, for one person. A
                crowned lion, a Nataraja, a portrait of somebody&rsquo;s parents,
                a pavé Cuban link. If you can describe it, it has probably
                already been modelled here.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 lg:mt-16">
            <PortfolioRail pieces={RING_SHOWCASE} />
          </div>

          <p className="mt-8 text-center font-sans text-[12px] text-bone/35">
            The rail moves on its own — hover to hold it, or click the piece to
            see it full size.
          </p>
        </div>
      </section>

      {/* ---- where they are drawn ---- */}
      <section className="border-y border-bone/10 bg-[#120e0c] py-16 lg:py-20">
        <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <TiltCard max={6}>
              <CldImage
                publicId={STUDIO.cad}
                alt="Sanskar sculpting a piece on a pen display at the studio"
                ratio="3/2"
                sizes="(min-width:1024px) 58vw, 92vw"
                widths={[640, 960, 1280, 1600]}
                className="rounded-2xl"
              />
            </TiltCard>
          </Reveal>

          <div className="lg:col-span-5">
            <p className="label text-gold">Before the metal</p>
            <h2 className="display mt-4 text-[clamp(1.7rem,3.6vw,2.6rem)] text-bone">
              <RevealWords text="Each of these was sculpted on screen first" />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-5 text-pretty font-sans text-[14px] leading-relaxed text-bone/60">
                A lion&rsquo;s mane, a likeness, the fall of a sari in silver —
                all of it is modelled digitally before a gram of gold is cut,
                which is how a piece can be turned, weighed and corrected while
                it still costs nothing to change. You see three rendered views
                of your own piece before it goes anywhere near a casting flask.
              </p>
              <Link
                href="/jewellery/customise"
                className="label mt-6 inline-block border-b border-bone/25 pb-1 text-bone transition-colors hover:border-gold hover:text-gold-light"
              >
                Have yours drawn
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- the whole wall ---- */}
      <section className="bg-[#0a0807] py-16 lg:py-24">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="label text-gold">Everything on the bench</p>
            <h2 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)] text-bone">
              <RevealWords text="All of it, in one place" />
            </h2>
            <p className="mt-4 font-sans text-[13px] leading-relaxed text-bone/50">
              Filter by what you are after. Every tile opens full size.
            </p>
          </div>

          <div className="mt-10">
            <PortfolioGrid pieces={PORTFOLIO} />
          </div>
        </div>
      </section>

      {/* ---- the obvious next step ---- */}
      <section className="border-t border-bone/10 bg-[#120e0c] py-16 text-center lg:py-20">
        <div className="shell">
          <p className="label text-gold">Did none of these quite do it?</p>
          <h2 className="display mx-auto mt-4 max-w-2xl text-[clamp(1.8rem,4vw,2.8rem)] text-bone">
            Then send us the one that does
          </h2>
          <p className="mx-auto mt-4 max-w-md font-sans text-[13px] leading-relaxed text-bone/55">
            A photograph of anything — a piece you saw, a piece you inherited, a
            sketch on paper. The design fee is {formatFee()}, and you can settle
            it online as soon as we have agreed what is being made.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/jewellery/customise" className="btn-light">
              Design your own
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
