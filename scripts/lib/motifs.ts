/**
 * Flat-graphic Indian textile motifs, as plain SVG geometry.
 *
 * Each motif is drawn inside a 100x100 box so the same path can be used two
 * ways: tiled small as an all-over field, and scaled up 6-8x as the single
 * oversized shape that carries the composition. That doubling is the whole
 * point -- it is what keeps a category tile looking like one designed print
 * rather than a stock pattern with a logo dropped on it.
 *
 * Deliberately no <filter> and no <text>: Cloudinary rasterises SVG with its
 * own converter, where filter primitives and font availability are both
 * unreliable. Everything here is paths, gradients and solid fills, which
 * survive that trip intact.
 */

export type Motif = {
  name: string;
  /** Geometry in a 100x100 box. `S` is the stroke colour token, `F` the fill. */
  draw: (S: string, F: string) => string;
  /** Tile size in px when used as the all-over field. */
  tile: number;
};

const ring = (cx: number, cy: number, r: number, S: string, w = 2) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${S}" stroke-width="${w}"/>`;

/** Paisley / buta -- the mango curl. */
const paisley = (S: string, F: string) => `
  <path d="M50 6 C80 6 95 32 95 55 C95 80 74 96 51 96 C29 96 10 80 10 58
           C10 40 22 26 38 26 C52 26 61 36 61 48 C61 59 53 67 43 67
           C36 67 31 62 31 56"
        fill="${F}" fill-opacity="0.18" stroke="${S}" stroke-width="2.4"
        stroke-linecap="round"/>
  <path d="M50 20 C70 20 82 38 82 55 C82 72 68 84 52 84"
        fill="none" stroke="${S}" stroke-width="1.3" stroke-opacity="0.75"/>
  ${ring(52, 58, 7, S, 1.2)}`;

/** Jaali -- the ogee lattice of a carved screen. */
const jaali = (S: string, F: string) => `
  <path d="M50 2 C74 2 98 26 98 50 C98 74 74 98 50 98 C26 98 2 74 2 50 C2 26 26 2 50 2 Z"
        fill="${F}" fill-opacity="0.12" stroke="${S}" stroke-width="2"/>
  <path d="M50 2 C50 26 26 50 2 50 M50 2 C50 26 74 50 98 50
           M50 98 C50 74 26 50 2 50 M50 98 C50 74 74 50 98 50"
        fill="none" stroke="${S}" stroke-width="1.6"/>
  ${ring(50, 50, 13, S, 1.4)}`;

/** Chikankari sprig -- a small flower with two leaves. */
const chikan = (S: string, F: string) => {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 * Math.PI) / 180;
    const cx = 50 + Math.cos(a) * 17;
    const cy = 42 + Math.sin(a) * 17;
    return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="9" ry="13"
      transform="rotate(${i * 60} ${cx.toFixed(1)} ${cy.toFixed(1)})"
      fill="${F}" fill-opacity="0.2" stroke="${S}" stroke-width="1.5"/>`;
  }).join("");
  return `${petals}${ring(50, 42, 6, S, 1.6)}
    <path d="M50 58 L50 94" stroke="${S}" stroke-width="1.8" fill="none"/>
    <path d="M50 74 C38 72 32 82 34 90 C44 90 50 84 50 74 Z
             M50 80 C62 78 68 88 66 96 C56 96 50 90 50 80 Z"
          fill="${F}" fill-opacity="0.18" stroke="${S}" stroke-width="1.3"/>`;
};

/** Sitara -- the eight-point star of a mirror-work grid. */
const sitara = (S: string, F: string) => {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? 46 : 19;
    const a = (i * 22.5 * Math.PI) / 180 - Math.PI / 2;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${F}" fill-opacity="0.16"
            stroke="${S}" stroke-width="2" stroke-linejoin="round"/>
          ${ring(50, 50, 10, S, 1.5)}`;
};

/** Leheriya -- the diagonal wave of a tie-dyed turban length. */
const leheriya = (S: string) =>
  [0, 25, 50, 75].map((o) =>
    `<path d="M${-10 + o} 110 Q${15 + o} 70 ${5 + o} 50 Q${-5 + o} 30 ${20 + o} -10"
       fill="none" stroke="${S}" stroke-width="3" stroke-linecap="round"/>`).join("");

/** Bandhani -- clustered tie-dye dots. */
const bandhani = (S: string, F: string) => {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return `<circle cx="${(50 + Math.cos(a) * 30).toFixed(1)}"
      cy="${(50 + Math.sin(a) * 30).toFixed(1)}" r="5.5"
      fill="${F}" fill-opacity="0.22" stroke="${S}" stroke-width="1.4"/>`;
  }).join("");
  return `${dots}<circle cx="50" cy="50" r="9" fill="${F}" fill-opacity="0.25"
    stroke="${S}" stroke-width="1.8"/>`;
};

/** Zari -- the metallic stripe and bead row of a woven border. */
const zari = (S: string, F: string) => `
  <path d="M-10 70 L70 -10 M30 110 L110 30" stroke="${S}" stroke-width="3.5"
        fill="none" stroke-linecap="round"/>
  <path d="M-10 92 L92 -10" stroke="${S}" stroke-width="1.2" stroke-opacity="0.7" fill="none"/>
  ${[20, 44, 68].map((d) =>
    `<circle cx="${d}" cy="${100 - d}" r="4" fill="${F}" fill-opacity="0.3"
       stroke="${S}" stroke-width="1.3"/>`).join("")}`;

/** Kamal -- a stylised lotus, seen head-on. */
const kamal = (S: string, F: string) => {
  const petals = Array.from({ length: 10 }, (_, i) => {
    const a = i * 36;
    return `<path d="M50 50 C40 26 44 10 50 4 C56 10 60 26 50 50 Z"
      transform="rotate(${a} 50 50)" fill="${F}" fill-opacity="0.15"
      stroke="${S}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }).join("");
  return `${petals}${ring(50, 50, 11, S, 1.8)}`;
};

export const MOTIFS: Motif[] = [
  { name: "paisley", draw: paisley, tile: 120 },
  { name: "jaali", draw: jaali, tile: 104 },
  { name: "chikan", draw: chikan, tile: 132 },
  { name: "sitara", draw: sitara, tile: 96 },
  { name: "leheriya", draw: (S) => leheriya(S), tile: 112 },
  { name: "bandhani", draw: bandhani, tile: 100 },
  { name: "zari", draw: zari, tile: 92 },
  { name: "kamal", draw: kamal, tile: 116 },
];
