/* eslint-disable no-console */
/**
 * Retouch the studio-floor photography and republish it as its own asset.
 *
 *   npx tsx scripts/retouch-studio.ts --dry   # print the recipes and URLs
 *   npx tsx scripts/retouch-studio.ts         # publish + repoint the DB
 *
 * These were shot on a phone on the shop floor, so the frame carries rails,
 * hangers, the wooden floor and whatever was hanging alongside. Two recipes
 * are used, picked per photograph rather than applied blanket:
 *
 *   "cutout"    Cloudinary's AI background removal, then padded onto the
 *               site's bone ground. Only used where the garment is genuinely
 *               isolated -- on a rail it cannot separate overlapping clothes
 *               and leaves ghosts of the neighbours, which looks worse than
 *               the honest original.
 *
 *   "smartcrop" Content-aware crop to a consistent 3:4 with a colour grade.
 *               No cutout, so nothing can be eaten off an embroidered edge;
 *               the garment simply fills the frame and the clutter falls
 *               outside it.
 *
 * The result is uploaded as a new asset rather than left as a delivery-time
 * transform, so the retouched frame is what the admin sees and can replace,
 * and the original stays untouched underneath.
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

process.loadEnvFile?.(".env");

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");
const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "sanskar";
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** The site's bone ground, so a cutout sits on the page rather than on white. */
const GROUND = "ece0cd";
const OUT_W = 1400;

const GRADE = "e_improve,e_auto_contrast,e_vibrance:18,e_sharpen:45";
const CUTOUT_GRADE = "e_improve,e_sharpen:40";

type Recipe =
  | { kind: "cutout"; preCrop?: string }
  | { kind: "smartcrop" };

const PIECES: { slug: string; source: string; recipe: Recipe }[] = [
  {
    // Alone on a stand against a plain wall -- the one shot where the AI has a
    // clean edge to find, and it finds it.
    slug: "shikar-olive-linen-bandhgala",
    source: "whatsapp-image-2026-10-19-at-8-04-18-pm-eb32a11b5514",
    recipe: { kind: "cutout" },
  },
  {
    // On a stand, but with a yellow kurta crowding the left. Cropping in
    // first gives the cutout an edge it can actually follow.
    slug: "moti-bagh-ivory-sherwani",
    source: "whatsapp-image-2026-10-19-at-8-04-38-pm-22b8a5304cbc",
    recipe: { kind: "cutout", preCrop: "c_crop,g_center,w_0.62,h_0.95,x_0.06" },
  },
  {
    slug: "nautch-black-resham-bandhgala",
    source: "whatsapp-image-2026-10-19-at-8-05-42-pm-dfdf4416e7ee",
    recipe: { kind: "smartcrop" },
  },
  {
    slug: "khaki-jaal-tonal-sherwani",
    source: "whatsapp-image-2026-10-19-at-8-06-10-pm-77d85a833cce",
    recipe: { kind: "smartcrop" },
  },
  {
    slug: "baraat-ivory-herringbone-sherwani",
    source: "whatsapp-image-2026-10-19-at-8-06-26-pm-c4d8a8bd0903",
    recipe: { kind: "smartcrop" },
  },
  {
    slug: "zafar-black-jaal-jacket",
    source: "whatsapp-image-2026-10-19-at-8-11-10-pm-5c15c82ec764",
    recipe: { kind: "smartcrop" },
  },
  {
    slug: "qaiser-paisley-beaded-jacket",
    source: "whatsapp-image-2026-10-19-at-8-11-37-pm-f7cdbc9a331a",
    recipe: { kind: "smartcrop" },
  },
  {
    slug: "sitara-velvet-bandhgala",
    source: "whatsapp-image-2026-10-19-at-8-12-07-pm-e4c8a0d70e02",
    recipe: { kind: "smartcrop" },
  },
];

function transformUrl(source: string, recipe: Recipe): string {
  const id = `${FOLDER}/${source}`;
  const steps: string[] = [];

  if (recipe.kind === "cutout") {
    if (recipe.preCrop) steps.push(recipe.preCrop);
    steps.push("e_background_removal");
    steps.push(`c_pad,ar_3:4,b_rgb:${GROUND},w_${OUT_W}`);
    steps.push(`${CUTOUT_GRADE},f_jpg,q_auto:best`);
  } else {
    steps.push(`c_fill,g_auto,ar_3:4,w_${OUT_W}`);
    steps.push(`${GRADE},f_jpg,q_auto:best`);
  }

  return `https://res.cloudinary.com/${CLOUD}/image/upload/${steps.join("/")}/${id}`;
}

function configure() {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary keys missing from .env");
  }
  cloudinary.config({
    cloud_name: CLOUD,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * The first request for a derivative this size can answer 423 while
 * Cloudinary builds it (background removal especially is not instant), so
 * touch it until it is ready before asking the uploader to fetch it.
 */
async function waitForDerivative(url: string): Promise<void> {
  for (let attempt = 1; attempt <= 20; attempt++) {
    const res = await fetch(url, { method: "GET" });
    if (res.ok) {
      await res.arrayBuffer();
      return;
    }
    if (res.status === 423 || res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, Math.min(2500 * attempt, 20000)));
      continue;
    }
    throw new Error(`Derivative failed: HTTP ${res.status} for ${url}`);
  }
  throw new Error(`Derivative never became ready: ${url}`);
}

async function main() {
  if (!DRY) configure();

  let published = 0;

  for (const piece of PIECES) {
    const url = transformUrl(piece.source, piece.recipe);

    if (DRY) {
      console.log(`\n${piece.slug}  [${piece.recipe.kind}]\n  ${url}`);
      continue;
    }

    await waitForDerivative(url);

    const res = await cloudinary.uploader.upload(url, {
      folder: `${FOLDER}/studio`,
      public_id: piece.slug,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      context: { source: piece.source, recipe: piece.recipe.kind },
    });
    const publicId = String(res.public_id);

    // Repoint the product's imagery at the retouched frame.
    const product = await prisma.product.findUnique({
      where: { slug: piece.slug },
      select: { id: true },
    });
    if (!product) {
      console.warn(`  ! no product "${piece.slug}" — run add-studio-pieces first`);
      continue;
    }

    await prisma.productMedia.updateMany({
      where: { productId: product.id, publicId: `${FOLDER}/${piece.source}` },
      data: { publicId },
    });

    // Any shelf still pointing at the raw frame follows it across.
    await prisma.category.updateMany({
      where: { imageId: `${FOLDER}/${piece.source}` },
      data: { imageId: publicId },
    });

    published++;
    console.log(
      `  ${piece.recipe.kind.padEnd(10)} ${publicId.padEnd(44)} ` +
        `${res.width}x${res.height}  ${(Number(res.bytes) / 1024).toFixed(0)} KB`,
    );
  }

  if (!DRY) console.log(`\n${published} frames retouched and repointed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
