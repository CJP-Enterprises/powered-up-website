import { redirect } from "next/navigation";
import { getSession } from "@/lib/calc-auth";
import CalculatorForm from "@/components/CalculatorForm";

export const metadata = { title: { absolute: "Load Calculator | Powered Up LLC" } };

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ load?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/calculator/login");

  const { load } = await searchParams;
  const loadId = load && /^\d+$/.test(load) ? load : null;

  return <CalculatorForm loadId={loadId} />;
}
