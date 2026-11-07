/**
 * The jewellery house: portfolio artwork, the commission story, and the one
 * place the design fee is written down.
 *
 * Deliberately a plain module rather than database rows. The portfolio is a
 * fixed body of work -- it is not a shelf, nothing here is priced or added to
 * a bag -- and the commission copy is editorial. Both change at the pace of a
 * deploy, not of an admin edit.
 *
 * No `server-only`: the gallery and the commission form are client
 * components and import from here.
 */

/** The design fee, in paise. One definition; every surface reads it. */
export const DESIGN_FEE_PAISE = 99_900;

export function formatFee(paise: number = DESIGN_FEE_PAISE): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export type Category =
  | "Rings"
  | "Pendants"
  | "Bracelets"
  | "Brooches & cufflinks"
  | "Sets"
  | "Sculpture";

/** Display order of the filter, and of the grid when it is unfiltered. */
export const CATEGORIES: Category[] = [
  "Rings",
  "Pendants",
  "Bracelets",
  "Sets",
  "Brooches & cufflinks",
  "Sculpture",
];

export type Piece = {
  /** Stable key used by every curated subset below. */
  id: string;
  /** Cloudinary public id, from the `items/` folder. */
  publicId: string;
  /** Short name. Shown under the piece. */
  title: string;
  /** Alt text, describing the form -- these are unnamed studio shots. */
  alt: string;
  category: Category;
  /**
   * Source shape, so a layout can put the two tall shots and the handful of
   * letterbox ones where they belong instead of cropping the subject out.
   */
  shape?: "portrait" | "wide";
};

/**
 * The portfolio, in display order.
 *
 * Shot properly, on velvet, on the hand and in the tray -- which is why these
 * replaced the earlier set wholesale: at the sizes this site shows jewellery
 * at, legibility of the metal is the whole argument.
 *
 * Note what these actually are: mostly one-off commissions, modelled from
 * something a customer brought in. That is the case the commission page is
 * making, so the strongest sculpted pieces lead.
 */
export const PORTFOLIO: Piece[] = [
  // ---- rings ----
  {
    id: "lion-ring",
    publicId: "Gemini_Generated_Image_jnbxiljnbxiljnbx_tkx9ap",
    title: "Twin lions",
    alt: "Gold ring crowned with twin lion heads, on a velvet stand",
    category: "Rings",
  },
  {
    id: "tiger-ring",
    publicId: "Gemini_Generated_Image_h04p1jh04p1jh04p_jxusxc",
    title: "Tiger head",
    alt: "Silver tiger-head ring worn on a hand against green velvet",
    category: "Rings",
  },
  {
    id: "dragon-ring",
    publicId: "Gemini_Generated_Image_2q5say2q5say2q5s_lievms",
    title: "Dragon head",
    alt: "Gold dragon-head ring with a sapphire eye, worn on a hand",
    category: "Rings",
  },
  {
    id: "ram-ring",
    publicId: "Gemini_Generated_Image_gz1a1agz1a1agz1a_wblkpw",
    title: "Ram head",
    alt: "Silver ram's head ring with curled horns, worn on a hand",
    category: "Rings",
  },
  {
    id: "skull-ring",
    publicId: "Gemini_Generated_Image_ehrdpvehrdpvehrd_zrkuhg",
    title: "The hooded skull",
    alt: "Silver ring sculpted as a hooded skull",
    category: "Rings",
    shape: "portrait",
  },
  {
    id: "panther-wrap",
    publicId: "Gemini_Generated_Image_7145l37145l37145_cnpf8w",
    title: "Panther wrap",
    alt: "Gold panther ring that coils twice around the finger",
    category: "Rings",
  },
  {
    id: "crown-solitaire",
    publicId: "Gemini_Generated_Image_u96z39u96z39u96z_jupu0h",
    title: "Crowned solitaire",
    alt: "Solitaire ring on a filigree crown gallery, with its matching band",
    category: "Rings",
  },
  {
    id: "vine-solitaire",
    publicId: "Gemini_Generated_Image_ru0kabru0kabru0k_u2i9hk",
    title: "Vine-shank solitaire",
    alt: "Gold solitaire with a pavé vine shank, worn on a hand",
    category: "Rings",
  },
  {
    id: "the-pair",
    publicId: "Gemini_Generated_Image_p225m3p225m3p225_uxi55d",
    title: "The pair",
    alt: "A rose-gold band and a pear-cut solitaire, made as a pair",
    category: "Rings",
  },
  {
    id: "sapphire-stack",
    publicId: "Gemini_Generated_Image_evkqtuevkqtuevkq_cke7bu",
    title: "Sapphire stack",
    alt: "Blue sapphire and gold rings stacked on a hennaed hand",
    category: "Rings",
  },
  {
    id: "black-hexagon",
    publicId: "Gemini_Generated_Image_lmv53almv53almv5_njug4x",
    title: "Black hexagon",
    alt: "White gold ring with a black step-cut hexagon and pavé shoulders",
    category: "Rings",
  },
  {
    id: "greek-signet",
    publicId: "Gemini_Generated_Image_by1yrrby1yrrby1y_lqb9bq",
    title: "Greek-key signet",
    alt: "Silver signet ring with a Greek-key border and black pavé face",
    category: "Rings",
  },
  {
    id: "flat-signet",
    publicId: "Gemini_Generated_Image_p49z5fp49z5fp49z_xfyc5o",
    title: "Flat-top signet",
    alt: "Two-tone flat-top signet ring worn on a hand",
    category: "Rings",
  },
  {
    id: "lynx-wrap",
    publicId: "Gemini_Generated_Image_1ddgyq1ddgyq1ddg_aoaden",
    title: "Lynx wrap",
    alt: "Gold lynx ring coiled around a finger, textured throughout",
    category: "Rings",
  },
  {
    id: "pave-wrap",
    publicId: "Gemini_Generated_Image_6u61wb6u61wb6u61_my39gn",
    title: "Pavé wrap",
    alt: "Gold ring that wraps the finger twice, pavé-set along the top",
    category: "Rings",
  },
  {
    id: "woven-band",
    publicId: "Gemini_Generated_Image_3ob5hx3ob5hx3ob5_tlj1h5",
    title: "Woven band",
    alt: "Gold band woven from fine wire, worn on a hand",
    category: "Rings",
    shape: "wide",
  },
  {
    id: "nameplate-ring",
    publicId: "Gemini_Generated_Image_zae1xvzae1xvzae1_xe9raz",
    title: "The name ring",
    alt: "Silver ring cut as a name in block letters, worn on a hand",
    category: "Rings",
  },

  // ---- pendants ----
  {
    id: "lion-crown-pendant",
    publicId: "Gemini_Generated_Image_85wr4e85wr4e85wr_pmtt2x",
    title: "The crowned lion",
    alt: "Silver lion's head pendant wearing a pavé-set crown",
    category: "Pendants",
  },
  {
    id: "nataraja",
    publicId: "Gemini_Generated_Image_mygd7emygd7emygd_xivpsu",
    title: "Nataraja",
    alt: "Dancing Nataraja cast in gold inside a patterned ring",
    category: "Pendants",
  },
  {
    id: "ganesha-pendant",
    publicId: "Gemini_Generated_Image_hkyoovhkyoovhkyo_viwxfh",
    title: "Ganesha",
    alt: "Silver Ganesha pendant in deep relief, with a pavé bale",
    category: "Pendants",
  },
  {
    id: "portrait-pendant",
    publicId: "Gemini_Generated_Image_o2fjkho2fjkho2fj_yvfwtt",
    title: "Her parents, in gold",
    alt: "Portrait pendant in gold: a couple sculpted in relief inside a frame",
    category: "Pendants",
  },
  {
    id: "eagle-pendant",
    publicId: "Gemini_Generated_Image_w981rmw981rmw981_jekvrr",
    title: "Eagle in flight",
    alt: "Silver eagle pendant with every feather cut, on a heavy chain",
    category: "Pendants",
  },
  {
    id: "torso-pendant",
    publicId: "Gemini_Generated_Image_wp26hvwp26hvwp26_ifupu9",
    title: "The torso",
    alt: "Sculpted torso pendant in silver on a fine chain",
    category: "Pendants",
  },
  {
    id: "wing-pendant",
    publicId: "Gemini_Generated_Image_u0to0cu0to0cu0to_kcxvvq",
    title: "Winged leaf",
    alt: "Gold winged-leaf pendant worn on a fine chain at the collarbone",
    category: "Pendants",
  },
  {
    id: "calligraphy-medallion",
    publicId: "Gemini_Generated_Image_jodnxujodnxujodn_lupgab",
    title: "The calligraphic medallion",
    alt: "Openwork calligraphic medallion in gold, ringed with green stones",
    category: "Pendants",
  },
  {
    id: "diamond-square",
    publicId: "Gemini_Generated_Image_imxpl7imxpl7imxp_fdzrrc",
    title: "Square, on the diagonal",
    alt: "Openwork square pendant in gold and diamond, set on the diagonal",
    category: "Pendants",
  },
  {
    id: "roman-tag",
    publicId: "Gemini_Generated_Image_3n5p8r3n5p8r3n5p_fhrvxc",
    title: "Roman numerals",
    alt: "Gold tag pendant with Roman numerals framing two sculpted cat heads",
    category: "Pendants",
    shape: "wide",
  },
  {
    id: "boy-charm",
    publicId: "Gemini_Generated_Image_92nu9v92nu9v92nu_evisjc",
    title: "The little boy",
    alt: "Gold charm pendant modelled as a small boy in a cap",
    category: "Pendants",
  },
  {
    id: "lakshmi-haar",
    publicId: "Gemini_Generated_Image_od7t71od7t71od7t_k9hwm7",
    title: "Lakshmi on pearls",
    alt: "Gold Lakshmi pendant hung on three strands of seed pearls",
    category: "Pendants",
  },
  {
    id: "clasped-hands",
    publicId: "Gemini_Generated_Image_nhb32wnhb32wnhb3_uj3p2j",
    title: "Clasped hands",
    alt: "Two clasped hands modelled in silver as a collar",
    category: "Pendants",
  },
  {
    id: "koi-pair",
    publicId: "Gemini_Generated_Image_izav5oizav5oizav_xyfg7o",
    title: "A pair of koi",
    alt: "A pair of koi carp modelled in gold on a velvet stand",
    category: "Pendants",
  },

  // ---- bracelets ----
  {
    id: "cuban-link",
    publicId: "Gemini_Generated_Image_u7p2kfu7p2kfu7p2_ar3ga1",
    title: "Cuban link",
    alt: "Heavy silver Cuban-link bracelet, textured throughout, in its tray",
    category: "Bracelets",
  },
  {
    id: "paperclip-link",
    publicId: "Gemini_Generated_Image_s98qjrs98qjrs98q_hbr4hi",
    title: "Paperclip link",
    alt: "Gold paperclip-link bracelet with pavé connectors",
    category: "Bracelets",
  },
  {
    id: "om-bracelet",
    publicId: "Gemini_Generated_Image_phoefwphoefwphoe_mxo94c",
    title: "Om links",
    alt: "Silver bracelet with engraved panel links, each carrying an Om",
    category: "Bracelets",
  },
  {
    id: "charm-snake",
    publicId: "Gemini_Generated_Image_tjliv3tjliv3tjli_ixjvvw",
    title: "The charm bracelet",
    alt: "Silver snake-chain bracelet hung with an engraved disc charm",
    category: "Bracelets",
  },
  {
    id: "pave-tennis",
    publicId: "Gemini_Generated_Image_ipl7tmipl7tmipl7_fsvfk3",
    title: "Pavé tennis",
    alt: "Slim pavé-set bracelet worn on a wrist",
    category: "Bracelets",
  },
  {
    id: "black-pave-cuff",
    publicId: "Gemini_Generated_Image_kk9yyikk9yyikk9y_tocsed",
    title: "Black pavé",
    alt: "Rounded bracelet set throughout with black stones, worn on a wrist",
    category: "Bracelets",
  },
  {
    id: "ornate-cuff",
    publicId: "Gemini_Generated_Image_dcck8edcck8edcck_vxyqoa",
    title: "The open cuff",
    alt: "Silver cuff with ornate repoussé finials at either end",
    category: "Bracelets",
  },
  {
    id: "woven-bangle",
    publicId: "Gemini_Generated_Image_h8qlw1h8qlw1h8ql_crt8hh",
    title: "Woven bangle",
    alt: "Gold bangle woven from fine wire, worn on a wrist",
    category: "Bracelets",
  },
  {
    id: "fine-chain-bracelet",
    publicId: "Gemini_Generated_Image_w7ik5ow7ik5ow7ik_e5hxko",
    title: "Fine chain",
    alt: "A fine silver chain bracelet on a wrist, lit against black",
    category: "Bracelets",
    shape: "wide",
  },
  {
    id: "black-pave-close",
    publicId: "Gemini_Generated_Image_qslgd0qslgd0qslg_ivoetf",
    title: "Black pavé, close",
    alt: "Close detail of black pavé setting across a curved surface",
    category: "Bracelets",
    shape: "wide",
  },

  // ---- sets ----
  {
    id: "leaf-set",
    publicId: "Gemini_Generated_Image_yjjnuryjjnuryjjn_faa1hy",
    title: "The leaf set",
    alt: "Pendant and matching ear drops, leaves set in white and champagne stones",
    category: "Sets",
  },
  {
    id: "rose-oval-set",
    publicId: "Gemini_Generated_Image_75phki75phki75ph_h993xj",
    title: "Rose gold ovals",
    alt: "Rose gold pendant and earrings, each around an oval white stone",
    category: "Sets",
  },
  {
    id: "peacock-bib",
    publicId: "Gemini_Generated_Image_wgyaicwgyaicwgya_jrszke",
    title: "The peacock bib",
    alt: "Pearl strand carrying a diamond and pearl peacock bib centrepiece",
    category: "Sets",
  },

  // ---- brooches & cufflinks ----
  {
    id: "bow-brooch",
    publicId: "Gemini_Generated_Image_yeyeswyeyeswyeye_sex5kk",
    title: "Bow and arrow",
    alt: "Engraved gold bow-and-arrow brooch pinned to a navy lapel",
    category: "Brooches & cufflinks",
  },
  {
    id: "spider-brooch",
    publicId: "Gemini_Generated_Image_wbtikowbtikowbti_oulp5o",
    title: "The spider",
    alt: "Gold spider brooch built around a watch dial, on a lapel",
    category: "Brooches & cufflinks",
  },
  {
    id: "infinity-brooch",
    publicId: "Gemini_Generated_Image_pjket4pjket4pjke_d3hcis",
    title: "Infinity",
    alt: "Gold infinity brooch feathered in pavé, with a single diamond",
    category: "Brooches & cufflinks",
    shape: "wide",
  },
  {
    id: "buddha-cufflink",
    publicId: "Gemini_Generated_Image_qgotilqgotilqgot_nfvqmq",
    title: "Buddha cufflink",
    alt: "Gold Buddha cufflink fastened at a white shirt cuff",
    category: "Brooches & cufflinks",
  },
  {
    id: "deity-cufflinks",
    publicId: "Gemini_Generated_Image_1z1mkw1z1mkw1z1m_fyrlcv",
    title: "Deity cufflinks",
    alt: "A pair of gold cufflinks struck with a deity in relief, in their box",
    category: "Brooches & cufflinks",
  },

  // ---- sculpture ----
  {
    id: "ganesha-idol",
    publicId: "Gemini_Generated_Image_bz71hjbz71hjbz71_hu1rtd",
    title: "Ganesha, seated",
    alt: "Silver Ganesha idol on a blue base, laid for puja",
    category: "Sculpture",
  },
  {
    id: "lakshmi-sculpture",
    publicId: "Gemini_Generated_Image_m0f5mjm0f5mjm0f5_dktn6i",
    title: "Lakshmi",
    alt: "Silver seated Lakshmi on a stepped base",
    category: "Sculpture",
  },
  {
    id: "peacock-lady",
    publicId: "Gemini_Generated_Image_b63pjdb63pjdb63p_k9eclt",
    title: "Woman with a peacock",
    alt: "Silver figure of a woman with a peacock, mounted on a wooden base",
    category: "Sculpture",
  },
  {
    id: "bronze-hunter",
    publicId: "Gemini_Generated_Image_ns4z1vns4z1vns4z_dq7vbq",
    title: "The hunter",
    alt: "Bronze figure of a hunter standing on a signed plinth",
    category: "Sculpture",
    shape: "portrait",
  },
  {
    id: "the-dog",
    publicId: "Gemini_Generated_Image_9nhhpj9nhhpj9nhh_mncau3",
    title: "The dog",
    alt: "A dog modelled at rest and cast in dark bronze",
    category: "Sculpture",
  },
];

const INDEX = new Map(PORTFOLIO.map((p) => [p.id, p]));

/** Look a piece up by id. Throws on a typo rather than rendering a hole. */
export function piece(id: string): Piece {
  const found = INDEX.get(id);
  if (!found) throw new Error(`Unknown portfolio piece: ${id}`);
  return found;
}

/** Several, in the order given. */
export function pieces(...ids: string[]): Piece[] {
  return ids.map(piece);
}

export function byCategory(category: Category): Piece[] {
  return PORTFOLIO.filter((p) => p.category === category);
}

/**
 * The twelve strongest silhouettes, for the rotating ring on the landing
 * page. Chosen for shape read at thumbnail size: a lion, a dragon, a skull
 * carry across a 3D carousel in a way a pavé tennis bracelet does not.
 */
export const RING_SHOWCASE = pieces(
  "lion-crown-pendant",
  "dragon-ring",
  "nataraja",
  "tiger-ring",
  "eagle-pendant",
  "ganesha-pendant",
  "skull-ring",
  "koi-pair",
  "portrait-pendant",
  "ram-ring",
  "peacock-bib",
  "panther-wrap",
);

/** The two doors out of the landing page. */
export const DOOR_PORTFOLIO = piece("lion-crown-pendant");
export const DOOR_COMMISSION = piece("portrait-pendant");

/** Two counter-running marquee rails. Between them they use the whole body. */
export const MARQUEE_TOP = pieces(
  "bow-brooch",
  "cuban-link",
  "leaf-set",
  "sapphire-stack",
  "calligraphy-medallion",
  "woven-bangle",
  "greek-signet",
  "lakshmi-haar",
  "pave-tennis",
  "the-pair",
  "deity-cufflinks",
  "wing-pendant",
);

export const MARQUEE_BOTTOM = pieces(
  "spider-brooch",
  "black-hexagon",
  "om-bracelet",
  "boy-charm",
  "ornate-cuff",
  "vine-solitaire",
  "roman-tag",
  "charm-snake",
  "rose-oval-set",
  "flat-signet",
  "torso-pendant",
  "lynx-wrap",
);

/**
 * The bench, and the man at it.
 *
 * Two photographs rather than a folder of them: one of the CAD work actually
 * happening, one of Sanskar. Everything else on these pages is the work.
 */
export const STUDIO = {
  /** Sanskar sculpting on the pen display -- the whole pitch, in one frame. */
  cad: "DSC_0019_oknz4w",
  /** Portrait, lit against a dark ground. */
  designer: "DSC_0005_n65ovn",
  /** The CAD sculpting clip, used as the landing hero. */
  film: "WhatsApp_Video_2026-10-31_at_5.26.42_PM_rwkxjm",
} as const;

/** Four close shots for the "on the bench" wall on the commission page. */
export const BENCH_WALL = pieces(
  "ganesha-pendant",
  "crown-solitaire",
  "eagle-pendant",
  "black-hexagon",
);

export type Step = { n: string; title: string; body: string };

/**
 * What actually happens after the form is sent.
 *
 * Written as commitments rather than marketing: every number here is one the
 * atelier has to be able to keep, because a commission customer measures you
 * against it.
 */
export const PROCESS: Step[] = [
  {
    n: "01",
    title: "Send us the reference",
    body: "A photograph, a screenshot, a sketch on paper, or a piece of your grandmother's you want reworked. Anything that shows us the shape in your head. One image is enough to start.",
  },
  {
    n: "02",
    title: "We call you back",
    body: "Within two working days, on the number you leave. We talk through metal, stones, size and what it is for — and we tell you honestly if what you want cannot be made the way you imagine it.",
  },
  {
    n: "03",
    title: "The design fee",
    body: `Once the brief is settled, the ${formatFee()} design fee is payable and the bench starts. It covers the CAD modelling and three rendered views of your piece, plus one round of revisions. It is adjusted against the final invoice if you go ahead.`,
  },
  {
    n: "04",
    title: "You see it before it exists",
    body: "You approve the renders — proportions, stone sizes, the weight of the metal — before a gram of gold is cut. Nothing goes to casting until you have said yes to the drawing.",
  },
  {
    n: "05",
    title: "Cast, set and finished in-house",
    body: "Casting, kundan setting, meenakari and polish all happen on our own bench in Chanakyapuri. You are welcome to come and watch any stage of it.",
  },
];

export type Faq = { q: string; a: string };

export const COMMISSION_FAQS: Faq[] = [
  {
    q: `What does the ${formatFee()} actually pay for?`,
    a: "The design work: CAD modelling of your piece and three rendered views of it, plus one round of revisions after you have seen them. If you place the order, the fee comes off the final invoice. If you do not, the renders are yours to keep.",
  },
  {
    q: "When do I pay it?",
    a: "Whenever you like. Sending the brief costs nothing, and the ordinary route is that we call you, settle what is being made, and send a payment link afterwards. If you already know what you want, you can pay the fee the moment the brief is sent and the bench starts a day or two sooner.",
  },
  {
    q: "How do I pay, and is it safe?",
    a: "Through Razorpay — UPI, card, netbanking or a wallet. The payment window is Razorpay's own; we never see or store your card details, and the receipt reaches your inbox from them.",
  },
  {
    q: "How long does a commission take?",
    a: "Renders within about a week of the brief being settled. Making the piece itself depends on what it is — a pair of studs is a different proposition from a bridal set — and we give you a date in writing before you pay anything beyond the design fee.",
  },
  {
    q: "Can you work with my own gold or stones?",
    a: "Yes, and often that is the point — a commission frequently starts with a piece someone has inherited and does not wear. Bring it in and we will weigh and assess it with you present.",
  },
  {
    q: "Can you copy a design I have seen elsewhere?",
    a: "We will take it as a starting point and make something of our own from it. We do not reproduce another house's piece stone for stone.",
  },
  {
    q: "What if I do not like the renders?",
    a: "You get one round of revisions inside the fee. If it is still not right after that, we stop there and you owe nothing further — the design fee is not refundable, because the bench time has been spent, but you are under no obligation to order.",
  },
];

/** What we ask for, and why — shown beside the form so the fields earn themselves. */
export const BRIEF_HINTS = [
  "A reference image is worth more than a paragraph. Screenshot, photograph, or a sketch on paper — anything.",
  "Tell us the occasion and the date. It changes what we can promise you.",
  "A budget range is not a commitment. It stops us designing something you did not want to be quoted.",
];
