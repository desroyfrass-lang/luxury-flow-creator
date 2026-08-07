/**
 * Frassy Entrance — destination registry.
 *
 * Frassy is the host of the Frass ecosystem: she welcomes a visitor once per
 * major destination per session, then steps aside into companion mode.
 * Only "major destinations" are listed here — sub-pages, product pages and
 * grids inherit nothing, so browsing never re-triggers a greeting.
 */
export interface FrassyDestination {
  /** Stable session key. */
  id: string;
  /** Short name shown under the greeting. */
  label: string;
  /** The welcome Frassy speaks on first arrival. */
  welcome: string;
}

interface DestinationRule extends FrassyDestination {
  /** Exact path, or a prefix when `prefix` is true. */
  match: string;
  prefix?: boolean;
}

const RULES: DestinationRule[] = [
  {
    id: "home",
    match: "/",
    label: "Frass",
    welcome:
      "Welcome to Frass. Where people, creativity, opportunity, and community come together. Whether you're here to shop or explore the Frass World, I'm here whenever you need me.",
  },
  {
    id: "frass-world",
    match: "/frass-world",
    prefix: true,
    label: "Frass World",
    welcome:
      "Welcome to Frass World. Every district here is a place with its own purpose — commerce, creation, learning and community. Wander wherever you're drawn; I'll be right here.",
  },
  {
    id: "frass-hill",
    match: "/frassy",
    prefix: true,
    label: "Frass Hill",
    welcome:
      "Welcome to Frass Hill, the heart of our community. This is where Builders learn, collaborate, and grow together. There's always something new waiting to be discovered.",
  },
  {
    id: "district",
    match: "/shop-frass",
    prefix: true,
    label: "The Frass District",
    welcome:
      "Welcome to the Frass District. Every door on this street is its own store, with its own story. Take your time — I think you'll enjoy exploring.",
  },
  {
    id: "kicks-district",
    match: "/kicks-district",
    prefix: true,
    label: "Frass Kicks District",
    welcome:
      "Welcome to the Frass Kicks District. This is our fashion promenade, where every storefront is a destination and every collection has its own story. Take your time — I think you'll enjoy exploring.",
  },
  {
    id: "luxury-house",
    match: "/frass-luxury-house",
    prefix: true,
    label: "Frass Luxury House",
    welcome:
      "Welcome to Frass Luxury House. Here, craftsmanship, elegance, and timeless design come together. Every room has been thoughtfully curated for you to discover at your own pace.",
  },
  {
    id: "frass-kicks",
    match: "/frass-kicks",
    prefix: true,
    label: "Frass Kicks",
    welcome:
      "Welcome to Frass Kicks. Footwear picked for how you actually move — casual, classic and street, all on one wall. Step through whenever you're ready.",
  },
  {
    id: "frass-drip",
    match: "/frass-drip",
    prefix: true,
    label: "Frass Drip",
    welcome:
      "Welcome to Frass Drip. Each floor is its own room — the Boardroom, the Night Floor, the Lounge and more. Walk the floor you're dressing for.",
  },
  {
    id: "bare-drip",
    match: "/bare-drip",
    prefix: true,
    label: "Bare Drip",
    welcome:
      "Welcome to Bare Drip. Two quiet rooms — swim on one side, intimates on the other. Everything here is chosen for comfort first.",
  },
  {
    id: "afro-designers",
    match: "/afro-designers",
    prefix: true,
    label: "Afro Designers",
    welcome:
      "Welcome to Afro Designers. These are independent houses from across the continent and the diaspora, each with their own hand. Meet the designers, then shop the work.",
  },
  {
    id: "liquidation",
    match: "/sales-clearance",
    prefix: true,
    label: "The Liquidation Room",
    welcome:
      "Welcome to the Liquidation Room. Real markdowns, a weekly hidden gem and a flash drop on the clock. Move quick — good things leave fast in here.",
  },
  {
    id: "virals",
    match: "/social-media-virals",
    prefix: true,
    label: "Social Media Virals",
    welcome:
      "Welcome to Social Media Virals. Everything trending, in one store. If you saw it on your feed, it probably lives here.",
  },
  {
    id: "capsules",
    match: "/capsules",
    prefix: true,
    label: "Capsules & Lookbooks",
    welcome:
      "Welcome to our Capsules. These are limited stories, styled end to end. Read them like editorials — then wear them.",
  },
];

/** Resolve the destination for a pathname, or null when it isn't a major one. */
export function resolveDestination(pathname: string): FrassyDestination | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  for (const rule of RULES) {
    const hit = rule.prefix
      ? path === rule.match || path.startsWith(rule.match + "/")
      : path === rule.match;
    if (hit) return { id: rule.id, label: rule.label, welcome: rule.welcome };
  }
  return null;
}
