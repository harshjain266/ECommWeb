import "server-only";
import { prisma } from "@/lib/db";

/**
 * Flatten the category tree into a select list, with sub-categories indented
 * beneath their parent so the shape of the nav is legible in a dropdown.
 */
export async function getCategoryOptions() {
  const tops = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      children: {
        orderBy: { position: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  const options: { id: string; label: string }[] = [];
  for (const top of tops) {
    options.push({ id: top.id, label: top.name });
    for (const child of top.children) {
      options.push({ id: child.id, label: `   ${top.name} → ${child.name}` });
    }
  }
  return options;
}
