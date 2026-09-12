import ServicePageLayout from "@/components/ServicePageLayout";
import { services } from "@/lib/services";

const data = services.find((s) => s.slug === "new-construction")!;

export const metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: "https://www.poweredbymicah.com/services/new-construction" },
};

export default function Page() {
  return <ServicePageLayout {...data} />;
}
