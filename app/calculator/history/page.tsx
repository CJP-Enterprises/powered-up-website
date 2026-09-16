import { redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import { getSession } from "@/lib/calc-auth";

export const metadata = { title: { absolute: "Job History | Powered Up LLC" } };
export const dynamic = "force-dynamic";

type Row = {
  id: number;
  customer_name: string;
  job_address: string;
  job_date: string;
  recommended_service_size: number | null;
  created_at: string;
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect("/calculator/login");

  let rows: Row[] = [];
  try {
    const result = await sql<Row>`
      SELECT id, customer_name, job_address, job_date, recommended_service_size, created_at
      FROM calculations
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    rows = result.rows;
  } catch (e) {
    console.error("History query failed:", e);
  }

  return (
    <main style={{ background: "var(--navy)", minHeight: "80vh", padding: "40px 0 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <div style={eyebrow}>Powered Up LLC · Internal Tool</div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                color: "var(--cream)",
                margin: "8px 0 0",
              }}
            >
              Saved Job History
            </h1>
          </div>
          <Link href="/calculator" style={linkBtn}>
            ← Back to Calculator
          </Link>
        </div>

        <div
          style={{
            background: "var(--navy-mid)",
            border: "1px solid rgba(244,239,230,0.10)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {rows.length === 0 ? (
            <p style={{ padding: 40, textAlign: "center", color: "rgba(244,239,230,0.5)" }}>
              No saved calculations yet.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                  <tr>
                    {["Customer", "Address", "Date", "Rec. Service", "Created", "Actions"].map(
                      (h) => (
                        <th key={h} style={th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid rgba(244,239,230,0.08)" }}>
                      <td style={{ ...td, color: "var(--cream)", fontWeight: 600 }}>
                        {r.customer_name}
                      </td>
                      <td style={td}>{r.job_address}</td>
                      <td style={td}>{fmtDate(r.job_date)}</td>
                      <td style={td}>
                        {r.recommended_service_size ? (
                          <span style={{ color: "var(--yellow)", fontWeight: 700 }}>
                            {r.recommended_service_size} A
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={td}>{fmtDate(r.created_at)}</td>
                      <td style={td}>
                        <Link href={`/calculator?load=${r.id}`} style={loadLink}>
                          Load →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--yellow)",
  fontWeight: 700,
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 18px",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(244,239,230,0.6)",
  fontWeight: 700,
  background: "var(--navy-deep)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "14px 18px",
  fontSize: 14,
  color: "rgba(244,239,230,0.75)",
  verticalAlign: "middle",
};

const linkBtn: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--yellow)",
};

const loadLink: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--yellow)",
  whiteSpace: "nowrap",
};
