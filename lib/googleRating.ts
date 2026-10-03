/**
 * The Google rating and review count, read from the live listing through the
 * CJP rating feed (no Google API key on this site), cached for an hour (ISR).
 * The homepage reviews band, the reviews section and the AggregateRating
 * schema all read this, so there is one source.
 */
export type GoogleRating = {
  rating: number;
  count: number;
  reviewUrl: string;
  mapsUrl: string;
  live: boolean;
};

/** Google Place ID of the Powered Up LLC Business Profile. */
export const PLACE_ID = "ChIJn_D8cRazpSURYazH1avIYOM";

/** Google's write-a-review link for that profile. /review redirects here. */
export const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJn_D8cRazpSURYazH1avIYOM";

/** Real numbers read from the live listing on 2026-10-03. Used only if the CJP feed is unreachable. */
const FALLBACK = { rating: 5.0, count: 24 } as const;

export async function getGoogleRating(): Promise<GoogleRating> {
  const reviewUrl = GOOGLE_REVIEW_URL;
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;
  try {
    const res = await fetch(
      `https://go.cjp-enterprises.com/api/public/google-rating?place_id=${PLACE_ID}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const d = await res.json();
      if (typeof d.rating === "number" && typeof d.count === "number")
        return { rating: d.rating, count: d.count, reviewUrl: d.reviewUrl || reviewUrl, mapsUrl, live: true };
    }
  } catch {}
  return { ...FALLBACK, reviewUrl, mapsUrl, live: false };
}
