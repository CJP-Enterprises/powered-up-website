import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

/**
 * CJP "How did you hear about us?" v1.0.0 (skills repo assets/wave5, 2026-11-16).
 * Copy VERBATIM to lib/heardAbout.ts. SERVER ONLY (node:crypto): never import it
 * from a "use client" file. The browser half is components/HeardAbout.tsx.
 *
 * Flow (wave-1 security rule: an untrusted browser never holds a CRM lead id):
 *   1. The lead route's KEYED forward to Signal/CRM answers with `lead_id`
 *      (cjp-crm #217: /api/ingest and /api/v1/leads return it only to a keyed,
 *      Origin-less caller).
 *   2. The route calls sealLeadToken(leadId) and returns `{ ..., ha: token }`.
 *      The token is AES-256-GCM (authenticated: any change fails), key =
 *      HMAC-SHA256(site secret, "cjp-heard-about-v1"), payload {l: leadId,
 *      e: expiry}, 2 h life. The lead id inside is unreadable without the key.
 *   3. The form keeps `ha` in sessionStorage and goes to /thank-you, where
 *      <HeardAbout /> asks the question and POSTs {answer, detail?, token} to
 *      /api/heard-about.
 *   4. /api/heard-about opens the token, checks expiry, and forwards
 *      {lead_id, answer, detail} to POST <crm>/api/ingest/heard-about with the
 *      same key the lead forward uses. The CRM stores leads.heard_about once.
 *
 * Site secret: env HEARD_ABOUT_SECRET when set, else the key the lead forward
 * already uses (CJP_SIGNAL_API_KEY / CJP_CRM_LEAD_KEY ...). No forward key = no
 * lead id = no token = the question simply does not show. Nothing new to set.
 */

export const HEARD_ABOUT = [
  "google_search",
  "google_maps",
  "ai_assistant",
  "social",
  "friend",
  "truck_sign",
  "other",
] as const;
export type HeardAbout = (typeof HEARD_ABOUT)[number];
export const HEARD_ABOUT_DETAIL_MAX = 60;
const TOKEN_TTL_MS = 2 * 3_600_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function secret(): string | null {
  const s =
    process.env.HEARD_ABOUT_SECRET ||
    process.env.CJP_SIGNAL_API_KEY ||
    process.env.CJP_CRM_LEAD_KEY ||
    process.env.CJP_CRM_KEY ||
    process.env.CJP_SIGNAL_KEY ||
    "";
  return s.trim() || null;
}

function keyOf(s: string): Buffer {
  return createHmac("sha256", s).update("cjp-heard-about-v1").digest();
}

/** A sealed token for this lead, or null when there is no secret / no valid id. */
export function sealLeadToken(leadId: unknown, now: number = Date.now()): string | null {
  const s = secret();
  if (!s || typeof leadId !== "string" || !UUID.test(leadId)) return null;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", keyOf(s), iv);
  const body = Buffer.concat([c.update(JSON.stringify({ l: leadId.toLowerCase(), e: now + TOKEN_TTL_MS }), "utf8"), c.final()]);
  return Buffer.concat([iv, body, c.getAuthTag()]).toString("base64url");
}

/**
 * THE way a lead route gets its token: pass the CRM forward's parsed JSON answer.
 * Seals only a lead THIS request created (security review 2026-11-16): never for a
 * duplicate/repeat folded into an existing lead (resubmitting someone else's
 * phone/email must not yield a token for their lead), never for filtered spam,
 * and only when the CRM says created: true (cjp-crm #219).
 */
export function tokenForCrmAnswer(crm: unknown): string | null {
  if (!crm || typeof crm !== "object") return null;
  const c = crm as { lead_id?: unknown; created?: unknown; filtered?: unknown; duplicate?: unknown; repeat?: unknown };
  if (c.filtered === true || c.duplicate === true || c.repeat === true || c.created !== true) return null;
  return sealLeadToken(c.lead_id);
}

/** The lead id inside a valid, unexpired token, else null. */
export function openLeadToken(token: unknown, now: number = Date.now()): string | null {
  const s = secret();
  if (!s || typeof token !== "string" || token.length < 40 || token.length > 400) return null;
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 12 + 16 + 1) return null;
    const d = createDecipheriv("aes-256-gcm", keyOf(s), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(raw.length - 16));
    const json = Buffer.concat([d.update(raw.subarray(12, raw.length - 16)), d.final()]).toString("utf8");
    const p = JSON.parse(json) as { l?: unknown; e?: unknown };
    if (typeof p.l !== "string" || !UUID.test(p.l) || typeof p.e !== "number" || p.e < now) return null;
    return p.l;
  } catch {
    return null;
  }
}

export function isHeardAbout(v: unknown): v is HeardAbout {
  return typeof v === "string" && (HEARD_ABOUT as readonly string[]).includes(v);
}

/** "Other" free text: NFKC, control/format chars and < > dropped, 60-char cap. */
export function cleanDetail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v
    .slice(0, 500)
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}<>]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, HEARD_ABOUT_DETAIL_MAX)
    .trim();
  return s || null;
}

/**
 * Where the answer goes: the CRM next to the lead forward, with the same key.
 * EDIT ONLY THIS FUNCTION per site to match the lead route's transport:
 *   Signal ingest sites: CJP_SIGNAL_INGEST_URL (.../api/ingest) + Bearer CJP_SIGNAL_API_KEY
 *   CRM v1 sites:        CJP_CRM_URL + X-CRM-Key CJP_CRM_LEAD_KEY
 * Never send an Origin header (the CRM refuses browser-shaped calls).
 */
export function crmTarget(): { url: string; headers: Record<string, string> } | null {
  const ingest = process.env.CJP_SIGNAL_INGEST_URL?.trim();
  const ingestKey = process.env.CJP_SIGNAL_API_KEY?.trim();
  if (ingest && ingestKey) {
    return {
      url: `${ingest.replace(/\/+$/, "")}/heard-about`,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ingestKey}` },
    };
  }
  const crm = process.env.CJP_CRM_URL?.trim();
  const crmKey = process.env.CJP_CRM_LEAD_KEY?.trim();
  if (crm && crmKey) {
    return {
      url: `${crm.replace(/\/+$/, "")}/api/ingest/heard-about`,
      headers: { "Content-Type": "application/json", "X-CRM-Key": crmKey },
    };
  }
  return null;
}
