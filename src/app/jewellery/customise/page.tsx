import type { Metadata } from "next";
import { Check, Mail, MessageCircle, Phone } from "lucide-react";
import { CommissionForm } from "@/components/jewellery/CommissionForm";
import { CldImage } from "@/components/ui/CldImage";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { ATELIER } from "@/lib/atelier";
import {
  ATELIER_AT_WORK,
  BRIEF_HINTS,
  COMMISSION_FAQS,
  PROCESS,
  formatFee,
} from "@/lib/jewellery";

export const metadata: Metadata = {
  title: "Design Your Own — Sanskar Gupta Fine Jewellery",
  description:
    "Send us a photograph of the piece you want made. We model it, render it, and you approve the drawing before any gold is cut.",
};

export default function CustomisePage() {
  return (
    <>
      {/* ---- opening band ---- */}
      <section className="relative bg-ink">
        <CldImage
          publicId={ATELIER_AT_WORK.landscape[0]}
          alt="Sanskar modelling a piece at the tablet"
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full rounded-none"
          imgClassName="opacity-70"
        />
        <div className="absolute inset-0 scrim-full" />

        <div className="shell relative py-20 lg:py-28">
          <p className="label text-gold-light">Bespoke commissions</p>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] text-bone">
            <RevealWords text="Design your own" />
          </h1>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/70">
              Send us a photograph of the piece in your head. We model it, show
              you three renders, and nothing goes to casting until you have said
              yes to the drawing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- the brief ---- */}
      <section className="bg-bone py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* what we need, and what it costs */}
          <div className="lg:col-span-5">
            <p className="label text-gold">Start here</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.8rem)] text-ink">
              <RevealWords text="Tell us what to make" />
            </h2>

            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-4">
                {BRIEF_HINTS.map((h) => (
                  <li key={h} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                    />
                    <span className="font-sans text-[13px] leading-relaxed text-ink-mute">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>

              {/* The fee, stated plainly and early. Burying it is how a
                  commission enquiry turns into an argument later. */}
              <div className="mt-10 rounded-xl border border-gold/30 bg-bone-warm p-6">
                <p className="label text-gold">The design fee</p>
                <p className="display mt-2 text-[32px] text-ink">{formatFee()}</p>
                <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-mute">
                  Covers CAD modelling, three rendered views and one round of
                  revisions. It is adjusted against your final invoice if you go
                  ahead — and it is <strong className="text-ink">not</strong>{" "}
                  payable now. Send the brief first; we will call you, agree what
                  is being made, and only then send a payment link.
                </p>
              </div>

              <div className="mt-8 space-y-2">
                <p className="label text-ink-mute/70">Rather just talk?</p>
                <a
                  href={`tel:${ATELIER.phoneDigits}`}
                  className="flex items-center gap-2.5 font-sans text-[13px] text-ink transition-colors hover:text-oxblood"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {ATELIER.phone}
                </a>
                <a
                  href={`https://wa.me/${ATELIER.phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-sans text-[13px] text-ink transition-colors hover:text-oxblood"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                  WhatsApp us a photograph
                </a>
                <a
                  href={`mailto:${ATELIER.email}`}
                  className="flex items-center gap-2.5 font-sans text-[13px] text-ink transition-colors hover:text-oxblood"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {ATELIER.email}
                </a>
                <p className="pt-2 font-sans text-[12px] text-ink-mute">
                  {ATELIER.hours} · {ATELIER.area}
                </p>
              </div>
            </Reveal>
          </div>

          {/* the form itself */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-ink/10 bg-bone-warm/40 p-6 sm:p-8">
              <CommissionForm />
            </div>
          </div>
        </div>
      </section>

      {/* ---- the bench at work ---- */}
      <section className="overflow-hidden border-y border-ink/10 bg-bone-warm py-16 lg:py-24">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="label text-gold">On the bench</p>
            <h2 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)] text-ink">
              <RevealWords text="Modelled by hand, before a gram is cut" />
            </h2>
            <p className="mt-4 max-w-lg font-sans text-[13px] leading-relaxed text-ink-mute">
              Every commission is sculpted digitally first, so you can turn it,
              change a stone size, and see the weight of the metal before any of
              it is real.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {ATELIER_AT_WORK.portrait.slice(0, 4).map((id, i) => (
              <Reveal key={id} delay={i * 0.08}>
                {/* Alternate columns sit lower, so the row reads as a wall
                    rather than as four things in a line. */}
                <div className={i % 2 === 1 ? "lg:mt-10" : ""}>
                  <CldImage
                    publicId={id}
                    alt="The jewellery bench at work"
                    ratio="3/4"
                    sizes="(min-width:1024px) 23vw, 46vw"
                    widths={[400, 640, 800]}
                    imgClassName="transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- the process ---- */}
      <section className="bg-bone py-16 lg:py-24">
        <div className="shell">
          <p className="label text-gold">What happens next</p>
          <h2 className="display mt-4 max-w-2xl text-[clamp(1.8rem,4vw,2.8rem)] text-ink">
            <RevealWords text="From your photograph to the finished piece" />
          </h2>

          <ol className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <li className="grid gap-3 py-7 sm:grid-cols-12 sm:gap-8">
                  <p className="font-display text-[26px] font-light leading-none text-gold/50 sm:col-span-1">
                    {s.n}
                  </p>
                  <h3 className="display text-[21px] text-ink sm:col-span-4">
                    {s.title}
                  </h3>
                  <p className="font-sans text-[13px] leading-relaxed text-ink-mute sm:col-span-7">
                    {s.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- questions ---- */}
      <section className="border-t border-ink/10 bg-bone-warm py-16 lg:py-24">
        <div className="shell max-w-3xl">
          <p className="label text-gold">Before you ask</p>
          <h2 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)] text-ink">
            <RevealWords text="The questions everyone asks" />
          </h2>

          {/* Plain <details>, so it opens with no JavaScript and is findable
              by the browser's own in-page search. */}
          <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
            {COMMISSION_FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[18px] font-light text-ink marker:content-none">
                  {f.q}
                  <span
                    aria-hidden
                    className="shrink-0 font-sans text-[18px] leading-none text-gold transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl font-sans text-[13px] leading-relaxed text-ink-mute">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
