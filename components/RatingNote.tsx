import type { CSSProperties } from "react";
import { getRatingNote } from "@/lib/ratingNote";

/**
 * Live Google rating + newest short review (lib/ratingNote.ts), beside a call
 * button or a booking form. Server component; renders nothing when the rating
 * is unavailable. Visible text only (no review schema).
 */
export default async function RatingNote({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const d = await getRatingNote();
  if (!d) return null;
  return (
    <div className={`max-w-[34rem] ${className}`} style={style}>
      <a
        href={d.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-cream hover:text-yellow"
      >
        <span aria-hidden="true" className="inline-flex gap-0.5 text-yellow">
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M8 1.6l1.9 4.02 4.35.6-3.16 3.02.79 4.36L8 11.55l-3.88 2.05.79-4.36L1.75 6.22l4.35-.6L8 1.6Z" />
            </svg>
          ))}
        </span>
        <span>
          {d.rating.toFixed(1)} on Google{d.count !== null ? ` · ${d.count} reviews` : ""}
        </span>
      </a>
      {d.quote && (
        <p className="mt-1.5 text-sm leading-relaxed text-cream/75">
          <span>&ldquo;{d.quote.text}&rdquo;</span>{" "}
          <span className="whitespace-nowrap text-cream/55">&mdash; {d.quote.author}, Google review</span>
        </p>
      )}
    </div>
  );
}
