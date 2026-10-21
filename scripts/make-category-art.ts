/* eslint-disable no-console */
/**
 * Generate and publish the per-category artwork.
 *
 *   npx tsx scripts/make-category-art.ts --dry     # write previews only
 *   npx tsx scripts/make-category-art.ts           # upload + point the DB at it
 *   npx tsx scripts/make-category-art.ts --force   # also replace real photography
 *
 * Why this exists: the studio supplied 47 assets for 50+ shelves, so the seed
 * had to reuse the same still in several unrelated places -- Men > Sherwanis
 * and Women > Sarees were sharing one photograph. Rather than keep recycling,
 * every shelf gets its own generated print, which the admin can swap for real
 * photography one shelf at a time as it is shot.
 *
 * The output is SVG: a few KB each instead of a few MB, and resolution
 * independent, which is the cheapest possible answer to "keep it lightweight".
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { categoryArt } from "./lib/art";

process.loadEnvFile?.(".env");

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "sanskar";
const PREVIEW_DIR = ".art-preview";

/**
 * Colourways per house, so a parent's shelves read as one family: menswear
 * stays in the olive/ink register of the real bandhgalas, womenswear in the
 * rose/oxblood one, jewellery dark so metal reads against it.
 */
const FAMILY: Record<string, string[]> = {
  men: ["olive", "ink", "jade", "bone"],
  women: ["rose", "oxblood", "ivory", "clay"],
  jewellery: ["ink", "oxblood", "bone"],
  occasion: ["oxblood", "rose", "clay", "jade"],
  "new-collection": ["ivory", "bone", "clay"],
};

function configureCloud() {
  const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary keys missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env, or pass --dry.",
    );
  }
  cloudinary.config({
    cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

async function upload(slug: string, svg: string): Promise<string> {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: `${FOLDER}/art`,
    public_id: slug,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
  return String(res.public_id);
}

async function main() {
  if (!DRY) configureCloud();
  mkdirSync(PREVIEW_DIR, { recursive: true });

  const cats = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { position: "asc" }],
  });
  const byId = new Map(cats.map((c) => [c.id, c]));

  // The seed had 47 assets for 52 shelves, so it dealt them round-robin and
  // every tile ended up sharing its still with another shelf. A publicId used
  // by more than one category is therefore filler, not a chosen photograph.
  const uses = new Map<string, number>();
  for (const c of cats) {
    if (c.imageId) uses.set(c.imageId, (uses.get(c.imageId) ?? 0) + 1);
  }

  let made = 0;
  let skipped = 0;
  let bytes = 0;

  for (const cat of cats) {
    const parent = cat.parentId ? byId.get(cat.parentId) : undefined;
    const family = FAMILY[parent?.slug ?? cat.slug];

    // Replace generated art (so re-runs are idempotent) and recycled filler.
    // A uniquely-used publicId is someone's deliberate choice -- leave it.
    const isGenerated = (cat.imageId ?? "").includes(`${FOLDER}/art/`);
    const isFiller = !cat.imageId || (uses.get(cat.imageId) ?? 0) > 1;
    if (!isGenerated && !isFiller && !FORCE) {
      skipped++;
      continue;
    }

    const svg = categoryArt(cat.slug, { palettes: family });
    bytes += Buffer.byteLength(svg);
    writeFileSync(`${PREVIEW_DIR}/${cat.slug}.svg`, svg);

    if (!DRY) {
      const publicId = await upload(cat.slug, svg);
      await prisma.category.update({ where: { id: cat.id }, data: { imageId: publicId } });
    }
    made++;
    console.log(`  ${DRY ? "drew" : "published"}  ${cat.slug}`);
  }

  console.log(
    `\n${made} tiles ${DRY ? "drawn" : "published"}, ${skipped} left on real photography.` +
      `\nAverage size ${(bytes / Math.max(made, 1) / 1024).toFixed(1)} KB.` +
      `\nPreviews in ./${PREVIEW_DIR}/`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
