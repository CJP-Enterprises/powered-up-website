import { redirect } from "next/navigation";
import { getSession } from "@/lib/calc-auth";
import CalcLoginForm from "@/components/CalcLoginForm";

export const metadata = { title: { absolute: "Load Calculator Access | Powered Up LLC" } };

export default async function CalcLoginPage() {
  const session = await getSession();
  if (session) redirect("/calculator");

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        background: "var(--navy)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--navy-mid)",
          border: "1px solid rgba(244, 239, 230, 0.10)",
          borderTop: "3px solid var(--yellow)",
          borderRadius: 14,
          padding: "40px 34px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--yellow)",
            fontWeight: 700,
          }}
        >
          Powered Up LLC
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            lineHeight: 1.15,
            margin: "10px 0 6px",
            color: "var(--cream)",
          }}
        >
          Load Calculator Access
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(244, 239, 230, 0.55)",
            marginBottom: 26,
          }}
        >
          Private tool. Enter your credentials to continue.
        </p>

        <CalcLoginForm />
      </div>
    </main>
  );
}
