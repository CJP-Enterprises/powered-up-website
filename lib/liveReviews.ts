/**
 * Live Google reviews for a CJP client site (new-client-build asset, v1.0.1, 2026-11-14; 1.0.1 = type-only fix for noUncheckedIndexedAccess, no runtime change).
 *
 * New 4-5 star Google reviews show up on the site by themselves. The CJP feed
 * (cjp-frontdesk GET https://go.cjp-enterprises.com/api/public/google-reviews?place_id=)
 * returns up to 5 recent 4-5 star reviews with text: { id, author ("Jane D."),
 * rating, date (YYYY-MM-DD | null), text }. No key on the site; the place_id must
 * already be in Supabase `site_reviews` (the same row the rating band uses).
 *
 * Rules (vault sops/new-client-build.md, step 5):
 * - lib/reviews.ts stays the curated, verbatim list. This file only ADDS reviews
 *   the curated list does not already have, and returns the curated list
 *   unchanged when the feed fails, times out or the site has no Place ID. It can
 *   never break the build: every error path returns [].
 * - Fetch it in a SERVER component / at build time only, never in the browser,
 *   and never above the fold (the hero and LCP never wait on it).
 * - Caching: pass the SAME fetch cache option the site's lib/googleRating.ts uses.
 *   Default `{ next: { revalidate: 86400 } }` (daily). If googleRating uses
 *   `cache: "force-cache"` (fully static site), pass that, so this file never
 *   turns a static site into an ISR one (vault memory: vercel-isr-regeneration-500).
 * - Schema: keep Review / AggregateRating JSON-LD on what it used today. Do not
 *   feed live reviews into structured data.
 *
 * Usage:
 *   import { getLiveReviews, mergeReviews } from "@/lib/liveReviews";
 *   const live = await getLiveReviews(site.googlePlaceId);
 *   const shown = mergeReviews(reviews, live, {
 *     text: (r) => r.quote,
 *     author: (r) => r.name,
 *     from: (l) => ({ quote: l.text, name: l.author, stars: l.rating }),
 *   });
 * For the cjp-visual ReviewStage shape ({ reviewData, homePicks }) use
 * mergeReviewData(reviewData, homePicks, live).
 */

export const GOOGLE_REVIEWS_FEED = "https://go.cjp-enterprises.com/api/public/google-reviews";

export type LiveReview = {
  /** Google's id for the review; stable across fetches. */
  id: string;
  /** First name + last initial, as Google shows it ("Jane D."). */
  author: string;
  /** 4 or 5. */
  rating: number;
  /** YYYY-MM-DD, or null. */
  date: string | null;
  /** Verbatim. */
  text: string;
};

type FetchCache = { next?: { revalidate?: number | false }; cache?: RequestCache };

const PLACE_ID_RE = /^[A-Za-z0-9_-]{10,200}$/;

function isLiveReview(x: unknown): x is LiveReview {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.author === "string" &&
    typeof r.rating === "number" &&
    r.rating >= 4 &&
    r.rating <= 5 &&
    typeof r.text === "string" &&
    r.text.trim().length > 0 &&
    (r.date === null || typeof r.date === "string")
  );
}

/** Recent 4-5 star Google reviews with text, newest first. [] on any failure. */
export async function getLiveReviews(
  placeId: string | null | undefined,
  cacheInit: FetchCache = { next: { revalidate: 86400 } },
  timeoutMs = 5000,
): Promise<LiveReview[]> {
  if (!placeId || !PLACE_ID_RE.test(placeId)) return [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A race, not an AbortSignal: a signal can opt the fetch out of Next's cache.
    const load = (async () => {
      const res = await fetch(`${GOOGLE_REVIEWS_FEED}?place_id=${encodeURIComponent(placeId)}`, cacheInit as RequestInit);
      if (!res.ok) return [];
      const body = (await res.json()) as { reviews?: unknown };
      return Array.isArray(body.reviews) ? body.reviews.filter(isLiveReview) : [];
    })();
    const timeout = new Promise<LiveReview[]>((resolve) => {
      timer = setTimeout(() => resolve([]), timeoutMs);
    });
    return await Promise.race([load.catch(() => [] as LiveReview[]), timeout]);
  } catch {
    return [];
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Lowercase letters/digits only, so curly quotes, spacing and "…" never matter. */
export function normalizeReviewText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** First name + first letter of the surname, normalised ("Jane Doe" / "jane d." -> "jane d"). */
export function authorKey(name: string): string {
  const words = name.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0] ?? "";
  if (words.length === 1) return first;
  return `${first} ${(words[words.length - 1] ?? "").charAt(0)}`;
}

/**
 * True when a live review is already in the curated list: same text (either one
 * contains the other's first 60 characters, so stored excerpts still match), or
 * same reviewer (first name + surname initial) when the author is known.
 */
export function isAlreadyCurated(
  live: LiveReview,
  curatedTexts: readonly string[],
  curatedAuthors: readonly string[] = [],
): boolean {
  const t = normalizeReviewText(live.text);
  const head = t.slice(0, 60);
  for (const c of curatedTexts) {
    const n = normalizeReviewText(c);
    if (!n) continue;
    if (n.includes(head) || t.includes(n.slice(0, 60))) return true;
  }
  const a = authorKey(live.author);
  return Boolean(a) && a !== "google reviewer" && curatedAuthors.some((c) => authorKey(c) === a);
}

/** Live reviews the curated list does not already carry, newest first. */
export function newLiveReviews(
  live: readonly LiveReview[],
  curatedTexts: readonly string[],
  curatedAuthors: readonly string[] = [],
): LiveReview[] {
  const seen = new Set<string>();
  return live.filter((l) => {
    if (seen.has(l.id) || isAlreadyCurated(l, curatedTexts, curatedAuthors)) return false;
    seen.add(l.id);
    return true;
  });
}

/**
 * Curated list + new live reviews. New ones go first (they are the newest) unless
 * `placement: "end"`. `maxNew` caps how many live ones are added (default 3), so a
 * layout never grows by more than that; curated reviews are never dropped.
 */
export function mergeReviews<T>(
  curated: readonly T[],
  live: readonly LiveReview[],
  opts: {
    text: (r: T) => string;
    author?: (r: T) => string | null | undefined;
    from: (l: LiveReview) => T;
    maxNew?: number;
    placement?: "start" | "end";
  },
): T[] {
  const add = newLiveReviews(
    live,
    curated.map(opts.text),
    opts.author ? curated.map((r) => opts.author!(r) ?? "").filter(Boolean) : [],
  )
    .slice(0, opts.maxNew ?? 3)
    .map(opts.from);
  return opts.placement === "end" ? [...curated, ...add] : [...add, ...curated];
}

/* ---- cjp-visual ReviewStage shape ({ reviewData, homePicks }) ------------- */

type StageRecord = { id: string; quote: string; name: string; stars?: 1 | 2 | 3 | 4 | 5 };
type StageData<R extends StageRecord> = { platform: string; provenance: string; reviews: readonly R[] };
type StagePick = string | { id: string; excerpt: string };

/**
 * Adds new live reviews to a ReviewStage review file and its picks list. The
 * first pick (the designed lead/pull quote) stays first; new reviews follow it,
 * then the rest of the curated picks. Ids are "g-<hash>" so they never collide.
 */
export function mergeReviewData<R extends StageRecord>(
  data: StageData<R>,
  picks: readonly StagePick[],
  live: readonly LiveReview[],
  maxNew = 3,
): { data: StageData<R>; picks: StagePick[] } {
  const add = newLiveReviews(
    live,
    data.reviews.map((r) => r.quote),
    data.reviews.map((r) => r.name),
  ).slice(0, maxNew);
  if (add.length === 0) return { data, picks: [...picks] };
  const records = add.map((l) => ({
    id: `g-${shortHash(l.id)}`,
    quote: l.text,
    name: l.author,
    stars: Math.round(l.rating) as 4 | 5,
  })) as unknown as R[];
  const ids = records.map((r) => r.id);
  return {
    data: {
      ...data,
      provenance: `${data.provenance}; plus ${records.length} pulled live from the CJP Google reviews feed`,
      reviews: [...data.reviews, ...records],
    },
    picks: picks.length ? [picks[0] as StagePick, ...ids, ...picks.slice(1)] : ids,
  };
}

function shortHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
