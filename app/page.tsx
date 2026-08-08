import Link from "next/link";
import QualifyForm from "@/components/QualifyForm";
import { services } from "@/lib/services";

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

const Star = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MARQUEE = [
  "New Construction Wiring",
  "Panel Upgrades · 100A · 200A · 400A",
  "EV Charger Installation",
  "Kitchen & Bath Remodels",
  "Federal Pacific Replacements",
  "Knob & Tube Remediation",
];

const TOWNS = [
  "Taunton", "Raynham", "Berkley", "Dighton", "Lakeville", "Norton", "Mansfield", "Easton",
  "Foxboro", "Sharon", "Bridgewater", "Brockton", "Stoughton", "Middleboro", "Hanover",
  "Pembroke", "Norwell", "Marshfield", "Kingston", "Plymouth",
];

const FAQ = [
  {
    q: "What towns does Powered Up LLC serve?",
    a: (
      <>
        Powered Up LLC serves <strong>20 towns across the Greater Boston area and the South
        Shore</strong>: Taunton, Raynham, Berkley, Dighton, Lakeville, Norton, Mansfield, Easton,
        Foxboro, Sharon, Bridgewater, Brockton, Stoughton, Middleboro, Hanover, Pembroke, Norwell,
        Marshfield, Kingston, and Plymouth. We are based in Taunton, MA. Service area expanding —
        call to confirm coverage for your specific town.
      </>
    ),
  },
  {
    q: "Is Powered Up LLC licensed and insured in Massachusetts?",
    a: (
      <>
        Yes. Powered Up LLC is <strong>licensed by the Commonwealth of Massachusetts</strong> and
        carries full general liability insurance on every job, residential and commercial. License
        and insurance documentation can be provided at the time of quote.
      </>
    ),
  },
  {
    q: "Do you handle Federal Pacific (FPE) or Zinsco panel replacements?",
    a: (
      <>
        Yes. Federal Pacific Stab-Lok and Zinsco panels are documented fire hazards that many
        Massachusetts homeowner&apos;s insurance carriers refuse to cover. Powered Up LLC replaces
        them with <strong>modern 100A, 200A, or 400A panels</strong>, pulls the electrical permit,
        and coordinates the town wiring inspection. Available across Taunton, Brockton, Plymouth,
        and 17 other South Shore towns.
      </>
    ),
  },
  {
    q: "Do you install Level 2 EV chargers?",
    a: (
      <>
        Yes. We install Level 2 EV chargers for <strong>all major brands</strong> including Tesla,
        ChargePoint, Wallbox, JuiceBox, and Grizzl-E. The circuit is sized specifically to your
        vehicle&apos;s amperage draw, and a load calculation is performed on the existing panel
        before install. Permit is pulled and most installations complete in one day.
      </>
    ),
  },
  {
    q: "Do I need a permit to upgrade my electrical panel in Massachusetts?",
    a: (
      <>
        Yes. Massachusetts requires an electrical permit for any panel upgrade, replacement, or
        service change. Powered Up LLC pulls the permit, performs the work to current{" "}
        <strong>Massachusetts Electrical Code (527 CMR 12, NEC 2023)</strong>, and coordinates the
        inspection with the local town wiring inspector.
      </>
    ),
  },
  {
    q: "How fast can I get a quote from Powered Up LLC?",
    a: (
      <>
        Most quote requests are returned <strong>within 24 hours</strong>. Call or text (508)
        622-5919, or submit a quote form at poweredbymicah.com. Hours are Monday through Saturday,
        7am to 7pm.
      </>
    ),
  },
  {
    q: "Who owns Powered Up LLC?",
    a: (
      <>
        Powered Up LLC is an owner-operated electrical contracting company{" "}
        <strong>founded in 2024 by Micah Gentile</strong>, a Massachusetts-licensed electrician
        based in Taunton. Powered Up is a Black-owned small business serving residential and
        commercial customers across the Greater Boston area and the South Shore.
      </>
    ),
  },
  {
    q: "Do you handle knob-and-tube or aluminum wiring remediation?",
    a: (
      <>
        Yes. Powered Up LLC handles <strong>knob-and-tube replacement and aluminum wiring
        remediation</strong> for older homes across the South Shore. Many MA insurance carriers will
        not write or renew a homeowner&apos;s policy on a home with active knob-and-tube — we provide
        documentation for your insurance file after remediation is complete.
      </>
    ),
  },
];

const REVIEW_COUNT = 24;
const REVIEW_RATING = "5.0";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Electrician", "LocalBusiness"],
      "@id": "https://www.poweredbymicah.com/#business",
      name: "Powered Up LLC",
      alternateName: "Powered Up Electrical",
      description:
        "Licensed, owner-operated electrical contractor serving Taunton, the Greater Boston area, and the South Shore. Panel upgrades, EV chargers, new construction, remodels.",
      url: "https://www.poweredbymicah.com",
      telephone: "+1-508-622-5919",
      email: "micah.gentile@poweredbymicah.com",
      foundingDate: "2024",
      founder: { "@id": "https://www.poweredbymicah.com/#micah" },
      image: "https://www.poweredbymicah.com/og-image.jpg",
      logo: "https://www.poweredbymicah.com/logo.png",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Taunton",
        addressRegion: "MA",
        postalCode: "02780",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 41.9001, longitude: -71.0898 },
      areaServed: [
        ...TOWNS.map((name) => ({
          "@type": "City",
          name,
          containedInPlace: { "@type": "State", name: "Massachusetts" },
        })),
        { "@type": "AdministrativeArea", name: "South Shore, Massachusetts" },
        { "@type": "AdministrativeArea", name: "Greater Boston Area" },
      ],
      serviceArea: {
        "@type": "GeoCircle",
        geoMidpoint: { "@type": "GeoCoordinates", latitude: 41.9001, longitude: -71.0898 },
        geoRadius: "72000",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "07:00",
        closes: "19:00",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: REVIEW_RATING,
        reviewCount: String(REVIEW_COUNT),
        bestRating: "5",
        worstRating: "1",
      },
      parentOrganization: { "@id": "https://www.poweredbymicah.com/#organization" },
      location: { "@id": "https://www.poweredbymicah.com/#place" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Electrical Services",
        itemListElement: [
          "Electrical Panel Upgrade — 100A, 200A, 400A",
          "Federal Pacific and Zinsco Panel Replacement",
          "EV Charger Installation (Level 2)",
          "New Construction Wiring",
          "Kitchen and Bathroom Remodel Wiring",
          "Knob-and-Tube Wiring Remediation",
          "Aluminum Wiring Remediation",
          "Wiring Repair and Troubleshooting",
          "Light Fixture Installation",
          "Outdoor Lighting Installation",
        ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      },
      sameAs: ["https://www.facebook.com/poweredupllc"],
    },
    {
      "@type": "Organization",
      "@id": "https://www.poweredbymicah.com/#organization",
      name: "Powered Up LLC",
      url: "https://www.poweredbymicah.com",
      logo: "https://www.poweredbymicah.com/logo.png",
      founder: { "@id": "https://www.poweredbymicah.com/#micah" },
      foundingDate: "2024",
      foundingLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Taunton",
          addressRegion: "MA",
          addressCountry: "US",
        },
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-508-622-5919",
        email: "micah.gentile@poweredbymicah.com",
        contactType: "Customer Service",
        areaServed: "US-MA",
        availableLanguage: "English",
      },
    },
    {
      "@type": "Person",
      "@id": "https://www.poweredbymicah.com/#micah",
      name: "Micah Gentile",
      jobTitle: "Owner and Licensed Electrician",
      worksFor: { "@id": "https://www.poweredbymicah.com/#organization" },
      knowsAbout: [
        "Electrical panel upgrades",
        "EV charger installation",
        "Residential and commercial electrical work",
        "Massachusetts Electrical Code",
        "Knob-and-tube remediation",
      ],
    },
    {
      "@type": "Place",
      "@id": "https://www.poweredbymicah.com/#place",
      name: "Powered Up LLC — Taunton, MA",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Taunton",
        addressRegion: "MA",
        postalCode: "02780",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 41.9001, longitude: -71.0898 },
      hasMap: "https://www.google.com/maps/search/?api=1&query=Powered+Up+LLC+Taunton+MA",
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.poweredbymicah.com/#faq",
      mainEntity: [
        {
          q: "What towns does Powered Up LLC serve?",
          a: "Powered Up LLC serves 20 towns across the Greater Boston area and the South Shore: Taunton, Raynham, Berkley, Dighton, Lakeville, Norton, Mansfield, Easton, Foxboro, Sharon, Bridgewater, Brockton, Stoughton, Middleboro, Hanover, Pembroke, Norwell, Marshfield, Kingston, and Plymouth. We are based in Taunton, MA. Service area expanding — call to confirm coverage for your specific town.",
        },
        {
          q: "Is Powered Up LLC licensed and insured in Massachusetts?",
          a: "Yes. Powered Up LLC is licensed by the Commonwealth of Massachusetts and carries full general liability insurance on every job, residential and commercial. License and insurance documentation can be provided at the time of quote.",
        },
        {
          q: "Do you handle Federal Pacific (FPE) or Zinsco panel replacements?",
          a: "Yes. Federal Pacific Stab-Lok and Zinsco panels are documented fire hazards that many Massachusetts homeowner's insurance carriers refuse to cover. Powered Up LLC replaces them with modern 100A, 200A, or 400A panels, pulls the electrical permit, and coordinates the town wiring inspection. Available across Taunton, Brockton, Plymouth, and 17 other South Shore towns.",
        },
        {
          q: "Do you install Level 2 EV chargers?",
          a: "Yes. We install Level 2 EV chargers for all major brands including Tesla, ChargePoint, Wallbox, JuiceBox, and Grizzl-E. The circuit is sized specifically to your vehicle's amperage draw, and a load calculation is performed on the existing panel before install. Permit is pulled and most installations complete in one day.",
        },
        {
          q: "Do I need a permit to upgrade my electrical panel in Massachusetts?",
          a: "Yes. Massachusetts requires an electrical permit for any panel upgrade, replacement, or service change. Powered Up LLC pulls the permit, performs the work to current Massachusetts Electrical Code (527 CMR 12, NEC 2023), and coordinates the inspection with the local town wiring inspector.",
        },
        {
          q: "How fast can I get a quote from Powered Up LLC?",
          a: "Most quote requests are returned within 24 hours. Call or text (508) 622-5919, or submit a quote form at poweredbymicah.com. Hours are Monday through Saturday, 7am to 7pm.",
        },
        {
          q: "Who owns Powered Up LLC?",
          a: "Powered Up LLC is an owner-operated electrical contracting company founded in 2024 by Micah Gentile, a Massachusetts-licensed electrician based in Taunton. Powered Up is a Black-owned small business serving residential and commercial customers across the Greater Boston area and the South Shore.",
        },
        {
          q: "Do you handle knob-and-tube or aluminum wiring remediation?",
          a: "Yes. Powered Up LLC handles knob-and-tube replacement and aluminum wiring remediation for older homes across the South Shore. Many MA insurance carriers will not write or renew a homeowner's policy on a home with active knob-and-tube — we provide documentation for your insurance file after remediation is complete.",
        },
      ].map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.poweredbymicah.com/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.poweredbymicah.com/" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.poweredbymicah.com/#website",
      url: "https://www.poweredbymicah.com",
      name: "Powered Up LLC",
      publisher: { "@id": "https://www.poweredbymicah.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.poweredbymicah.com/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://www.poweredbymicah.com/#webpage",
      url: "https://www.poweredbymicah.com/",
      name: "Powered Up LLC | Licensed Electrician | Taunton, MA | Owner-Operated",
      isPartOf: { "@id": "https://www.poweredbymicah.com/#website" },
      about: { "@id": "https://www.poweredbymicah.com/#business" },
      breadcrumb: { "@id": "https://www.poweredbymicah.com/#breadcrumb" },
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".faq-answer", ".hero-sub"] },
    },
  ],
};

const REVIEWS = [
  {
    name: "Jan Schwaner",
    source: "Google Review",
    body: "“Micah was courteous, prompt, easy to communicate with, knowledgeable, and thoroughly professional. We would hire him again — in fact, we have!”",
  },
  {
    name: "Damien Gabourel",
    source: "Google Review",
    body: "“Micah is very skilled, professional and knowledgeable. I would recommend his services to anyone.”",
  },
  {
    name: "Joshua Potvin",
    source: "Google Review · Local Guide",
    body: "“Micah is a great electrician and a great guy! I would trust him with any of my electrical projects.”",
  },
  {
    name: "Elias Cordova",
    source: "Google Review",
    body: "“Excellent experience with Micah from start to finish. The team was professional, responsive, and extremely knowledgeable.”",
  },
  {
    name: "Silas Robinson",
    source: "Google Review",
    body: "“Micah is hardworking, diligent, and delightful. He does his work with care and a sunny, contagious attitude. If you need electrical work done you would be lucky to get him.”",
  },
  {
    name: "Trudi Goldberg Pires",
    source: "Google Review",
    body: "“Micah responded quickly and arrived early for the job. He did everything in the amount of time he said it would take. Highly recommend.”",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        {/* Was an autoplaying background video: 1.6 MB on mobile, 3.1 MB on
            desktop. Autoplay downloads regardless of preload="metadata", so
            the hero could not paint until it arrived — Largest Contentful
            Paint measured 21.7s on mobile against a 2.5s target. A still of
            Micah is 54 KB, carries the same message as the headline, and
            paints immediately. */}
        <img
          className="hero-media"
          src="/photos/micah-hero.webp"
          alt="Micah Gentile, owner of Powered Up LLC, at a completed Enphase battery installation"
          width={900}
          height={1200}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-scrim" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span>Taunton, MA · Est. 2024</span>
          </div>
          <h1>
            When you call,<br />you get <em>Micah</em>.<br />Not a call center.
          </h1>
          <p className="hero-sub">
            <strong>Powered Up LLC</strong> is an owner-operated electrical contractor serving
            Taunton and the South Shore. Panel upgrades, EV chargers, new construction, remodels —
            handled from quote to inspection by the same licensed electrician.
          </p>
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
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-val">20</span>
              <span className="hero-meta-lbl">Towns Served</span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-val">24h</span>
              <span className="hero-meta-lbl">Quote Turnaround</span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-val">100%</span>
              <span className="hero-meta-lbl">Owner-Operated</span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-val">MA</span>
              <span className="hero-meta-lbl">Licensed &amp; Insured</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUALIFICATION FORM */}
      <section id="book" className="qualify">
        <div className="wrap">
          <QualifyForm />
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

      {/* SERVICES */}
      <section id="services" className="services">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">What We Do</div>
              <h2 className="h-section">
                Electrical work,<br />handled <em>start to finish</em>.
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
            {services.map((s) => (
              <Link href={`/services/${s.slug}`} className="service" key={s.slug}>
                <div className="service-num">{s.homepageLabel}</div>
                <h3 className="service-title">{s.homepageTitle}</h3>
                <p className="service-desc">{s.homepageDesc}</p>
                <span className="service-arrow">
                  View service
                  <Arrow w="2.2" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF / 400A WORK */}
      <section id="work" className="proof">
        <div className="wrap">
          <div className="proof-inner">
            <div className="proof-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/work-400a-install.jpg"
                alt="400A electrical service install by Powered Up LLC"
              />
              <div className="proof-photo-tag">400A · Recent Install</div>
            </div>

            <div className="proof-text">
              <div className="eyebrow">Why Powered Up</div>
              <h2 className="h-section">
                No subs. No call centers.<br />
                <em>One licensed electrician.</em>
              </h2>
              <p className="sub-section" style={{ marginBottom: 30 }}>
                When you call Powered Up, you get the same person who shows up to do the work, runs
                the permit, and stands behind it after. No estimating department. No rotating crews.
                No B-team.
              </p>
              <ul className="proof-bullets">
                <li>
                  <span>
                    <strong>Same-day or next-day quotes</strong> — usually back to you within 24
                    hours.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Direct text/call</strong> — no dispatcher gatekeeping a $200 service
                    call.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Code-compliant work</strong> — permits pulled, inspections coordinated,
                    paperwork done right.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Fully insured</strong> — general liability coverage on every job,
                    residential or commercial.
                  </span>
                </li>
              </ul>
              <Link href="#book" className="btn btn-primary">
                Book a Call
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEET MICAH */}
      <section id="meet-micah" className="meet-micah">
        <div className="wrap">
          <div className="meet-micah-inner">
            <div className="meet-micah-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/photos/micah-portrait.jpg"
                alt="Micah Gentile, owner and licensed electrician at Powered Up LLC, standing in front of Enphase battery backup installation"
              />
              <div className="meet-micah-badge">
                <span className="meet-micah-badge-label">The Owner</span>
                <span className="meet-micah-badge-name">Micah Gentile</span>
              </div>
            </div>

            <div className="meet-micah-text">
              <div className="eyebrow">The Owner</div>
              <h2 className="h-section">
                Every job. <em>Every quote.</em>
                <br />
                Every call.
              </h2>
              <p className="sub-section" style={{ marginBottom: 24 }}>
                Powered Up LLC is owner-operated. When you call, you talk to Micah — the same
                licensed Massachusetts electrician who will walk your job, write your quote, run the
                wire, pull the permit, and stand behind the work.
              </p>
              <p className="sub-section" style={{ marginBottom: 32 }}>
                The work spans everything from a broken outlet on a Tuesday morning to a full Enphase
                battery backup install. Whatever the scope, one licensed electrician handles it from
                start to finish.
              </p>

              <div className="meet-micah-credentials">
                <div className="credential">
                  <span className="credential-label">Licensed</span>
                  <span className="credential-value">Massachusetts Electrical Contractor</span>
                </div>
                <div className="credential">
                  <span className="credential-label">Insured</span>
                  <span className="credential-value">Full General Liability</span>
                </div>
                <div className="credential">
                  <span className="credential-label">Founded</span>
                  <span className="credential-value">Taunton, MA · 2024</span>
                </div>
                <div className="credential">
                  <span className="credential-label">Specialties</span>
                  <span className="credential-value">
                    Enphase Battery Backup · EV Chargers · Panel Upgrades · Whole-Home Rewires
                  </span>
                </div>
              </div>

              <a href="#book" className="btn btn-primary" style={{ marginTop: 32 }}>
                Book a Call with Micah
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
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section id="area" className="area">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Where We Work</div>
              <h2 className="h-section">
                20 towns. <em>One driving radius.</em>
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
            {TOWNS.map((t, i) => (
              <div className={`town${i === 0 ? " hub" : ""}`} key={t}>
                {t}
              </div>
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

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Common Questions</div>
              <h2 className="h-section">
                Questions before<br />you book? <em>Read these.</em>
              </h2>
            </div>
          </div>

          <div className="faq-list">
            {FAQ.map((item, i) => (
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

      {/* REVIEWS */}
      <section id="reviews" className="reviews">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Real Customers · Real Reviews</div>
              <h2 className="h-section">
                5.0 stars.<br />
                <em>{`${REVIEW_COUNT} Google reviews.`}</em>
              </h2>
            </div>
            <div className="section-head-right">
              <a
                href="https://g.page/r/CWGsx9WryGDjEAE/review"
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
              >
                Leave a Review
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </a>
            </div>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((r) => (
              <div className="review-card" key={r.name}>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="review-body">{r.body}</p>
                <div className="review-author">
                  <span className="review-name">{r.name}</span>
                  <span className="review-source">{r.source}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="reviews-footer">
            <span className="reviews-footer-text">{`See all ${REVIEW_COUNT} reviews on Google →`}</span>
            <a
              href="https://www.google.com/search?q=Powered+Up+LLC+Taunton"
              target="_blank"
              rel="noopener"
              className="btn btn-ghost"
            >
              View on Google
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section id="contact" className="contact" style={{ padding: "80px 0" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Direct Contact</div>
              <h2 className="h-section">
                Prefer to call?<br />
                <em>Reach Micah direct.</em>
              </h2>
            </div>
          </div>

          <div className="contact-info" style={{ maxWidth: 760 }}>
            <a href="tel:+15086225919" className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-lbl">Direct Line</span>
                  <span className="contact-info-val">(508) 622-5919</span>
                </span>
              </a>
              <a href="mailto:micah.gentile@poweredbymicah.com" className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-lbl">Email</span>
                  <span className="contact-info-val">micah.gentile@poweredbymicah.com</span>
                </span>
              </a>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-lbl">Hours</span>
                  <span className="contact-info-val">Mon–Sat · 7am–7pm</span>
                </span>
              </div>
              <div className="contact-info-row">
                <span className="contact-info-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="contact-info-text">
                  <span className="contact-info-lbl">Service Area</span>
                  <span className="contact-info-val">Taunton · South Shore · 20 towns</span>
                </span>
              </div>
            </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </>
  );
}
