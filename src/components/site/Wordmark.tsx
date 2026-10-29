import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The house marks: the peacock and the "Sanskar & Kabir" lettering.
 *
 * Both arrive as artwork on white with a lot of surrounding paper, so every
 * URL carries two fixes before anything else:
 *
 *   e_trim                 crops the dead margin, so the mark can be sized by
 *                          its own height instead of its padding
 *   e_make_transparent     drops the white ground -- without it the logo sits
 *                          in a white box on the bone header and the
 *                          chocolate footer
 *
 * The artwork is a single brown, which disappears on a dark ground, so the
 * `tone` prop tints it to bone via `e_colorize`. That is why this builds its
 * own URLs rather than going through `lib/media`: those transforms are
 * specific to flat brand artwork and have no business in the product
 * pipeline.
 */

const CLOUD = "https://res.cloudinary.com/ddlj4gono/image/upload";
const PEACOCK = "v1793208560/gffh_1_duk8vn.png";
const LETTERING = "v1793208509/WhatsApp_Image_2026-10-28_at_10.57.16_PM_l37tan.jpg";

/** Trimmed proportions, measured once so nothing reflows while loading. */
const PEACOCK_RATIO = 260 / 201;
const LETTERING_RATIO = 658 / 73;

export type Tone = "ink" | "bone";

const CLEAN = "e_trim/e_make_transparent:25";
const TINT = "e_colorize:100,co_rgb:F5EDE1";

function brand(id: string, tone: Tone, width: number): string {
  const steps = [CLEAN];
  if (tone === "bone") steps.push(TINT);
  steps.push(`f_png,q_auto,w_${width},dpr_2.0`);
  return `${CLOUD}/${steps.join("/")}/${id}`;
}

export function Monogram({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <img
      src={brand(PEACOCK, tone, 160)}
      alt=""
      aria-hidden
      width={Math.round(40 * PEACOCK_RATIO)}
      height={40}
      className={cn("h-10 w-auto select-none", className)}
    />
  );
}

export function Lettering({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: Tone;
}) {
  return (
    <img
      src={brand(LETTERING, tone, 520)}
      alt=""
      aria-hidden
      width={Math.round(18 * LETTERING_RATIO)}
      height={18}
      className={cn("h-[18px] w-auto select-none", className)}
    />
  );
}

/**
 * Peacock and lettering together, linking home.
 *
 * `row` is for the header, where there are only ~62px of height to work in;
 * `stack` is the house's own arrangement and is used where there is room.
 */
export function Wordmark({
  className,
  size = "md",
  tone = "ink",
  layout = "row",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: Tone;
  layout?: "row" | "stack";
}) {
  const bird = { sm: "h-6", md: "h-7", lg: "h-12" }[size];
  const type = {
    sm: "h-[12px]",
    md: "h-[14px] sm:h-[15px]",
    lg: "h-[22px]",
  }[size];

  return (
    <Link
      href="/"
      aria-label="Sanskar & Kabir, home"
      className={cn(
        "group flex select-none items-center transition-opacity duration-300 hover:opacity-70",
        layout === "stack" ? "flex-col gap-2.5" : "flex-row gap-2.5 sm:gap-3",
        className,
      )}
    >
      <Monogram tone={tone} className={cn(bird, "w-auto")} />
      <Lettering tone={tone} className={cn(type, "w-auto")} />
    </Link>
  );
}
