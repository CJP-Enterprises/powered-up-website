import TownPageLayout from "@/components/TownPageLayout";
import { towns } from "@/lib/towns";

const data = towns.find((t) => t.slug === "quincy")!;

export const metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: "https://www.poweredbymicah.com/quincy" },
};

export default function Page() {
  return <TownPageLayout {...data} />;
}
