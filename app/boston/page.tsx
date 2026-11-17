import TownPageLayout from "@/components/TownPageLayout";
import { towns } from "@/lib/towns";

const data = towns.find((t) => t.slug === "boston")!;

export const metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: "https://www.poweredbymicah.com/boston" },
  // Share image = this page's own hero job photo (SEO wave 5). Setting openGraph
  // replaces the layout's, so title/description/url go with it.
  openGraph: { type: "website", siteName: "Powered Up LLC", locale: "en_US", url: "https://www.poweredbymicah.com/boston", title: data.metaTitle, description: data.metaDescription, images: [data.heroPhoto] },
  twitter: { card: "summary_large_image", title: data.metaTitle, description: data.metaDescription, images: [data.heroPhoto] },
};

export default function Page() {
  return <TownPageLayout {...data} />;
}
