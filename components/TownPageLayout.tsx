import Link from "next/link";
import QualifyForm from "@/components/QualifyForm";
import { services } from "@/lib/services";

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

export type TownPageLayoutProps = {
  slug: string;
  townName: string;
  townFull: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSub: string;
  heroPhoto: string;
  bodyParagraphs: string[];
  housingNotes: string;
  faqs: Array<{ q: string; a: string }>;
  metaTitle: string;
  metaDescription: string;
};

export default function TownPageLayout({
  slug,
  townName,
  townFull,
  heroTitle,
  heroTitleHighlight,
  heroSub,
  heroPhoto,
  bodyParagraphs,
  housingNotes,
  faqs,
  metaDescription,
}: TownPageLayoutProps) {
  const pageUrl = `${SITE_URL}/${slug}`;
  const [intro, ...rest] = bodyParagraphs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: `Electrician in ${townName}`,
        serviceType: "Electrical contractor",
        description: metaDescription,
        url: pageUrl,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: { "@id": `${pageUrl}#place` },
      },
      {
        "@type": "Place",
        "@id": `${pageUrl}#place`,
        name: townFull,
        address: {
          "@type": "PostalAddress",
          addressLocality: townName,
          addressRegion: "MA",
          addressCountry: "US",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: townName, item: pageUrl },
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
            <span>{townFull} · Licensed &amp; Insured</span>
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
          <QualifyForm defaultTown={townName} />
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
          <div className="eyebrow">Electrical Service in {townName}</div>
          <div className="lp-prose">
            {intro && <p className="lp-intro">{intro}</p>}
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {housingNotes && <p className="lp-housing-note">{housingNotes}</p>}
          </div>
        </div>
      </section>

      {/* SERVICES WE OFFER */}
      <section id="services" className="services">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">What We Do</div>
              <h2 className="h-section">
                Services we offer<br />in <em>{townName}</em>.
              </h2>
            </div>
            <div className="section-head-right">
              <Link href="#book" className="btn btn-ghost">
                Book a Call
                <Arrow w="2.2" />
              </Link>
            </div>
          </div>

          <div className="services-grid">
            {services.map((s, i) => (
              <Link href={`/services/${s.slug}`} className="service" key={s.slug}>
                <div className="service-num">
                  {String(i + 1).padStart(2, "0")} — {townName}
                </div>
                <h3 className="service-title">{s.serviceName}</h3>
                <p className="service-desc">{s.heroSub}</p>
                <span className="service-arrow">
                  Learn more
                  <Arrow w="2.2" />
                </span>
              </Link>
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
                Electrician in {townName}.<br />
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
