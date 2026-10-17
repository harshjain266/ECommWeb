import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { Hero, type HeroSlide } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { OccasionEdit, type EditTile } from "@/components/site/OccasionEdit";
import { VideoTrio } from "@/components/site/VideoTrio";
import { DiwaliCarousel } from "@/components/site/DiwaliCarousel";
import { Testimonials } from "@/components/site/Testimonials";
import { EditorialSplit } from "@/components/site/EditorialSplit";
import { CraftStats } from "@/components/site/CraftStats";
import { SectionHead } from "@/components/site/SectionHead";
import { ProductGrid, cardSelect } from "@/components/product/ProductGrid";
import { ExploreButton } from "@/components/ui/ExploreButton";
import { getWishlistIds } from "@/lib/wishlist";

export const revalidate = 60;

export default async function HomePage() {
  const [
    heroBanners,
    editorials,
    diwali,
    featured,
    newArrivals,
    testimonials,
    clipRows,
    wishlist,
  ] = await Promise.all([
    prisma.banner.findMany({
      where: { slot: "HERO", isActive: true },
      orderBy: { position: "asc" },
    }),
    prisma.banner.findMany({
      where: { slot: "EDITORIAL", isActive: true },
      orderBy: { position: "asc" },
    }),
    prisma.banner.findMany({
      where: { slot: "DIWALI", isActive: true },
      orderBy: { position: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { position: "asc" },
      take: 8,
      select: cardSelect,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: cardSelect,
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
    prisma.productMedia.findMany({
      where: { kind: "VIDEO" },
      orderBy: { id: "asc" },
      take: 14,
      select: { publicId: true },
    }),
    getWishlistIds(),
  ]);

  const slides: HeroSlide[] = heroBanners.map((b) => ({
    id: b.id,
    eyebrow: b.eyebrow,
    title: b.title,
    subtitle: b.subtitle,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
    publicId: b.publicId,
    kind: b.kind,
  }));

  // The same clip is attached to more than one product, so de-duplicate.
  const clips = [...new Set(clipRows.map((c) => c.publicId))];

  const occasionTiles: EditTile[] = [
    {
      label: "Carnival",
      href: "/collections/sangeet-cocktail",
      publicId: clips[1] ?? clips[0],
      kind: "VIDEO",
    },
    {
      label: "Sangeet",
      href: "/collections/mehendi",
      publicId: clips[2] ?? clips[0],
      kind: "VIDEO",
    },
    {
      label: "Wedding",
      href: "/collections/wedding-pheras",
      publicId: clips[3] ?? clips[0],
      kind: "VIDEO",
    },
  ];

  const trio = [
    { publicId: clips[4], label: "Groom Edits", href: "/collections/groom-edits" },
    { publicId: clips[5], label: "Festive Vibe", href: "/collections/festive-vibe" },
    { publicId: clips[6], label: "Ceremony Edits", href: "/collections/ceremony-edits" },
  ].filter((t) => Boolean(t.publicId));

  return (
    <SiteChrome overHero>
      {/* ---- 1st screen: the hero films ---- */}
      <Hero slides={slides} />

      <Marquee />

      {/* ---- 2nd scroll: the statement + the occasion edit ---- */}
      <OccasionEdit tiles={occasionTiles} />

      {/* ---- 3rd scroll: the edit buttons ---- */}
      <section className="bg-bone py-14">
        <div className="shell flex flex-wrap items-center justify-center gap-3">
          <ExploreButton
            href="/collections/groom-edits"
            label="Groom Edits"
            variant="inline"
          />
          <ExploreButton
            href="/collections/festive-vibe"
            label="Festive Vibe"
            variant="inline"
          />
          <ExploreButton
            href="/collections/ceremony-edits"
            label="Ceremony Edits"
            variant="inline"
          />
          <Link href="/collections/all" className="btn-dark">
            View all designs
          </Link>
        </div>
      </section>

      {/* ---- the films, three across, centre one unmutable ---- */}
      <VideoTrio items={trio as { publicId: string; label: string; href: string }[]} />

      {/* ---- signature pieces ---- */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="shell">
          <SectionHead
            eyebrow="The signature pieces"
            title="Chosen by the atelier"
            blurb="The pieces we would put forward first — either because of what went into them, or because of how they photograph in person."
            href="/collections/all"
            hrefLabel="View all designs"
          />
          <div className="mt-14">
            <ProductGrid products={featured} wishlist={wishlist} />
          </div>
        </div>
      </section>

      {/* ---- 4th scroll: the festive carousel ---- */}
      <DiwaliCarousel
        slides={diwali.map((b) => ({
          id: b.id,
          eyebrow: b.eyebrow,
          title: b.title,
          subtitle: b.subtitle,
          ctaLabel: b.ctaLabel,
          ctaHref: b.ctaHref,
          publicId: b.publicId,
          kind: b.kind,
        }))}
      />

      {/* ---- jewellery, the other half of the house ---- */}
      {editorials[0] && (
        <EditorialSplit
          eyebrow={editorials[0].eyebrow}
          title={editorials[0].title}
          body={editorials[0].subtitle ?? ""}
          ctaLabel={editorials[0].ctaLabel}
          ctaHref={editorials[0].ctaHref}
          publicId={editorials[0].publicId}
          kind={editorials[0].kind}
          tone="dark"
        />
      )}

      <CraftStats />

      {/* ---- new arrivals ---- */}
      {newArrivals.length > 0 && (
        <section className="bg-bone-warm py-20 lg:py-28">
          <div className="shell">
            <SectionHead
              eyebrow="Just off the floor"
              title="New this season"
              blurb="Added as each piece is finished, which is why the list is short and changes often."
              href="/collections/new-collection"
              hrefLabel="All new arrivals"
            />
            <div className="mt-14">
              <ProductGrid products={newArrivals} wishlist={wishlist} />
            </div>
          </div>
        </section>
      )}

      {/* ---- 5th scroll: in their own words ---- */}
      <Testimonials
        items={testimonials.map((t) => ({
          id: t.id,
          author: t.author,
          occasion: t.occasion,
          quote: t.quote,
          publicId: t.publicId,
          kind: t.kind,
        }))}
      />

      {/* ---- the atelier ---- */}
      {editorials[1] && (
        <EditorialSplit
          eyebrow={editorials[1].eyebrow}
          title={editorials[1].title}
          body={editorials[1].subtitle ?? ""}
          ctaLabel={editorials[1].ctaLabel}
          ctaHref={editorials[1].ctaHref}
          publicId={editorials[1].publicId}
          kind={editorials[1].kind}
          flip
        />
      )}

      {/* ---- appointment ---- */}
      <section className="bg-ink py-24 text-center lg:py-32">
        <div className="shell">
          <p className="label text-gold">The bridal studio</p>
          <h2 className="display mx-auto mt-6 max-w-3xl text-[clamp(2.2rem,6vw,4.4rem)] text-bone">
            Nine months. Three fittings. One piece that exists only once.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-bone/60">
            Bridal commissions open roughly nine months before the date. You will
            meet the karigars doing the work, and you will see the piece three
            times before it is finished.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/atelier" className="btn-gold">
              Request an appointment
            </Link>
            <Link href="/about" className="btn-outline-light">
              About the house
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
