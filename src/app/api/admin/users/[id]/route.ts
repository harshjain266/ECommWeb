import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/admin-guard";
import { isAdminRequest } from "@/lib/auth";
import { userRoleSchema, fieldErrors } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = userRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unknown role", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const session = await isAdminRequest();

  // Guard against an admin demoting themselves and locking everyone out of
  // the console, and against removing the last remaining admin.
  if (session?.userId === id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot remove your own administrator access" },
      { status: 409 },
    );
  }
  if (parsed.data.role === "CUSTOMER") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "There must be at least one administrator" },
        { status: 409 },
      );
    }
  }

  await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({ ok: true, id, role: parsed.data.role });
});
