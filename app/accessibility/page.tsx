import type { Metadata } from "next";

/**
 * /accessibility (SEO wave 5, playbook #575; kit assets/wave5 v1.0.0). Plain
 * statement only: never claim WCAG certification or compliance. The phone is
 * the number the site already prints.
 */
export const metadata: Metadata = {
  title: { absolute: "Accessibility | Powered Up LLC" },
  description:
    "Accessibility statement for Powered Up LLC: how we keep this website usable for everyone, and how to reach Micah if something is hard to use.",
  alternates: { canonical: "/accessibility" },
};

const UPDATED = "November 2026";

export default function AccessibilityPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Legal</div>
          <h1>Accessibility</h1>
          <p>Last reviewed {UPDATED}.</p>
        </div>
      </section>

      <article className="post">
        <div className="post-wrap">
          <div className="prose prose-invert prose-brand">
            <p>
              We want everyone to be able to use this website, including people who use a screen reader, keyboard
              navigation, zoom or voice control.
            </p>
            <h2>What we do</h2>
            <ul>
              <li>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</li>
              <li>Every change to the site is checked automatically for accessibility problems on our key pages before it goes live.</li>
              <li>Pages use real headings, labelled form fields, text alternatives for photos and readable color contrast.</li>
            </ul>
            <h2>If something is hard to use</h2>
            <p>
              If any part of this site is difficult to use, tell us and we will help you directly and fix it. Call or text{" "}
              <a href="tel:+15086225919">(508) 622-5919</a> or email{" "}
              <a href="mailto:micah.gentile@poweredbymicah.com">micah.gentile@poweredbymicah.com</a>.
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
