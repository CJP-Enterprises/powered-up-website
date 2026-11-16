/**
 * "What to expect" beside the booking forms (SEO playbook rows 325/376).
 * Owner facts already on the site, nothing new:
 * - step 1: components/QualifyForm.tsx ("Quick form, then pick a time on
 *   Micah's calendar").
 * - step 2: QualifyForm ("He'll call at the selected time to confirm the
 *   project and provide a quote") + the home FAQ ("Most quote requests are
 *   returned within 24 hours").
 * - step 3: home hero ("handled from quote to inspection by the same licensed
 *   electrician") + lib/services.ts ("Permits pulled, inspections coordinated").
 * - step 4: lib/services.ts ("coordinate the inspection with the local town
 *   wiring inspector").
 * - warranty: none stated on the site or in the vault, so no line.
 */
export const EXPECT_STEPS = [
  {
    title: "Quick form, pick a time",
    body: "Fill in the quick form, then pick a time on Micah's calendar.",
  },
  {
    title: "Micah calls with a quote",
    body: "He calls at the time you picked to confirm the project and provide a quote. Most quote requests are returned within 24 hours.",
  },
  {
    title: "Permit pulled, work done",
    body: "The same licensed electrician handles the job from quote to inspection. Permits pulled, no subs, no call center.",
  },
  {
    title: "Inspection coordinated",
    body: "We coordinate the inspection with the local town wiring inspector.",
  },
] as const;

export const WARRANTY: string | null = null;
