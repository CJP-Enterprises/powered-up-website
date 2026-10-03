import type { GoogleRating } from "@/lib/googleRating";

/**
 * Google reviews band, directly under the homepage hero. Server-rendered from
 * getGoogleRating(): no client fetch, no Google script, nothing competing with
 * the hero photo for LCP. Renders nothing when there is no count.
 */
export default function GoogleReviewsBand({ rating }: { rating: GoogleRating | null }) {
  if (!rating || rating.count <= 0) return null;
  const pct = Math.max(0, Math.min(100, (rating.rating / 5) * 100));
  const score = rating.rating.toFixed(1);
  return (
    <section className="greviews" aria-label="Google reviews">
      <div className="wrap greviews-inner">
        <div className="greviews-score">
          <span className="greviews-rating">{score}</span>
          <div className="greviews-meta">
            <span className="greviews-stars" role="img" aria-label={`Rated ${score} out of 5 on Google`}>
              <span className="greviews-stars-base" aria-hidden="true">★★★★★</span>
              <span className="greviews-stars-fill" aria-hidden="true" style={{ width: `${pct}%` }}>
                ★★★★★
              </span>
            </span>
            <span className="greviews-count">
              {`${rating.count} Google review${rating.count === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>
        <div className="greviews-actions">
          <a className="btn btn-primary greviews-btn" href={rating.reviewUrl} target="_blank" rel="noopener">
            Leave us a Google review
          </a>
          <a className="greviews-read" href={rating.mapsUrl} target="_blank" rel="noopener">
            Read our reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}
