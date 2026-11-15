/**
 * CJP lead attribution v1.0.0 (skills repo assets/attribution, 2026-11-15).
 *
 * Copy VERBATIM to lib/attribution.ts. Shared by the browser and the server:
 * no imports, no Node APIs, no cookies (localStorage only, so no consent
 * banner impact). Fix upstream, bump the version, re-copy.
 *
 *   ATTRIBUTION_SCRIPT   inline <script> body, rendered once in app/layout.tsx
 *                        by components/AttributionScript.tsx. Runs on every
 *                        full page load, stores first touch + last touch.
 *   getAttribution()     browser: read the stored record for a form POST.
 *   sanitizeAttribution  server: known keys only, strings only, length caps.
 *   attributionLine()    server: the one-line "Came from" text, PLAIN-TEXT email only.
 *   attributionLineHtml() server: the same line HTML-escaped; the only form allowed in HTML.
 *
 * Stored record (localStorage key "cjp_attr", 90 days from first_seen_at):
 *   first touch: utm_source utm_medium utm_campaign utm_term utm_content
 *                gclid gbraid wbraid msclkid fbclid landing_page referrer
 *                first_seen_at
 *   last touch:  last_utm_source last_utm_medium last_utm_campaign
 *                last_referrer last_seen_at  (updated only on a visit that
 *                carries utms / a click id / an external referrer)
 *
 * referrer is the external HOSTNAME only (chatgpt.com, www.google.com), never
 * a full URL. A same-site referrer is ignored.
 */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "landing_page",
  "referrer",
  "first_seen_at",
  "last_utm_source",
  "last_utm_medium",
  "last_utm_campaign",
  "last_referrer",
  "last_seen_at",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

const STORAGE_KEY = "cjp_attr";

/**
 * The browser half, as a string so it can be inlined in the HTML and run
 * before React hydrates (a visitor who taps away early is still captured).
 * ES5 on purpose: no transpiler touches it. Every step is try/catch'd: a
 * blocked localStorage (Safari private mode, cleared site data) is a no-op.
 */
export const ATTRIBUTION_SCRIPT = `(function(){try{var K="${STORAGE_KEY}",D=7776e6,n=Date.now(),L=location,Q=new URLSearchParams(L.search),C=["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","gbraid","wbraid","msclkid","fbclid"],P={},H=false,R="",S=null,i,v;for(i=0;i<C.length;i++){v=Q.get(C[i]);if(v){P[C[i]]=v.slice(0,200);H=true}}try{if(document.referrer){var h=new URL(document.referrer).hostname,b=function(x){return x.replace(/^www\\./,"")};if(h&&b(h)!==b(L.hostname))R=h.slice(0,200)}}catch(e){}try{S=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}var f=S&&Date.parse(S.first_seen_at);if(!S||typeof S!=="object"||!f||n-f>D){S={};for(i in P)S[i]=P[i];S.landing_page=(L.pathname+L.search).slice(0,300);if(R)S.referrer=R;S.first_seen_at=new Date(n).toISOString()}if(H||R){S.last_utm_source=P.utm_source||"";S.last_utm_medium=P.utm_medium||"";S.last_utm_campaign=P.utm_campaign||"";S.last_referrer=R;S.last_seen_at=new Date(n).toISOString()}localStorage.setItem(K,JSON.stringify(S))}catch(e){}})();`;

/** Browser only. The stored record, or undefined (SSR, blocked storage, none). */
export function getAttribution(): Attribution | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return sanitizeAttribution(parsed);
  } catch {
    return undefined;
  }
}

const CAPS: Partial<Record<AttributionKey, number>> = {
  landing_page: 300,
  first_seen_at: 40,
  last_seen_at: 40,
};

/**
 * Server side (and reused by the reader). Accepts the object, or a JSON string
 * (multipart forms post it as one field). Unknown keys dropped, non-strings
 * dropped, control characters stripped, each value capped (200; landing_page
 * 300). Returns undefined when nothing survives, so callers can `?? null`.
 */
export function sanitizeAttribution(input: unknown): Attribution | undefined {
  let value = input;
  if (typeof value === "string") {
    if (value.length > 8000) return undefined;
    try {
      value = JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const src = value as Record<string, unknown>;
  const out: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const v = src[key];
    if (typeof v !== "string") continue;
    const clean = cleanValue(key, v.trim());
    if (clean) out[key] = clean.slice(0, CAPS[key] ?? 200);
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Every value is visitor-controlled. utm_* / click ids: a conservative charset
 * or dropped. Referrers: a bare hostname or dropped. landing_page: the path
 * (and query) re-serialised through new URL(), then the same charset. Dates:
 * ISO only. Nothing else survives, so no value can carry markup.
 */
const SAFE = /^[A-Za-z0-9._~\-/ +%:=&?,]+$/;
const HOST = /^[A-Za-z0-9.-]+$/;

function cleanValue(key: AttributionKey, v: string): string {
  if (!v) return "";
  if (key === "referrer" || key === "last_referrer") {
    let host = v;
    try {
      host = new URL(v.includes("://") ? v : `https://${v}`).hostname;
    } catch {
      return "";
    }
    return HOST.test(host) ? host.toLowerCase() : "";
  }
  if (key === "landing_page") {
    try {
      const u = new URL(v, "https://example.invalid");
      const path = `${u.pathname}${u.search}`;
      return SAFE.test(path) && !/[<>"'`]/.test(path) ? path : "";
    } catch {
      return "";
    }
  }
  if (key === "first_seen_at" || key === "last_seen_at") {
    return /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(v) ? v : "";
  }
  return /^[A-Za-z0-9._~\-/ +%:]+$/.test(v) ? v : "";
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** The same line, HTML-escaped. ANY use inside an HTML email body goes through this. */
export function attributionLineHtml(a: Attribution | undefined): string {
  return escapeHtml(attributionLine(a));
}

/**
 * One line for the owner email, e.g.
 *   "Source: google / cpc · Landing: /panel-upgrades · Referrer: chatgpt.com"
 * Empty string when there is nothing worth printing.
 */
export function attributionLine(a: Attribution | undefined): string {
  if (!a) return "";
  const parts: string[] = [];
  const src = [a.utm_source, a.utm_medium].filter(Boolean).join(" / ");
  if (src) parts.push(`Source: ${src}`);
  if (a.utm_campaign) parts.push(`Campaign: ${a.utm_campaign}`);
  const click = a.gclid ? "Google Ads" : a.gbraid || a.wbraid ? "Google Ads (iOS)" : a.msclkid ? "Microsoft Ads" : a.fbclid ? "Facebook" : "";
  if (click) parts.push(`Click: ${click}`);
  if (a.landing_page) parts.push(`Landing: ${a.landing_page.split("?")[0]}`);
  if (a.referrer) parts.push(`Referrer: ${a.referrer}`);
  const last = [a.last_utm_source, a.last_utm_medium].filter(Boolean).join(" / ") || a.last_referrer || "";
  const first = src || a.referrer || "";
  if (last && last !== first) parts.push(`Latest visit: ${last}`);
  return parts.join(" · ");
}
