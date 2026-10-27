import "server-only";
import { prisma } from "@/lib/db";
import { toMenuGroup, type NavItem } from "@/lib/nav-shared";

export type { NavItem, NavChild, MenuGroup } from "@/lib/nav-shared";
export { groupChildren, GROUP_LABELS, GROUP_ORDER } from "@/lib/nav-shared";

/**
 * The shoppable navigation, read from the Category table so the boutique can
 * restructure the menu from the admin console without a deploy.
 *
 * Wishlist and About Us also sit in the header, but they are pages rather
 * than categories, so the header appends them as static links.
 */
export async function getNav(): Promise<NavItem[]> {
  const tops = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { position: "asc" },
    select: {
      name: true,
      slug: true,
      description: true,
      featured: true,
      imageId: true,
      imageKind: true,
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        select: { name: true, slug: true, description: true, menuGroup: true },
      },
    },
  });

  return tops.map((t) => ({
    ...t,
    children: t.children.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      group: toMenuGroup(c.menuGroup),
    })),
  }));
}
