import { prisma } from "@/lib/db";
import { PageHead } from "@/components/admin/PageHead";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const tops = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    include: {
      _count: { select: { products: true } },
      children: {
        orderBy: { position: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });

  return (
    <div>
      <PageHead
        title="Navigation"
        blurb="This is the site menu. Top-level entries are the header options; their children are the sub-options that open beneath them. Use the arrows to move an entry forward or back — the storefront follows this order exactly."
      />
      <CategoryManager
        tree={tops.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description ?? "",
          imageId: t.imageId ?? "",
          position: t.position,
          isActive: t.isActive,
          featured: t.featured,
          parentId: null,
          productCount: t._count.products,
          children: t.children.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description ?? "",
            imageId: c.imageId ?? "",
            position: c.position,
            isActive: c.isActive,
            featured: c.featured,
            parentId: t.id,
            productCount: c._count.products,
            children: [],
          })),
        }))}
      />
    </div>
  );
}
