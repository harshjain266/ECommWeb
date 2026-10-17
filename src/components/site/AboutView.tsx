import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { AboutTabs } from "@/components/site/AboutTabs";
import { Prose } from "@/components/site/Prose";
import { CldImage } from "@/components/ui/CldImage";
import { Reveal } from "@/components/ui/Reveal";
import { findAboutSection } from "@/lib/about";
import { STILLS } from "@/lib/media-library";

/**
 * One About Us section: the shared hero, the tab strip, the section's prose,
 * and — on the founders page — a portrait pair for Sanskar and Kabir.
 */
export function AboutView({ slug }: { slug: string }) {
  const section = findAboutSection(slug);
  if (!section) return null;

  return (
    <>
      <PageHero
        eyebrow="The house"
        title={section.title}
        blurb={section.blurb}
        publicId={STILLS[section.art % STILLS.length]}
      />

      <AboutTabs />

      {slug === "our-founders" && (
        <section className="bg-bone-warm py-16 lg:py-20">
          <div className="shell grid gap-10 sm:grid-cols-2 lg:gap-16">
            {[
              {
                name: "Sanskar",
                role: "Jewellery Designer",
                line: "Temple gold, polki and meenakari — trained on a bench before he ever drew on paper.",
                art: STILLS[2],
              },
              {
                name: "Kabir",
                role: "Fashion Designer",
                line: "Pattern cutting first, surface second — hand-canvassed sherwanis and toile-fitted lehengas.",
                art: STILLS[11],
              },
            ].map((f, i) => (
              <Reveal key={f.name} delay={i * 0.1}>
                <figure>
                  <CldImage
                    publicId={f.art}
                    alt={`${f.name}, ${f.role}`}
                    ratio="4/5"
                    sizes="(min-width:640px) 45vw, 100vw"
                    grayscale
                  />
                  <figcaption className="mt-5">
                    <p className="display text-[30px] text-ink">{f.name}</p>
                    <p className="label mt-2 text-gold">{f.role}</p>
                    <p className="mt-3 max-w-xs font-sans text-[13px] leading-relaxed text-ink-mute">
                      {f.line}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Prose blocks={section.blocks} />

      <section className="border-t border-ink/10 bg-bone-warm py-16 text-center">
        <div className="shell">
          <p className="label text-gold">Come and see</p>
          <h2 className="display mx-auto mt-4 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] text-ink">
            The work is easier to understand in person
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/atelier" className="btn-dark">
              Book an appointment
            </Link>
            <Link href="/collections/all" className="btn-outline">
              View all designs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
