import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stands in for a piece that has no media attached.
 *
 * Deliberately not the `skeleton` shimmer. That is a loading state, and
 * using it here meant a product with no images sat shimmering for ever --
 * indistinguishable from an image that was still downloading, which is
 * exactly how it got reported ("the image is not loading"). This says the
 * quiet part out loud instead.
 */
export function NoImage({
  label = "Image coming soon",
  ratio = "3/4",
  className,
  compact = false,
}: {
  label?: string;
  ratio?: string;
  className?: string;
  /** Icon only — for thumbnails too small to carry a caption. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 border border-dashed border-ink/15 bg-bone-warm text-ink-mute/45",
        className,
      )}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label}
    >
      <ImageOff
        className={compact ? "h-3.5 w-3.5" : "h-5 w-5"}
        strokeWidth={1.25}
        aria-hidden
      />
      {!compact && <span className="label px-2 text-center leading-tight">{label}</span>}
    </div>
  );
}
