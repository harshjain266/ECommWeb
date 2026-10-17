import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** The signed-in user's full record, or null. */
export async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  return user;
}

/** Gate a page on being signed in; bounces to /login with a return path. */
export async function requireUser(returnTo = "/account"): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/**
 * Gate a page on the ADMIN role. Re-reads the role from the database rather
 * than trusting the JWT alone, so revoking an admin takes effect immediately
 * instead of when their 30-day token expires.
 */
export async function requireAdmin(returnTo = "/admin"): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const fresh = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (fresh?.role !== "ADMIN") redirect("/?error=forbidden");
  return { ...session, role: "ADMIN" };
}

/** Same check, but for route handlers: returns a flag instead of redirecting. */
export async function isAdminRequest(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  const fresh = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  return fresh?.role === "ADMIN" ? session : null;
}
