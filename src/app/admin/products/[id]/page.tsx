import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategoryOptions } from "@/lib/category-options";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        media: { orderBy: { position: "asc" } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
    getCategoryOptions(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <PageHead
        title={product.name}
        blurb={`SKU ${product.sku}${product.isActive ? "" : " · currently hidden from the storefront"}`}
      />
      <Link
        href={`/product/${product.slug}`}
        target="_blank"
        className="label link-sweep mt-4 inline-block text-ink-mute"
      >
        View on the storefront
      </Link>

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          tagline: product.tagline ?? "",
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku,
          categoryId: product.categoryId,
          fabric: product.fabric ?? "",
          color: product.color ?? "",
          craft: product.craft ?? "",
          careNotes: product.careNotes ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          position: product.position,
          media: product.media.map((m) => ({
            publicId: m.publicId,
            kind: m.kind,
            alt: m.alt ?? "",
          })),
          variants: product.variants.map((v) => ({
            size: v.size,
            stock: v.stock,
            priceDelta: v.priceDelta,
          })),
        }}
      />
    </div>
  );
}
