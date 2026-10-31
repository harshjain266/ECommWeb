/**
 * The jewellery house: portfolio artwork, the commission story, and the one
 * place the design fee is written down.
 *
 * Deliberately a plain module rather than database rows. The portfolio is a
 * fixed body of work shot in one session -- it is not a shelf, nothing here
 * is priced or added to a bag -- and the commission copy is editorial. Both
 * change at the pace of a deploy, not of an admin edit.
 *
 * No `server-only`: the gallery and the commission form are client
 * components and import from here.
 */

/** The design fee, in paise. One definition; every surface reads it. */
export const DESIGN_FEE_PAISE = 99_900;

export function formatFee(paise: number = DESIGN_FEE_PAISE): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export type Piece = {
  /** The original shot, on velvet, in the shop. Used by the lightbox. */
  publicId: string;
  /**
   * The same piece with the background cut away, stored as a transparent PNG.
   *
   * Generated once through Cloudinary's background removal and uploaded as a
   * real asset rather than left as a delivery transform: the AI pass takes
   * seconds on a cold URL, and no visitor should ever be the one waiting for
   * it. Delivery is now an ordinary fetch.
   */
  cut: string;
  /** Alt text. These are unnamed studio shots, so it describes the form. */
  alt: string;
};

/**
 * The portfolio, in display order.
 *
 * Shot in one sitting on velvet, all 1600x1194 -- which is why the gallery
 * can commit to a single landscape ratio and not fight the source material.
 *
 * Note what these actually are: mostly one-off commissions, modelled from
 * something a customer brought in. That is the argument the commission page
 * is making, so the strongest sculpted pieces lead.
 */
export const PORTFOLIO: Piece[] = [
{ publicId: "WhatsApp_Image_2026-10-26_at_2.29.34_PM_bfskaq", cut: "sanskar/jewellery/cut-01", alt: "Crowned lion's head pendant in silver, the crown set with pavé stones" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.22_PM_q1m0hq", cut: "sanskar/jewellery/cut-02", alt: "Dancing Nataraja cast in gold, framed by a patterned ring" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.39_PM_xclerg", cut: "sanskar/jewellery/cut-03", alt: "Pearl strand with a diamond and pearl peacock centrepiece" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.29_PM_eefm73", cut: "sanskar/jewellery/cut-04", alt: "Portrait pendant in gold: a couple sculpted in relief inside a rope-chain frame" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.20_PM_svjpxf", cut: "sanskar/jewellery/cut-05", alt: "Citrine and diamond pendant with matching ear drops in white gold" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.28_PM_imazsf", cut: "sanskar/jewellery/cut-06", alt: "Gold ring crowned with twin lion heads" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.36_PM_bt3nyy", cut: "sanskar/jewellery/cut-07", alt: "Openwork calligraphic medallion in gold, ringed with green stones" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.24_PM_c3bbu5", cut: "sanskar/jewellery/cut-08", alt: "Sculpted torso pendant in silver on a fine chain" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.38_PM_vyiie0", cut: "sanskar/jewellery/cut-09", alt: "Heavy Cuban-link bracelet, pavé-set throughout in white gold" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.26_PM_zuqcef", cut: "sanskar/jewellery/cut-10", alt: "Gold pendant with Roman numerals framing two sculpted lion heads" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.41_PM_xe30a2", cut: "sanskar/jewellery/cut-11", alt: "Openwork square pendant in gold and diamond, set on the diagonal" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.23_PM_rcy6jy", cut: "sanskar/jewellery/cut-12", alt: "Silver figure of a woman with a peacock, mounted on a wooden base" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.33_PM_zripgk", cut: "sanskar/jewellery/cut-13", alt: "Winged-leaf pendant in gold, worn on a fine chain" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.42_PM_b2v4gk", cut: "sanskar/jewellery/cut-14", alt: "White gold ring with a black step-cut centre and pavé shoulders" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.32_PM_q24sxb", cut: "sanskar/jewellery/cut-15", alt: "A pair of koi carp modelled in gold" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.31_PM_e0ghis", cut: "sanskar/jewellery/cut-16", alt: "Two clasped hands modelled in silver as a collar" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.35_PM_wf1ftt", cut: "sanskar/jewellery/cut-17", alt: "Silver bracelet with engraved panel links" },
  { publicId: "WhatsApp_Image_2026-10-26_at_2.29.27_PM_zuwh7m", cut: "sanskar/jewellery/cut-18", alt: "Silver bracelet hung with engraved disc charms" },
];

/** The piece that fronts the portfolio wherever it is linked from. */
export const PORTFOLIO_COVER = PORTFOLIO[0].publicId;

/** The bench at work -- used across the commission page. */
export const ATELIER_AT_WORK = {
  /** Portrait, for the tall editorial columns. */
  portrait: [
    "WhatsApp_Image_2026-10-31_at_5.26.42_PM_laizh2",
    "WhatsApp_Image_2026-10-31_at_5.26.43_PM_gkrjpg",
    "WhatsApp_Image_2026-10-31_at_5.26.43_PM_1_tso51y",
    "WhatsApp_Image_2026-10-31_at_5.26.43_PM_2_ldwaj1",
    "WhatsApp_Image_2026-10-31_at_5.30.59_PM_kejkiz",
  ],
  /** Landscape, for the wide bands. */
  landscape: [
    "WhatsApp_Image_2026-10-31_at_5.26.44_PM_awihbi",
    "WhatsApp_Image_2026-10-31_at_5.26.43_PM_3_w36if8",
  ],
  /** The CAD sculpting clip. */
  film: "WhatsApp_Video_2026-10-31_at_5.26.42_PM_rwkxjm",
} as const;

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
    a: "Not now. Send the form first — it costs nothing. We call you, settle the brief, and only then send a payment link. Nothing is charged until you have spoken to someone.",
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
