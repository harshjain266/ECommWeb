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
  imageKind: "IMAGE" | "VIDEO";
  children: NavChild[];
};

/** Column headings in the mega menu, in render order. */
export const GROUP_LABELS: Record<MenuGroup, string> = {
  OCCASION: "Shop By Occasion",
  CATEGORY: "Shop By Category",
  COLLECTION: "Shop By Collection",
};

/**
 * Which columns the menu actually renders, in order.
 *
 * COLLECTION is deliberately absent: the house asked for the "Shop By
 * Collection" column to come out of the menu. The group itself is kept (the
 * type, the label, the stored values) so categories already tagged COLLECTION
 * keep their tag and stay reachable at their own URLs -- they simply no
 * longer get a column. Put "COLLECTION" back in this array to restore it.
 */
export const GROUP_ORDER: MenuGroup[] = ["OCCASION", "CATEGORY"];

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
