import "server-only";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdminRequest } from "@/lib/auth";
import { invalidateNav, invalidateProducts } from "@/lib/catalog-cache";

/**
 * Wrap an admin route handler so every one of them is role-checked the same
 * way. Returns 401/403 rather than redirecting, since these are fetch targets.
 *
 * Any successful write also drops the catalogue caches. Doing it here rather
 * than at each handler's return is deliberate: these handlers have a dozen
 * exit points between them, and a single missed invalidation would show up as
 * "I changed it in the admin and the site did not update", which is both
 * baffling to diagnose and indistinguishable from a bug. Over-invalidating
 * costs one extra query on the next request; under-invalidating costs trust.
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
      const res = await handler(req, ...rest);

      if (req.method !== "GET" && res.ok) {
        invalidateNav();
        invalidateProducts();
      }

      return res;
    } catch (err) {
      console.error("admin route failed", err);

      /*
       * Turn the database's own complaints into something an admin can act
       * on. A duplicate reference used to surface as a 500 carrying a raw
       * Prisma stack trace with internal bundle paths in it -- unreadable,
       * and it looked like the site was broken rather than like the form
       * needing one field changed.
       */
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          const fields = (err.meta?.target as string[] | undefined) ?? [];
          const label = fields.length ? fields.join(", ") : "value";
          return NextResponse.json(
            {
              error: `That ${label} is already in use. Pick another.`,
              fields: Object.fromEntries(fields.map((f) => [f, "Already in use"])),
            },
            { status: 422 },
          );
        }
        if (err.code === "P2025") {
          return NextResponse.json({ error: "That record no longer exists." }, { status: 404 });
        }
        if (err.code === "P2003") {
          return NextResponse.json(
            { error: "Something else still refers to this. Remove those first." },
            { status: 409 },
          );
        }
      }

      const message =
        err instanceof Error ? err.message : "Something went wrong";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
