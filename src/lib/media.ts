/**
 * Cloudinary delivery-URL builder.
 *
 * The source library for this store is iPhone-native: stills are HEIC and
 * clips are HEVC-in-QuickTime (.mov). Neither plays in Chrome or Firefox, so
 * nothing is ever linked raw -- every URL goes through a delivery transform
 * that forces a web-safe output format:
 *
 *   HEIC still  ->  f_auto (jpg/webp/avif by Accept header)
 *   .mov clip   ->  .mp4 (h264) + a so_0 jpg poster frame
 *
 * Cloudinary generates a derivative lazily on first request (answering 423
 * while it transcodes) and then serves it from cache, which is why
 * `scripts/warm-media.ts` pre-touches every derivative used above the fold.
 */

export const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ddlj4gono";

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/** Strip a leading version segment and any source extension from a public id. */
export function normalizePublicId(publicId: string): string {
  return publicId
    .trim()
    .replace(/^\/+/, "")
    .replace(/^v\d+\//, "")
    .replace(/\.(heic|heif|jpe?g|png|webp|avif|mov|mp4|m4v|webm|gif)$/i, "");
}

export type Crop = "fill" | "fit" | "limit" | "scale" | "thumb";
export type Gravity = "auto" | "face" | "center" | "north" | "south";

export type ImageOpts = {
  width?: number;
  height?: number;
  crop?: Crop;
  gravity?: Gravity;
  /** 1-100, or "auto" (default) */
  quality?: number | "auto";
  blur?: number;
  grayscale?: boolean;
  dpr?: number;
};

function imageTransform(o: ImageOpts): string {
  const t: string[] = [];
  // f_auto negotiates avif/webp/jpg per browser -- this is what rescues HEIC.
  t.push("f_auto");
  t.push(`q_${o.quality ?? "auto"}`);
  if (o.width) t.push(`w_${Math.round(o.width)}`);
  if (o.height) t.push(`h_${Math.round(o.height)}`);
  if (o.crop) t.push(`c_${o.crop}`);
  else if (o.width && o.height) t.push("c_fill");
  if (o.gravity) t.push(`g_${o.gravity}`);
  else if (o.width && o.height) t.push("g_auto");
  if (o.blur) t.push(`e_blur:${o.blur}`);
  if (o.grayscale) t.push("e_grayscale");
  if (o.dpr) t.push(`dpr_${o.dpr}`);
  return t.join(",");
}

/** A web-safe still, whatever the source format was. */
export function imageUrl(publicId: string, opts: ImageOpts = {}): string {
  const id = normalizePublicId(publicId);
  if (!id) return "";
  return `${BASE}/image/upload/${imageTransform(opts)}/${id}`;
}

/** A tiny, heavily-blurred version used as a CSS blur-up placeholder. */
export function blurUrl(publicId: string): string {
  return imageUrl(publicId, { width: 24, quality: 30, blur: 400, crop: "fill" });
}

/**
 * Blur-up placeholder for either media kind.
 *
 * Videos must be addressed through `/video/upload/` -- asking for a clip's id
 * under `/image/upload/` is a 404, which is the whole reason this exists
 * separately from `blurUrl`.
 */
export function blurUrlFor(publicId: string, kind: "IMAGE" | "VIDEO"): string {
  return kind === "VIDEO"
    ? videoPosterUrl(publicId, { width: 24, quality: 30, blur: 400, crop: "fill" })
    : blurUrl(publicId);
}

export type VideoOpts = {
  width?: number;
  height?: number;
  crop?: Crop;
  /** Only "auto" is unavailable here -- see `videoUrl`. */
  gravity?: Exclude<Gravity, "auto">;
  quality?: number | "auto";
  /** Drop the audio track -- autoplaying loops must be silent anyway. */
  mute?: boolean;
};

/** An h264 .mp4 rendition, transcoded from the HEVC .mov source. */
export function videoUrl(publicId: string, opts: VideoOpts = {}): string {
  const id = normalizePublicId(publicId);
  if (!id) return "";
  const t: string[] = [`q_${opts.quality ?? "auto"}`];
  if (opts.width) t.push(`w_${Math.round(opts.width)}`);
  if (opts.height) t.push(`h_${Math.round(opts.height)}`);
  if (opts.crop) t.push(`c_${opts.crop}`);
  else if (opts.width && opts.height) t.push("c_fill");
  // No `g_auto` here, unlike the image builder: Cloudinary rejects it on the
  // video pipeline -- "g_auto must be in a transformation component by
  // itself" -- and returns 400, so asking for both a width and a height used
  // to produce a broken clip rather than a cropped one.
  if (opts.width && opts.height) t.push(`g_${opts.gravity ?? "center"}`);
  // vc_h264 is the widest-support codec; mp4 container keeps Safari happy too.
  t.push("vc_h264");
  if (opts.mute) t.push("ac_none");
  return `${BASE}/video/upload/${t.join(",")}/${id}.mp4`;
}

/** First frame of a clip, as a still -- used for `poster` so there is no black flash. */
export function videoPosterUrl(publicId: string, opts: ImageOpts = {}): string {
  const id = normalizePublicId(publicId);
  if (!id) return "";
  const t = ["so_0", imageTransform(opts)].join(",");
  return `${BASE}/video/upload/${t}/${id}.jpg`;
}

/**
 * Resolve either media kind to a still -- handy for cards, carts and order
 * lines where a video product still needs a thumbnail.
 */
export function thumbUrl(
  publicId: string,
  kind: "IMAGE" | "VIDEO",
  opts: ImageOpts = {},
): string {
  return kind === "VIDEO" ? videoPosterUrl(publicId, opts) : imageUrl(publicId, opts);
}

/** `srcset` string for responsive stills. */
export function imageSrcSet(
  publicId: string,
  widths: number[],
  opts: ImageOpts = {},
): string {
  return widths
    .map((w) => `${imageUrl(publicId, { ...opts, width: w })} ${w}w`)
    .join(", ");
}
