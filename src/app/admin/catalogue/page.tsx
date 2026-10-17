import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { CatalogueManager } from "@/components/admin/CatalogueManager";

export const dynamic = "force-dynamic";

/**
 * The per-category catalogue screen: pick a category on the left, then add,
 * reorder, restock or remove its pieces on the right.
 */
export default async function AdminCatalogue({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;

  const tops = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      position: true,
      isActive: true,
      _count: { select: { products: true } },
      children: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          position: true,
          isActive: true,
          menuGroup: true,
          _count: { select: { products: true } },
        },
      },
    },
  });

  // Default to the first sub-category that actually holds pieces.
  const fallback =
    tops.flatMap((t) => t.children).find((c) => c._count.products > 0)?.id ??
    tops[0]?.children[0]?.id ??
    tops[0]?.id ??
    null;

  const selectedId = cat ?? fallback;

  const selected = selectedId
    ? await prisma.category.findUnique({
        where: { id: selectedId },
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { name: true } },
        },
      })
    : null;

  const products = selectedId
    ? await prisma.product.findMany({
        where: { categoryId: selectedId },
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          isActive: true,
          position: true,
          media: {
            orderBy: { position: "asc" },
            take: 1,
            select: { publicId: true, kind: true },
          },
          variants: {
            orderBy: { position: "asc" },
            select: { id: true, size: true, stock: true },
          },
          _count: { select: { orderItems: true } },
        },
      })
    : [];

  const allCategories = tops.flatMap((t) => [
    { id: t.id, label: t.name },
    ...t.children.map((c) => ({ id: c.id, label: `   ${t.name} → ${c.name}` })),
  ]);

  return (
    <div>
      <PageHead
        title="Catalogue"
        blurb="Every category and the pieces inside it. Add, reorder, restock or remove items here — the storefront follows this order exactly."
      />
      <CatalogueManager
        tree={tops.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          isActive: t.isActive,
          productCount: t._count.products,
          children: t.children.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            isActive: c.isActive,
            menuGroup: c.menuGroup,
            productCount: c._count.products,
          })),
        }))}
        selected={
          selected
            ? {
                id: selected.id,
                name: selected.name,
                slug: selected.slug,
                parentName: selected.parent?.name ?? null,
              }
            : null
        }
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          isActive: p.isActive,
          orderCount: p._count.orderItems,
          image: p.media[0]
            ? { publicId: p.media[0].publicId, kind: p.media[0].kind }
            : null,
          variants: p.variants,
        }))}
        allCategories={allCategories}
      />
    </div>
  );
}
