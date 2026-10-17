import { PageHead } from "@/components/admin/PageHead";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export default function AdminMedia() {
  return (
    <div>
      <PageHead
        title="Media library"
        blurb="Every asset in the studio's Cloudinary folder. Stills shot as HEIC and clips shot as HEVC .mov are stored as-is and transcoded on delivery — HEIC becomes WebP/AVIF, .mov becomes h264 mp4 — so they play in every browser without you converting anything."
      />
      <MediaLibrary uploadsEnabled={cloudinaryConfigured()} />
    </div>
  );
}
