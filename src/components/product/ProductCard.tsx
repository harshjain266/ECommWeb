"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CldImage } from "@/components/ui/CldImage";
import { CldVideo } from "@/components/ui/CldVideo";
import { WishlistButton } from "./WishlistButton";
import { formatINR, discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import { NoImage } from "@/components/ui/NoImage";

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: number;
  compareAtPrice: number | null;
  isNewArrival: boolean;
  category: { name: string; slug: string } | null;
  media: { publicId: string; kind: "IMAGE" | "VIDEO" }[];
};

/**
 * Catalogue tile. Hovering swaps the still for the product's clip (or its
 * second still, when there is no clip) -- the detail that makes a couture
 * grid feel alive without autoplaying a dozen videos at once.
 */
export function ProductCard({
  product,
  index = 0,
  sizes = "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw",
  saved = false,
}: {
  product: CardProduct;
  index?: number;
  sizes?: string;
  /** Whether the signed-in visitor already has this on their wishlist. */
  saved?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const primary = product.media[0];
  const secondary = product.media.find((m, i) => i > 0 && m.kind === "VIDEO")
    ?? product.media[1]
    ?? null;

  const off = discountPercent(product.price, product.compareAtPrice);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index, 7) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      {/*
        The heart sits outside the anchor on purpose: a <button> inside an <a>
        is invalid HTML and breaks hydration. The article is the positioning
        context, so it still lands on the image.
      */}
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton productId={product.id} initiallySaved={saved} />
      </div>

      <div className="relative overflow-hidden bg-bone-warm">
        <Link href={`/product/${product.slug}`} className="block">
          {/* base still */}
          {primary ? (
            <CldImage
              publicId={primary.publicId}
              alt={product.name}
              ratio="3/4"
              sizes={sizes}
              fromVideo={primary.kind === "VIDEO"}
              imgClassName={cn(
                "transition-all duration-[1400ms] ease-couture",
                hovered && secondary ? "scale-[1.04] opacity-0" : "scale-100 opacity-100",
              )}
            />
          ) : (
            <NoImage />
          )}

          {/* hover layer, only mounted once hovered so nothing is prefetched */}
          {secondary && hovered && (
            <div className="absolute inset-0 animate-[fade-up_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]">
              {secondary.kind === "VIDEO" ? (
                <CldVideo
                  publicId={secondary.publicId}
                  ratio="3/4"
                  width={640}
                  lazy={false}
                  priority
                  className="h-full w-full"
                />
              ) : (
                <CldImage
                  publicId={secondary.publicId}
                  alt={`${product.name}, alternate view`}
                  ratio="3/4"
                  sizes={sizes}
                  priority
                />
              )}
            </div>
          )}

          {/* badges */}
          <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1.5 p-3.5">
            {product.isNewArrival && (
              <span className="label bg-bone/95 px-2.5 py-1.5 text-ink">New</span>
            )}
            {off !== null && (
              <span className="label bg-oxblood px-2.5 py-1.5 text-bone">
                {off}% off
              </span>
            )}
          </div>

        </Link>

        {/*
          The hover actions are siblings of the product anchor, never children
          of it: a second <a> inside an <a> is invalid HTML and breaks
          hydration. The wrapper above is the positioning context, so the strip
          still lands on the image.
        */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full transition-transform duration-500 ease-couture group-hover:translate-y-0 group-focus-within:translate-y-0">
          <Link
            href={`/product/${product.slug}`}
            className="label flex-1 bg-bone/95 px-3 py-3.5 text-center text-ink transition-colors duration-300 hover:bg-bone"
          >
            View
          </Link>
          <Link
            href={`/atelier?piece=${encodeURIComponent(product.slug)}`}
            className="label flex-1 bg-ink px-3 py-3.5 text-center text-bone transition-colors duration-300 hover:bg-oxblood"
          >
            Book a fitting
          </Link>
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="block pt-4">
        <div>
          {product.category && (
            <p className="label text-ink-mute/60">{product.category.name}</p>
          )}
          <h3 className="mt-1.5 font-display text-[20px] font-light leading-snug text-ink">
            {product.name}
          </h3>
          {product.tagline && (
            <p className="mt-1 font-sans text-[12px] leading-relaxed text-ink-mute/75">
              {product.tagline}
            </p>
          )}
          <p className="mt-2.5 flex items-baseline gap-2.5 font-sans text-[13px]">
            <span className="text-ink">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-ink-mute/50 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
