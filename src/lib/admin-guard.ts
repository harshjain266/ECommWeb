import "server-only";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

/**
 * Wrap an admin route handler so every one of them is role-checked the same
 * way. Returns 401/403 rather than redirecting, since these are fetch targets.
 */
export function withAdmin<T extends unknown[]>(
  handler: (req: Request, ...rest: T) => Promise<Response>,
) {
  return async (req: Request, ...rest: T): Promise<Response> => {
    const session = await isAdminRequest();
    if (!session) {
      return NextResponse.json(
        { error: "Administrator access required" },
        { status: 403 },
      );
    }
    try {
      return await handler(req, ...rest);
    } catch (err) {
      console.error("admin route failed", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
