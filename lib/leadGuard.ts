/* ============================================================
   CJP lead guard — layered spam filtering for client lead forms.  v1.0.0

   SOURCE OF TRUTH: ~/.claude/skills/new-client-build/assets/lead-guard/
   Copied verbatim into each client repo as lib/leadGuard.ts.
   Fix it upstream and re-copy; never edit a client's copy in place.
   Bump LEAD_GUARD_VERSION on every change so drift is visible in a grep.

   WHY THIS EXISTS
   Contractors get buried in SEO / web-design / "we noticed your website"
   outreach through their own quote form. A honeypot alone does not stop it:
   that spam is sent by real people and headless browsers that fill visible
   fields correctly and leave hidden ones alone.

   THE LAYERS (a submission must pass ALL of them to be delivered)
     1. HONEYPOT   — hidden field; bots fill it, humans cannot see it.
     2. TIMING     — reject submissions completed in under a few seconds.
     3. GIBBERISH  — reject keyboard-mash / obviously fake names.
     4. NO MESSAGE — reject submissions that say nothing.      [opt-in]
     5. TOO SHORT  — reject messages under MIN_MESSAGE_WORDS.  [opt-in]
     6. NONSENSE   — reject messages that are mostly keyboard mash.
     7. BANNED     — reject SEO/marketing-spam signals in ANY field.

   Layers 4 and 5 are opt-in via `requireMessage` and MUST stay off wherever
   the form's message box is optional or absent. A homeowner who types "Fence"
   into an optional box is a real lead, and dropping them is far worse than
   passing a spam message through the remaining layers.

   SPAM IS NEVER HARD-FAILED. A filtered submission gets a normal-looking
   success response so bots stop retrying, but no email is sent. Every
   rejection is logged with the full payload, and the judgement-call layers
   also mail a copy to SPAM_QUARANTINE_EMAIL when it is set, because runtime
   logs roll off and that copy is what survives. A mis-caught real lead must
   always be recoverable.

   ENV (all optional — unset means "log only", which is the safe default)
     SPAM_QUARANTINE_EMAIL — mailbox that receives a copy of each filtered
       submission. Set it to Christian, not the client: it is a debugging
       surface, and pointing it at the owner just moves the spam.
     RESEND_API_KEY        — reused from the route's own config.
     Sender is read from SPAM_QUARANTINE_FROM, then QUOTE_FROM_EMAIL,
     CONTACT_FROM_EMAIL, RESEND_FROM, EMAIL_FROM — whichever the repo uses.
   ============================================================ */

import { messageIsEmpty, messageIsTooShort, messageWords } from "./messageRules";

export const LEAD_GUARD_VERSION = "1.0.0";

/* ------------------------------------------------------------------
   BANNED-PHRASE LIST  —  edit upstream, then re-copy to every client.
   Matched case-insensitively with WORD BOUNDARIES against every text field
   on the submission. Word boundaries are what make short entries safe:
   "seo" matches "SEO services" but not "Joseo". Keep entries distinctive so
   they cannot collide with legitimate trade wording, and prefer multi-word
   phrases whenever a single word is at all ambiguous.
   ------------------------------------------------------------------ */
const BANNED_PHRASES: string[] = [
  // --- SEO / link-spam outreach ---
  "seo",
  "seo audit",
  "search engine optimization",
  "search engine ranking",
  "rank your website",
  "ranking on google",
  "rank higher",
  "first page of google",
  "top of google",
  "backlink",
  "backlinks",
  "link building",
  "guest post",
  "guest posting",
  "off-page",
  "on-page seo",
  "domain authority",
  "increase traffic",
  "increase your traffic",
  "boost your traffic",
  "web traffic",
  "website traffic",
  "boost traffic",
  "drive traffic",
  "we noticed your website",
  "found your website",
  "visiting your website",
  "free consultation for your website",
  // --- Web / app dev outreach ---
  "web design",
  "website design",
  "website redesign",
  "web development",
  "app development",
  "mobile app",
  "dedicated developers",
  "hire developers",
  "wordpress",
  "shopify",
  // --- Agency / lead-broker outreach ---
  "digital marketing services",
  "lead generation",
  "lead generation service",
  "leads for your business",
  "verified leads",
  "b2b leads",
  "email list",
  "google ads management",
  "ppc management",
  "social media management",
  "ai automation",
  "ai agent",
  // --- Generic marketing spam ---
  "buy now",
  "limited time offer",
  "act now",
  "click here",
  "make money",
  "make money online",
  "work from home",
  "remove me from your list",
  "unsubscribe from this list",
  // --- Crypto / finance spam ---
  "crypto",
  "cryptocurrency",
  "bitcoin",
  "forex",
  "binary options",
  "investment opportunity",
  // --- Pharma / classic spam ---
  "viagra",
  "cialis",
  "casino",
  "payday loan",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const BANNED_REGEXES = BANNED_PHRASES.map(
  (p) => new RegExp("\\b" + escapeRegExp(p) + "\\b", "i")
);

// Minimum seconds a genuine human takes to fill out a form.
const MIN_FILL_SECONDS = 3;

export type SpamReason =
  | "honeypot"
  | "timing"
  | "gibberish-name"
  | "empty-message"
  | "too-short"
  | "nonsense"
  | "banned-phrase";

/* ---- Layer 2: timing ---------------------------------------------- */

// True if the form was submitted implausibly fast. `renderedAt` is the
// client's Date.now() when the form mounted. FAILS OPEN: a missing value or a
// negative elapsed time (clock skew) is never flagged, so a real user cannot
// be blocked by this check and a form that has not been wired up yet simply
// skips the layer instead of rejecting everyone.
function isTooFast(renderedAt: unknown, minSeconds: number): boolean {
  const at = Number(renderedAt);
  if (!Number.isFinite(at) || at <= 0) return false;
  const elapsedMs = Date.now() - at;
  return elapsedMs >= 0 && elapsedMs < minSeconds * 1000;
}

/* ---- Layer 3: gibberish names -------------------------------------- */

// Conservative keyboard-mash / fake-name detection for ONE name token.
// Deliberately lenient so real unusual names pass — accented and non-Latin
// names skip the letter-pattern heuristics entirely.
function tokenIsGibberishName(token: string): boolean {
  const t = token.trim();
  if (!t) return false; // emptiness is handled by required-field validation

  // Sane length ceiling — real name parts do not run this long.
  if (t.length > 30) return true;

  // Digits never belong in a name.
  if (/\d/.test(t)) return true;

  // Only letters (incl. accented), hyphens, apostrophes and periods.
  // Anything else (@, /, #, _, etc.) is a red flag.
  if (/[^\p{L}'.\-]/u.test(t)) return true;

  // The vowel / consonant-run heuristics only make sense for plain ASCII
  // letters. If the name uses accented or non-Latin letters, trust it.
  const lettersOnly = t.replace(/[^A-Za-z]/g, "");
  if (!lettersOnly) return false;
  if (!/^[A-Za-z]+$/.test(lettersOnly)) return false; // non-ASCII letters present

  // No vowel at all (y counts) in a 4+ letter token → mash (e.g. "hjkl").
  if (lettersOnly.length >= 4 && !/[aeiouy]/i.test(lettersOnly)) return true;

  // 5+ consonants in a row (y treated as a vowel that breaks the run) → mash.
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(lettersOnly)) return true;

  return false;
}

// Judge a name ONE TOKEN AT A TIME. This matters: many client forms use a
// single "name" field, and running the consonant-run heuristic across the
// whole string would splice unrelated letters together over the space and
// flag real people — "John Schmidt" collapses to "hnSchm", six consonants,
// and would be rejected. Splitting first makes that impossible.
export function looksLikeGibberishName(name: string): boolean {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  if (tokens.length > 6) return true; // a name, not a sentence
  return tokens.some(tokenIsGibberishName);
}

/* ---- Layer 6: nonsense messages ------------------------------------ */

// Keyboard mash is mostly typed by dragging along a row, so row adjacency is
// the signal that actually separates "asdf" from a real word. A vowel test is
// not enough on its own: "asdf" and "qwer" both contain vowels.
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const KEY_POS = new Map<string, [number, number]>();
KEYBOARD_ROWS.forEach((row, r) =>
  [...row].forEach((ch, c) => KEY_POS.set(ch, [r, c]))
);

const MIN_KEYBOARD_RUN = 4;

// How many of a token's characters sit inside a run of MIN_KEYBOARD_RUN or
// more consecutive keys along one keyboard row, in a consistent direction.
// Counts coverage rather than the single longest run, so repeated mash
// ("asdfasdf") scores 8 of 8 instead of 4 of 8 and is still caught.
function keyboardRunCoverage(token: string): number {
  const t = token.toLowerCase();
  const n = t.length;
  const covered = new Array<boolean>(n).fill(false);
  let i = 0;
  while (i < n) {
    let j = i;
    let dir = 0;
    while (j + 1 < n) {
      // Indexed reads are widened to `string | undefined` under
      // noUncheckedIndexedAccess, which some client repos enable. Pull them out
      // first so this file typechecks identically everywhere.
      const chA = t[j];
      const chB = t[j + 1];
      if (chA === undefined || chB === undefined) break;
      const a = KEY_POS.get(chA);
      const b = KEY_POS.get(chB);
      if (!a || !b || a[0] !== b[0] || Math.abs(b[1] - a[1]) !== 1) break;
      const d = b[1] - a[1];
      if (dir !== 0 && d !== dir) break;
      dir = d;
      j++;
    }
    if (j - i + 1 >= MIN_KEYBOARD_RUN) {
      for (let k = i; k <= j; k++) covered[k] = true;
    }
    i = Math.max(j, i + 1);
  }
  return covered.filter(Boolean).length;
}

// Does ONE word token look like keyboard mash? Deliberately narrower than the
// name version above. Digits, punctuation and long tokens are all normal in a
// project description ("200A", "NEMA 14-50"), so this judges nothing but
// purely alphabetic ASCII tokens. Accented and non-Latin words are trusted.
//
// The coverage ratio is what keeps real words safe. "liberty" and "property"
// both contain the row run "erty", but it covers only 4 of 7 and 4 of 8
// characters, under the threshold — and Liberty Township is a real service
// area for one of these clients.
function tokenLooksLikeMash(token: string): boolean {
  if (!/^[A-Za-z]+$/.test(token)) return false; // digits, punctuation, non-ASCII
  if (token.length < 4) return false; // too short to judge ("hvac", "ok", "sub")

  const covered = keyboardRunCoverage(token);
  if (covered >= MIN_KEYBOARD_RUN && covered / token.length >= 0.6) return true;

  if (!/[aeiouy]/i.test(token)) return true; // no vowel at all ("hjkl", "zxcvb")
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(token)) return true; // consonant run
  return false;
}

// True only when MOST of the message is keyboard mash. Conservative on
// purpose. One odd word must never sink a real request, because customers
// paste model numbers, brand names and abbreviations that no heuristic should
// be second-guessing. Needs a clear majority of mashed tokens AND at least two
// of them, so "Need a Siemens QN2200 breaker" passes and "asdf hjkl qwer" does
// not.
export function looksLikeNonsense(message: string): boolean {
  const tokens = messageWords(message);
  if (tokens.length < 2) return false;
  const mashed = tokens.filter(tokenLooksLikeMash).length;
  return mashed >= 2 && mashed / tokens.length >= 0.6;
}

/* ---- Layer 7: banned content --------------------------------------- */

// Bare domains as well as full URLs. Spam bodies carry several; a real
// customer occasionally pastes one (a photo link, a product page), which is
// why the threshold below is two and not one.
const URL_RE =
  /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+\.(?:com|net|org|io|co|biz|info|ru|cn|xyz|top|shop|online|site|us|uk|de|link|click)\b/gi;

// Email addresses have to come out before URLs are counted. Every submission
// carries one by definition, and its domain ("x.com") matches the bare-domain
// pattern above — so without this, a single legitimate pasted link puts a real
// customer at two "URLs" and gets them filtered.
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

function countUrls(text: string): number {
  const matches = text.replace(EMAIL_RE, " ").match(URL_RE);
  return matches ? matches.length : 0;
}

// Scans EVERY text field, not just the message. Spam that leads with its
// pitch in the name field is common, and a message-only check waves it
// through — which is exactly how the first version of this filter leaked.
function hasBannedContent(fields: string[]): boolean {
  const haystack = fields.filter(Boolean).join("\n");
  if (!haystack) return false;
  if (BANNED_REGEXES.some((re) => re.test(haystack))) return true;
  if (countUrls(haystack) >= 2) return true;
  return false;
}

/* ---- The guard ------------------------------------------------------ */

export interface LeadFields {
  /** Full name, or leave unset and pass firstName / lastName instead. */
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** The hidden honeypot field's submitted value. Any content means a bot. */
  honeypot?: unknown;
  /** The form's mount timestamp (client Date.now()). Missing = layer skipped. */
  renderedAt?: unknown;
  /** Which page the form was on, for the rejection log. */
  page?: string;
  /** Any other free-text fields to scan: service, projectType, subject... */
  extra?: Record<string, string | undefined>;
}

export interface GuardConfig {
  /**
   * Turn on the empty-message and too-short layers. ONLY set this where the
   * form's message box is genuinely required. Leaving it off on a site with an
   * optional message box is the correct, deliberate choice, not an oversight.
   */
  requireMessage?: boolean;
  /** Override the 3-second floor if a form is unusually short or long. */
  minFillSeconds?: number;
}

/**
 * Judge a submission. Returns the reason it is spam, or null when it is clean.
 * Pure and synchronous — safe to unit test and safe to call before any I/O.
 */
export function inspectLead(
  fields: LeadFields,
  config: GuardConfig = {}
): SpamReason | null {
  const name =
    (fields.name ?? [fields.firstName, fields.lastName].filter(Boolean).join(" "))
      .trim();
  const email = (fields.email ?? "").trim();
  const message = (fields.message ?? "").trim();
  const extras = Object.values(fields.extra ?? {}).map((v) => (v ?? "").trim());

  // 1. HONEYPOT
  if (typeof fields.honeypot === "string" && fields.honeypot.trim()) {
    return "honeypot";
  }

  // 2. TIMING
  if (isTooFast(fields.renderedAt, config.minFillSeconds ?? MIN_FILL_SECONDS)) {
    return "timing";
  }

  // 3. GIBBERISH NAME
  if (name && looksLikeGibberishName(name)) return "gibberish-name";

  // 4 & 5. MESSAGE SUBSTANCE — only where the form actually demands a message.
  if (config.requireMessage) {
    if (messageIsEmpty(message)) return "empty-message";
    if (messageIsTooShort(message)) return "too-short";
  }

  // 6. NONSENSE — judged only when there is a message to judge.
  if (message && looksLikeNonsense(message)) return "nonsense";

  // 7. BANNED CONTENT — across every field the submitter controls.
  if (hasBannedContent([name, email, message, ...extras])) return "banned-phrase";

  return null;
}

/* ---- Quarantine ----------------------------------------------------- */

// Rejections that get mailed to the quarantine mailbox: the ones where a real
// person could plausibly be caught. Honeypot and timing are excluded on
// purpose. A human cannot fill a field they cannot see, and the timing check
// already fails open, so a hit on either is a bot with no real false-positive
// risk. Excluding them also stops a bot flood from burying the mailbox, which
// is what would make the quarantine useless in practice.
const QUARANTINED_REASONS = new Set<SpamReason>([
  "gibberish-name",
  "empty-message",
  "too-short",
  "nonsense",
  "banned-phrase",
]);

function quarantineSender(): string | undefined {
  return (
    process.env.SPAM_QUARANTINE_FROM ||
    process.env.QUOTE_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    undefined
  );
}

// Mails a copy of a filtered submission so it outlives the runtime logs.
// Strictly best effort: every failure is logged and swallowed, because a
// problem here must never change what the caller sees or block the response.
// Unset SPAM_QUARANTINE_EMAIL and this is a no-op.
async function quarantine(
  reason: SpamReason,
  details: Record<string, unknown>
): Promise<void> {
  const to = process.env.SPAM_QUARANTINE_EMAIL;
  const from = quarantineSender();
  const key = process.env.RESEND_API_KEY;
  if (!to || !from || !key) return;
  if (!QUARANTINED_REASONS.has(reason)) return;

  const lines = [
    "This submission was caught by the lead form spam filter and was NOT",
    "delivered as a lead. It is copied here so a real lead caught by mistake",
    "can still be recovered. Genuine spam needs no action.",
    "",
    "Filter: " + reason,
    "Guard:  v" + LEAD_GUARD_VERSION,
    "",
    ...Object.entries(details).map(([k, v]) => k + ": " + String(v)),
  ];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[Filtered: ${reason}] lead form submission`,
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "leadGuard: quarantine copy rejected by Resend " + res.status + ": " + detail
      );
    }
  } catch (err) {
    console.error("leadGuard: quarantine copy failed:", err);
  }
}

/**
 * The one call a route makes. Returns null when the submission is clean and
 * the route should carry on; otherwise logs it, mails a quarantine copy, and
 * returns the Response to send back immediately.
 *
 * `successBody` MUST mirror what the route returns on a genuine success, so a
 * rare false positive sees the same confirmation screen a real lead does. Do
 * NOT include a marker the client reads to fire a conversion event: spam must
 * never be counted as a lead in GA4.
 */
export async function screenLead(
  fields: LeadFields,
  config: GuardConfig = {},
  successBody: Record<string, unknown> = { ok: true }
): Promise<Response | null> {
  const reason = inspectLead(fields, config);
  if (!reason) return null;

  const details = {
    name:
      fields.name ??
      [fields.firstName, fields.lastName].filter(Boolean).join(" ") ??
      "(none)",
    email: fields.email || "(none)",
    phone: fields.phone || "(not provided)",
    message: fields.message || "(none)",
    page: fields.page || "(unknown)",
    ...(fields.extra ?? {}),
  };

  console.warn(
    `leadGuard: REJECTED (${reason}) — no email sent. Submission:`,
    JSON.stringify(details)
  );
  await quarantine(reason, details);

  return Response.json(successBody, { status: 200 });
}
