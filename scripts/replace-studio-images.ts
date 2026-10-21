/**
 * Swap the rail snapshots for the studio photography.
 *
 * Reads files from `~/Desktop/incoming`, matched by filename stem. Stems are
 * normalised (lower-cased, runs of non-alphanumerics folded to a single
 * hyphen) so the names the photographs arrive with -- "Khaki jaal tonal
 * sherwani.jpeg" -- match without anyone having to rename anything.
 *
 * Every upload gets a content-hashed public id: `<slug>-<sha1[:8]>`.
 *
 * The first version of this reused the public id the product already pointed
 * at, so that no database write was needed. That was a mistake. Cloudinary
 * serves images with `max-age=2592000`, and reusing the id leaves the URL
 * byte-identical -- so every browser that had already seen the old photograph
 * went on showing it for thirty days, purged CDN or not. Hashing the content
 * into the id means a new photograph is always a new URL, which no cache can
 * get wrong. Re-running with an unchanged file is still a no-op.
 *
 *   npx tsx scripts/replace-studio-images.ts          # dry run
 *   npx tsx scripts/replace-studio-images.ts --go     # do it
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, parse } from "node:path";
import { homedir } from "node:os";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const DIR = join(homedir(), "Desktop", "incoming");
const GO = process.argv.includes("--go");
const prisma = new PrismaClient();

/** filename stem -> which product it belongs to. */
const REPLACE: Record<string, string> = {
  "ivory-sherwani": "moti-bagh-ivory-sherwani",
  "black-bandhgala": "nautch-black-resham-bandhgala",
  "ivory-indowestern": "baraat-ivory-herringbone-sherwani",
  "khaki-jaal-tonal-sherwani": "khaki-jaal-tonal-sherwani",
  "olive-linen-indowestern": "shikar-olive-linen-bandhgala",
};

/** Stems with no existing piece -- these become new ones. */
const CREATE: Record<
  string,
  {
    slug: string;
    name: string;
    categorySlug: string;
    price: number; // rupees
    tagline: string;
    description: string;
    fabric: string;
    color: string;
    craft: string;
    sizePreset: "MEN";
  }
> = {
  bandhgala: {
    slug: "sadaf-oat-textured-bandhgala",
    name: "Sadaf Oat Textured Bandhgala",
    categorySlug: "bandhgalas",
    price: 72000,
    tagline: "A self-textured bandhgala with an embroidered collar",
    description:
      "Cut close through the chest in a self-textured oat weave, with the whole of the collar given over to hand embroidery in matching thread and seed pearl. Worn here with ivory trousers; the pocket square is not included.",
    fabric: "Self-textured raw silk",
    color: "Oat",
    craft: "Hand-embroidered collar — zardozi and seed pearl",
    sizePreset: "MEN",
  },
  "kurta-set": {
    slug: "gulbadan-navy-printed-kurta-set",
    name: "Gulbadan Navy Printed Kurta Set",
    categorySlug: "mens-kurta-sets",
    price: 48000,
    tagline: "Hand-printed florals on navy, with a maroon shawl",
    description:
      "An A-line kurta hand-printed in a dense Mughal floral on navy, finished with an embroidered placket and cuffs. Comes with ivory trousers and the maroon printed shawl shown.",
    fabric: "Printed silk",
    color: "Navy",
    craft: "Hand-printed floral, embroidered placket",
    sizePreset: "MEN",
  },
};

const MEN_SIZES = [
  { size: '38"', stock: 1 },
  { size: '40"', stock: 1 },
  { size: '42"', stock: 1 },
  { size: '44"', stock: 0 },
  { size: "Made to Measure", stock: 99 },
];

function configure() {
  const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are missing from .env");
  }
  cloudinary.config({
    cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function main() {
  configure();

  let files: string[];
  try {
    files = readdirSync(DIR).filter(
      (f) => /\.(jpe?g|png|webp)$/i.test(f) && statSync(join(DIR, f)).isFile(),
    );
  } catch {
    console.error(`\nNothing to read: ${DIR} does not exist.\n`);
    return;
  }

  if (!files.length) {
    console.error(`\nNo images in ${DIR}\n`);
    return;
  }

  const known = new Set([...Object.keys(REPLACE), ...Object.keys(CREATE)]);
  const normalise = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const stems = files.map((f) => ({ file: f, stem: normalise(parse(f).name) }));

  const unknown = stems.filter((s) => !known.has(s.stem));
  if (unknown.length) {
    console.log("\nSkipping (filename not recognised):");
    for (const u of unknown) console.log(`  ${u.file}`);
  }

  const missing = [...known].filter((k) => !stems.some((s) => s.stem === k));
  if (missing.length) {
    console.log("\nExpected but not found:");
    for (const m of missing) console.log(`  ${m}`);
  }

  console.log(GO ? "\n— applying —\n" : "\n— dry run, pass --go to apply —\n");

  for (const { file, stem } of stems) {
    const path = join(DIR, file);

    const hash = createHash("sha1").update(readFileSync(path)).digest("hex").slice(0, 8);

    // ---- replacement: new id, so the URL changes and caches cannot stick ----
    const slug = REPLACE[stem];
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          media: { orderBy: { position: "asc" }, select: { id: true, publicId: true } },
        },
      });
      if (!product) {
        console.log(`  ! no product with slug "${slug}" — skipped ${file}`);
        continue;
      }
      const publicId = `sanskar/studio/${slug}-${hash}`;
      const current = product.media[0];
      if (current?.publicId === publicId) {
        console.log(`  ${file}\n      -> ${product.name}\n      already current — skipped`);
        continue;
      }
      console.log(
        `  ${file}\n      -> ${product.name}\n      -> ${publicId}` +
          (current ? `\n         (was ${current.publicId})` : ""),
      );
      if (GO) {
        const res = await cloudinary.uploader.upload(path, {
          public_id: publicId,
          overwrite: true,
          resource_type: "image",
        });
        if (current) {
          await prisma.productMedia.update({
            where: { id: current.id },
            data: { publicId, kind: "IMAGE" },
          });
        } else {
          await prisma.productMedia.create({
            data: { productId: product.id, publicId, kind: "IMAGE", position: 0 },
          });
        }
        console.log(`      done ${res.width}x${res.height}`);
      }
      continue;
    }

    // ---- a piece that does not exist yet ----
    const spec = CREATE[stem];
    if (!spec) continue;

    const existing = await prisma.product.findUnique({
      where: { slug: spec.slug },
      select: { id: true, media: { orderBy: { position: "asc" }, select: { id: true, publicId: true } } },
    });
    const publicId = `sanskar/studio/${spec.slug}-${hash}`;
    if (existing?.media[0]?.publicId === publicId) {
      console.log(`  ${file}\n      -> ${spec.name} — already current, skipped`);
      continue;
    }
    console.log(
      `  ${file}\n      -> NEW: ${spec.name}${existing ? " (already exists — image only)" : ""}\n      -> ${publicId}`,
    );
    if (!GO) continue;

    const res = await cloudinary.uploader.upload(path, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });
    console.log(`      uploaded ${res.width}x${res.height}`);
    if (existing) {
      const cur = existing.media[0];
      if (cur) {
        await prisma.productMedia.update({ where: { id: cur.id }, data: { publicId, kind: "IMAGE" } });
      } else {
        await prisma.productMedia.create({
          data: { productId: existing.id, publicId, kind: "IMAGE", position: 0 },
        });
      }
      console.log("      media row repointed");
      continue;
    }

    const category = await prisma.category.findUnique({
      where: { slug: spec.categorySlug },
      select: { id: true },
    });
    if (!category) {
      console.log(`      ! no category "${spec.categorySlug}" — product not created`);
      continue;
    }
    const last = await prisma.product.findFirst({
      where: { categoryId: category.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const issued = await prisma.product.findMany({ select: { sku: true } });
    let n = 0;
    for (const { sku } of issued) {
      const m = /^SK-STU-(\d+)$/.exec(sku);
      if (m) n = Math.max(n, Number(m[1]));
    }

    const created = await prisma.product.create({
      data: {
        name: spec.name,
        slug: spec.slug,
        sku: `SK-STU-${String(n + 1).padStart(3, "0")}`,
        tagline: spec.tagline,
        description: spec.description,
        fabric: spec.fabric,
        color: spec.color,
        craft: spec.craft,
        price: spec.price * 100,
        categoryId: category.id,
        position: (last?.position ?? -1) + 1,
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        media: { create: [{ publicId, kind: "IMAGE", position: 0 }] },
        variants: {
          create: MEN_SIZES.map((s, i) => ({ size: s.size, stock: s.stock, position: i })),
        },
      },
      select: { sku: true, slug: true },
    });
    console.log(`      created ${created.sku}  /product/${created.slug}`);
  }

  console.log("");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
