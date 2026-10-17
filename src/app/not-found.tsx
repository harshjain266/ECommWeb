import Link from "next/link";
import { SiteChrome } from "@/components/site/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
      <div className="shell flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
        <p className="label text-gold">404</p>
        <h1 className="display mt-5 text-[clamp(2.4rem,7vw,4.5rem)] text-ink">
          This page is not in the collection
        </h1>
        <p className="mt-5 max-w-md text-pretty font-sans text-[15px] leading-relaxed text-ink-mute">
          The piece may have sold, or the link may have changed. The collections
          below are a good place to pick the thread back up.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-dark">
            Return home
          </Link>
          <Link href="/collections/bridal" className="btn-outline">
            The bridal edit
          </Link>
          <Link href="/search" className="btn-outline">
            Search
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
