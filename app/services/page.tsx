import Link from "next/link";
import { services } from "@/lib/services";

export const metadata = {
  title: "Electrical Services in Taunton MA | Panels, EV, Lighting",
  description:
    "Full residential and light commercial electrical services across Taunton, the South Shore, and Greater Boston. Panel upgrades, EV chargers, new construction, remodels, wiring repair, lighting.",
  alternates: { canonical: "https://www.poweredbymicah.com/services" },
};

export default function ServicesIndex() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Full Service Menu</div>
          <h1>
            Every kind of electrical work.
            <br />
            <em>One licensed electrician.</em>
          </h1>
          <p className="page-header-sub">
            Powered Up LLC handles residential and light commercial electrical across Taunton, the
            South Shore, and Greater Boston. From an outlet swap on a Tuesday to a full-home rewire.
            Owner-operated by Micah Gentile.
          </p>
        </div>
      </section>

      <section className="services-index">
        <div className="wrap">
          <div className="services-grid">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="service">
                <div className="service-num">{s.homepageLabel}</div>
                <h3 className="service-title">{s.homepageTitle || s.serviceName}</h3>
                <p className="service-desc">{s.homepageDesc || s.heroSub}</p>
                <span className="service-arrow">
                  View service
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    style={{ width: 14, height: 14 }}
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="services-index-cta">
        <div className="wrap">
          <h2>Don&apos;t see your project on the list?</h2>
          <p>
            Micah handles a lot more than the six tiles above. If you have an electrical project not
            listed here, submit it through the booking form and Micah will confirm on the phone
            whether it&apos;s a fit.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/#book" className="btn btn-primary">
              Book a Call
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ width: 16, height: 16 }}
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a href="tel:+15086225919" className="btn btn-ghost">
              Call (508) 622-5919
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
