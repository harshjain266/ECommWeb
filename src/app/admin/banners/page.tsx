import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { BannerManager } from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ slot: "asc" }, { position: "asc" }],
  });

  return (
    <div>
      <PageHead
        title="Homepage banners"
        blurb="The hero carousel and the two editorial panels. A clip in the HERO slot autoplays silently behind the headline; a still is shown with a slow push-in instead."
      />
      <BannerManager
        initial={banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle ?? "",
          eyebrow: b.eyebrow ?? "",
          ctaLabel: b.ctaLabel ?? "",
          ctaHref: b.ctaHref ?? "",
          publicId: b.publicId,
          kind: b.kind,
          slot: b.slot as "HERO" | "MARQUEE" | "EDITORIAL",
          position: b.position,
          isActive: b.isActive,
        }))}
      />
    </div>
  );
}
