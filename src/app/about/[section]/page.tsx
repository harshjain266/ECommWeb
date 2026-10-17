import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutView } from "@/components/site/AboutView";
import { ABOUT_SECTIONS, findAboutSection } from "@/lib/about";

export function generateStaticParams() {
  return ABOUT_SECTIONS.filter((s) => s.slug).map((s) => ({ section: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const found = findAboutSection(section);
  if (!found) return { title: "Not found" };
  return { title: found.title, description: found.blurb };
}

export default async function AboutSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!findAboutSection(section)) notFound();
  return <AboutView slug={section} />;
}
