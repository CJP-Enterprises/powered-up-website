"use client";

import { useState } from "react";
import { GA_EVENT, trackEvent } from "@/lib/analytics";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ width: 16, height: 16 }}
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

// Micah's Calendly scheduling link, embedded directly as the iframe src.
const CALENDAR_SRC = "https://calendly.com/micah-gentile-poweredbymicah/powered-up-project-call";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Service dropdown options. Landing pages pass a `defaultService` that must
// match one of these values for the dropdown to pre-select it.
const SERVICE_OPTIONS = [
  "Panel upgrade or replacement",
  "EV charger installation",
  "New construction / addition",
  "Kitchen or bath remodel wiring",
  "Wiring repair / troubleshooting",
  "Lighting / fixtures",
  "Other",
];

type QualifyFormProps = {
  defaultService?: string;
  defaultTown?: string;
};

export default function QualifyForm({ defaultService, defaultTown }: QualifyFormProps = {}) {
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [town, setTown] = useState(defaultTown ?? "");
  const [website, setWebsite] = useState(""); // honeypot

  // Step 2 — pre-select the service only if it matches a known option.
  const [service, setService] = useState(
    defaultService && SERVICE_OPTIONS.includes(defaultService) ? defaultService : ""
  );
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");

  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const [sending, setSending] = useState(false);

  function goToStep(n: number) {
    setStep(n);
    if (typeof document !== "undefined") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function next1() {
    setErr1("");
    if (!name.trim() || !phone.trim() || !email.trim() || !town.trim()) {
      setErr1("Please fill in all fields.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErr1("Please enter a valid email.");
      return;
    }
    goToStep(2);
  }

  async function submit() {
    setErr2("");
    if (!service.trim() || !timeline.trim()) {
      setErr2("Please pick a service and timeline.");
      return;
    }

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      town: town.trim(),
      service: service.trim(),
      notes: "Timeline: " + timeline + "\n\n" + notes.trim(),
      website,
    };

    setSending(true);
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // GA4 key event. Inside the try, so a failed send is not counted as a
      // lead — nothing reached the inbox in that case.
      trackEvent(GA_EVENT.generateLead, {
        form_name: "qualify",
        form_destination: "/api/quote",
      });
    } catch (e) {
      // Don't block the calendar booking even if the email send fails.
      console.error("Quote API error:", e);
    }
    setSending(false);
    goToStep(3);
  }

  return (
    <div className="qualify-card">
      <div className="qualify-eyebrow">Book a Call · 30 Seconds</div>
      <h2>
        Get a quote.
        <br />
        Book a <em>call with Micah</em>.
      </h2>
      <p className="qualify-sub">
        Quick form, then pick a time on Micah&apos;s calendar. He&apos;ll call at the selected time
        to confirm the project and provide a quote.
      </p>

      <div className="qualify-progress">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`qualify-progress-step${
              step === n ? " active" : step > n ? " complete" : ""
            }`}
            data-step={n}
          />
        ))}
      </div>

      {/* STEP 1: Contact basics */}
      <div className={`qualify-step${step === 1 ? " active" : ""}`} id="qstep-1">
        <div className="qualify-row">
          <label htmlFor="qf-name">Your Name</label>
          <input
            type="text"
            id="qf-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="qualify-row-grid">
          <div className="qualify-row">
            <label htmlFor="qf-phone">Phone</label>
            <input
              type="tel"
              id="qf-phone"
              name="phone"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="qualify-row">
            <label htmlFor="qf-email">Email</label>
            <input
              type="email"
              id="qf-email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="qualify-row">
          <label htmlFor="qf-town">Town</label>
          <input
            type="text"
            id="qf-town"
            name="town"
            autoComplete="address-level2"
            placeholder="e.g. Taunton, Boston, Brockton"
            required
            value={town}
            onChange={(e) => setTown(e.target.value)}
          />
        </div>
        <input
          type="text"
          name="website"
          className="qualify-hp"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div className="qualify-actions">
          <button type="button" className="qualify-btn qualify-btn-primary" onClick={next1}>
            Next: Project Details
            <ArrowIcon />
          </button>
        </div>
        <div className="qualify-error" id="qerr-1">
          {err1}
        </div>
      </div>

      {/* STEP 2: Project details */}
      <div className={`qualify-step${step === 2 ? " active" : ""}`} id="qstep-2">
        <div className="qualify-row">
          <label htmlFor="qf-service">What kind of work?</label>
          <select
            id="qf-service"
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">Select one…</option>
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="qualify-row">
          <label htmlFor="qf-timeline">Timeline</label>
          <select
            id="qf-timeline"
            name="timeline"
            required
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          >
            <option value="">When do you need it?</option>
            <option>This week (urgent)</option>
            <option>Within 2 weeks</option>
            <option>Within 1-3 months</option>
            <option>Just planning ahead</option>
          </select>
        </div>
        <div className="qualify-row">
          <label htmlFor="qf-notes">Tell us about the project (optional)</label>
          <textarea
            id="qf-notes"
            name="notes"
            placeholder="Brief details — type of property, what you're trying to accomplish, anything else helpful…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="qualify-actions">
          <button
            type="button"
            className="qualify-btn qualify-btn-secondary"
            onClick={() => goToStep(1)}
          >
            ← Back
          </button>
          <button
            type="button"
            className="qualify-btn qualify-btn-primary"
            id="qf-submit"
            onClick={submit}
            disabled={sending}
          >
            {sending ? (
              "Sending…"
            ) : (
              <>
                Pick a Time on Micah&apos;s Calendar
                <ArrowIcon />
              </>
            )}
          </button>
        </div>
        <div className="qualify-error" id="qerr-2">
          {err2}
        </div>
      </div>

      {/* STEP 3: Calendar */}
      <div className={`qualify-step${step === 3 ? " active" : ""}`} id="qstep-3">
        <div className="qualify-success-note">
          <strong>Got it!</strong> Your project details are on the way to Micah. Now pick a time
          below and he&apos;ll call you to confirm.
        </div>
        <div className="qualify-calendar">
          <iframe src={CALENDAR_SRC} frameBorder="0" title="Book a call with Micah" />
        </div>
        <p className="qualify-sub" style={{ marginTop: 18, marginBottom: 0 }}>
          Trouble with the calendar? Call Micah directly at{" "}
          <a
            href="tel:+15086225919"
            style={{ color: "var(--navy-deep)", fontWeight: 700, textDecoration: "underline" }}
          >
            (508) 622-5919
          </a>
          .
        </p>
      </div>
    </div>
  );
}
