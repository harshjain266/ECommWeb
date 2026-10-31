import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";

const schema = z
  .object({
    status: z
      .enum(["NEW", "REVIEWING", "QUOTED", "IN_PROGRESS", "DELIVERED", "CLOSED"])
      .optional(),
    feePaid: z.boolean().optional(),
  })
  // Both fields are optional so either can be sent alone, which means an
  // empty body would otherwise parse as a valid no-op update.
  .refine((v) => v.status !== undefined || v.feePaid !== undefined, {
    message: "Nothing to update",
  });

export const PATCH = withAdmin(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const parsed = schema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
    }

    const existing = await prisma.commission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "No such commission" }, { status: 404 });
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, commission });
  },
);
