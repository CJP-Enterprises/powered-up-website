import { services } from "@/lib/services";

/**
 * Related services (SEO playbook row 234): 3 sibling services at the bottom of
 * each service page, with descriptive anchors taken from each service's own
 * copy (lib/services.ts) instead of bare names. Only the six services on the
 * site are ever linked. Pairings follow the work: a panel upgrade usually comes
 * up with an EV charger or old wiring, a remodel with lighting, and so on.
 */
const ANCHOR: Record<string, string> = {
  "panel-upgrades": "Panel upgrades and Federal Pacific / Zinsco replacements",
  "ev-chargers": "Level 2 EV charger installation",
  "new-construction": "New construction and addition wiring",
  "remodel-wiring": "Kitchen and bath remodel wiring",
  "wiring-repair": "Wiring repair, knob-and-tube and aluminum wiring",
  lighting: "Fixtures and outdoor lighting",
};

const PAIRS: Record<string, string[]> = {
  "panel-upgrades": ["ev-chargers", "wiring-repair", "new-construction"],
  "ev-chargers": ["panel-upgrades", "new-construction", "lighting"],
  "new-construction": ["panel-upgrades", "ev-chargers", "lighting"],
  "remodel-wiring": ["lighting", "panel-upgrades", "wiring-repair"],
  "wiring-repair": ["panel-upgrades", "remodel-wiring", "lighting"],
  lighting: ["remodel-wiring", "wiring-repair", "new-construction"],
};

export function relatedServices(slug: string) {
  return (PAIRS[slug] ?? [])
    .map((s) => services.find((x) => x.slug === s))
    .filter((s): s is (typeof services)[number] => Boolean(s))
    .map((s) => ({ slug: s.slug, label: s.homepageLabel, anchor: ANCHOR[s.slug] ?? s.serviceName, line: s.homepageDesc }));
}
