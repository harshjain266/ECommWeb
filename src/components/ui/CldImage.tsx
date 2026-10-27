import { imageUrl, imageSrcSet, blurUrlFor, videoPosterUrl } from "@/lib/media";
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
  grayscale?: boolean;
};

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
  grayscale = false,
}: Props) {
  if (!publicId) {
    return (
      <div
        className={cn("skeleton", className)}
        style={ratio ? { aspectRatio: ratio } : undefined}
        aria-hidden
      />
    );
  }

  const src = fromVideo
    ? videoPosterUrl(publicId, { width: 1200, grayscale })
    : imageUrl(publicId, { width: 1200, grayscale });

  const srcSet = fromVideo
    ? widths.map((w) => `${videoPosterUrl(publicId, { width: w, grayscale })} ${w}w`).join(", ")
    : imageSrcSet(publicId, widths, { grayscale });

  return (
    <div
      className={cn("relative overflow-hidden bg-bone-warm", className)}
      style={{
        ...(ratio ? { aspectRatio: ratio } : {}),
        // Blur-up: a 24px render sits behind the real image as a CSS background,
        // so there is colour on screen before the full asset arrives.
        backgroundImage: `url("${blurUrlFor(publicId, fromVideo ? "VIDEO" : "IMAGE")}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        className={cn("h-full w-full object-cover", imgClassName)}
        style={focus ? { objectPosition: focus } : undefined}
      />
    </div>
  );
}
