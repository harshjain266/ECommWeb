import { CldImage } from "./CldImage";
import { CldVideo } from "./CldVideo";

type Props = {
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  alt: string;
  ratio?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Videos: request this rendition width. */
  width?: number;
};

/** Renders whichever media kind a record carries, with one call site. */
export function MediaFrame({
  publicId,
  kind,
  alt,
  ratio,
  className,
  sizes,
  priority,
  width,
}: Props) {
  if (kind === "VIDEO") {
    return (
      <CldVideo
        publicId={publicId}
        ratio={ratio}
        className={className}
        priority={priority}
        width={width}
      />
    );
  }
  return (
    <CldImage
      publicId={publicId}
      alt={alt}
      ratio={ratio}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
