import type { Metadata } from "next";
import Link from "next/link";
import { towns } from "@/lib/towns";

// Service-areas hub (SEO playbook rows 82/97): every town page in one place,
// from lib/towns.ts (the same list the sitemap and the town pages use).
export const metadata: Metadata = {
  title: { absolute: "Service Areas | Powered Up LLC | Taunton, MA Electrician" },
  description: `Powered Up LLC serves ${towns.map((t) => t.townName).join(", ")} and the towns around them, across the South Shore and Greater Boston.`,
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreasPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Service Areas</div>
          <h1>
            Based in Taunton.<br />
            <em className="accent">Across the South Shore.</em>
          </h1>
          <p className="page-header-sub">
            Based in Taunton, serving every town within roughly a 45-minute drive — across the
            Greater Boston area and the South Shore.
          </p>
        </div>
      </section>

      <section id="area" className="area">
        <div className="wrap">
          <div className="towns-grid">
            {towns.map((t, i) => (
              <Link href={`/${t.slug}`} className={`town${i === 0 ? " hub" : ""}`} key={t.slug}>
                {t.townName}
              </Link>
            ))}
          </div>

          <div className="area-cta">
            <span className="area-cta-text">Don&apos;t see your town?</span>
            <a href="tel:+15086225919" className="btn btn-primary">
              Call (508) 622-5919
            </a>
          </div>
          <p className="sub-section" style={{ marginTop: 28 }}>
            See <Link href="/services">every service</Link> Micah handles in these towns.
          </p>
        </div>
      </section>
    </>
  );
}
