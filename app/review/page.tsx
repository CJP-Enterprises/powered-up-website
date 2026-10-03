import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: { absolute: "Leave a review | Powered Up LLC" },
  // Not a search destination: it is the target of a review-request text.
  robots: { index: false, follow: false },
};

// Micah's Google review link (the same one the home page reviews band uses).
import { GOOGLE_REVIEW_URL } from "@/lib/googleRating";

/**
 * /review — the branded link a review-request text carries. 10DLC content must
 * use links on the brand's own domain (public shorteners are banned), so this
 * forwards to the Google review form. Repoint it here; the filed link never changes.
 */
export default function ReviewPage() {
  redirect(GOOGLE_REVIEW_URL);
}
