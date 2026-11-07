import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { SpinRing } from "@/components/jewellery/SpinRing";
import { PieceMarquee } from "@/components/jewellery/PieceMarquee";
import { TiltCard } from "@/components/jewellery/TiltCard";
import {
  PORTFOLIO,
  PROCESS,
  RING_SHOWCASE,
  MARQUEE_TOP,
  MARQUEE_BOTTOM,
  STUDIO,
  DOOR_PORTFOLIO,
  DOOR_COMMISSION,
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
          publicId={STUDIO.film}
          width={1280}
          priority
          lazy={false}
          className="absolute inset-0 h-full w-full rounded-none"
          videoClassName="opacity-45 motion-safe:animate-slow-zoom"
          // The clip is shot portrait, so a wide band shows about a sixth of
          // it. Centred, that sixth was his chin; at 38% it was the keyboard.
          // 62% is the pen display with the sculpt on it -- the work itself,
          // which is the only thing in the frame that makes the argument.
          focus="center 62%"
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

      {/* ---- the ring: the work, turning ---- */}
      <section className="overflow-hidden bg-[#0a0807] py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="label text-gold">Turn it</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4.4vw,3rem)] text-bone">
              <RevealWords text="Twelve pieces, in the round" />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-4 font-sans text-[14px] leading-relaxed text-bone/55">
                Every one of these started as a photograph somebody sent us.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 lg:mt-14">
            <SpinRing pieces={RING_SHOWCASE} />
          </div>
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
            publicId={DOOR_PORTFOLIO.publicId}
            cta="Walk the wall"
          />
          <DoorCard
            href="/jewellery/customise"
            eyebrow="Bespoke"
            title="Design Your Own"
            blurb={`Send us a photograph of what you want made. We call you back within two working days. The design fee is ${formatFee()}, and you can settle it online the moment the brief is agreed.`}
            publicId={DOOR_COMMISSION.publicId}
            cta="Start a commission"
          />
        </div>
      </section>

      {/* ---- the man at the bench ---- */}
      <section className="border-y border-ink/10 bg-bone-warm py-16 lg:py-24">
        <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <TiltCard max={7}>
              <CldImage
                publicId={STUDIO.designer}
                alt="Sanskar Gupta, photographed in the studio"
                ratio="4/5"
                sizes="(min-width:1024px) 38vw, 92vw"
                widths={[480, 720, 960]}
                className="rounded-2xl"
              />
            </TiltCard>
          </Reveal>

          <div className="lg:col-span-7">
            <p className="label text-gold">Who makes it</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4.2vw,3rem)] text-ink">
              <RevealWords text="One pair of hands, from the drawing to the polish" />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-pretty font-sans text-[14px] leading-relaxed text-ink-mute">
                Sanskar models every commission himself, on a pen display,
                before any metal is touched. That is unusual: most houses send
                the CAD out and the maker never meets the person who will wear
                the piece. Here the person who draws it is the person who sets
                the stones, which is the only reason a lion’s mane or a
                likeness of somebody’s father survives the journey from a
                screenshot to a finished casting.
              </p>
              <p className="mt-4 max-w-xl text-pretty font-sans text-[14px] leading-relaxed text-ink-mute">
                Casting, kundan setting, meenakari and finishing all happen on
                the bench in Chanakyapuri. You are welcome to come and watch
                any stage of it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/jewellery/customise" className="btn-dark">
                  Commission a piece
                </Link>
                <Link href="/jewellery/portfolio" className="btn-outline">
                  See the work
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- the body of work, sliding past ---- */}
      <section className="overflow-hidden bg-bone py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-xl">
            <p className="label text-gold">Everything else</p>
            <h2 className="display mt-4 text-[clamp(1.7rem,3.6vw,2.6rem)] text-ink">
              <RevealWords text="Rings, pendants, cuffs, cufflinks, idols" />
            </h2>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          <PieceMarquee pieces={MARQUEE_TOP} duration={72} />
          <PieceMarquee pieces={MARQUEE_BOTTOM} duration={86} reverse />
        </div>

        <div className="shell mt-10">
          <Link
            href="/jewellery/portfolio"
            className="label inline-block border-b border-ink/25 pb-1 text-ink transition-colors hover:border-gold hover:text-oxblood"
          >
            All {PORTFOLIO.length} pieces
          </Link>
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
        <TiltCard max={6} lift={10}>
          <CldImage
            publicId={publicId}
            alt={title}
            ratio="4/3"
            sizes="(min-width:768px) 46vw, 92vw"
            widths={[400, 640, 800, 1200]}
            imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        </TiltCard>
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
