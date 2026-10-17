import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Server-side Cloudinary, used only by the admin media routes (upload and
 * delete). Public delivery URLs are built as plain strings in `lib/media.ts`
 * and need none of this -- which is why browsing and attaching assets works
 * with no API keys at all, and only uploading requires them.
 */
export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinary() {
  if (!cloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env",
    );
  }
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "sanskar";

export type UploadResult = {
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  width?: number;
  height?: number;
  bytes: number;
  format: string;
};

/**
 * Stream a browser-sent file straight through to Cloudinary.
 *
 * HEIC stills and .mov clips are uploaded as-is: Cloudinary stores the
 * original and the delivery layer transcodes to web-safe formats on the way
 * out, so nothing needs converting here.
 */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
): Promise<UploadResult> {
  const cld = getCloudinary();
  const isVideo = /\.(mov|mp4|m4v|webm|avi|mkv)$/i.test(filename);

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: isVideo ? "video" : "image" },
      (error, res) =>
        error ? reject(error) : resolve(res as unknown as Record<string, unknown>),
    );
    stream.end(buffer);
  });

  return {
    publicId: String(result.public_id),
    kind: isVideo ? "VIDEO" : "IMAGE",
    width: typeof result.width === "number" ? result.width : undefined,
    height: typeof result.height === "number" ? result.height : undefined,
    bytes: Number(result.bytes ?? 0),
    format: String(result.format ?? ""),
  };
}

export type CloudAsset = {
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  bytes: number;
  createdAt: string;
};

/**
 * List everything actually sitting in the studio's Cloudinary folder.
 *
 * Without this the media library could only show assets it already knew
 * about — the seeded manifest plus whatever was attached to a product — so a
 * freshly uploaded file vanished from the picker until it was used somewhere.
 *
 * Images and videos are separate resource types in the Admin API, so both are
 * paged through and merged.
 */
export async function listFolderAssets(): Promise<CloudAsset[]> {
  const cld = getCloudinary();
  const out: CloudAsset[] = [];

  for (const resourceType of ["image", "video"] as const) {
    let cursor: string | undefined;
    // Cap the paging so a huge library cannot hang the request.
    for (let page = 0; page < 10; page++) {
      const res: {
        resources?: Record<string, unknown>[];
        next_cursor?: string;
      } = await cld.api.resources({
        type: "upload",
        prefix: `${UPLOAD_FOLDER}/`,
        resource_type: resourceType,
        max_results: 500,
        next_cursor: cursor,
      });

      for (const r of res.resources ?? []) {
        out.push({
          publicId: String(r.public_id),
          kind: resourceType === "video" ? "VIDEO" : "IMAGE",
          bytes: Number(r.bytes ?? 0),
          createdAt: String(r.created_at ?? ""),
        });
      }

      cursor = res.next_cursor;
      if (!cursor) break;
    }
  }

  // Newest first, which is what an admin expects right after uploading.
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function destroyAsset(
  publicId: string,
  kind: "IMAGE" | "VIDEO",
): Promise<void> {
  const cld = getCloudinary();
  await cld.uploader.destroy(publicId, {
    resource_type: kind === "VIDEO" ? "video" : "image",
  });
}
