import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/site/SiteChrome";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import { CONTENT } from "@/lib/content";
import { STILLS } from "@/lib/media-library";

/**
 * The editorial pages (client care, the house, legal) share a layout and all
 * live in `lib/content.ts`, so they are one route rather than nine files.
 */
export function generateStaticParams() {
  return Object.keys(CONTENT).map((page) => ({ page }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const content = CONTENT[page];
  if (!content) return { title: "Not found" };
  return { title: content.title, description: content.blurb };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const content = CONTENT[page];
  if (!content) notFound();

  return (
    <SiteChrome>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        blurb={content.blurb}
        publicId={STILLS[content.art % STILLS.length]}
      />
      <Prose blocks={content.blocks} />
    </SiteChrome>
  );
}
