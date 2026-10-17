/** The seeded catalogue. `category` is a sub-category slug from the nav tree. */
export type ProductSeed = {
  name: string;
  tagline: string;
  description: string;
  /** Rupees; converted to paise on insert. */
  price: number;
  compareAtPrice?: number;
  category: string;
  /** Extra categories this piece also belongs to (occasion shelves). */
  also?: string[];
  fabric: string;
  color: string;
  craft: string;
  featured?: boolean;
  newArrival?: boolean;
  sizes?: "WOMEN" | "MEN" | "ONE" | "JEWEL";
};

export const PRODUCTS: ProductSeed[] = [
  // ---------------- women ----------------
  {
    name: "Gulnaar Zardozi Bridal Lehenga",
    tagline: "Nine hundred hours of hand-set zardozi",
    description:
      "A crimson raw-silk ghagra carrying nine hundred hours of zardozi, dabka and kora work laid out as a continuous vine from hem to waist. The blouse is fully boned and hand-finished on the inside so it holds its line through a long ceremony, and the eight-metre dupatta is edged in gota couched by hand rather than machine-run.",
    price: 385000,
    compareAtPrice: 445000,
    category: "lehengas",
    also: ["women-wedding-pheras", "wedding-pheras", "ceremony-edits"],
    fabric: "Raw silk, tissue organza dupatta",
    color: "Deep crimson, antique gold",
    craft: "Zardozi, dabka, kora, gota couching",
    featured: true,
  },
  {
    name: "Ivory Vows Pearl Lehenga",
    tagline: "Tonal ivory, pearl and bone",
    description:
      "Built entirely in one tonal family: ivory silk organza layered over a pearl-worked underskirt, so the embroidery reads as texture rather than contrast. Thousands of freshwater-pearl and bugle-bead accents are sewn individually. Designed for a daytime ceremony where the light does the work.",
    price: 298000,
    category: "ivory-vows",
    also: ["lehengas", "women-wedding-pheras", "bridal-must-haves"],
    fabric: "Silk organza over silk satin",
    color: "Ivory, pearl, bone",
    craft: "Pearl work, bugle beading, aari",
    featured: true,
    newArrival: true,
  },
  {
    name: "Benarasi Kadhwa Handloom Lehenga",
    tagline: "Woven on the loom, not embroidered after",
    description:
      "The brocade here is kadhwa — each motif woven in on the loom as a separate operation rather than embroidered on afterwards, which is why the reverse is as clean as the face. Woven over eleven weeks by a single family of weavers in Varanasi.",
    price: 215000,
    category: "lehengas",
    also: ["women-reception", "reception"],
    fabric: "Pure Benarasi silk brocade",
    color: "Molten gold, deep teal",
    craft: "Kadhwa handloom brocade",
    featured: true,
  },
  {
    name: "Mughal Garden Botanical Lehenga",
    tagline: "A charbagh, embroidered",
    description:
      "The skirt is read as a Mughal charbagh: four quadrants of botanical zardozi divided by channels of silver dabka, with the florals growing larger toward the hem. Moss-green silk ground with ivory and oxidised-silver thread.",
    price: 265000,
    compareAtPrice: 295000,
    category: "mughal-garden",
    also: ["lehengas", "women-sangeet-cocktail"],
    fabric: "Silk dupion, net dupatta",
    color: "Moss green, ivory, oxidised silver",
    craft: "Botanical zardozi, silver dabka",
    newArrival: true,
  },
  {
    name: "Sindoor Velvet Bridal Set",
    tagline: "Winter-weight silk velvet",
    description:
      "Silk velvet in a true sindoor red, worked with raised zardozi that catches a deep shadow against the pile. The weight is deliberate — this is a winter-wedding piece, cut to fall straight without a cancan underneath.",
    price: 342000,
    category: "lehengas",
    also: ["women-wedding-pheras", "wedding-pheras", "ceremony-edits"],
    fabric: "Silk velvet",
    color: "Sindoor red, gold",
    craft: "Raised zardozi, salma-sitara",
  },
  {
    name: "Noor Sequin Tissue Lehenga",
    tagline: "Built to catch a room's light",
    description:
      "A tissue-lamé base scattered with hand-sewn glass sequins in four graded sizes, densest at the hem. Lighter than it looks, and specifically designed for sangeet-floor movement.",
    price: 148000,
    category: "noor-festive",
    also: ["lehengas", "women-sangeet-cocktail", "sangeet-cocktail", "festive-vibe"],
    fabric: "Tissue lamé, net",
    color: "Champagne, rose gold",
    craft: "Graded hand-sequin work",
    featured: true,
    newArrival: true,
  },
  {
    name: "Kesar Organza Anarkali",
    tagline: "Forty-two panels, no visible seam",
    description:
      "A saffron silk-organza anarkali built from forty-two panels so it falls in a true circle, with the seams run and hand-felled flat to stay invisible. Thread-work florals in tonal silk float across the yoke and sleeve.",
    price: 96000,
    category: "anarkalis",
    also: ["women-haldi", "haldi", "festive-vibe"],
    fabric: "Silk organza, cotton-silk lining",
    color: "Saffron, ivory",
    craft: "Tonal resham thread work",
    newArrival: true,
  },
  {
    name: "Chandni Mirror-Work Anarkali",
    tagline: "Hand-cut shisha, not pre-cut discs",
    description:
      "Every mirror on this piece is hand-cut and set with a thread bezel, which is why the reflections are irregular rather than uniform. Ink-blue georgette, flared from a fitted bodice.",
    price: 82000,
    compareAtPrice: 98000,
    category: "anarkalis",
    also: ["women-mehendi", "mehendi"],
    fabric: "Georgette, silk lining",
    color: "Ink blue, mirror silver",
    craft: "Shisha mirror work, aari",
  },
  {
    name: "Rani Trained Reception Gown",
    tagline: "A metre-and-a-half sweep",
    description:
      "Draped silk crepe with a sweeping one-and-a-half metre train, a corseted interior and a single shoulder treatment in crystal and bugle bead. Weighted at the hem so the train follows rather than drags.",
    price: 178000,
    category: "lehengas",
    also: ["women-reception", "reception"],
    fabric: "Silk crepe, crystal tulle",
    color: "Rani pink, crystal",
    craft: "Draping, crystal bead work",
    featured: true,
  },
  {
    name: "Benarasi Kadhwa Silk Saree",
    tagline: "A pallu that took five weeks",
    description:
      "A six-and-a-half metre handloom Benarasi with a kadhwa pallu that took five weeks on the loom alone. Real zari — silver thread gilded in gold — so it will tarnish beautifully rather than flake. Comes with an unstitched blouse piece.",
    price: 125000,
    category: "sarees",
    also: ["benaras-reverie", "women-reception", "reception"],
    fabric: "Katan silk, real zari",
    color: "Oxblood, gold",
    craft: "Kadhwa handloom, real zari",
    featured: true,
    sizes: "ONE",
  },
  {
    name: "Shubhra Tissue Organza Saree",
    tagline: "Holds a pleat without starch",
    description:
      "Tissue organza with enough natural body to hold a sharp pleat unstarched, finished with a hand-scalloped selvedge and a worked border in silver kora. Nearly weightless on.",
    price: 68000,
    category: "sarees",
    also: ["women-haldi", "festive-edit"],
    fabric: "Tissue organza",
    color: "Pale silver, white",
    craft: "Scalloped edging, kora border",
    newArrival: true,
    sizes: "ONE",
  },
  {
    name: "Neelam Chiffon Saree",
    tagline: "A single continuous vine",
    description:
      "Featherweight sapphire chiffon with a hand-embroidered vine that runs unbroken from pallu to hem — one continuous line, no repeats. Pairs with the Neelam corset blouse.",
    price: 54000,
    compareAtPrice: 64000,
    category: "sarees",
    also: ["women-sangeet-cocktail"],
    fabric: "Pure chiffon",
    color: "Sapphire, silver",
    craft: "Continuous-line resham vine",
    sizes: "ONE",
  },
  {
    name: "Mehrunissa Hand-Block Suit Set",
    tagline: "Block-printed, not screen-printed",
    description:
      "Printed with hand-carved teak blocks in Bagru, which is why the registration shifts very slightly between repeats — the mark of the hand. Chanderi kurta, cotton-silk palazzo, matched dupatta.",
    price: 32000,
    category: "suit-sets",
    also: ["women-mehendi", "mehendi", "ready-to-ship"],
    fabric: "Chanderi, cotton silk",
    color: "Madder red, indigo, ivory",
    craft: "Hand-block printing, Bagru",
    newArrival: true,
  },
  {
    name: "Aangan Chikankari Kurta Set",
    tagline: "Lucknowi, in six stitch families",
    description:
      "Shadow-work chikankari from Lucknow using six distinct stitch families — bakhiya, phanda, murri, jaali, hool and keel — across a white cotton-mul kurta. Light enough for an afternoon, worked enough for an evening.",
    price: 24000,
    category: "kurta-sets",
    also: ["women-haldi", "haldi", "ready-to-ship", "just-in"],
    fabric: "Cotton mul, mulmul",
    color: "White on white",
    craft: "Lucknowi chikankari, jaali",
  },
  {
    name: "Rohan Drape Kurta Set",
    tagline: "An asymmetric drape, pinned once",
    description:
      "A single asymmetric drape falling from the left shoulder, secured with one concealed hook so the fall stays identical every wear. Textured matka silk, paired with slim trousers.",
    price: 58000,
    category: "indo-western-women",
    also: ["women-sangeet-cocktail", "festive-vibe"],
    fabric: "Matka silk",
    color: "Charcoal, pewter",
    craft: "Engineered drape, hand-rolled hems",
    newArrival: true,
  },
  {
    name: "Neelam Boned Corset Blouse",
    tagline: "Eleven bones, fully hand-finished",
    description:
      "Eleven spiral-steel bones in a cotton-twill interior, so it supports without a separate shaper. The outer shell is sapphire silk with silver aari along the neckline. Made to your measurements.",
    price: 28000,
    category: "blouses-and-corsets",
    also: ["bridal-must-haves"],
    fabric: "Silk shell, cotton twill interior",
    color: "Sapphire, silver",
    craft: "Spiral-steel boning, aari",
  },

  // ---------------- men ----------------
  {
    name: "Kabir Ceremonial Sherwani",
    tagline: "Hand-set buttons, hand-padded chest",
    description:
      "A full-length ivory raw-silk sherwani with a hand-padded chest canvas — the thing that makes a coat hold its shape over years rather than a season. Tone-on-tone zardozi across the placket and cuffs, with twenty-two hand-set buttons. Includes churidar and a matching stole.",
    price: 165000,
    compareAtPrice: 189000,
    category: "sherwanis",
    also: ["men-wedding-pheras", "wedding-pheras", "groom-edits", "ceremony-edits"],
    fabric: "Raw silk, canvassed chest",
    color: "Ivory, antique gold",
    craft: "Hand canvassing, tonal zardozi",
    featured: true,
    sizes: "MEN",
  },
  {
    name: "Sanskar Groom Sherwani",
    tagline: "Matched to her palette, thread for thread",
    description:
      "Our groom piece, dyed to match the bride's lehenga from the same thread lot so the two read as one set in photographs. Deep burgundy silk with gold dabka on the shoulders and hem.",
    price: 198000,
    category: "sherwanis",
    also: ["groom-edits", "men-wedding-pheras", "wedding-pheras", "sanghe-fw26"],
    fabric: "Silk dupion",
    color: "Burgundy, gold",
    craft: "Lot-matched dyeing, dabka",
    featured: true,
    sizes: "MEN",
  },
  {
    name: "Arjun Wool-Silk Bandhgala",
    tagline: "Closed neck, open calendar",
    description:
      "A midnight wool-silk bandhgala with a self-covered button stand and a hand-stitched armhole, which is what gives it the range of movement an off-the-rack jacket never has. Equally correct at a reception or a boardroom.",
    price: 88000,
    category: "bandhgalas",
    also: ["men-reception", "reception", "ready-to-ship"],
    fabric: "Wool-silk blend",
    color: "Midnight navy",
    craft: "Hand-stitched armholes, self buttons",
    sizes: "MEN",
    newArrival: true,
  },
  {
    name: "Veer Brocade Nehru Jacket",
    tagline: "Benarasi brocade, cut short",
    description:
      "Handloom Benarasi brocade cut into a clean short jacket with a notch-free mandarin collar. Worn over a plain kurta it carries an entire outfit.",
    price: 34000,
    category: "nehru-jackets",
    also: ["urli", "men-mehendi", "festive-edit"],
    fabric: "Benarasi brocade, silk lining",
    color: "Emerald, gold",
    craft: "Handloom brocade",
    sizes: "MEN",
  },
  {
    name: "Ishaan Overlay Indo-Western Set",
    tagline: "A jacket that reads as a cape",
    description:
      "An asymmetric overlay cut long on one side and cropped on the other, layered over a tonal kurta and slim trousers. Textured silk with a matte sequin shoulder.",
    price: 72000,
    category: "indo-western-men",
    also: ["men-sangeet-cocktail", "sangeet-cocktail", "festive-vibe"],
    fabric: "Textured silk",
    color: "Slate, gunmetal",
    craft: "Asymmetric panelling, matte sequin",
    newArrival: true,
    sizes: "MEN",
  },
  {
    name: "Sanghe Midnight Tuxedo",
    tagline: "Black tie, cut in Delhi",
    description:
      "A midnight-blue grosgrain-faced tuxedo cut on our own block, with a hand-padded lapel that rolls rather than creases. The only Western piece we make, and we make it properly.",
    price: 128000,
    category: "tuxedos",
    also: ["men-reception", "reception", "sanghe-fw26"],
    fabric: "Wool barathea, grosgrain facing",
    color: "Midnight blue",
    craft: "Hand-padded lapel, Milanese buttonhole",
    newArrival: true,
    sizes: "MEN",
  },
  {
    name: "Haldi Cotton-Silk Kurta Set",
    tagline: "Marigold, and nothing precious",
    description:
      "Made for the one ceremony where the clothes will be ruined: unlined cotton-silk in marigold, with a simple hand-run hem and no metal thread anywhere. Inexpensive on purpose.",
    price: 18000,
    category: "mens-kurta-sets",
    also: ["men-haldi", "haldi", "ready-to-ship"],
    fabric: "Cotton silk",
    color: "Marigold, white",
    craft: "Hand-run hems",
    sizes: "MEN",
  },
  {
    name: "Urli Brocade Kurta Set",
    tagline: "Brass-toned, temple-adjacent",
    description:
      "From the Urli line: a deep green brocade kurta with brass-toned zari, cut long over a straight churidar. The motif is lifted from a temple lamp, which is where the line gets its name.",
    price: 46000,
    category: "mens-kurta-sets",
    also: ["urli", "men-mehendi", "mehendi", "festive-vibe"],
    fabric: "Brocade, silk lining",
    color: "Deep green, brass",
    craft: "Handloom brocade",
    featured: true,
    sizes: "MEN",
  },

  // ---------------- jewellery ----------------
  {
    name: "Sanskar Temple Gold Rani Haar",
    tagline: "Nakkashi worked from the back",
    description:
      "A long temple-gold rani haar in 22k, with repoussé deities raised from the reverse rather than cast — the technique that gives temple jewellery its depth. Strung on silk thread, finished with a traditional adjustable dori.",
    price: 465000,
    category: "necklaces",
    also: ["sanskar-gold", "bridal-jewellery-sets", "wedding-pheras"],
    fabric: "22k gold, silk dori",
    color: "Temple gold",
    craft: "Repoussé nakkashi, hand-strung",
    featured: true,
    sizes: "JEWEL",
  },
  {
    name: "Polki Bridal Set",
    tagline: "Uncut diamond, closed-setting",
    description:
      "Uncut polki in a closed gold setting with a foil backing — the traditional method, which is why the stones glow rather than sparkle. Necklace, maang tikka and chandbalis, commissioned as one set.",
    price: 785000,
    category: "bridal-jewellery-sets",
    also: ["sanskar-gold", "necklaces", "wedding-pheras"],
    fabric: "22k gold, polki, foil backing",
    color: "Gold, uncut diamond",
    craft: "Closed polki setting, jadau",
    featured: true,
    newArrival: true,
    sizes: "JEWEL",
  },
  {
    name: "Chandbali Jhumkas",
    tagline: "A moon, then a bell",
    description:
      "A crescent chandbali with a jhumka suspended beneath it, in 22k gold with pearl drops. Light enough to wear through a full evening, which is not a given at this size.",
    price: 128000,
    category: "earrings",
    also: ["sanskar-gold", "reception", "sangeet-cocktail"],
    fabric: "22k gold, freshwater pearl",
    color: "Gold, pearl",
    craft: "Hand-raised chandbali, pearl stringing",
    sizes: "JEWEL",
  },
  {
    name: "Matha Patti Maang Tikka",
    tagline: "Three strings, one centre",
    description:
      "A three-string matha patti in kundan and gold, with a central tikka and side chains that sit along the parting. Hooks are padded so they do not pull.",
    price: 94000,
    category: "maang-tikka",
    also: ["bridal-jewellery-sets", "wedding-pheras"],
    fabric: "22k gold, kundan",
    color: "Gold, kundan white",
    craft: "Kundan setting, chain work",
    newArrival: true,
    sizes: "JEWEL",
  },
  {
    name: "Paired Polki Kadas",
    tagline: "Worn as two, never one",
    description:
      "A matched pair of broad kadas in polki and gold, designed to be worn together on one wrist in the Rajasthani manner. Hinged, with a concealed box clasp.",
    price: 268000,
    category: "bracelets-and-kadas",
    also: ["sanskar-gold", "mehendi", "sangeet-cocktail"],
    fabric: "22k gold, polki",
    color: "Gold, uncut diamond",
    craft: "Hinged kada, box clasp",
    sizes: "JEWEL",
  },
  {
    name: "Minakari Lotus Choker",
    tagline: "Enamel on the reverse, as it should be",
    description:
      "A lotus-motif choker with meenakari enamel worked on the reverse — the side nobody sees, which is exactly the point of the tradition. Jaipur enamel in rose, green and white.",
    price: 192000,
    compareAtPrice: 215000,
    category: "necklaces",
    also: ["sanskar-gold", "mehendi", "festive-edit"],
    fabric: "22k gold, meenakari enamel",
    color: "Gold, rose, green",
    craft: "Jaipur meenakari, kundan",
    featured: true,
    sizes: "JEWEL",
  },
];
