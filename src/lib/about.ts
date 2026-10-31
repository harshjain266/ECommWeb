import type { Block } from "@/components/site/Prose";

export type AboutSection = {
  slug: string;
  tab: string;
  title: string;
  blurb: string;
  /** Fallback hero art: an index into STILLS. */
  art: number;
  /** Explicit hero publicId, supplied by the house. Wins over `art`. */
  heroId?: string;
  blocks: Block[];
};

/** The About Us tabs, in the order they appear under the hero. */
export const ABOUT_SECTIONS: AboutSection[] = [
  {
    slug: "",
    tab: "About the House",
    title: "About the House",
    blurb:
      "Two disciplines under one roof: Kabir cuts the clothes, Sanskar sets the jewellery, and nothing leaves the building to be finished somewhere else.",
    art: 6,
    heroId: "WhatsApp_Image_2026-10-31_at_5.07.43_PM_hnxlps",
    blocks: [
      {
        kind: "p",
        text: "Founded in 2014, Sanskar & Kabir sits at the point where two crafts normally sold separately are made together. Most couture houses commission their jewellery from a third party and hope the two read as one. We do not — the clothes and the pieces worn with them are designed in the same room, from the same palette, by two people who have been arguing about colour for a decade.",
      },
      {
        kind: "h",
        text: "One floor, thirty-eight hands",
      },
      {
        kind: "p",
        text: "Zardozi, aari, dabka, gota and chikankari are all worked in-house in Chanakyapuri, alongside a jewellery bench doing repoussé, kundan setting and meenakari. For the first three years part of our aari went out to a workshop we did not control. The work came back fine and we had no idea who had done it or what they had been paid. Bringing it in cost us margin and a year of hiring, and it is the single best decision this house has made.",
      },
      {
        kind: "h",
        text: "What we will not do",
      },
      {
        kind: "list",
        items: [
          "Synthetic zari. It stays bright for a decade and then flakes. Real zari dulls into something warmer, and that is the point.",
          "Machine-run gota. It is faster and it is visibly flatter.",
          "Pre-cut mirror discs. Hand-cut shisha reflects irregularly, which is the whole character of the technique.",
          "Outsourced embroidery. If we cannot tell you who made it, we will not sell it.",
        ],
      },
      {
        kind: "h",
        text: "Where to find us",
      },
      {
        kind: "p",
        text: "Santushti Shopping Complex, Chanakyapuri, New Delhi. Tuesday to Saturday, 11am to 7pm, and by appointment on Sunday and Monday. Bridal consultations are booked rather than walked in, because they take ninety minutes and a designer has to be free for all of it.",
      },
    ],
  },

  {
    slug: "our-founders",
    tab: "Our Founders",
    title: "Our Founders",
    blurb:
      "Sanskar, who sets the jewellery. Kabir, who cuts the clothes. The house is named in that order because that is the order they met the craft.",
    art: 10,
    heroId: "WhatsApp_Image_2026-10-31_at_5.08.24_PM_rl0aup",
    blocks: [
      { kind: "h", text: "Sanskar — Jewellery Designer" },
      {
        kind: "p",
        text: "Sanskar trained on a bench before ever drawing on paper, apprenticed to a temple-gold karigar in Thrissur at nineteen. That order matters: he designs knowing what the metal will refuse to do, which is why nothing on our bench gets sent back as unmakeable.",
      },
      {
        kind: "p",
        text: "His work is deliberately traditional in method and quiet in form — repoussé raised from the reverse, closed polki settings with foil backing, meenakari enamelled on the side nobody sees. He will spend three weeks on the back of a necklace that will never be photographed, and consider the argument closed.",
      },
      {
        kind: "p",
        text: "The Sanskar Gold line is his: temple gold, strung on silk, finished with an adjustable dori the way it has been done for four hundred years.",
      },
      { kind: "h", text: "Kabir — Fashion Designer" },
      {
        kind: "p",
        text: "Kabir came the other way round — pattern cutting at NIFT, then four years in a Savile Row-trained tailoring workshop in Mumbai before coming home to Delhi. He thinks about Indian occasionwear the way a tailor thinks about a coat: canvas, balance, and whether a shoulder will still sit correctly in five years.",
      },
      {
        kind: "p",
        text: "It is why our sherwanis are hand-canvassed when almost nobody canvasses a sherwani, and why a bridal lehenga here is fitted as a toile in plain cotton before a single stitch of embroidery is worked. Shape first, surface second — which is an unfashionable order of operations in a business that sells photographs.",
      },
      { kind: "h", text: "Working together" },
      {
        kind: "p",
        text: "The practical result is lot-matching: a groom's sherwani dyed from the same thread lot as the bride's lehenga, and a jewellery set built to the exact gold of the zardozi it will sit against. In photographs the three read as one commission, because they were.",
      },
    ],
  },

  {
    slug: "our-philosophy",
    tab: "Our Philosophy",
    title: "Our Philosophy",
    blurb:
      "Where individuality meets contemporary Indian craft — made to be seen, felt, and remembered.",
    art: 14,
    blocks: [
      { kind: "h", text: "Craft is a labour record, not a decoration" },
      {
        kind: "p",
        text: "When we say nine hundred hours, we mean nine hundred hours of someone's life. That is the real cost of a bridal piece and we would rather you knew it than be told a vague story about heritage. Every commission ships with a card naming the karigars who worked on it.",
      },
      { kind: "h", text: "Fit is not a finishing step" },
      {
        kind: "p",
        text: "Occasion wear is photographed from every angle and worn for twelve hours, which is exactly when an average fit shows. Three fittings are included on every commission, and the third one exists specifically for the hem, with your actual shoes.",
      },
      { kind: "h", text: "The hand should be visible" },
      {
        kind: "p",
        text: "Slight irregularity in a mirror's reflection, a block print's registration, or the density of a zardozi vine is evidence of the hand. We do not correct it, and we will not accept it being called a defect. Uniformity is what a machine produces, and a machine is cheaper.",
      },
      { kind: "h", text: "A piece should outlive the occasion" },
      {
        kind: "p",
        text: "Alterations are complimentary for twelve months on anything bought here. Bodies change; a well-made piece should be able to follow. We would rather re-cut a waistband in year three than sell you a second lehenga.",
      },
      { kind: "h", text: "Say the hard thing early" },
      {
        kind: "p",
        text: "If a date is too tight for the work you want, we will say so at the consultation rather than at the fitting. If a colour will photograph badly in the light where you are getting married, we will tell you that too. It costs us sales and it has never once cost us a client.",
      },
    ],
  },
];

export function findAboutSection(slug: string | undefined) {
  return ABOUT_SECTIONS.find((s) => s.slug === (slug ?? ""));
}
