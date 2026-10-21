/**
 * The full Cloudinary asset library for this store, as bare public ids
 * (no version prefix, no extension -- see `lib/media.ts` for why).
 *
 * `STILLS` originate as iPhone HEIC/JPEG, `CLIPS` as HEVC .mov, so both are
 * only ever rendered through the transform helpers.
 */

export const STILLS = [
  "IMG_7603_cpoxvx",
  "IMG_2616_buhe9l",
  "IMG_2614_t4bfqb",
  "IMG_2617_axmoym",
  "IMG_2615_up30yr",
  "IMG_2613_x5x38s",
  "IMG_2669_svoos4",
  "IMG_2670_djt3bi",
  "IMG_2609_yvqmii",
  "IMG_2610_jtucpq",
  "IMG_2671_fmhrei",
  "IMG_2612_gcoicw",
  "IMG_2611_aeaeex",
  "IMG_4576_rvpxkg",
  "IMG_4550_ny6ahc",
  "IMG_4574_lmvexc",
  "IMG_4577_cr1ckg",
  "IMG_4578_wh7m7m",
  "IMG_4575_ic5dy2",
  "IMG_4573_ecbo9x",
  "IMG_4572_tahzyu",
] as const;

export const CLIPS = [
  "2F696985-ACA6-4C3D-A4C2-02A042ABB084_oeqdku",
  "IMG_7606_olj2gq",
  "IMG_7604_qsewqq",
  "IMG_7620_aw0ad5",
  "IMG_7617_ejhacq",
  "IMG_7621_mvmc4e",
  "IMG_7623_ubiebu",
  "IMG_7611_twdvlz",
  "IMG_7602_lvqe1d",
  "IMG_7601_rpvorr",
  "IMG_7613_ssmmyd",
  "IMG_7619_pf4lzs",
  "IMG_7624_vwnoyi",
  "IMG_7616_fmlg0h",
  "IMG_7609_qev8zb",
  "IMG_7614_gb802r",
  "IMG_7600_wtmm1e",
  "IMG_7608_aweock",
  "IMG_7612_fcrt5t",
  "IMG_7622_qfpmt6",
  "IMG_2658_qcjtbn",
  "IMG_2660_pkwny0",
  "IMG_2626_sq5zo3",
  "IMG_2654_dwdl7k",
  "IMG_2655_uwsrl4",
  "IMG_4552_bepygj",
] as const;

/**
 * Menswear shot on the studio floor, 19 Oct 2026.
 *
 * Kept separate from STILLS rather than appended to it: `pickStill` indexes
 * STILLS by position, so growing that array would re-deal every seeded
 * product's imagery on the next reseed. These are addressed by name instead.
 *
 * These are the retouched frames published by `scripts/retouch-studio.ts`,
 * which is what the site actually renders. The raw phone originals stay in
 * Cloudinary under `sanskar/` untouched, so a retouch can be redone or undone
 * without re-uploading anything.
 */
export const STUDIO_STILLS = [
  "sanskar/studio/shikar-olive-linen-bandhgala",
  "sanskar/studio/moti-bagh-ivory-sherwani",
  "sanskar/studio/nautch-black-resham-bandhgala",
  "sanskar/studio/khaki-jaal-tonal-sherwani",
  "sanskar/studio/baraat-ivory-herringbone-sherwani",
  "sanskar/studio/zafar-black-jaal-jacket",
  "sanskar/studio/qaiser-paisley-beaded-jacket",
  "sanskar/studio/sitara-velvet-bandhgala",
] as const;

export type AssetKind = "IMAGE" | "VIDEO";

export const ALL_ASSETS: { publicId: string; kind: AssetKind }[] = [
  ...STILLS.map((publicId) => ({ publicId, kind: "IMAGE" as const })),
  ...STUDIO_STILLS.map((publicId) => ({ publicId, kind: "IMAGE" as const })),
  ...CLIPS.map((publicId) => ({ publicId, kind: "VIDEO" as const })),
];

/** Deterministic pick so seeds and the media picker stay stable across runs. */
export function pickStill(i: number): string {
  return STILLS[i % STILLS.length];
}

export function pickClip(i: number): string {
  return CLIPS[i % CLIPS.length];
}
