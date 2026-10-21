/**
 * Colourways for the generated category art.
 *
 * These are not arbitrary: each one is lifted from a garment the studio
 * actually shot -- the olive bandhgala, the ivory sherwani, the black-and-
 * ivory resham jacket, the oxblood paisley -- so the generated tiles sit in
 * the same room as the real photography instead of fighting it. `bg`/`bg2`
 * make the ground wash, `motif` draws the all-over field, `hero` the
 * oversized shape, and `line` the keylines.
 */
export type Palette = {
  name: string;
  bg: string;
  bg2: string;
  motif: string;
  hero: string;
  line: string;
  /** Scrim colour behind the overlaid label, so white text always holds. */
  scrim: string;
};

export const PALETTES: Palette[] = [
  { name: "bone",    bg: "#f2e7d7", bg2: "#e0cdb0", motif: "#a9834b", hero: "#8c6336", line: "#a9834b", scrim: "#3e2516" },
  { name: "olive",   bg: "#6a6b4f", bg2: "#44452f", motif: "#d8d2b4", hero: "#e5d1a8", line: "#c9c095", scrim: "#232416" },
  { name: "ivory",   bg: "#efe9dc", bg2: "#d7cdb8", motif: "#b9a179", hero: "#9a7f55", line: "#b9a179", scrim: "#3e2516" },
  { name: "ink",     bg: "#3a2a20", bg2: "#1d130c", motif: "#a9834b", hero: "#c9a35f", line: "#a9834b", scrim: "#120b06" },
  { name: "oxblood", bg: "#7a2116", bg2: "#4a120b", motif: "#e5d1a8", hero: "#e9c884", line: "#d9b878", scrim: "#300c07" },
  { name: "clay",    bg: "#d9bb98", bg2: "#b9906a", motif: "#6b4327", hero: "#53301a", line: "#7a4f2e", scrim: "#2e1a0e" },
  { name: "jade",    bg: "#2f5048", bg2: "#17302b", motif: "#cdbb8e", hero: "#e2cf9d", line: "#b6a376", scrim: "#0d1d19" },
  { name: "rose",    bg: "#d9a8a0", bg2: "#b57a72", motif: "#5a2220", hero: "#7a2116", line: "#7f3a33", scrim: "#2c0f0d" },
];
