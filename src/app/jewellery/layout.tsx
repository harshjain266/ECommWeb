import { SiteChrome } from "@/components/site/SiteChrome";
import { JewelleryTabs } from "@/components/jewellery/JewelleryTabs";

export default function JewelleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      <JewelleryTabs />
      {children}
    </SiteChrome>
  );
}
