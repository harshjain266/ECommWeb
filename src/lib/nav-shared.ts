/**
 * Navigation types and pure helpers.
 *
 * Kept separate from `lib/nav.ts` (which is `server-only` because it reaches
 * for Prisma) so the client header can import `groupChildren` without
 * dragging the database layer into the browser bundle.
 */
export type MenuGroup = "OCCASION" | "CATEGORY" | "COLLECTION";

export type NavChild = {
  name: string;
  slug: string;
  description: string | null;
  group: MenuGroup;
};

export type NavItem = {
  name: string;
  slug: string;
  description: string | null;
  featured: boolean;
  imageId: string | null;
  children: NavChild[];
};

/** Column headings in the mega menu, in render order. */
export const GROUP_LABELS: Record<MenuGroup, string> = {
  OCCASION: "Shop By Occasion",
  CATEGORY: "Shop By Category",
  COLLECTION: "Shop By Collection",
};

export const GROUP_ORDER: MenuGroup[] = ["OCCASION", "CATEGORY", "COLLECTION"];

/** Split a nav item's children into the three mega-menu columns. */
export function groupChildren(children: NavChild[]) {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: children.filter((c) => c.group === group),
  })).filter((col) => col.items.length > 0);
}

/** Anything unlabelled falls into "Shop By Category". */
export function toMenuGroup(value: string | null | undefined): MenuGroup {
  return value === "OCCASION" || value === "COLLECTION" ? value : "CATEGORY";
}
