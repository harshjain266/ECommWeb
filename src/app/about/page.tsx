import type { Metadata } from "next";
import { AboutView } from "@/components/site/AboutView";
import { findAboutSection } from "@/lib/about";

const section = findAboutSection("");

export const metadata: Metadata = {
  title: section?.title ?? "About Us",
  description: section?.blurb,
};

export default function AboutPage() {
  return <AboutView slug="" />;
}
