import type { Metadata } from "next";
import { SiteChrome } from "@/components/site/SiteChrome";
import { PageHero } from "@/components/site/PageHero";
import { AppointmentForm } from "@/components/site/AppointmentForm";
import { CldVideo } from "@/components/ui/CldVideo";
import { Reveal } from "@/components/ui/Reveal";
import { STILLS, CLIPS } from "@/lib/media-library";

export const metadata: Metadata = {
  title: "The atelier",
  description:
    "Book a consultation at our New Delhi atelier. Bridal commissions run to a nine-month calendar with three fittings included.",
};

const STEPS = [
  {
    n: "01",
    title: "The consultation",
    body: "Ninety minutes with a designer. We look at silhouettes, at what suits you standing and sitting, and at what the light will be like where you are getting married. Nothing is ordered on the day.",
  },
  {
    n: "02",
    title: "The drawing",
    body: "You receive a hand drawing with fabric and thread swatches attached, and a fixed price. Changes at this stage cost nothing, which is why we would rather you made them now.",
  },
  {
    n: "03",
    title: "The first fitting",
    body: "A toile — a plain cotton mock-up of the whole piece — fitted on you, so the shape is settled before a single stitch of embroidery is worked.",
  },
  {
    n: "04",
    title: "The work",
    body: "Between eight weeks and seven months on the frame, depending on the density. You are welcome to come and watch; most people come twice.",
  },
  {
    n: "05",
    title: "The final fittings",
    body: "Two more, a fortnight apart, with the embroidery on. The last one is for the hem, with your shoes.",
  },
];

export default function AtelierPage() {
  return (
    <SiteChrome>
      <PageHero
        eyebrow="Shahpur Jat, New Delhi"
        title="The atelier"
        blurb="Everything we sell is cut, embroidered and finished on one floor, by people we employ directly. You are welcome to come and watch it happen."
        publicId={STILLS[6]}
      />

      <section className="bg-bone py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="label text-gold">How a commission works</p>
            <ol className="mt-10 space-y-10">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.06}>
                  <li className="flex gap-6">
                    <span className="label shrink-0 pt-1.5 text-ink-mute/40">{s.n}</span>
                    <div>
                      <h3 className="font-display text-[23px] font-light text-ink">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-pretty font-sans text-[14px] leading-[1.75] text-ink-mute">
                        {s.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-bone-warm p-7">
              <p className="label text-gold">Book a consultation</p>
              <h2 className="display mt-3 text-[28px] text-ink">
                Come and see the work
              </h2>
              <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-mute">
                Tell us a little about the occasion and we will find a slot.
              </p>
              <div className="mt-7">
                <AppointmentForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 lg:py-24">
        <div className="shell">
          <p className="label text-gold">On the floor</p>
          <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)] text-bone">
            Thirty-eight karigars, one roof
          </h2>
          <p className="mt-5 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/60">
            Zardozi, aari, dabka, gota and chikankari are all worked in-house.
            Nothing is sent out, which is the only way to be certain who made
            what, and under what conditions.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CLIPS.slice(10, 14).map((id) => (
              <CldVideo key={id} publicId={id} ratio="9/16" width={640} />
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
