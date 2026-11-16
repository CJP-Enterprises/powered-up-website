import { getGoogleRating, PLACE_ID, isQuotableLiveReview } from "@/lib/googleRating";
import { getLiveReviews } from "@/lib/liveReviews";
import { normalizeReviewField } from './showableReview';

/**
 * Live Google rating + the newest short review quote, beside the hero call
 * buttons and the booking forms (SEO playbook row 426).
 *
 * - Rating/count from lib/googleRating.ts, quote from the CJP live-reviews feed
 *   (lib/liveReviews.ts), both on the same hourly revalidate, server-rendered:
 *   no client fetch, no layout shift, the hero photo stays the LCP.
 * - Count shown only above 30.
 * - Visible text only. No AggregateRating / Review markup (banned fleet-wide).
 * - Quotes are verbatim, cut at a sentence or word boundary with an ellipsis,
 *   never reworded. Feed down = rating only.
 * - Same OFF_LIMITS rule as the home page reviews (vault never_say: prices,
 *   code citations): a quote that trips it is skipped.
 */
export const COUNT_MIN = 30;
const MAX_QUOTE = 110;
const OFF_LIMITS = /\$\s?\d|\bNEC\b|\bCMR\b/i;

export type RatingNoteData = {
  rating: number;
  count: number | null;
  mapsUrl: string;
  quote: { text: string; author: string } | null;
};

export function shortQuote(text: string, max = MAX_QUOTE): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const sentence = /^(.{25,}?[.!?])(\s|$)/.exec(t);
  if (sentence && sentence[1].length <= max) return sentence[1];
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > 40 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

const time = (d: string | null) => (d ? Date.parse(d) || 0 : 0);

export async function getRatingNote(): Promise<RatingNoteData | null> {
  const [rating, live] = await Promise.all([
    getGoogleRating(),
    getLiveReviews(PLACE_ID, { next: { revalidate: 3600 } }),
  ]);
  if (!rating.live || !rating.rating) return null;
  const newest = live
    .filter((r) => isQuotableLiveReview(r))
    .sort((a, b) => time(b.date) - time(a.date))
    .map((r) => ({ text: shortQuote(normalizeReviewField(r.text)), author: normalizeReviewField(r.author) }))
    .find((q) => !OFF_LIMITS.test(q.text));
  return {
    rating: rating.rating,
    count: rating.count > COUNT_MIN ? rating.count : null,
    mapsUrl: rating.mapsUrl,
    quote: newest ?? null,
  };
}
