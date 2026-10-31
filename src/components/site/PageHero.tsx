import { CldImage } from "@/components/ui/CldImage";
import { Reveal, RevealWords } from "@/components/ui/Reveal";

export function PageHero({
  eyebrow,
  title,
  blurb,
  publicId,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  publicId?: string;
}) {
  return (
    <section className="relative bg-ink">
      {publicId && (
        <>
          <CldImage
            publicId={publicId}
            alt={title}
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full rounded-none"
            imgClassName="opacity-80"
          />
          <div className="absolute inset-0 scrim-full" />
        </>
      )}
      <div className="shell relative py-20 lg:py-28">
        <p className="label text-gold-light">{eyebrow}</p>
        <h1 className="display mt-5 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] text-bone">
          <RevealWords text={title} />
        </h1>
        {blurb && (
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/65">
              {blurb}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
