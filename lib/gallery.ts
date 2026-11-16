/**
 * Gallery items (moved from app/gallery/page.tsx so service pages can show
 * the same real job photos). `services` tags a photo to a service page ONLY
 * where its own caption names that work (panel / service upgrade, SPAN panel,
 * EV charger); underground, solar, portrait and van photos carry none.
 * Order = newest job first (the gallery has always been kept that way).
 */
export type GalleryItem = {
  cls: string;
  src: string;
  alt: string;
  tag: string;
  services?: string[];
  title: string;
  desc: string;
};

// Every item here is a real job photo. The previous first entry was an
// AI-generated SPAN panel carrying a visible "AI-generated content" watermark,
// presented as Micah's own finished work; it was a fabricated cover-on version
// of the genuine SPAN install further down this list.
export const ITEMS: GalleryItem[] = [
  // Underground service job, Sept 21-23 2026. Six photos from Micah, shown in
  // the order the work happened: trench, conduit, posts, wire pull, pedestal.
  {
    cls: "gallery-item",
    src: "/photos/work-underground-meter-pedestal.jpg",
    alt: "Finished freestanding meter pedestal by Powered Up LLC — meter socket on a post-mounted board with underground conduit to grade",
    tag: "Underground Service · Finished",
    title: "Freestanding Meter Pedestal",
    desc: "Day three. Meter socket and junction box mounted on a post-set pedestal, with the underground conduit runs stubbed up to grade. Clean, plumb, and ready for the utility.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-underground-pedestal-wire-pull.jpg",
    alt: "Underground service conduits stubbed up between two pressure-treated posts with feeder conductors pulled through",
    tag: "Underground Service · Day 2",
    title: "Posts Set, Feeders Pulled",
    desc: "Pressure-treated posts set and the conduits stubbed up between them. Feeder conductors pulled through the underground run before the pedestal board goes on.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-underground-conduit-house.jpg",
    alt: "Three PVC conduit runs strapped to the side of a house and swept down into an underground trench",
    tag: "Underground Service · Day 1",
    title: "Conduit Up the House",
    desc: "Three conduit runs strapped to the siding and swept into the trench at the foundation, so nothing shows above grade but clean pipe.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-underground-trench-conduit.jpg",
    alt: "Three grey PVC conduits laid in an open trench beside a landscaped bed",
    tag: "Underground Service · Day 1",
    title: "Conduit in the Trench",
    desc: "Conduits laid in the open trench, routed under an existing shrub so the planting stays put.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-underground-trench-excavator.jpg",
    alt: "Mini excavator trenching for underground electrical conduit through a landscaped yard with boulders moved aside",
    tag: "Underground Service · Day 1",
    title: "Trenching the Run",
    desc: "Mini excavator on site for the trench. Boulders lifted out and set aside, shrubs kept, conduit laid the same day.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-underground-pedestal-back.jpg",
    alt: "Back of the meter pedestal board with two conduits strapped up, Powered Up LLC van in the driveway",
    tag: "Underground Service · Day 3",
    title: "Pedestal Board, Van in the Drive",
    desc: "The back side of the pedestal with the conduits strapped up the board. That is the Powered Up van in the driveway, which means Micah is the one on the job.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-tesla-charger-install.jpg",
    alt: "Tesla Wall Connector installed by Powered Up LLC — home EV charger with dedicated circuit and conduit run",
    tag: "EV Charger",
    services: ["ev-chargers"],
    title: "Tesla Wall Connector Install",
    desc: "Tesla Wall Connector Level 2 EV charger install with dedicated 240V circuit, proper conduit run, and code-compliant disconnect. Installed in an exterior alcove for weather protection.",
  },
  {
    cls: "gallery-item portrait",
    src: "/photos/micah-portrait.jpg",
    alt: "Micah Gentile, owner and licensed electrician at Powered Up LLC",
    tag: "Meet the Owner",
    title: "Micah Gentile · Owner & Licensed Electrician",
    desc: "When you call Powered Up LLC, this is who answers. Massachusetts-licensed electrician, owner-operator, and the one who shows up to do the work. Pictured at a commercial Enphase battery storage install.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-service-upgrade-white.jpg",
    alt: "200A electrical service upgrade installation on a white South Shore home",
    tag: "Service Upgrade",
    services: ["panel-upgrades"],
    title: "200A Service Install",
    desc: "New meter base, main disconnect, and service entry conduit on a residential home. Permit pulled, inspection coordinated.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-solar-enphase.jpg",
    alt: "Enphase solar PV system maintenance on a South Shore home",
    tag: "Solar Service",
    title: "Enphase Solar System Service",
    desc: "Solar PV system maintenance and disconnect work. Powered Up LLC handles troubleshooting and service on existing Enphase systems.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-service-upgrade-victorian.jpg",
    alt: "Service entry upgrade on a Victorian home in the Greater Boston area",
    tag: "Older Home",
    services: ["panel-upgrades"],
    title: "Victorian Service Upgrade",
    desc: "Service entry upgrade on a historic South Shore home. Older homes often need careful coordination with knob-and-tube remediation and modern code compliance.",
  },
  {
    cls: "gallery-item featured",
    src: "/photos/company-van.jpg",
    alt: "Powered Up LLC company van with branding and contact information",
    tag: "On The Road",
    title: "Powered Up LLC · Across the South Shore",
    desc: "If you see the van around Taunton, Brockton, Raynham, or Plymouth — that's us. Residential and commercial · service upgrades · rewires · new construction · car chargers.",
  },
  // This photo is a SPAN smart panel, but the copy on it described a meter
  // base, conduit run and disconnect — the caption belonged to a different
  // job. The SPAN description that was attached to the deleted AI image was
  // accurate; it just had a fabricated photo under it. Reunited here.
  {
    cls: "gallery-item",
    src: "/photos/work-finished-service.jpg",
    alt: "SPAN smart panel installed by Powered Up LLC, backlit and open to show the breaker layout",
    tag: "Smart Panel",
    services: ["panel-upgrades"],
    title: "SPAN Smart Panel Install",
    desc: "Finished SPAN smart panel install. Per-circuit monitoring, dynamic load management, and app-based control — the modern replacement for a traditional breaker panel. One of the few installers of this level of electrical hardware on the South Shore.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-panel-install-02.jpg",
    alt: "Electrical panel work by Powered Up LLC — install and coordination",
    tag: "Panel Install",
    services: ["panel-upgrades"],
    title: "Panel Install",
    desc: "Electrical panel installation with clean wire management. Residential and commercial capability across the South Shore.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-panel-install-03.jpg",
    alt: "Electrical panel work by Powered Up LLC — residential install",
    tag: "Panel Install",
    services: ["panel-upgrades"],
    title: "Panel Install",
    desc: "Residential panel work. All installs done to current Massachusetts Electrical Code with permit and inspection coordination.",
  },
];
