import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioRail } from "@/components/jewellery/PortfolioRail";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { PORTFOLIO, formatFee } from "@/lib/jewellery";

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
      <section className="bg-[#0a0807] pb-20 pt-16 lg:pb-28 lg:pt-20">
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
            <PortfolioRail pieces={PORTFOLIO} />
          </div>

          <p className="mt-10 text-center font-sans text-[12px] text-bone/35">
            The rail moves on its own — hover to hold it, or click the piece to
            see it as it was photographed.
          </p>
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
            sketch on paper. The design fee is {formatFee()} and becomes payable
            only after we have spoken.
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
