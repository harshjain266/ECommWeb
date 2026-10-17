import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

/**
 * Edge gate for the admin area and the account pages.
 *
 * This only checks that a *valid, signed* session exists and claims the ADMIN
 * role -- it cannot hit the database from the edge runtime. The authoritative
 * check is `requireAdmin()` in each admin page, which re-reads the role from
 * Postgres so a demoted admin loses access immediately rather than when their
 * token expires. Middleware is the cheap first pass; the page is the lock.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sk_session")?.value;
  const session = token ? await verifySession(token) : null;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=forbidden", req.url));
    }
  }

  if (pathname.startsWith("/account") && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
