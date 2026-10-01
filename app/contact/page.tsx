import type { Metadata } from "next";
import QualifyForm from "@/components/QualifyForm";

export const metadata: Metadata = {
  title: { absolute: "Book a Call | Powered Up LLC | Taunton, MA Electrician" },
  description:
    "Get a quote from Powered Up LLC. Quick form, then pick a time on Micah's calendar, or call (508) 622-5919.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Book a Call</div>
          <h1>
            Get a quote.<br />Talk to <em>Micah</em>.
          </h1>
          <p>
            Fill in the quick form, then pick a time on Micah&apos;s calendar. Prefer to call? Reach
            him direct at <a href="tel:+15086225919">(508) 622-5919</a>.
          </p>
        </div>
      </section>

      <section id="book" className="qualify">
        <div className="wrap">
          <QualifyForm />
        </div>
      </section>
    </>
  );
}
