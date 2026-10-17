/* eslint-disable no-console */
import { PrismaClient, type MediaKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { STILLS, CLIPS } from "../src/lib/media-library";
import { NAV_TREE } from "./nav-tree";
import { PRODUCTS } from "./catalogue";

const prisma = new PrismaClient();
const R = (rupees: number) => rupees * 100;

const SIZE_SETS = {
  WOMEN: [
    { size: "XS", stock: 2 },
    { size: "S", stock: 3 },
    { size: "M", stock: 4 },
    { size: "L", stock: 3 },
    { size: "XL", stock: 2 },
    { size: "Custom Tailored", stock: 99, priceDelta: R(12000) },
  ],
  MEN: [
    { size: '38"', stock: 2 },
    { size: '40"', stock: 3 },
    { size: '42"', stock: 3 },
    { size: '44"', stock: 2 },
    { size: '46"', stock: 1 },
    { size: "Custom Tailored", stock: 99, priceDelta: R(15000) },
  ],
  ONE: [{ size: "One Size", stock: 6 }],
  JEWEL: [
    { size: "Standard", stock: 3 },
    { size: "Made to Order", stock: 99, priceDelta: R(25000) },
  ],
} as const;

const DELIVERY_INFO =
  "Ready pieces dispatch within 3 working days and reach metros in 2–4 working days. Custom-tailored and made-to-order pieces take 8–10 weeks and include three fittings. International orders ship by DHL Express; duties are payable by the recipient.";

const DISCLAIMER =
  "Every piece is made by hand, so slight irregularity in embroidery density, mirror reflection or print registration is the mark of the hand rather than a defect. Colour on a screen is not colour in a room — we will send physical swatches before any commission.";

const WASHCARE =
  "Dry clean only, by a specialist familiar with hand embroidery. Store flat in the muslin bag provided, away from direct light. Never hang pieces with heavy zardozi — the weight will distort the shoulder.";

const TESTIMONIALS = [
  {
    author: "Ananya & Rohit",
    occasion: "Wedding, Udaipur",
    quote:
      "We went in for one lehenga and came out having planned four outfits. Three fittings sounded excessive until the third one, when they changed something I had not even noticed was wrong.",
  },
  {
    author: "Meher Kapoor",
    occasion: "Sangeet, Delhi",
    quote:
      "I danced for five hours in it. Nothing came loose, nothing scratched, and the sequins were still all there the next morning. That is the whole review.",
  },
  {
    author: "Vikram Set",
    occasion: "Groom, Jaipur",
    quote:
      "They dyed my sherwani from the same thread lot as my wife's lehenga. In the photographs the two of us read as one piece. I would not have thought to ask for that.",
  },
  {
    author: "The Bhatia Family",
    occasion: "Trousseau",
    quote:
      "Eleven outfits across four ceremonies, delivered on the dates they gave us nine months earlier. Not one phone call where we had to chase them.",
  },
  {
    author: "Ishita R.",
    occasion: "Reception, Mumbai",
    quote:
      "The Benarasi was woven for me over eleven weeks. They sent photographs from the loom every fortnight. I have kept all of them.",
  },
];

async function main() {
  console.log("> clearing existing data");
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.user.deleteMany();

  // ---------------- users ----------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@sanskarandkabir.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

  await prisma.user.create({
    data: {
      name: "Atelier Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      phone: "+91 98100 00000",
    },
  });
  console.log(`> admin: ${adminEmail} / ${adminPassword}`);

  const customer = await prisma.user.create({
    data: {
      name: "Aarohi Mehta",
      email: "aarohi@example.com",
      password: await bcrypt.hash("Customer@123", 12),
      role: "CUSTOMER",
      phone: "+91 98200 11111",
      addresses: {
        create: {
          fullName: "Aarohi Mehta",
          phone: "+91 98200 11111",
          line1: "12 Amrita Shergill Marg",
          line2: "Lodhi Estate",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110003",
          isDefault: true,
        },
      },
    },
  });
  console.log("> customer: aarohi@example.com / Customer@123");

  // ---------------- navigation ----------------
  const slugToId = new Map<string, string>();
  let art = 0;

  for (const [i, top] of NAV_TREE.entries()) {
    const parent = await prisma.category.create({
      data: {
        name: top.name,
        slug: top.slug,
        description: top.description,
        position: i,
        featured: top.featured ?? false,
        imageId: STILLS[art++ % STILLS.length],
      },
    });
    slugToId.set(parent.slug, parent.id);

    for (const [j, child] of top.children.entries()) {
      // A child slug can appear under more than one parent (the occasions are
      // shared), so skip rather than fail on the unique constraint.
      if (slugToId.has(child.slug)) continue;
      const kid = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parent.id,
          menuGroup: child.group,
          position: j,
          imageId: STILLS[art++ % STILLS.length],
        },
      });
      slugToId.set(kid.slug, kid.id);
    }
  }
  console.log(`> ${slugToId.size} categories`);

  // ---------------- products ----------------
  let still = 0;
  let clip = 0;

  for (const [i, p] of PRODUCTS.entries()) {
    const categoryId = slugToId.get(p.category) ?? null;
    if (!categoryId) console.warn(`  ! unknown category ${p.category}`);

    const media: {
      publicId: string;
      kind: MediaKind;
      alt: string;
      position: number;
    }[] = [
      {
        publicId: STILLS[still++ % STILLS.length],
        kind: "IMAGE",
        alt: `${p.name} — front`,
        position: 0,
      },
      {
        publicId: CLIPS[clip++ % CLIPS.length],
        kind: "VIDEO",
        alt: `${p.name} — in motion`,
        position: 1,
      },
      {
        publicId: STILLS[still++ % STILLS.length],
        kind: "IMAGE",
        alt: `${p.name} — detail`,
        position: 2,
      },
      {
        publicId: CLIPS[clip++ % CLIPS.length],
        kind: "VIDEO",
        alt: `${p.name} — detail in motion`,
        position: 3,
      },
    ];

    const sizes = SIZE_SETS[p.sizes ?? "WOMEN"];

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        tagline: p.tagline,
        description: p.description,
        price: R(p.price),
        compareAtPrice: p.compareAtPrice ? R(p.compareAtPrice) : null,
        sku: `SK-${String(i + 1).padStart(4, "0")}`,
        categoryId,
        fabric: p.fabric,
        color: p.color,
        craft: p.craft,
        careNotes: WASHCARE,
        deliveryInfo: DELIVERY_INFO,
        disclaimer: DISCLAIMER,
        customizable: true,
        isActive: true,
        isFeatured: p.featured ?? false,
        isNewArrival: p.newArrival ?? false,
        position: i,
        media: { create: media },
        variants: {
          create: sizes.map((s, k) => ({
            size: s.size,
            stock: s.stock,
            priceDelta: "priceDelta" in s ? (s.priceDelta as number) : 0,
            position: k,
          })),
        },
      },
    });
  }
  console.log(`> ${PRODUCTS.length} products`);

  // ---------------- banners ----------------
  await prisma.banner.createMany({
    data: [
      {
        eyebrow: "Sanghe FW/26",
        title: "Gulnaar",
        subtitle:
          "Nine hundred hours of hand-set zardozi, cut to measure over three fittings.",
        ctaLabel: "Explore the collection",
        ctaHref: "/collections/new-collection",
        publicId: CLIPS[0],
        kind: "VIDEO",
        slot: "HERO",
        position: 0,
      },
      {
        eyebrow: "Handloom",
        title: "Benaras Reverie",
        subtitle:
          "Kadhwa brocade, woven motif by motif on the looms at Varanasi — eleven weeks to the metre.",
        ctaLabel: "Explore the weave",
        ctaHref: "/collections/benaras-reverie",
        publicId: CLIPS[3],
        kind: "VIDEO",
        slot: "HERO",
        position: 1,
      },
      {
        eyebrow: "Sanskar Gold",
        title: "The jewellery",
        subtitle:
          "Temple gold, polki and kundan — made in the same house, to sit with the clothes.",
        ctaLabel: "Explore jewellery",
        ctaHref: "/collections/jewellery",
        publicId: STILLS[9],
        kind: "IMAGE",
        slot: "EDITORIAL",
        position: 0,
      },
      {
        eyebrow: "The Atelier",
        title: "Made by hand, in front of you",
        subtitle:
          "Every piece is cut, worked and finished in our Delhi studio. You can come and watch it happen.",
        ctaLabel: "Book an appointment",
        ctaHref: "/atelier",
        publicId: STILLS[4],
        kind: "IMAGE",
        slot: "EDITORIAL",
        position: 1,
      },
      // The Diwali carousel on the 4th homepage scroll.
      {
        eyebrow: "Diwali",
        title: "Sanghe FW/26",
        subtitle: "The festive line, shot at Amer.",
        ctaLabel: "Explore",
        ctaHref: "/collections/festive-edit",
        publicId: CLIPS[5],
        kind: "VIDEO",
        slot: "DIWALI",
        position: 0,
      },
      {
        eyebrow: "Diwali",
        title: "Noor",
        subtitle: "Tissue and graded sequin, built to catch a room's light.",
        ctaLabel: "Explore",
        ctaHref: "/collections/noor-festive",
        publicId: CLIPS[8],
        kind: "VIDEO",
        slot: "DIWALI",
        position: 1,
      },
      {
        eyebrow: "Diwali",
        title: "Urli",
        subtitle: "Brass-toned brocade, lifted from a temple lamp.",
        ctaLabel: "Explore",
        ctaHref: "/collections/urli",
        publicId: STILLS[13],
        kind: "IMAGE",
        slot: "DIWALI",
        position: 2,
      },
    ],
  });
  console.log("> banners");

  // ---------------- testimonials ----------------
  await prisma.testimonial.createMany({
    data: TESTIMONIALS.map((t, i) => ({
      ...t,
      publicId: i % 2 === 0 ? CLIPS[(i + 11) % CLIPS.length] : STILLS[(i + 5) % STILLS.length],
      kind: (i % 2 === 0 ? "VIDEO" : "IMAGE") as MediaKind,
      position: i,
    })),
  });
  console.log(`> ${TESTIMONIALS.length} testimonials`);

  // ---------------- a settled order ----------------
  const first = await prisma.product.findFirst({
    where: { sku: "SK-0010" },
    include: { variants: true, media: true },
  });
  const addr = await prisma.address.findFirst({ where: { userId: customer.id } });

  if (first && addr) {
    const subtotal = first.price;
    const order = await prisma.order.create({
      data: {
        orderNumber: "SK-2026-0001",
        userId: customer.id,
        addressId: addr.id,
        status: "PAID",
        subtotal,
        shipping: 0,
        total: subtotal,
        email: customer.email,
        phone: customer.phone,
        shipAddress: {
          fullName: addr.fullName,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
        },
        items: {
          create: [
            {
              productId: first.id,
              variantId: first.variants[0]?.id ?? null,
              name: first.name,
              size: first.variants[0]?.size ?? null,
              imageId: first.media[0]?.publicId ?? null,
              unitPrice: subtotal,
              quantity: 1,
            },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: "order_SEEDDEMO0001",
        razorpayPaymentId: "pay_SEEDDEMO0001",
        status: "CAPTURED",
        amount: subtotal,
        method: "upi",
        raw: { seeded: true },
      },
    });
    console.log("> demo order SK-2026-0001");
  }

  // A couple of wishlist rows so the page is not empty on first look.
  const wishables = await prisma.product.findMany({ take: 3, select: { id: true } });
  await prisma.wishlistItem.createMany({
    data: wishables.map((p) => ({ userId: customer.id, productId: p.id })),
  });

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
