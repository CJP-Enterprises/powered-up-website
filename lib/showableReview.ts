/**
 * Hide filter for live Google feed reviews (security review 2026-11-16,
 * Mission-Decks/mission-decks#37/#38). Pure, no imports: lib/googleRating.ts
 * re-exports it so the reviews band and the rating note share ONE list.
 * Every place a live feed review can appear filters with isShowableLiveReview
 * first; the short quote beside the call button also uses isQuotableLiveReview
 * (fails closed on any 3+ digit run). These are already-public Google reviews:
 * this keeps personal details off the client's site, it is not an approval queue.
 */

/** Site-specific hides: a reviewer's name or a phrase from their text. Checked on text AND author. */
// Powered Up: vault never_say (prices, code citations), moved here from app/page.tsx OFF_LIMITS.
export const NEVER_SHOW: readonly RegExp[] = [/\$\s?\d/, /\bNEC\b/i, /\bCMR\b/i]

/** Personal details a customer can type into a review; never republished. */
export const PERSONAL_INFO: readonly RegExp[] = [
  /\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/, // 10-digit phone
  /\+\d[\d\s().-]{7,}\d/, // +1 / international phone
  /\b\d{3}[\s.-]\d{4}\b/, // 7-digit phone
  /[\w.+-]+@[\w-]+\.[\w.]+/, // email
  /\b[\w.+-]+\s*[([]?\s*at\s*[)\]]?\s*[\w-]+\s*[([]?\s*dot\s*[)\]]?\s*(?:com|net|org|us|co|io|biz|info)\b/i, // "name at domain dot com"
  /https?:\/\/|www\./i, // links
  /\b[a-z0-9][a-z0-9-]*\.(?:com|net|org|us|co|io|biz|info)\b/i, // bare domain
  // street address: house number (1+ digits) + 1-3 words + suffix, abbreviated or full
  /\b\d+\s+(?:[a-z][a-z.'-]*\s+){1,3}(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|ct|court|blvd|boulevard|way|pl|place|cir|circle|ter|terrace|pkwy|parkway|hwy|highway|trl|trail)\b/i,
]

/** Exactly what the site renders: NFKC, format chars (zero-width etc.) removed, whitespace collapsed, trimmed. */
export function normalizeReviewField(s: string): string {
  return s.normalize('NFKC').replace(/\p{Cf}/gu, '').replace(/\s+/g, ' ').trim()
}

/** True when a live feed review may be shown on the site (text AND author checked, normalised). */
export function isShowableLiveReview(
  r: { text: string; author: string },
  neverShow: readonly RegExp[] = NEVER_SHOW,
): boolean {
  return ![r.text, r.author]
    .map(normalizeReviewField)
    .some((f) => neverShow.some((re) => re.test(f)) || PERSONAL_INFO.some((re) => re.test(f)))
}

/**
 * Stricter, for the short quote beside the call button: also fails closed on any
 * run of 3+ digits, or 7+ digits in total once separators are removed (any script).
 */
export function isQuotableLiveReview(
  r: { text: string; author: string },
  neverShow: readonly RegExp[] = NEVER_SHOW,
): boolean {
  return (
    isShowableLiveReview(r, neverShow) &&
    ![r.text, r.author]
      .map(normalizeReviewField)
      .some((f) => /\p{Nd}{3,}/u.test(f) || f.replace(/[^\p{Nd}]/gu, '').length >= 7)
  )
}
