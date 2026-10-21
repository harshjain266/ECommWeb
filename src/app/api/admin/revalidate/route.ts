import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-guard";
import { invalidateNav, invalidateProducts } from "@/lib/catalog-cache";

/**
 * Flush the catalogue caches by hand.
 *
 * Writes made through the admin API invalidate themselves (see `withAdmin`),
 * but a maintenance script that talks to the database directly cannot -- and
 * `revalidateTag` only works inside a request. Without this the site serves
 * the old navigation and the old homepage for up to the revalidate window
 * after any such script, which looks exactly like the change not having
 * applied.
 */
export const POST = withAdmin(async () => {
  invalidateNav();
  invalidateProducts();
  return NextResponse.json({ ok: true, flushed: ["nav", "products"] });
});
