import RatingNote from "@/components/RatingNote";
import { EXPECT_STEPS, WARRANTY } from "@/lib/whatToExpect";

/**
 * Under the booking form (navy .qualify band): the live Google rating + newest
 * review (components/RatingNote) and the "What to expect" steps
 * (lib/whatToExpect.ts). Server component.
 */
export default function FormAside() {
  return (
    <div className="mx-auto mt-16 grid max-w-[720px] gap-10 md:grid-cols-[1fr_1.3fr]">
      <RatingNote />
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-yellow">What to expect</h3>
        <ol className="mt-5 space-y-5">
          {EXPECT_STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3">
              <span aria-hidden="true" className="font-display text-2xl font-bold leading-none text-yellow/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-semibold text-cream">{s.title}</p>
                <p className="mt-1 text-[0.9375rem] leading-relaxed text-cream/75">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {WARRANTY && (
          <p className="mt-6 border-t border-cream/15 pt-4 text-sm text-cream/70">
            <span className="font-semibold text-cream">Warranty:</span> {WARRANTY}
          </p>
        )}
      </div>
    </div>
  );
}
