import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { mergeAnonymousCart } from "@/lib/cart";
import { registerSchema, fieldErrors } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password: await hashPassword(password),
        // Role is never taken from the request body -- self-registration is
        // always a customer. Admins are promoted from the admin panel.
        role: "CUSTOMER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await createSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await mergeAnonymousCart(user.id);

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "An account with that email already exists",
          fields: { email: "Already registered — try signing in instead" },
        },
        { status: 409 },
      );
    }
    console.error("register failed", err);
    return NextResponse.json({ error: "Could not create the account" }, { status: 500 });
  }
}
