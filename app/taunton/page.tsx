import TownPageLayout from "@/components/TownPageLayout";
import { towns } from "@/lib/towns";

const data = towns.find((t) => t.slug === "taunton")!;

export const metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: "https://www.poweredbymicah.com/taunton" },
};

export default function Page() {
  return <TownPageLayout {...data} />;
}
