import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { ALL_ASSETS } from "@/lib/media-library";
import { cloudinaryConfigured, listFolderAssets } from "@/lib/cloudinary";

export type MediaAsset = {
  publicId: string;
  kind: "IMAGE" | "VIDEO";
  /** Where this asset is currently used, for the "in use" badge. */
  usedBy: string[];
  /** True for assets uploaded through the console (i.e. live in Cloudinary). */
  uploaded?: boolean;
};

/**
 * The media library.
 *
 * Three sources, unioned:
 *   1. the Cloudinary folder itself — only when API keys are configured;
 *      this is what makes a freshly uploaded file appear straight away
 *   2. the seeded manifest of the studio's original shoot
 *   3. anything already referenced by a product, banner or category
 *
 * Sources 2 and 3 mean the picker is still useful with no API keys at all —
 * keys are needed to upload and to enumerate, not to browse or attach.
 */
export const GET = withAdmin(async () => {
  const [productMedia, banners, categories] = await Promise.all([
    prisma.productMedia.findMany({
      select: { publicId: true, kind: true, product: { select: { name: true } } },
    }),
    prisma.banner.findMany({ select: { publicId: true, kind: true, title: true } }),
    prisma.category.findMany({
      where: { imageId: { not: null } },
      select: { imageId: true, name: true },
    }),
  ]);

  const map = new Map<string, MediaAsset>();

  const touch = (
    publicId: string,
    kind: "IMAGE" | "VIDEO",
    usedBy?: string,
    uploaded?: boolean,
  ) => {
    const existing = map.get(publicId);
    if (existing) {
      if (usedBy && !existing.usedBy.includes(usedBy)) existing.usedBy.push(usedBy);
      if (uploaded) existing.uploaded = true;
      return;
    }
    map.set(publicId, {
      publicId,
      kind,
      usedBy: usedBy ? [usedBy] : [],
      uploaded: uploaded ?? false,
    });
  };

  // 1. live folder contents
  let cloudError: string | null = null;
  const uploadsEnabled = cloudinaryConfigured();
  if (uploadsEnabled) {
    try {
      for (const a of await listFolderAssets()) {
        touch(a.publicId, a.kind, undefined, true);
      }
    } catch (err) {
      // A listing failure must not take the whole picker down — fall back to
      // the manifest and the database.
      cloudError =
        err instanceof Error ? err.message : "Could not list the Cloudinary folder";
      console.error("cloudinary listing failed", err);
    }
  }

  // 2. the original shoot
  for (const a of ALL_ASSETS) touch(a.publicId, a.kind);

  // 3. everything in use
  for (const m of productMedia) touch(m.publicId, m.kind, m.product.name);
  for (const b of banners) touch(b.publicId, b.kind, `Banner: ${b.title}`);
  for (const c of categories) {
    if (c.imageId) touch(c.imageId, "IMAGE", `Nav: ${c.name}`);
  }

  const assets = [...map.values()].sort((a, b) => {
    // Newly uploaded first, then stills, then clips.
    if (Boolean(a.uploaded) !== Boolean(b.uploaded)) return a.uploaded ? -1 : 1;
    if (a.kind !== b.kind) return a.kind === "IMAGE" ? -1 : 1;
    return a.publicId.localeCompare(b.publicId);
  });

  return NextResponse.json({
    assets,
    uploadsEnabled,
    cloudError,
    counts: {
      total: assets.length,
      images: assets.filter((a) => a.kind === "IMAGE").length,
      videos: assets.filter((a) => a.kind === "VIDEO").length,
      uploaded: assets.filter((a) => a.uploaded).length,
    },
  });
});
