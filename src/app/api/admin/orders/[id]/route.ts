import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { orderStatusSchema, fieldErrors } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unknown status", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const next = parsed.data.status;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: next } });

    // Cancelling or refunding a paid order returns its stock to the shelf;
    // guarded so repeated saves cannot credit stock twice.
    const wasCommitted = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
      order.status,
    );
    const nowReleased = next === "CANCELLED" || next === "REFUNDED";

    if (wasCommitted && nowReleased) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  return NextResponse.json({ ok: true, id, status: next });
});
