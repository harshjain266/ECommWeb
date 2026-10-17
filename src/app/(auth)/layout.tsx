import { SiteChrome } from "@/components/site/SiteChrome";
import { CldImage } from "@/components/ui/CldImage";
import { STILLS } from "@/lib/media-library";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <div className="grid min-h-[calc(100svh-84px)] lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-16 sm:px-12 lg:px-16">
          {children}
        </div>
        <div className="relative hidden lg:block">
          <CldImage
            publicId={STILLS[2]}
            alt="From the atelier"
            priority
            sizes="50vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 scrim-b" />
          <div className="absolute inset-x-0 bottom-0 p-12">
            <p className="label text-gold-light">The atelier</p>
            <p className="display mt-3 max-w-sm text-[28px] text-bone">
              Every commission begins with a conversation and a tape measure.
            </p>
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}
