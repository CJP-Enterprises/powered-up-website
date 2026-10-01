import type { Metadata } from "next";

/**
 * Terms of service, and the SMS program disclosure carriers read during
 * A2P 10DLC review. Keep in step with the Text messages section of /privacy
 * and the opt-in description filed on the campaign. If one changes, all three
 * change. (Pattern: CJP-Enterprises/fixed-haus app/terms.)
 */
export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Powered Up LLC" },
  description:
    "Terms of service for Powered Up LLC, including the text message program: what we send, how often, and how to stop.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE = "October 1, 2026";

export default function TermsPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Legal</div>
          <h1>Terms of Service</h1>
          <p>Effective {EFFECTIVE}.</p>
        </div>
      </section>

      <article className="post">
        <div className="post-wrap">
          <div className="prose prose-invert prose-brand">
            <p>
              These terms cover this website and the text messages Powered Up LLC sends. Using the
              site, calling us, or replying to one of our texts means you accept them.
            </p>

            <h2>Using this site</h2>
            <p>
              Everything here — project descriptions, photographs, service areas, timelines — is a
              description of the work we do, not a quote and not a contract. A price is a price when
              it is written down for your specific project and agreed.
            </p>

            <h2>Text messages: what you are agreeing to</h2>
            <p>
              <strong>How you opt in.</strong> You opt in by contacting us first. If you call{" "}
              <a href="tel:+15086225919">(508) 622-5919</a> and we cannot pick up, we text that number
              back to ask what you need. If you submit the quote form and tick the optional text box,
              you are agreeing we may text you about that request. We never text a number that did
              not contact us first, and we never buy, rent or import lists.
            </p>
            <p>
              <strong>What we send.</strong> A reply when we miss your call, confirmation that your
              quote request arrived, messages about scheduling and your job, and one request for a
              review after a job is finished. Service messages only. We do not send promotions,
              offers or marketing by text.
            </p>
            <p>
              <strong>How often.</strong> Message frequency varies and depends on what you contact us
              about. Most people get one or two messages about a single enquiry.
            </p>
            <p>
              <strong>What it costs.</strong> We do not charge for messages. Message and data rates
              may apply from your own carrier.
            </p>
            <p>
              <strong>How to stop.</strong> Reply <strong>STOP</strong> to any message and you will
              get one confirmation and then nothing further. Reply <strong>START</strong> if you want
              them back. Reply <strong>HELP</strong>, or call{" "}
              <a href="tel:+15086225919">(508) 622-5919</a>, for help.
            </p>
            <p>
              <strong>Carriers.</strong> Mobile carriers are not liable for delayed or undelivered
              messages. Delivery is not guaranteed and can depend on your device, coverage and
              carrier.
            </p>
            <p>
              <strong>
                No mobile information will be shared with third parties or affiliates for marketing
                or promotional purposes. Text messaging originator opt-in data and consent is not
                shared with any third party.
              </strong>
            </p>
            <p>
              What we do with the rest of your information is set out in our{" "}
              <a href="/privacy">privacy policy</a>.
            </p>

            <h2>Quotes and the work itself</h2>
            <p>
              Sending the form or leaving a voicemail starts a conversation, it does not book a job
              and does not oblige either of us to anything. The terms of the work — scope, price,
              schedule, payment — are whatever is agreed in writing for your project. If something
              here disagrees with that agreement, that agreement wins.
            </p>

            <h2>Changes</h2>
            <p>
              If what we send or how we handle it changes, this page changes with it and the
              effective date at the top moves. The current page is the agreement; there is no archive
              of prior versions.
            </p>

            <h2>Contact</h2>
            <p>
              Powered Up LLC · Taunton, MA · <a href="tel:+15086225919">(508) 622-5919</a> ·{" "}
              <a href="mailto:micah.gentile@poweredbymicah.com">micah.gentile@poweredbymicah.com</a>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
