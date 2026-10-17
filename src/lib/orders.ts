import "server-only";
import { prisma } from "@/lib/db";

/**
 * Allocate the next human-facing order number, e.g. SK-2026-0042.
 *
 * Done inside the caller's transaction and derived from a count, which is
 * fine at this volume; a high-write store would want a Postgres sequence.
 */
export async function nextOrderNumber(
  tx: Pick<typeof prisma, "order">,
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.order.count({
    where: { orderNumber: { startsWith: `SK-${year}-` } },
  });
  return `SK-${year}-${String(count + 1).padStart(4, "0")}`;
}
