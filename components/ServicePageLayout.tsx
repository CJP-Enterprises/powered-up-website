import Link from "next/link";
import QualifyForm from "@/components/QualifyForm";
import { towns } from "@/lib/towns";

const SITE_URL = "https://www.poweredbymicah.com";

const MARQUEE = [
  "New Construction Wiring",
  "Panel Upgrades · 100A · 200A · 400A",
  "EV Charger Installation",
  "Kitchen & Bath Remodels",
  "Federal Pacific Replacements",
  "Knob & Tube Remediation",
];

const Arrow = ({ w = "2.5" }: { w?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const Phone = ({ w = "2.2" }: { w?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export type ServicePageLayoutProps = {
  slug: string;
  serviceName: string;
  serviceValue: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSub: string;
  heroPhoto: string;
  bodyParagraphs: string[];
  faqs: Array<{ q: string; a: string }>;
  metaTitle: string;
  metaDescription: string;
};

export default function ServicePageLayout({
  slug,
  serviceName,
  serviceValue,
  heroTitle,
  heroTitleHighlight,
  heroSub,
  heroPhoto,
  bodyParagraphs,
  faqs,
  metaDescription,
}: ServicePageLayoutProps) {
  const pageUrl = `${SITE_URL}/services/${slug}`;
  const [intro, ...rest] = bodyParagraphs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: serviceName,
        serviceType: serviceName,
        description: metaDescription,
        url: pageUrl,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: [
          ...towns.map((t) => ({
            "@type": "City",
            name: t.townName,
            containedInPlace: { "@type": "State", name: "Massachusetts" },
          })),
          { "@type": "AdministrativeArea", name: "Greater Boston Area" },
          { "@type": "AdministrativeArea", name: "South Shore, Massachusetts" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services/panel-upgrades` },
          { "@type": "ListItem", position: 3, name: serviceName, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${heroPhoto}')` }} />
        <div className="hero-scrim" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span>Powered Up LLC · Taunton, MA</span>
          </div>
          <h1>
            {heroTitle}
            <br />
            <em className="accent">{heroTitleHighlight}</em>
          </h1>
          <p className="hero-sub">{heroSub}</p>
          <div className="hero-ctas">
            <Link href="#book" className="btn btn-primary">
              Book a Call
              <Arrow />
            </Link>
            <a href="tel:+15086225919" className="btn btn-ghost">
              <Phone />
              (508) 622-5919
            </a>
          </div>
        </div>
      </section>

      {/* QUALIFICATION FORM */}
      <section id="book" className="qualify">
        <div className="wrap">
          <QualifyForm defaultService={serviceValue} />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span className="marquee-item" key={i}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* BODY CONTENT */}
      <section className="lp-body">
        <div className="wrap">
          <div className="eyebrow">{serviceName}</div>
          <div className="lp-prose">
            {intro && <p className="lp-intro">{intro}</p>}
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Common Questions</div>
              <h2 className="h-section">
                {serviceName}.<br />
                <em>Answered.</em>
              </h2>
            </div>
          </div>

          <div className="faq-list">
            {faqs.map((item, i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q">
                  <span className="faq-q-num">Q{i + 1}</span>
                  {item.q}
                </div>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHERE WE WORK */}
      <section id="area" className="area">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Where We Work</div>
              <h2 className="h-section">
                {serviceName} <em>near you.</em>
              </h2>
            </div>
            <div className="section-head-right">
              <a href="tel:+15086225919" className="btn btn-ghost">
                Call (508) 622-5919
                <Phone />
              </a>
            </div>
          </div>

          <p className="sub-section" style={{ marginBottom: 20 }}>
            Based in Taunton, serving every town within roughly a 45-minute drive — across the
            Greater Boston area and the South Shore.
          </p>

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
              <Phone w="2.5" />
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
