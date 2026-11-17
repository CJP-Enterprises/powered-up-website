"use client";

import { useEffect, useState } from "react";

/**
 * CJP "How did you hear about us?" v1.0.0 (skills repo assets/wave5, 2026-11-16).
 * Copy to components/HeardAbout.tsx and render ONCE on the thank-you page
 * (or, on a site with no thank-you page, in the success panel that REPLACES the
 * form after a submit). NEVER on the form itself. Optional: no answer = nothing.
 *
 * Shows only when the lead route handed back a sealed token (`ha` in the JSON
 * answer; the form stores it with rememberHeardAboutToken). No token, nothing
 * renders. The answer goes to /api/heard-about, which opens the token server
 * side; this file never sees a lead id.
 *
 * Style: inherits the page's font/colours. Pass `className` for the wrapper and
 * `buttonClassName` to reuse the site's own chip/button classes; the default
 * inline styles are neutral and keep >= 44px tap targets and visible focus.
 */

export const HEARD_ABOUT_TOKEN_KEY = "cjp_ha";

/** Call in the form's success handler, BEFORE navigating: rememberHeardAboutToken(data.ha). */
export function rememberHeardAboutToken(token: unknown): void {
  if (typeof token !== "string" || !token || token.length > 400) return;
  try {
    sessionStorage.setItem(HEARD_ABOUT_TOKEN_KEY, token);
  } catch {
    /* private mode: the question just won't show */
  }
}

const OPTIONS: { key: string; label: string }[] = [
  { key: "google_search", label: "Google search" },
  { key: "google_maps", label: "Google Maps" },
  { key: "ai_assistant", label: "ChatGPT / AI" },
  { key: "social", label: "Facebook / Instagram" },
  { key: "friend", label: "Friend or neighbor" },
  { key: "truck_sign", label: "Saw a truck or sign" },
  { key: "other", label: "Other" },
];

type Props = { className?: string; buttonClassName?: string; heading?: string };

export default function HeardAbout({ className, buttonClassName, heading = "Quick question: how did you hear about us?" }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"ask" | "other" | "sending" | "done">("ask");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let t: string | null = null;
    try {
      t = sessionStorage.getItem(HEARD_ABOUT_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    // Fallback carrier: ?ha=<token> (then removed from the address bar).
    const url = new URL(window.location.href);
    const q = url.searchParams.get("ha");
    if (!t && q) t = q;
    if (q) {
      url.searchParams.delete("ha");
      window.history.replaceState(null, "", url.pathname + (url.search || "") + url.hash);
    }
    if (t && t.length <= 400) setToken(t);
  }, []);

  if (!token) return null;

  async function send(answer: string, text?: string) {
    setState("sending");
    try {
      await fetch("/api/heard-about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, detail: answer === "other" ? (text ?? "").slice(0, 60) : undefined, token }),
        keepalive: true,
      });
    } catch {
      /* optional question: never show the visitor an error */
    }
    try {
      sessionStorage.removeItem(HEARD_ABOUT_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setState("done");
  }

  const btn: React.CSSProperties = buttonClassName
    ? {}
    : {
        minHeight: 44,
        padding: "0.5rem 0.9rem",
        borderRadius: 999,
        border: "1px solid currentColor",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        fontSize: "0.95rem",
        cursor: "pointer",
      };

  return (
    <section
      className={className}
      aria-labelledby="heard-about-q"
      style={className ? undefined : { margin: "2.5rem auto 0", maxWidth: 640, textAlign: "center" }}
    >
      {state === "done" ? (
        <p role="status" style={{ margin: 0 }}>
          Thanks, that helps us a lot.
        </p>
      ) : (
        <>
          <h2 id="heard-about-q" style={className ? undefined : { fontSize: "1.1rem", margin: "0 0 0.25rem" }}>
            {heading}
          </h2>
          <p style={{ margin: "0 0 1rem", opacity: 0.8, fontSize: "0.9rem" }}>Optional. One tap.</p>
          {state === "other" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send("other", detail);
              }}
              style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}
            >
              <label htmlFor="heard-about-other" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Where did you hear about us?
              </label>
              <input
                id="heard-about-other"
                type="text"
                maxLength={60}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Where did you hear about us?"
                autoComplete="off"
                style={{ minHeight: 44, padding: "0.5rem 0.75rem", font: "inherit", flex: "1 1 220px", maxWidth: 360, color: "#111", background: "#fff", border: "1px solid #767676", borderRadius: 8 }}
              />
              <button type="submit" className={buttonClassName} style={btn}>
                Send
              </button>
            </form>
          ) : (
            <div role="group" aria-labelledby="heard-about-q" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={buttonClassName}
                  style={btn}
                  disabled={state === "sending"}
                  onClick={() => (o.key === "other" ? setState("other") : void send(o.key))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
