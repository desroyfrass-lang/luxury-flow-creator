/**
 * FRASS-0421 Phase 2 — Town Square.
 *
 * Town Square is not TikTok. TikTok is people. Town Square is the whole town:
 * people, businesses, artists, brands, farmers, builders, events, stores,
 * districts, live broadcasts, community, foundation, announcements and creators.
 *
 * Everything on Frass Hill starts here, so the square is a *directory of
 * presences* — not a feed of posts.
 */

export type PresenceKind =
  | "people"
  | "businesses"
  | "artists"
  | "brands"
  | "farmers"
  | "builders"
  | "events"
  | "stores"
  | "districts"
  | "live"
  | "community"
  | "foundation"
  | "announcements"
  | "creators";

export type PresenceLens = {
  id: PresenceKind | "all";
  label: string;
  glyph: string;
  /** One everyday-language line: what stands here. */
  blurb: string;
};

/** The lenses across the top of the square. "All" is the default view. */
export const PRESENCE_LENSES: PresenceLens[] = [
  { id: "all", label: "The whole square", glyph: "🏛", blurb: "Everyone and everything currently standing in the square." },
  { id: "people", label: "People", glyph: "🧍", blurb: "Members of Frass Hill, with their own For Me page." },
  { id: "businesses", label: "Businesses", glyph: "🏪", blurb: "Registered Frass businesses trading on the Hill." },
  { id: "artists", label: "Artists", glyph: "🎨", blurb: "Musicians, painters, writers and performers." },
  { id: "brands", label: "Brands", glyph: "🏷", blurb: "Labels and partners running campaigns with Frass." },
  { id: "farmers", label: "Farmers", glyph: "🌱", blurb: "Growers, fishers and food producers from the Farm District." },
  { id: "builders", label: "Builders", glyph: "🛠", blurb: "Frass Builders and Skilled Builders making things in public." },
  { id: "events", label: "Events", glyph: "📅", blurb: "What is happening on the Hill this week." },
  { id: "stores", label: "Stores", glyph: "🛍", blurb: "Storefronts you can walk into right now." },
  { id: "districts", label: "Districts", glyph: "🗺", blurb: "The eight places that make up the town." },
  { id: "live", label: "Live", glyph: "🔴", blurb: "Broadcasting right now, from For Us and Frass Radio." },
  { id: "community", label: "Community", glyph: "🤝", blurb: "Circles, gatherings and shared work." },
  { id: "foundation", label: "Foundation", glyph: "💚", blurb: "Service, giving and impact on the Hill." },
  { id: "announcements", label: "Announcements", glyph: "📣", blurb: "Notices posted publicly by the town." },
  { id: "creators", label: "Creators", glyph: "🎬", blurb: "FV Studios creators, shows and channels." },
];

export type SquarePresence = {
  id: string;
  kind: PresenceKind;
  name: string;
  /** Who or what this is, in one line. */
  line: string;
  /** Where standing at this stall takes you. */
  to: string;
  /** Optional small status line ("Open now", "Sat 4pm", "3 live"). */
  status?: string;
  glyph: string;
};

/**
 * The permanent residents of the square. Live broadcasts and member profiles
 * are added on top of this at render time — these are the presences that are
 * always here, the way real market stalls are.
 */
export const SQUARE_PRESENCES: SquarePresence[] = [
  // Districts — the town itself
  { id: "d-frass", kind: "districts", name: "Frass District", line: "The retail heart: Kicks, Drip, Bare, Shape, Plus and Kids.", to: "/frass-district", glyph: "🏙", status: "Open" },
  { id: "d-luxury", kind: "districts", name: "Frass Luxury House", line: "The private estate — ateliers, gardens and the two wings.", to: "/frass-luxury-house", glyph: "🕊", status: "Open" },
  { id: "d-kids", kind: "districts", name: "Kids Valley", line: "Children take their own road — the valley down into Children's Village.", to: "/kids-valley", glyph: "🌿", status: "Separate road" },
  { id: "d-studio", kind: "districts", name: "Studio District", line: "FV Studios: video, audio, motion and the label.", to: "/studio", glyph: "🎬", status: "Open" },
  { id: "d-wellness", kind: "districts", name: "Health & Wellness Centre", line: "Wellness, Care Network, Herbal Garden, Meditation, Nutrition.", to: "/health-wellness", glyph: "🌿", status: "Open" },
  { id: "d-farm", kind: "districts", name: "Farm District", line: "Growers, fishers and the food money that stays local.", to: "/frass-hill", glyph: "🌾", status: "Open" },
  { id: "d-hill", kind: "districts", name: "The Town Plan", line: "Stand back and see every district at once.", to: "/frass-hill", glyph: "🗺", status: "Always" },

  // Stores
  { id: "s-kicks", kind: "stores", name: "Frass Kicks", line: "Casual, Classic and Street — three walls of shoes.", to: "/frass-district", glyph: "👟", status: "Open now" },
  { id: "s-drip", kind: "stores", name: "Frass Drip", line: "Work, Street and Evening drip for men and women.", to: "/frass-district", glyph: "🧥", status: "Open now" },
  { id: "s-bridal", kind: "stores", name: "Frass Bridal", line: "The wedding village — pavilions, vault and concierge.", to: "/bridal", glyph: "💍", status: "Open now" },
  { id: "s-shape", kind: "stores", name: "Frass Shape™", line: "Shapewear as wellness, with the AI Fit Assistant.", to: "/frass-shape", glyph: "🪞", status: "Open now" },
  { id: "s-plus", kind: "stores", name: "Frass Plus+", line: "The full collection architecture, sized 10.5 and up.", to: "/frass-plus", glyph: "➕", status: "Open now" },
  { id: "s-liquidation", kind: "stores", name: "The Liquidation Room", line: "Sale, Vault, Hidden Gem and Frassy's Lucky Spin.", to: "/sales-clearance", glyph: "🎰", status: "Weekly drop" },
  { id: "s-viral", kind: "stores", name: "Viral", line: "What the Hill is watching — and buying.", to: "/social-media-virals", glyph: "🔥", status: "Trending" },

  // Businesses
  { id: "b-builder", kind: "businesses", name: "Frass Business Builder", line: "Turn a creation into a registered business in six steps.", to: "/business-builder", glyph: "💼", status: "Open" },
  { id: "b-hosting", kind: "businesses", name: "Frass Hosting", line: "Publish and host your business on the Hill.", to: "/frass-hosting", glyph: "🏝", status: "4 plans" },
  { id: "b-market", kind: "businesses", name: "Marketplace Desk", line: "Trusted trade between Builders — reputation first.", to: "/opportunity", glyph: "🧾", status: "Open" },
  { id: "b-afro", kind: "businesses", name: "Afro Designers", line: "Independent designers with their own shopfronts.", to: "/afro-designers", glyph: "🌍", status: "Open" },

  // Artists & creators
  { id: "a-radio", kind: "artists", name: "Frass Radio", line: "Music, podcasts, Originals and live sessions.", to: "/frass-radio", glyph: "📻", status: "On air" },
  { id: "a-media", kind: "artists", name: "Music & Media Room", line: "What the town is listening to right now.", to: "/music-media", glyph: "🎧", status: "Playing" },
  { id: "c-fv", kind: "creators", name: "FV Studios Network", line: "Nine divisions — the label, film studio and publishing house.", to: "/fv-studios", glyph: "🎞", status: "Open" },
  { id: "c-studio", kind: "creators", name: "The Production Floor", line: "Direct Frassy, cut a timeline, publish the same day.", to: "/studio", glyph: "🎬", status: "Open" },
  { id: "c-lookbook", kind: "creators", name: "Lookbook", line: "Editorial stories shot on the Hill.", to: "/lookbook", glyph: "📖", status: "New issue" },

  // Brands
  { id: "br-partners", kind: "brands", name: "Brand Partnerships", line: "Paid campaigns, escrow-settled, faceless friendly.", to: "/brand-partnerships", glyph: "🤝", status: "Campaigns open" },
  { id: "br-capsules", kind: "brands", name: "Capsules", line: "Limited brand collaborations, released in drops.", to: "/capsules", glyph: "🧊", status: "Limited" },

  // Farmers
  { id: "f-farm", kind: "farmers", name: "Farm District Market", line: "Produce, preserves and the people who grow them.", to: "/frass-hill", glyph: "🧺", status: "Market day" },
  { id: "f-herbal", kind: "farmers", name: "Herbal Garden", line: "Bush medicine and everyday remedies, taught properly.", to: "/health-wellness", glyph: "🌿", status: "Open" },

  // Builders
  { id: "bu-academy", kind: "builders", name: "The Academy", line: "Six Builder Paths, project-based, Frassy as mentor.", to: "/academy", glyph: "🎓", status: "Enrolling" },
  { id: "bu-opportunity", kind: "builders", name: "Opportunity Centre", line: "Every creation has a business waiting inside it.", to: "/opportunity", glyph: "📈", status: "Open" },
  { id: "bu-vault", kind: "builders", name: "Builder Vault", line: "Your work, kept and searchable for life.", to: "/vault", glyph: "🗄", status: "Private" },
  { id: "bu-creation", kind: "builders", name: "Creation Desk", line: "Start something today and show it in public.", to: "/creation", glyph: "✍️", status: "Open" },

  // Community
  { id: "co-forus", kind: "community", name: "For Us", line: "The Community Hall — today's stories from the Hill.", to: "/for-us", glyph: "🌅", status: "Updated today" },
  { id: "co-forme", kind: "community", name: "For Me", line: "Your own page. Everything about you, in one place.", to: "/for-me", glyph: "🪪", status: "Yours" },
  { id: "co-welcome", kind: "community", name: "Welcome Hall", line: "The gates: registration and arrival into Frass Hill.", to: "/welcome-hall", glyph: "🚪", status: "The gates" },
  { id: "co-blog", kind: "community", name: "Brand Journal", line: "Longer writing from the Hill.", to: "/blog", glyph: "📰", status: "Weekly" },

  // Foundation
  { id: "fo-foundation", kind: "foundation", name: "Frass Foundation", line: "Service through building — impact you can trace.", to: "/frass-hill", glyph: "💚", status: "Always open" },
  { id: "fo-kids", kind: "foundation", name: "Children's Fund", line: "Every Kids purchase carries a mission behind it.", to: "/frass-kids", glyph: "🧡", status: "Active" },

  // Events
  { id: "e-live", kind: "events", name: "Live Directory", line: "Everything broadcasting across the ecosystem.", to: "/live", glyph: "🔴", status: "Check now" },
  { id: "e-golive", kind: "events", name: "Go Live", line: "Take the stage in the square in under a minute.", to: "/live/go", glyph: "🎙", status: "Anytime" },
  { id: "e-drop", kind: "events", name: "Flash Drop", line: "The timed release in the Liquidation Room.", to: "/sales-clearance", glyph: "⏱", status: "This week" },

  // People
  { id: "p-directory", kind: "people", name: "Member Directory", line: "Every Builder on the Hill has a page and a door.", to: "/for-us", glyph: "🧍", status: "Growing" },
  { id: "p-rewards", kind: "people", name: "Rewards Desk", line: "Welcome Journey, coupons and the Lucky Spin.", to: "/rewards", glyph: "🎁", status: "Open" },
];

/** Notices the town posts publicly. Announcements are a presence, not a feed. */
export type SquareAnnouncement = {
  id: string;
  title: string;
  body: string;
  from: string;
  to?: string;
};

export const SQUARE_ANNOUNCEMENTS: SquareAnnouncement[] = [
  {
    id: "an-1",
    title: "Town Square is now the front door",
    body: "For Us, Go Live, Frass Radio, Viral and every For Me page connect through here. One square, one heart.",
    from: "Founder Hall",
    to: "/for-us",
  },
  {
    id: "an-2",
    title: "Frass Hosting is open",
    body: "Four plans — Landing Page, Starter, Business and Commerce. Build it in the Business Builder, host it with Frass.",
    from: "Studio District",
    to: "/frass-hosting",
  },
  {
    id: "an-3",
    title: "Wellness stays free",
    body: "Everyday care in the Health & Wellness Centre is free for every member. Verified professionals sit beside it, never in front of it.",
    from: "Health & Wellness Centre",
    to: "/health-wellness",
  },
];

/**
 * FRASS-0423 — the quarters of the square.
 *
 * A real Caribbean square is not one crowd; it is corners. This is where each
 * group naturally stands. Children are deliberately absent: they arrive
 * through Kids Valley, never through the square.
 */
export type SquareQuarter = {
  id: string;
  name: string;
  glyph: string;
  /** What you'd see standing in this corner. */
  scene: string;
  to: string;
  lens: PresenceKind;
};

export const SQUARE_QUARTERS: SquareQuarter[] = [
  { id: "q-stage", name: "The Performance Corner", glyph: "🎤", scene: "Somebody always has a mic. Live sessions, sound systems, open verses.", to: "/live", lens: "live" },
  { id: "q-trade", name: "The Business Row", glyph: "🏪", scene: "Shopfronts, signage, people trading and talking prices in the open.", to: "/business-builder", lens: "businesses" },
  { id: "q-market", name: "The Farmers' Corner", glyph: "🧺", scene: "Crates of produce, preserves, and the growers standing behind them.", to: "/frass-hill", lens: "farmers" },
  { id: "q-wedding", name: "The Wedding Expo", glyph: "💍", scene: "Pavilions, dressmakers and couples planning under the trees.", to: "/bridal", lens: "events" },
  { id: "q-builders", name: "The Builders' Yard", glyph: "🛠", scene: "Work in progress, shown in public, critiqued out loud.", to: "/academy", lens: "builders" },
  { id: "q-foundation", name: "The Foundation Steps", glyph: "💚", scene: "Service, collections and the impact the Hill can point to.", to: "/frass-hill", lens: "foundation" },
  { id: "q-artists", name: "The Artists' Arcade", glyph: "🎨", scene: "Painters, writers, photographers and the label crew.", to: "/fv-studios", lens: "artists" },
  { id: "q-notice", name: "The Notice Wall", glyph: "📣", scene: "Announcements posted by the town, read standing up.", to: "/for-us", lens: "announcements" },
];

export function presencesFor(kind: PresenceKind | "all"): SquarePresence[] {
  if (kind === "all") return SQUARE_PRESENCES;
  return SQUARE_PRESENCES.filter((p) => p.kind === kind);
}

/** What the square is doing at this hour — the square is never the same twice. */
export function squareMood(date = new Date()): { label: string; glyph: string; line: string } {
  const h = date.getHours();
  if (h < 11) return { label: "Morning", glyph: "🌅", line: "Stalls opening, coffee on, the square filling up." };
  if (h < 16) return { label: "Midday", glyph: "☀️", line: "Full trade. Everybody is out and the square is loud." };
  if (h < 20) return { label: "Sunset", glyph: "🌇", line: "Music starting, work winding down, people staying to talk." };
  return { label: "Evening", glyph: "🌙", line: "Lanterns up. Live sessions, quiet business, long conversations." };
}
