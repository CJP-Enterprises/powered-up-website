import ServicePageLayout from "@/components/ServicePageLayout";
import { services } from "@/lib/services";

const data = services.find((s) => s.slug === "lighting")!;

export const metadata = {
  title: { absolute: data.metaTitle },
  description: data.metaDescription,
  alternates: { canonical: "https://www.poweredbymicah.com/services/lighting" },
};

export default function Page() {
  return <ServicePageLayout {...data} />;
}
