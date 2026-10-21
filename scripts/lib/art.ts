import { MOTIFS } from "./motifs";
import { PALETTES, type Palette } from "./palettes";

/**
 * Composes one category tile as a flat-graphic print.
 *
 * The layout follows the one move that makes a print read as fashion rather
 * than wallpaper: a quiet all-over field, then a single motif blown up far
 * past the frame so it crops off the edge. Everything is derived from a hash
 * of the slug, so a given category always regenerates to the identical
 * artwork -- re-running the script is a no-op rather than a reshuffle.
 */

const W = 1200;
const H = 1600;

/** FNV-1a. Any stable string hash would do; this one is short and dependency-free. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A deterministic 0..1 stream seeded off the slug, so each pick is independent. */
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
}

export type ArtOptions = {
  /** Restrict to a subset of colourways so a parent's children stay a family. */
  palettes?: string[];
};

export function categoryArt(slug: string, opts: ArtOptions = {}): string {
  const seed = hash(slug);
  const r = rng(seed);

  const pool: Palette[] = opts.palettes?.length
    ? PALETTES.filter((p) => opts.palettes!.includes(p.name))
    : PALETTES;
  const pal = (pool.length ? pool : PALETTES)[seed % (pool.length || PALETTES.length)];

  const field = MOTIFS[seed % MOTIFS.length];
  // Offset the pick so the oversized shape is rarely the field's own motif.
  const hero = MOTIFS[(seed + 3 + Math.floor(r() * 3)) % MOTIFS.length];

  // Deliberately larger than the canvas: a motif that fits inside the frame
  // reads as a logo, one that runs off it reads as a length of printed cloth.
  const heroScale = 9 + r() * 4;                  // 900..1300px across
  const heroX = W * (0.54 + r() * 0.40);          // carries off the right edge
  const heroY = H * (0.20 + r() * 0.26);
  const heroRot = Math.round(-28 + r() * 56);

  const ghostScale = 4.4 + r() * 2.2;
  const ghostX = -90 - r() * 80;
  const ghostY = H * (0.62 + r() * 0.16);
  const ghostRot = Math.round(-20 + r() * 40);

  const fieldRot = Math.round(-12 + r() * 24);
  const bgAngle = Math.round(r() * 60 + 150);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${bgAngle} 0.5 0.5)">
      <stop offset="0" stop-color="${pal.bg}"/>
      <stop offset="1" stop-color="${pal.bg2}"/>
    </linearGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${pal.scrim}" stop-opacity="0"/>
      <stop offset="1" stop-color="${pal.scrim}" stop-opacity="0.66"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0.55" stop-color="${pal.scrim}" stop-opacity="0"/>
      <stop offset="1" stop-color="${pal.scrim}" stop-opacity="0.34"/>
    </radialGradient>
    <pattern id="f" width="${field.tile}" height="${field.tile}"
             patternUnits="userSpaceOnUse"
             patternTransform="rotate(${fieldRot})">
      <g transform="scale(${(field.tile / 100).toFixed(4)})">
        ${field.draw(pal.motif, pal.motif)}
      </g>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#f)" opacity="0.22"/>

  <!-- the oversized shape, cropped by the frame on purpose -->
  <g transform="translate(${heroX.toFixed(0)} ${heroY.toFixed(0)}) rotate(${heroRot}) scale(${heroScale.toFixed(2)}) translate(-50 -50)"
     opacity="0.55">
    ${hero.draw(pal.hero, pal.hero)}
  </g>

  <!-- a quieter echo, anchoring the lower-left -->
  <g transform="translate(${ghostX.toFixed(0)} ${ghostY.toFixed(0)}) rotate(${ghostRot}) scale(${ghostScale.toFixed(2)}) translate(-50 -50)"
     opacity="0.22">
    ${hero.draw(pal.motif, pal.motif)}
  </g>

  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <!-- the label is overlaid by the UI at the bottom, so guarantee contrast there -->
  <rect y="${H * 0.52}" width="${W}" height="${H * 0.48}" fill="url(#s)"/>

  <rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none"
        stroke="${pal.line}" stroke-opacity="0.45" stroke-width="1.5"/>
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none"
        stroke="${pal.line}" stroke-opacity="0.2" stroke-width="1"/>
</svg>`;
}

export { PALETTES };
