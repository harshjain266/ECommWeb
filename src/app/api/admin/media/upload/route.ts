import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-guard";
import { uploadBuffer, cloudinaryConfigured } from "@/lib/cloudinary";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB, to allow atelier video clips

const ALLOWED = /\.(jpe?g|png|webp|avif|heic|heif|mov|mp4|m4v|webm)$/i;

/**
 * Upload an asset to Cloudinary and return its public id, ready to attach to
 * a product, banner or category.
 *
 * HEIC and .mov are accepted on purpose -- the whole studio shoots on iPhone,
 * and the delivery layer transcodes them on the way out.
 */
export const POST = withAdmin(async (req) => {
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env to enable uploads.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That file is over the ${MAX_BYTES / 1024 / 1024}MB limit` },
      { status: 413 },
    );
  }
  if (!ALLOWED.test(file.name)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, HEIC, MP4 or MOV." },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadBuffer(buffer, file.name);

  return NextResponse.json({ ok: true, ...result });
});
