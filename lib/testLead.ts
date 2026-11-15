import { timingSafeEqual } from "node:crypto";

/**
 * CJP synthetic test lead v1.0.0 (skills repo assets/attribution, 2026-11-15).
 * Copy VERBATIM to lib/testLead.ts. SERVER ONLY (node:crypto): never import it
 * from a "use client" file.
 *
 * The orchestrator / an agent proves a site's lead route end to end by POSTing
 * a normal lead body plus `cjp_test_token`. When it equals env
 * CJP_TEST_LEAD_TOKEN (constant-time compare; ignored entirely when the env var
 * is unset) the route:
 *   - still runs validation and the rest of the lead guard,
 *   - skips the per-IP rate limit and the guard's fill-time check only,
 *   - emails CJP_TEST_LEAD_TO with "[CJP TEST] " on the subject, NEVER the owner,
 *   - sends no visitor auto-reply / SMS,
 *   - forwards `test: true` to Signal,
 *   - answers { ok: true, test: true } (no `lead` flag, so no GA4 event).
 *
 * Both env vars live on every client Vercel project (Production + Preview).
 * Values: ~/.cjp/test-lead.env. Never print them.
 */
export type TestLead = {
  /** True when the token matched. */
  isTest: boolean;
  /** CJP's test inbox. Null when isTest is false, or when the env var is unset
   * (then the route must refuse to send rather than fall back to the owner). */
  to: string | null;
};

export function checkTestLead(token: unknown): TestLead {
  const expected = process.env.CJP_TEST_LEAD_TOKEN?.trim();
  if (!expected || typeof token !== "string" || !token) return { isTest: false, to: null };
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) return { isTest: false, to: null };
  return { isTest: true, to: process.env.CJP_TEST_LEAD_TO?.trim() || null };
}

export const TEST_SUBJECT_PREFIX = "[CJP TEST] ";
