/* eslint-disable no-console */
/**
 * Upload a folder of studio photography to Cloudinary.
 *
 *   npx tsx scripts/ingest-photos.ts ~/Desktop/incoming
 *
 * Prints the resulting public ids so they can be pasted into a seed or an
 * admin field. Re-running is safe: the public id is derived from the file's
 * content hash, so the same photograph always lands on the same id rather
 * than piling up duplicates every time the script is run.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, extname, basename } from "node:path";
import { v2 as cloudinary } from "cloudinary";

process.loadEnvFile?.(".env");

const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "sanskar";
const DIR = process.argv[2];
const IMAGE = /\.(jpe?g|png|webp|avif|heic|heif)$/i;
const VIDEO = /\.(mov|mp4|m4v|webm)$/i;

if (!DIR) {
  console.error("Usage: tsx scripts/ingest-photos.ts <directory>");
  process.exit(1);
}

function configure() {
  const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary keys missing from .env");
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

  const files = readdirSync(DIR)
    .filter((f) => IMAGE.test(f) || VIDEO.test(f))
    .filter((f) => statSync(join(DIR, f)).isFile())
    .sort();

  if (!files.length) {
    console.log(`No images or clips found in ${DIR}`);
    return;
  }

  console.log(`Uploading ${files.length} file(s) from ${DIR}\n`);
  const ids: string[] = [];

  for (const file of files) {
    const path = join(DIR, file);
    const buf = readFileSync(path);
    const isVideo = VIDEO.test(file);

    // Content hash, so a re-run overwrites rather than duplicating. The
    // original filename is kept in context for anyone auditing later.
    const digest = createHash("sha1").update(buf).digest("hex").slice(0, 12);
    const publicId = `${basename(file, extname(file))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)}-${digest}`;

    const res = await cloudinary.uploader.upload(path, {
      folder: FOLDER,
      public_id: publicId,
      overwrite: true,
      resource_type: isVideo ? "video" : "image",
      context: { original: file },
    });

    ids.push(String(res.public_id));
    console.log(
      `  ${String(res.public_id).padEnd(60)} ${res.width}x${res.height}  ` +
        `${(Number(res.bytes) / 1024).toFixed(0)} KB`,
    );
  }

  console.log(`\nDone. ${ids.length} asset(s) live.\n`);
  console.log(ids.map((id) => `  "${id}",`).join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
