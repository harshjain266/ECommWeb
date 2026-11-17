import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";

/**
 * The banner at the head of a shelf -- Men, New Collection, View all designs.
 *
 * It used to be its own thing: the artwork was *contained* in the band and the
 * gap around it filled with a blurred blow-up of the same asset, so a portrait
 * garment shot could be shown whole in a wide band. It worked, but it read as
 * a different kind of page from the front door, which is a full-bleed film
 * with the copy sitting on it. The house asked for one banner idiom across the
 * site, so this is the homepage hero's: the asset fills the band and is
 * cropped, a single scrim carries the type, and nothing is letterboxed.
 *
 * The crop is anchored high by default. A full-length studio shot centred in a
 * wide band is a midriff; `focus` pulls it up to the face and the neckline,
 * and a shelf whose art needs something else can say so.
 */
export function CollectionBanner({
  publicId,
  kind = "IMAGE",
  focus = "center 28%",
  children,
}: {
  publicId?: string | null;
  kind?: "IMAGE" | "VIDEO";
  /** `object-position` for the crop. */
  focus?: string;
  /** Breadcrumb, heading and standfirst, laid over the film. */
  children: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex h-[clamp(420px,72svh,780px)] items-end overflow-hidden bg-ink">
      {publicId && (
        <>
          {kind === "VIDEO" ? (
            <CldVideo
              publicId={publicId}
              width={1920}
              priority
              lazy={false}
              posterAt={2}
              fit="cover"
              focus={focus}
              className="absolute inset-0 h-full w-full rounded-none"
            />
          ) : (
            <CldImage
              publicId={publicId}
              alt=""
              priority
              sizes="100vw"
              widths={[960, 1280, 1600, 1920]}
              focus={focus}
              className="absolute inset-0 h-full w-full rounded-none"
            />
          )}

          {/* The same scrim the front door uses, so the two bands carry type
              the same way. */}
          <div className="absolute inset-0 scrim-full" />
        </>
      )}

      <div className="shell relative w-full pb-12 lg:pb-16">{children}</div>
    </section>
  );
}
