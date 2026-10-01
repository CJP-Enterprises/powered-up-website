import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Powered Up LLC" },
  description:
    "How Powered Up LLC handles the information you send through poweredbymicah.com, including text messages.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "October 1, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
          <p>Effective {EFFECTIVE}.</p>
        </div>
      </section>

      <article className="post">
        <div className="post-wrap">
          <div className="prose prose-invert prose-brand">
            <p>
              This website, poweredbymicah.com, is operated by Powered Up LLC, an electrical
              contractor based in Taunton, MA. This policy explains what we collect, why, and what we
              do with it. It is written to be read, not to be scrolled past.
            </p>

            <h2>What we collect</h2>
            <p>
              <strong>Information you give us.</strong> If you fill in the quote form, we collect your
              name, phone number, email address, town, the kind of work, your timeline, any project
              details you type, and whether you ticked the optional text box. Nothing on the form is
              collected that you did not enter.
            </p>
            <p>
              <strong>Anti-spam signals.</strong> The form includes a hidden field that a person never
              sees and a timestamp recording when the page finished loading. Automated submissions
              fill the hidden field or submit implausibly fast, and both get discarded. Neither is
              used to identify you.
            </p>
            <p>
              <strong>Analytics.</strong> We use Google Analytics. It places cookies in your browser
              and records which pages were viewed, roughly where in the world the visit came from,
              what device was used, and which link brought you here. We also record when someone taps
              a phone number or submits the form, so we can tell what on the site is working. These
              are counts of events, not records about you personally, and we never send your name,
              email address or phone number to Google.
            </p>

            <h2>What we do with it</h2>
            <p>
              Quote requests are emailed to the owner so he can call you back about your project.
              That is the whole purpose. Analytics data is used to understand which pages bring in
              work.
            </p>

            <h2>Who sees it</h2>
            <p>
              Quote form submissions are delivered by <strong>Resend</strong>, an email delivery
              service, to the owner&apos;s inbox. If you book a time after the form, the booking is
              made on <strong>Calendly</strong>, which receives what you enter there. Analytics data
              goes to <strong>Google</strong>. The website is hosted by <strong>Vercel</strong>,
              which keeps standard server logs including IP addresses for security and operational
              purposes.
            </p>
            <p>
              <strong>
                We do not sell your information. We do not rent it, trade it, or share it with other
                contractors, lead brokers, marketing lists, or anyone else.
              </strong>{" "}
              The only person who sees your quote request is the electrician who would come and do
              the work.
            </p>

            <h2>Text messages</h2>
            <p>
              If you call Powered Up LLC and the call is not answered, an automated text is sent back
              to the number you called from, asking what you need. If you submit the quote form and
              tick the optional text box, you may get a text confirming it arrived. After a completed
              job you may get one text asking for a review. That is the whole program: service
              messages about your own enquiry or your own job.
            </p>
            <p>
              Message frequency varies and depends on what you contact us about. Message and data
              rates may apply. Reply STOP to any message to stop receiving them, and HELP for help.
              Carriers are not liable for delayed or undelivered messages.
            </p>
            <p>
              No mobile information will be shared with third parties or affiliates for marketing or
              promotional purposes. Text messaging originator opt-in data and consent is not shared
              with any third party. Your number is used to reply to you about your own enquiry and
              nothing else. We do not send promotions or marketing by text.
            </p>
            <p>
              Texts are sent on our behalf by our messaging provider so they can be delivered, and by
              the software that runs our phone and review follow-up. Neither uses your number for
              anything other than delivering these messages.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Quote requests live in the owner&apos;s email inbox and are kept as long as they are
              useful as a business record. Analytics data is retained on Google&apos;s default
              schedule for the property. Ask us to delete your request and we will.
            </p>

            <h2>Cookies and opting out</h2>
            <p>
              The cookies on this site come from Google Analytics. You can block or delete them in
              your browser settings, install Google&apos;s official opt-out add-on, or use any
              tracking blocker. The site is built so that all of it works normally with analytics
              blocked — nothing on the page depends on a tracker loading.
            </p>

            <h2>Children</h2>
            <p>
              This site is for people hiring an electrician. It is not directed at children under 13
              and we do not knowingly collect information from them.
            </p>

            <h2>Your choices</h2>
            <p>
              You can ask us what we hold about you, ask us to correct it, or ask us to delete it.
              Call <a href="tel:+15086225919">(508) 622-5919</a> or email{" "}
              <a href="mailto:micah.gentile@poweredbymicah.com">micah.gentile@poweredbymicah.com</a>{" "}
              and we will take care of it. There is no form for this and no wait.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              If what the site collects changes, this page changes with it and the effective date at
              the top moves. There is no archive of prior versions; the current page is the policy.
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
