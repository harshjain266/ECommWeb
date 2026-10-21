/* eslint-disable no-console */
/**
 * Register the eight pieces shot on the studio floor on 19 Oct as real
 * products, each on its own photograph.
 *
 *   npx tsx scripts/add-studio-pieces.ts
 *
 * Upserted by slug, so re-running updates rather than duplicating. The
 * publicIds come from `scripts/ingest-photos.ts`, which derives them from a
 * content hash -- re-uploading the same photograph keeps the same id, which is
 * what lets this script stay idempotent across both halves of the pipeline.
 */
import { PrismaClient } from "@prisma/client";

process.loadEnvFile?.(".env");
const prisma = new PrismaClient();
const R = (rupees: number) => rupees * 100;

const DELIVERY =
  "Ready pieces dispatch within 3 working days and reach metros in 2–4 working days. Custom-tailored pieces take 8–10 weeks and include three fittings. International orders ship by DHL Express; duties are payable by the recipient.";
const DISCLAIMER =
  "Photographed on the studio floor in daylight, unretouched. Every piece is made by hand, so slight irregularity in embroidery density is the mark of the hand rather than a defect. Colour on a screen is not colour in a room — we will send physical swatches before any commission.";
const WASHCARE =
  "Dry clean only, by a specialist familiar with hand embroidery. Store flat in the muslin bag provided, away from direct light. Never hang pieces with heavy zardozi — the weight will distort the shoulder.";

const SIZES = [
  { size: '38"', stock: 1 },
  { size: '40"', stock: 2 },
  { size: '42"', stock: 2 },
  { size: '44"', stock: 1 },
  { size: '46"', stock: 1 },
  { size: "Custom Tailored", stock: 99, priceDelta: R(15000) },
];

const PIECES = [
  {
    slug: "shikar-olive-linen-bandhgala",
    name: "Shikar Olive Linen Bandhgala",
    tagline: "A hand-worked shikar crest on slub linen",
    category: "bandhgalas",
    price: 68000,
    compareAtPrice: 79000,
    fabric: "Slub linen, cupro lining",
    color: "Moss olive, antique gold",
    craft: "Zardozi crest, dabka collar, gota hem vine",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-04-18-pm-eb32a11b5514",
    featured: true,
    description:
      "An olive slub-linen bandhgala built around a single hand-worked shikar crest at the chest — a stag framed in a wreath of dabka and kora, raised high enough to catch light from across a room. The mandarin collar is embroidered on both the stand and the fall, and a thin gota vine runs the front hem and cuffs so the piece reads as finished from every angle. Cut close through the chest and released slightly at the waist.",
  },
  {
    slug: "moti-bagh-ivory-sherwani",
    name: "Moti Bagh Ivory Sherwani",
    tagline: "Pearl and zardozi worked to full coverage",
    category: "sherwanis",
    price: 325000,
    compareAtPrice: 385000,
    fabric: "Raw silk, tissue organza dupatta",
    color: "Ivory, pearl, oyster",
    craft: "Full-coverage pearl, zardozi, dabka, kora",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-04-38-pm-22b8a5304cbc",
    featured: true,
    newArrival: true,
    description:
      "The house's heaviest groom piece. Ivory raw silk carried to full coverage in freshwater pearl, zardozi and dabka, laid out as a honeycomb jaal that tightens towards the shoulder and opens again at the hem. Worked in a single tonal family so the embroidery reads as texture rather than contrast — which is what lets it photograph in daylight without flattening. Supplied with a blush tissue-organza dupatta edged in matching zari.",
  },
  {
    slug: "nautch-black-resham-bandhgala",
    name: "Nautch Black Resham Bandhgala",
    tagline: "Ivory resham on matte black wool",
    category: "bandhgalas",
    price: 96000,
    fabric: "Matte wool crepe, bemberg lining",
    color: "Black, ivory",
    craft: "Resham thread work, hand-couched vine",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-05-42-pm-dfdf4416e7ee",
    featured: true,
    description:
      "Ivory resham worked directly onto matte black wool crepe, with no sequin and no metal anywhere in it — the whole piece is thread. The design is built as a mirrored cypress rising from the hem to the shoulder, dense at the yoke and thinning as it travels down, so the eye is carried up. Piped in ivory at the collar and placket. For a sangeet or a reception, rather than a day ceremony.",
  },
  {
    slug: "khaki-jaal-tonal-sherwani",
    name: "Khaki Jaal Tonal Sherwani",
    tagline: "Tone-on-tone jaal, worked edge to edge",
    category: "sherwanis",
    price: 185000,
    compareAtPrice: 215000,
    fabric: "Silk chanderi over cotton silk",
    color: "Khaki taupe, bone",
    craft: "Resham jaal, aari, scalloped zari edging",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-06-10-pm-77d85a833cce",
    featured: true,
    description:
      "A long open-front sherwani in khaki silk chanderi, worked edge to edge in a bone resham jaal of arches and flowering vines. Because the thread sits only a half-tone from the ground, the piece changes with the light — nearly plain in shade, fully carved in sun. Closes on a run of covered buttons over a tonal inner kurta. One of the quieter things we make, and the one most often chosen by grooms who do not want to be looked at first.",
  },
  {
    slug: "baraat-ivory-herringbone-sherwani",
    name: "Baraat Ivory Herringbone Sherwani",
    tagline: "A gold baraat crest on woven herringbone",
    category: "sherwanis",
    price: 142000,
    fabric: "Herringbone raw silk, silk inner",
    color: "Ivory, pale gold",
    craft: "Zardozi crest, pearl buttons, zari placket",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-06-26-pm-c4d8a8bd0903",
    featured: true,
    newArrival: true,
    description:
      "Woven ivory herringbone, left almost entirely plain so that one motif can carry the piece: a gold baraat crest at the chest — a caparisoned elephant under a flowering tree, worked in dabka and sequin. The placket is bordered in fine zari and closed with twenty hand-wound pearl buttons, over a pale gold embroidered inner kurta. Designed for a daytime wedding, where the texture of the weave does more work than embroidery would.",
  },
  {
    slug: "zafar-black-jaal-jacket",
    name: "Zafar Black Jaal Jacket",
    tagline: "All-over resham jaal, hem to collar",
    category: "indo-western-men",
    price: 158000,
    fabric: "Silk velvet, quilted silk lining",
    color: "Black, ivory, pale sage",
    craft: "Dense resham jaal, scallop border, aari",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-11-10-pm-5c15c82ec764",
    featured: true,
    description:
      "An open-front long jacket covered corner to corner in ivory and pale-sage resham — leaf, lotus and scale worked so densely that the black ground survives only as outline. The border is scalloped by hand and edged in a narrow braid, and the hem carries a separate deeper band so the piece finishes rather than simply stops. Fully lined in quilted silk; heavy, and meant to be.",
  },
  {
    slug: "qaiser-paisley-beaded-jacket",
    name: "Qaiser Paisley Beaded Jacket",
    tagline: "Beaded paisley on indigo selvedge denim",
    category: "indo-western-men",
    price: 124000,
    compareAtPrice: 148000,
    fabric: "Selvedge denim, beaded silk appliqué",
    color: "Vermilion, aubergine, indigo",
    craft: "Glass bead, sequin, hand appliqué",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-11-37-pm-f7cdbc9a331a",
    featured: true,
    newArrival: true,
    description:
      "The house's argument for wearing something other than ivory. Oversized paisley in vermilion and aubergine, beaded by hand in glass and sequin, appliquéd onto indigo selvedge denim so the whole thing has weight and holds its shape off the shoulder. The placket is bordered in a narrow paisley run and left open over a plain black kurta. Loud in a photograph, surprisingly wearable in a room.",
  },
  {
    slug: "sitara-velvet-bandhgala",
    name: "Sitara Velvet Bandhgala",
    tagline: "Crystal sitara and two birds in flight",
    category: "bandhgalas",
    price: 88000,
    fabric: "Cotton silk velvet, satin lining",
    color: "Jet black, crystal, gold",
    craft: "Crystal appliqué, bullion birds, chain collar",
    publicId: "sanskar/whatsapp-image-2026-10-19-at-8-12-07-pm-e4c8a0d70e02",
    featured: true,
    description:
      "Jet-black cotton-silk velvet, cut lean, and left almost bare except for three placed pieces: an eight-point crystal sitara at the chest, and two birds in bullion and crystal rising across the lower front as though they had just left it. A single line of crystal runs the collar edge. The restraint is the point — on velvet, three motifs read louder than thirty.",
  },
];

async function main() {
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  let n = 0;
  for (const [i, p] of PIECES.entries()) {
    const categoryId = catId.get(p.category);
    if (!categoryId) throw new Error(`No category "${p.category}" — run the seed first.`);

    const sku = `SK-STU-${String(i + 1).padStart(3, "0")}`;
    const data = {
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: R(p.price),
      compareAtPrice: p.compareAtPrice ? R(p.compareAtPrice) : null,
      sku,
      categoryId,
      fabric: p.fabric,
      color: p.color,
      craft: p.craft,
      careNotes: WASHCARE,
      deliveryInfo: DELIVERY,
      disclaimer: DISCLAIMER,
      customizable: true,
      isActive: true,
      isFeatured: Boolean(p.featured),
      isNewArrival: Boolean(p.newArrival),
      position: i,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...data, slug: p.slug },
      update: data,
    });

    // Media and variants are rewritten wholesale so the script stays idempotent.
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    await prisma.productMedia.create({
      data: { productId: product.id, publicId: p.publicId, kind: "IMAGE", alt: p.name, position: 0 },
    });

    for (const [j, v] of SIZES.entries()) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: product.id, size: v.size } },
        create: {
          productId: product.id,
          size: v.size,
          stock: v.stock,
          priceDelta: v.priceDelta ?? 0,
          position: j,
        },
        update: { stock: v.stock, priceDelta: v.priceDelta ?? 0, position: j },
      });
    }

    n++;
    console.log(`  ${p.slug.padEnd(36)} -> ${p.category}`);
  }

  console.log(`\n${n} studio pieces registered.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
