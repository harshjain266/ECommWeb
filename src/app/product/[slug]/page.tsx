import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { CustomisationDialog } from "@/components/product/CustomisationDialog";
import { ProductGrid, cardSelect } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/site/SectionHead";
import { imageUrl, videoPosterUrl } from "@/lib/media";
import { discountPercent, formatINR } from "@/lib/money";
import { getWishlistIds } from "@/lib/wishlist";

export const revalidate = 60;

const WHATSAPP = "919870196806";

type Params = { slug: string };

async function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true, parent: { select: { name: true, slug: true } } },
      },
      media: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Piece not found" };

  const hero = product.media[0];
  const og = hero
    ? hero.kind === "VIDEO"
      ? videoPosterUrl(hero.publicId, { width: 1200 })
      : imageUrl(hero.publicId, { width: 1200 })
    : undefined;

  return {
    title: product.name,
    description: product.tagline ?? product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.tagline ?? undefined,
      images: og ? [{ url: og, width: 1200, height: 1600 }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product || !product.isActive) notFound();

  const [related, wishlist] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      take: 4,
      orderBy: { position: "asc" },
      select: cardSelect,
    }),
    getWishlistIds(),
  ]);

  const off = discountPercent(product.price, product.compareAtPrice);

  const specs = [
    ["Fabric", product.fabric],
    ["Colour", product.color],
    ["Craft", product.craft],
    ["Reference", product.sku],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  const panels = [
    {
      label: "Product Information",
      body: [
        product.description,
        specs.map(([k, v]) => `${k}: ${v}`).join(" · "),
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    product.deliveryInfo && { label: "Delivery Timelines", body: product.deliveryInfo },
    product.disclaimer && { label: "Disclaimer", body: product.disclaimer },
    product.careNotes && { label: "Washcare", body: product.careNotes },
  ].filter(Boolean) as { label: string; body: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.media
      .filter((m) => m.kind === "IMAGE")
      .slice(0, 4)
      .map((m) => imageUrl(m.publicId, { width: 1200 })),
    brand: { "@type": "Brand", name: "Sanskar & Kabir" },
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "INR",
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const enquiry = encodeURIComponent(
    `Hello — I'd like to ask about ${product.name} (${product.sku}).`,
  );

  return (
    <SiteChrome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell py-8 lg:py-10">
        <nav
          aria-label="Breadcrumb"
          className="label flex flex-wrap items-center gap-2 text-ink-mute/60"
        >
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          {product.category?.parent && (
            <>
              <Link
                href={`/collections/${product.category.parent.slug}`}
                className="hover:text-ink"
              >
                {product.category.parent.name}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          {product.category && (
            <>
              <Link
                href={`/collections/${product.category.slug}`}
                className="hover:text-ink"
              >
                {product.category.name}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-ink/70">{product.name}</span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <ProductGallery
            items={product.media.map((m) => ({
              id: m.id,
              publicId: m.publicId,
              kind: m.kind,
              alt: m.alt,
            }))}
            name={product.name}
          />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              {product.isNewArrival && (
                <span className="label bg-ink px-2.5 py-1.5 text-bone">New</span>
              )}
              {off !== null && (
                <span className="label bg-oxblood px-2.5 py-1.5 text-bone">
                  {off}% off
                </span>
              )}
              {product.category && (
                <Link
                  href={`/collections/${product.category.slug}`}
                  className="label link-sweep text-ink-mute/70"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            <h1 className="display mt-4 text-[clamp(1.9rem,4.5vw,3rem)] text-ink">
              {product.name}
            </h1>

            {product.tagline && (
              <p className="mt-2.5 font-display text-[18px] font-light italic text-ink-mute">
                {product.tagline}
              </p>
            )}

            {product.compareAtPrice && (
              <p className="mt-2 font-sans text-sm text-ink-mute/60 line-through">
                {formatINR(product.compareAtPrice)}
              </p>
            )}

            <div className="mt-7">
              <AddToCart
                productId={product.id}
                basePrice={product.price}
                savedToWishlist={wishlist.includes(product.id)}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  size: v.size,
                  stock: v.stock,
                  priceDelta: v.priceDelta,
                }))}
              />
            </div>

            {product.customizable && (
              <div className="mt-2.5">
                <CustomisationDialog productName={product.name} sku={product.sku} />
              </div>
            )}

            <div className="mt-8">
              <ProductAccordion panels={panels} />
            </div>

            {/* ---- need help ---- */}
            <div className="mt-8">
              <p className="label text-ink-mute">Need help with the product?</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href="tel:+919870196806"
                  className="flex flex-col items-center gap-1.5 border border-ink/15 py-4 transition-colors hover:border-ink"
                >
                  <Phone className="h-4 w-4 text-ink-mute" strokeWidth={1.4} />
                  <span className="label text-ink">Call Us</span>
                </a>
                <a
                  href={`mailto:atelier@sanskarandkabir.com?subject=${enquiry}`}
                  className="flex flex-col items-center gap-1.5 border border-ink/15 py-4 transition-colors hover:border-ink"
                >
                  <Mail className="h-4 w-4 text-ink-mute" strokeWidth={1.4} />
                  <span className="label text-ink">Email Us</span>
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${enquiry}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex flex-col items-center gap-1.5 border border-ink/15 py-4 transition-colors hover:border-ink"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-ink-mute"
                    aria-hidden
                  >
                    <path d="M3.5 20.5 4.8 16A8.2 8.2 0 1 1 8 19.2l-4.5 1.3Z" />
                  </svg>
                  <span className="label text-ink">WhatsApp</span>
                </a>
              </div>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-4 border-t border-ink/10 pt-8">
              {[
                ["Made to measure", "Three fittings included"],
                ["Shipped free", "Across India, insured"],
                ["Hand-finished", "In our own Delhi studio"],
                ["Secure payment", "Cards, UPI and netbanking"],
              ].map(([title, sub]) => (
                <li key={title}>
                  <p className="label text-ink">{title}</p>
                  <p className="mt-1 font-sans text-[12px] text-ink-mute/70">{sub}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-bone-warm py-20 lg:py-24">
          <div className="shell">
            <Reveal>
              <SectionHead
                eyebrow="You may also like"
                title="From the same edit"
                href={
                  product.category ? `/collections/${product.category.slug}` : undefined
                }
                hrefLabel={product.category ? `All ${product.category.name}` : undefined}
              />
            </Reveal>
            <div className="mt-12">
              <ProductGrid products={related} wishlist={wishlist} />
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  );
}
