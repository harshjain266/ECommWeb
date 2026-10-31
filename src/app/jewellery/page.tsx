import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import {
  PORTFOLIO,
  ATELIER_AT_WORK,
  PROCESS,
  PORTFOLIO_COVER,
  formatFee,
} from "@/lib/jewellery";

export const metadata: Metadata = {
  title: "Sanskar Gupta — Fine Jewellery",
  description:
    "Fine jewellery designed and made on our own bench in Chanakyapuri. See the portfolio, or commission a piece of your own.",
};

/** The jewellery house landing: what it is, then the two doors out of it. */
export default function JewelleryHome() {
  return (
    <>
      {/* ---- opening band ---- */}
      <section className="relative bg-ink">
        <CldVideo
          publicId={ATELIER_AT_WORK.film}
          width={1280}
          priority
          lazy={false}
          className="absolute inset-0 h-full w-full rounded-none"
          videoClassName="opacity-45"
        />
        <div className="absolute inset-0 scrim-full" />

        <div className="shell relative py-24 text-center lg:py-32">
          <p className="label text-gold-light">Sanskar Gupta</p>
          <h1 className="display mx-auto mt-5 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] text-bone">
            <RevealWords text="Jewellery, drawn and made under one roof" />
          </h1>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/70">
              A lion in a crown. A portrait of someone’s parents. A pair of koi.
              Every piece here was modelled, cast and set on our own bench, and
              most of them exist because somebody asked for them. Look through
              what we have made — then send us the thing in your head.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- the two doors ---- */}
      <section className="bg-bone py-16 lg:py-24">
        <div className="shell grid gap-6 md:grid-cols-2 lg:gap-8">
          <DoorCard
            href="/jewellery/portfolio"
            eyebrow="The work"
            title="Portfolio"
            blurb={`${PORTFOLIO.length} pieces from the bench — most of them made once, for one person, from something they brought in.`}
            publicId={PORTFOLIO_COVER}
            cta="Walk the wall"
          />
          <DoorCard
            href="/jewellery/customise"
            eyebrow="Bespoke"
            title="Design Your Own"
            blurb={`Send us a photograph of what you want made. We call you back within two working days. The design fee is ${formatFee()}, payable only once the brief is agreed.`}
            publicId={ATELIER_AT_WORK.landscape[0]}
            cta="Start a commission"
          />
        </div>
      </section>

      {/* ---- how a commission actually runs ---- */}
      <section className="border-t border-ink/10 bg-bone-warm py-20 lg:py-28">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="label text-gold">From a photograph to a finished piece</p>
            <h2 className="display mt-4 text-[clamp(2rem,5vw,3.4rem)] text-ink">
              <RevealWords text="Five steps, and you see it before it exists" />
            </h2>
          </div>

          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <li>
                  <p className="font-display text-[34px] font-light leading-none text-gold/50">
                    {s.n}
                  </p>
                  <h3 className="display mt-4 text-[22px] text-ink">{s.title}</h3>
                  <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-mute">
                    {s.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/jewellery/customise" className="btn-dark">
              Start a commission
            </Link>
            <Link href="/jewellery/portfolio" className="btn-outline">
              See the portfolio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function DoorCard({
  href,
  eyebrow,
  title,
  blurb,
  publicId,
  cta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  blurb: string;
  publicId: string;
  cta: string;
}) {
  return (
    <Reveal>
      <Link href={href} className="group block">
        <CldImage
          publicId={publicId}
          alt={title}
          ratio="4/3"
          sizes="(min-width:768px) 46vw, 92vw"
          widths={[400, 640, 800, 1200]}
          imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <p className="label mt-5 text-gold">{eyebrow}</p>
        <h2 className="display mt-2 flex items-center gap-2 text-[30px] text-ink">
          {title}
          <ArrowUpRight
            className="h-5 w-5 text-ink-mute transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
            strokeWidth={1.25}
          />
        </h2>
        <p className="mt-3 max-w-sm font-sans text-[13px] leading-relaxed text-ink-mute">
          {blurb}
        </p>
        <span className="label mt-4 inline-block border-b border-ink/25 pb-1 text-ink transition-colors group-hover:border-gold group-hover:text-oxblood">
          {cta}
        </span>
      </Link>
    </Reveal>
  );
}
