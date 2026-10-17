/**
 * The site navigation, as the boutique specified it.
 *
 * Top-level rows are the header options. Their children are the mega-menu
 * sub-options, split into three columns by `group`:
 *
 *   OCCASION   -> "Shop By Occasion"
 *   CATEGORY   -> "Shop By Category"
 *   COLLECTION -> "Shop By Collection"
 *
 * Wishlist and About Us sit in the header too, but they are not shoppable
 * categories, so they are static links rather than rows in this tree.
 */
export type MenuGroup = "OCCASION" | "CATEGORY" | "COLLECTION";

export type NavChildSeed = {
  name: string;
  slug: string;
  description: string;
  group: MenuGroup;
};

export type NavTopSeed = {
  name: string;
  slug: string;
  description: string;
  featured?: boolean;
  children: NavChildSeed[];
};

/** The five occasions, reused across Men, Women and the Occasion menu. */
const OCCASIONS: { name: string; slug: string; description: string }[] = [
  { name: "Haldi", slug: "haldi", description: "Marigold, raw silk, nothing precious." },
  { name: "Mehendi", slug: "mehendi", description: "Lighter weights, brighter palettes." },
  {
    name: "Wedding / Pheras",
    slug: "wedding-pheras",
    description: "The ceremony itself.",
  },
  {
    name: "Sangeet / Cocktail",
    slug: "sangeet-cocktail",
    description: "Built to move in.",
  },
  { name: "Reception", slug: "reception", description: "Evening formality." },
];

const occasionChildren = (prefix: string): NavChildSeed[] =>
  OCCASIONS.map((o) => ({
    name: o.name,
    slug: `${prefix}-${o.slug}`,
    description: o.description,
    group: "OCCASION" as const,
  }));

export const NAV_TREE: NavTopSeed[] = [
  {
    name: "New Collection",
    slug: "new-collection",
    description:
      "Sanghe FW/26 — the newest pieces off the atelier floor, added as each one is finished.",
    featured: true,
    children: [
      {
        name: "Just In",
        slug: "just-in",
        description: "This week's additions.",
        group: "CATEGORY",
      },
      {
        name: "Festive Edit",
        slug: "festive-edit",
        description: "Diwali, Eid, Pujo.",
        group: "CATEGORY",
      },
      {
        name: "Ready To Ship",
        slug: "ready-to-ship",
        description: "Dispatched within 48 hours.",
        group: "CATEGORY",
      },
      {
        name: "Sanghe FW/26",
        slug: "sanghe-fw26",
        description: "The autumn-winter line.",
        group: "COLLECTION",
      },
    ],
  },

  {
    name: "Men",
    slug: "men",
    description: "Sherwanis, bandhgalas and kurta sets, tailored to the half-inch.",
    children: [
      ...occasionChildren("men"),
      {
        name: "Sherwanis",
        slug: "sherwanis",
        description: "Full-length ceremonial coats with hand-set buttons.",
        group: "CATEGORY",
      },
      {
        name: "Bandhgalas",
        slug: "bandhgalas",
        description: "Closed-neck jackets in wool blends and silk.",
        group: "CATEGORY",
      },
      {
        name: "Kurta Sets",
        slug: "mens-kurta-sets",
        description: "Kurta and churidar, cut clean.",
        group: "CATEGORY",
      },
      {
        name: "Tuxedos",
        slug: "tuxedos",
        description: "Black tie, cut in India.",
        group: "CATEGORY",
      },
      {
        name: "Nehru Jackets",
        slug: "nehru-jackets",
        description: "Layering pieces in brocade and raw silk.",
        group: "CATEGORY",
      },
      {
        name: "Indo-Western",
        slug: "indo-western-men",
        description: "Drape kurtas, asymmetric overlays and jacket sets.",
        group: "CATEGORY",
      },
      {
        name: "Urli",
        slug: "urli",
        description: "Brass-toned brocade and deep green.",
        group: "COLLECTION",
      },
      {
        name: "Benaras Reverie",
        slug: "benaras-reverie",
        description: "Kadhwa brocade from the looms at Varanasi.",
        group: "COLLECTION",
      },
    ],
  },

  {
    name: "Women",
    slug: "women",
    description:
      "Hand-worked lehengas, saris and separates, cut to measure in our Delhi atelier.",
    children: [
      ...occasionChildren("women"),
      {
        name: "Lehengas + Gowns",
        slug: "lehengas",
        description: "Ghagras and floor-sweeping silhouettes.",
        group: "CATEGORY",
      },
      {
        name: "Sarees",
        slug: "sarees",
        description: "Benarasi, tissue and chiffon drapes.",
        group: "CATEGORY",
      },
      {
        name: "Anarkalis",
        slug: "anarkalis",
        description: "Panelled, with structured bodices.",
        group: "CATEGORY",
      },
      {
        name: "Suit Sets",
        slug: "suit-sets",
        description: "Kurta, bottom and dupatta, finished as a set.",
        group: "CATEGORY",
      },
      {
        name: "Kurta Sets",
        slug: "kurta-sets",
        description: "Everyday-festive separates.",
        group: "CATEGORY",
      },
      {
        name: "Indo-Western",
        slug: "indo-western-women",
        description: "Draped skirts, cape sets and sari-gowns.",
        group: "CATEGORY",
      },
      {
        name: "Blouses & Corsets",
        slug: "blouses-and-corsets",
        description: "Boned, embroidered and ready to pair.",
        group: "CATEGORY",
      },
      {
        name: "Ivory Vows",
        slug: "ivory-vows",
        description: "A tonal bridal line in ivory, pearl and bone.",
        group: "COLLECTION",
      },
      {
        name: "Mughal Garden",
        slug: "mughal-garden",
        description: "Botanical zardozi on ivory and moss.",
        group: "COLLECTION",
      },
    ],
  },

  {
    name: "Occasion",
    slug: "occasion",
    description: "Shop by the evening you are dressing for.",
    children: [
      ...OCCASIONS.map((o) => ({
        name: o.name,
        slug: o.slug,
        description: o.description,
        group: "OCCASION" as const,
      })),
      {
        name: "Bridal Must-Haves",
        slug: "bridal-must-haves",
        description: "Everything between the ceremonies.",
        group: "CATEGORY",
      },
      {
        name: "Groom Edits",
        slug: "groom-edits",
        description: "Matched to her palette, down to the thread.",
        group: "CATEGORY",
      },
      {
        name: "Festive Vibe",
        slug: "festive-vibe",
        description: "Lighter occasionwear.",
        group: "CATEGORY",
      },
      {
        name: "Ceremony Edits",
        slug: "ceremony-edits",
        description: "For the ceremony itself.",
        group: "CATEGORY",
      },
      {
        name: "Noor Festive",
        slug: "noor-festive",
        description: "Light-catching sequins and tissue.",
        group: "COLLECTION",
      },
    ],
  },

  {
    name: "Jewellery",
    slug: "jewellery",
    description:
      "Sanskar's side of the house — temple gold, polki and kundan, made to sit with the clothes.",
    children: [
      {
        name: "Bridal Sets",
        slug: "bridal-jewellery-sets",
        description: "Necklace, tikka and earrings as one commission.",
        group: "CATEGORY",
      },
      {
        name: "Necklaces",
        slug: "necklaces",
        description: "Rani haars, chokers and layered sets.",
        group: "CATEGORY",
      },
      {
        name: "Earrings",
        slug: "earrings",
        description: "Jhumkas, chandbalis and studs.",
        group: "CATEGORY",
      },
      {
        name: "Maang Tikka",
        slug: "maang-tikka",
        description: "Matha pattis and single-string tikkas.",
        group: "CATEGORY",
      },
      {
        name: "Bracelets & Kadas",
        slug: "bracelets-and-kadas",
        description: "Paired and single, in gold and polki.",
        group: "CATEGORY",
      },
      {
        name: "Sanskar Gold",
        slug: "sanskar-gold",
        description: "The signature temple-gold line.",
        group: "COLLECTION",
      },
    ],
  },
];
