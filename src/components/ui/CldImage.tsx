import { imageUrl, blurUrlFor, videoPosterUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  publicId: string;
  alt: string;
  /** Candidate widths for srcset. */
  widths?: number[];
  sizes?: string;
  /** Aspect ratio as a CSS value, e.g. "3/4". */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Treat the id as a video and use its first frame. */
  fromVideo?: boolean;
  /**
   * Where to anchor the crop, as a CSS `object-position`.
   *
   * The image is cropped by `object-cover`, which centres by default. Put a
   * portrait studio shot in a wide box and the centre band is the model's
   * midriff -- the head and the collar, which is what the piece is actually
   * about, fall outside. Pass "top" (or a value like "center 25%") for those.
   */
  focus?: string;
  /**
   * Crop on Cloudinary, at `ratio`, with subject detection -- instead of
   * letting CSS `object-cover` take a blind centre slice.
   *
   * The difference matters whenever portrait studio art is shown in a
   * landscape box: cover shows the middle 50% of a 2:3 photograph, which on a
   * full-length shot is the chest and the hem, and the face is gone. No
   * `object-position` fixes that for every image at once, because the subject
   * is at a different height in each one. `g_auto` finds it per asset.
   *
   * Needs `ratio` to be a plain `w/h`; ignored otherwise.
   */
  smartCrop?: boolean;
  /**
   * `cover` (the default) fills the box and crops whatever does not fit.
   * `contain` scales the whole image down until all of it is inside.
   *
   * Shelf artwork is portrait; a full-bleed landscape band shows about a fifth
   * of it, which on a garment shot is a strip of fabric with no garment. Those
   * callers want the whole frame, sized down, and supply their own backdrop
   * behind the letterbox -- so `contain` also drops the blur-up placeholder,
   * which would otherwise sit visibly in the margins.
   */
  fit?: "cover" | "contain";
  grayscale?: boolean;
};

/** "4/3" -> 1.333. Returns null for anything that is not a plain ratio. */
function parseRatio(ratio?: string): number | null {
  const m = ratio?.match(/^\s*(\d*\.?\d+)\s*\/\s*(\d*\.?\d+)\s*$/);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  return h > 0 && w > 0 ? w / h : null;
}

const DEFAULT_WIDTHS = [400, 640, 800, 1200, 1600, 1920];

/**
 * A still from Cloudinary.
 *
 * Deliberately a plain <img> rather than next/image: the source assets are
 * HEIC, which Next's optimizer cannot decode, whereas Cloudinary's `f_auto`
 * already negotiates avif/webp/jpg per browser. So we hand the browser a
 * srcset of pre-transformed URLs and let it choose.
 */
export function CldImage({
  publicId,
  alt,
  widths = DEFAULT_WIDTHS,
  sizes = "100vw",
  ratio,
  className,
  imgClassName,
  priority = false,
  fromVideo = false,
  focus,
  smartCrop = false,
  fit = "cover",
  grayscale = false,
}: Props) {
  if (!publicId) {
    return (
      <div
        className={cn("skeleton rounded-xl", className)}
        style={ratio ? { aspectRatio: ratio } : undefined}
        aria-hidden
      />
    );
  }

  // When smart-cropping, every rendition is asked for at the box's own shape
  // so Cloudinary -- not the browser -- decides what to keep.
  const aspect = smartCrop ? parseRatio(ratio) : null;
  const shape = (w: number) =>
    aspect
      ? { width: w, height: Math.round(w / aspect), crop: "fill" as const, gravity: "auto" as const }
      : { width: w };

  const src = fromVideo
    ? videoPosterUrl(publicId, { ...shape(1200), grayscale })
    : imageUrl(publicId, { ...shape(1200), grayscale });

  const srcSet = (
    fromVideo
      ? widths.map((w) => `${videoPosterUrl(publicId, { ...shape(w), grayscale })} ${w}w`)
      : widths.map((w) => `${imageUrl(publicId, { ...shape(w), grayscale })} ${w}w`)
  ).join(", ");

  const contain = fit === "contain";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        contain ? "bg-transparent" : "bg-bone-warm",
        className,
      )}
      style={{
        ...(ratio ? { aspectRatio: ratio } : {}),
        // Blur-up: a 24px render sits behind the real image as a CSS background,
        // so there is colour on screen before the full asset arrives.
        ...(contain
          ? {}
          : {
              backgroundImage: `url("${blurUrlFor(publicId, fromVideo ? "VIDEO" : "IMAGE")}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }),
      }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "h-full w-full",
          contain ? "object-contain" : "object-cover",
          imgClassName,
        )}
        style={focus ? { objectPosition: focus } : undefined}
      />
    </div>
  );
}
