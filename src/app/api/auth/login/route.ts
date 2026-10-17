import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";
import { mergeAnonymousCart } from "@/lib/cart";
import { loginSchema, fieldErrors } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Deliberately identical response for "no such user" and "wrong password",
  // so the endpoint cannot be used to enumerate registered emails.
  const ok = user ? await verifyPassword(password, user.password) : false;
  if (!user || !ok) {
    return NextResponse.json(
      { error: "That email and password do not match" },
      { status: 401 },
    );
  }

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await mergeAnonymousCart(user.id);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    // The client uses this to decide where to land after sign-in.
    redirect: user.role === "ADMIN" ? "/admin" : "/account",
  });
}
