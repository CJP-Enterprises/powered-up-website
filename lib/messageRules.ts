/* ============================================================
   CJP lead guard — message rules (isomorphic).

   SOURCE OF TRUTH: ~/.claude/skills/new-client-build/assets/lead-guard/
   Copied verbatim into each client repo as lib/messageRules.ts.
   Fix it upstream and re-copy; never edit a client's copy in place.

   These live in their own file rather than inside the API route because BOTH
   sides need them and they must not drift apart: the form uses them to warn a
   real person before they submit, and the route enforces them for anything
   that posts directly. If the two disagree, a homeowner gets told their
   message is fine and is then silently filtered, which is the exact failure
   this whole filter is meant to avoid.
   ============================================================ */

// A genuine quote request describes the job. Spam that clears the name and
// email checks typically does not.
export const MIN_MESSAGE_WORDS = 3;

// Fallback floor for scripts that do not space their words (Japanese,
// Chinese), which legitimately tokenise as a single word.
const MIN_MESSAGE_CHARS = 12;

// Split a message into word tokens: whitespace-separated runs, stripped of
// surrounding punctuation, keeping only those with a letter or digit in them.
// "Need a 200A panel, asap!" -> ["Need", "a", "200A", "panel", "asap"]
export function messageWords(message: string): string[] {
  return message
    .split(/\s+/)
    .map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter((t) => /[\p{L}\p{N}]/u.test(t));
}

// True when the submitter told us nothing at all. Requiring one letter or
// digit also catches a blank in disguise: a lone space, ".", "-".
export function messageIsEmpty(message: string): boolean {
  return !/[\p{L}\p{N}]/u.test(message);
}

// True when there is a message but it is too thin to be a real request.
export function messageIsTooShort(message: string): boolean {
  if (messageWords(message).length >= MIN_MESSAGE_WORDS) return false;

  // A message with no Latin letters is likely written in a script that does
  // not use spaces, where a word count built for English does not apply.
  // Judge those by length instead so they are not rejected for being one token.
  const dense = message.replace(/\s+/g, "");
  if (!/[A-Za-z]/.test(message) && dense.length >= MIN_MESSAGE_CHARS) return false;

  return true;
}
