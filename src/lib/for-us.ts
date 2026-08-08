// FRASS-0920 / FRASS-0921 — "For Us", the Community Heart of Frass Hill.
//
// For Us is not a feed. It is the Community Hall inside Frass Town Square.
// People before products. Stories before shopping. Community before algorithms.
//
// Content is organised into a finite set of sections. There is no endless
// scroll: when today's community highlights are read, the day is done.

export type ForUsSectionId =
  | "today"
  | "good_news"
  | "walk_with_power"
  | "creator_spotlight"
  | "style"
  | "music"
  | "learn"
  | "around_the_hill"
  | "celebrations"
  | "foundation"
  | "behind_the_build";

export type ForUsStory = {
  id: string;
  /** Who or where this came from. */
  source: string;
  title: string;
  body: string;
  /** Optional destination elsewhere in Frass. */
  to?: string;
  cta?: string;
  /** Loose tag used for context-aware ordering. */
  tags: string[];
};

export type ForUsSection = {
  id: ForUsSectionId;
  glyph: string;
  name: string;
  /** One line: why this section exists. */
  purpose: string;
  stories: ForUsStory[];
};

export const FOR_US_SECTIONS: ForUsSection[] = [
  {
    id: "today",
    glyph: "🌎",
    name: "Today in Frass",
    purpose: "The pulse of the town — what is actually happening today.",
    stories: [
      {
        id: "today-1",
        source: "Town Square",
        title: "Notice board refreshed this morning",
        body: "Three new opportunities went up on the board overnight: a shopfit contract in Frass District, a mural commission in Studio District, and two apprentice places in Builders Village.",
        to: "/opportunity",
        cta: "Read the board",
        tags: ["opportunity", "projects", "trades"],
      },
      {
        id: "today-2",
        source: "Frass District",
        title: "A new storefront opened on the promenade",
        body: "An independent house joined the district street this week. The doors are open, the rails are stocked, and the first fitting appointments are live.",
        to: "/shop-frass",
        cta: "Walk the street",
        tags: ["fashion", "marketplace", "business"],
      },
      {
        id: "today-3",
        source: "Children's Village",
        title: "The Discovery Village posted a new build challenge",
        body: "Ages 6–12 are making rain gauges this week and logging what they measure. Parents can follow along from the dashboard.",
        to: "/kids-world",
        cta: "See the village",
        tags: ["family", "education", "children"],
      },
      {
        id: "today-4",
        source: "Foundation Office",
        title: "A classroom reached its goal",
        body: "Community contributions closed the gap on a classroom supply drive. The Foundation desk is now matching the next one.",
        tags: ["foundation", "community", "family"],
      },
    ],
  },
  {
    id: "good_news",
    glyph: "🌟",
    name: "Good News From Around the Hill",
    purpose: "Genuine, meaningful moments — curated because they matter, not because they went viral.",
    stories: [
      {
        id: "gn-1",
        source: "Builders Village",
        title: "A young builder completed their first portfolio",
        body: "Six months of small projects, photographed and written up properly. It is now in the Vault, and it is good work.",
        to: "/vault",
        cta: "Visit the Vault",
        tags: ["projects", "mentorship", "trades"],
      },
      {
        id: "gn-2",
        source: "Children's Village",
        title: "A family reached an education milestone",
        body: "Their Family Vision Map has its first completed year. Two children, one plan, and a household that stuck with it.",
        tags: ["family", "education", "children", "foundation"],
      },
      {
        id: "gn-3",
        source: "Farm District",
        title: "A farmer shared a growing technique that is helping others",
        body: "Simple shade-cloth spacing that held yields through the dry weeks. Four neighbouring plots have copied it already.",
        tags: ["agriculture", "growing", "community farms", "harvest"],
      },
      {
        id: "gn-4",
        source: "Studio District",
        title: "A local DJ booked their first community festival",
        body: "From an open-mic set on the Square stage to a main-stage slot in one season.",
        to: "/music-media",
        cta: "Hear the set",
        tags: ["music", "artists", "events", "recording"],
      },
      {
        id: "gn-5",
        source: "Builders Village",
        title: "A builder mentored two apprentices this week",
        body: "Unpaid, unprompted, on his own site. Both apprentices logged hours toward certification.",
        tags: ["mentorship", "trades", "projects"],
      },
    ],
  },
  {
    id: "walk_with_power",
    glyph: "❤️",
    name: "Walk With Power",
    purpose: "Stories that remind people why Frass exists.",
    stories: [
      {
        id: "wp-1",
        source: "Foundation",
        title: "The volunteer shift that turned into a business",
        body: "She signed up to help paint a community kitchen. She now runs the crew that finishes them.",
        tags: ["foundation", "community", "volunteer", "business"],
      },
      {
        id: "wp-2",
        source: "Family",
        title: "Three generations building on the same plot",
        body: "A grandmother's garden, a mother's market stall, a son's delivery route. One household, three trades.",
        tags: ["family", "agriculture", "community"],
      },
      {
        id: "wp-3",
        source: "Academy",
        title: "First certification in the family",
        body: "Two evenings a week for a year. The certificate is framed; the work is already booked.",
        to: "/academy",
        cta: "Visit the Academy",
        tags: ["education", "mentorship", "trades"],
      },
    ],
  },
  {
    id: "creator_spotlight",
    glyph: "🎨",
    name: "Creator Spotlight",
    purpose: "New people featured every week — artists, makers, farmers, founders.",
    stories: [
      {
        id: "cs-1",
        source: "Studio District",
        title: "The photographer shooting the district after dark",
        body: "Gold trim, wet pavement, glass doors. His work is now the reference for how the promenade is lit.",
        tags: ["artists", "fashion", "editorials", "recording"],
      },
      {
        id: "cs-2",
        source: "Marketplace",
        title: "The furniture maker who only uses reclaimed wood",
        body: "Every piece carries the note of where the timber came from. The waiting list is honest about the wait.",
        tags: ["craftsmanship", "marketplace", "business", "trades"],
      },
      {
        id: "cs-3",
        source: "Farm District",
        title: "The grower turning a half-acre into a teaching plot",
        body: "Weekend sessions, free, open to anyone with a bucket and a question.",
        tags: ["agriculture", "growing", "community farms", "education"],
      },
    ],
  },
  {
    id: "style",
    glyph: "👟",
    name: "Style & Inspiration",
    purpose: "Inspiration, not shopping. Members inspiring members.",
    stories: [
      {
        id: "st-1",
        source: "Luxury House",
        title: "Editorial: the estate in early light",
        body: "Linen, stone, gardens still wet. A quiet lookbook for the season.",
        to: "/lookbook",
        cta: "Open the lookbook",
        tags: ["fashion", "editorials", "luxury stories", "craftsmanship"],
      },
      {
        id: "st-2",
        source: "Frass District",
        title: "Street style from the promenade",
        body: "Seven members, seven ways to wear the same silhouette. Nothing here is a product page.",
        to: "/capsules",
        cta: "See the capsule",
        tags: ["fashion", "community", "editorials"],
      },
      {
        id: "st-3",
        source: "Community",
        title: "Dressing for the harvest festival",
        body: "What people actually wear when the day starts on the plot and ends on the Square.",
        tags: ["fashion", "harvest", "events"],
      },
    ],
  },
  {
    id: "music",
    glyph: "🎵",
    name: "Music & Podcasts",
    purpose: "Sets, episodes and conversations from around the Hill.",
    stories: [
      {
        id: "mu-1",
        source: "Studio District",
        title: "Founder conversation — building without borrowing",
        body: "Forty minutes on financing a first season out of cashflow, with the numbers left in.",
        to: "/music-media",
        cta: "Listen",
        tags: ["music", "podcasts", "business", "recording"],
      },
      {
        id: "mu-2",
        source: "Music Stage",
        title: "Community playlist — Sunday on the Square",
        body: "Assembled from what members actually played this month.",
        to: "/music-media",
        cta: "Play",
        tags: ["music", "artists", "events"],
      },
    ],
  },
  {
    id: "learn",
    glyph: "🎓",
    name: "Learn Together",
    purpose: "Learning stays free. Always.",
    stories: [
      {
        id: "ln-1",
        source: "Builder Academy",
        title: "Pricing your first three jobs",
        body: "A short lesson on quoting honestly and still eating. Free, like every lesson here.",
        to: "/academy",
        cta: "Start the lesson",
        tags: ["education", "business", "trades", "mentorship"],
      },
      {
        id: "ln-2",
        source: "Farm Academy",
        title: "Soil before seed",
        body: "What to test, what to fix, and what to stop buying.",
        tags: ["agriculture", "growing", "education"],
      },
      {
        id: "ln-3",
        source: "Children's Village",
        title: "Money lessons a seven-year-old can hold",
        body: "Three short activities parents can run at the kitchen table.",
        to: "/kids-world/discover",
        cta: "Open activities",
        tags: ["family", "children", "education", "parent resources"],
      },
    ],
  },
  {
    id: "around_the_hill",
    glyph: "🌿",
    name: "Around the Hill",
    purpose: "One update from every district, so the whole town stays connected.",
    stories: [
      {
        id: "ah-1",
        source: "Builders Village",
        title: "Two sites broke ground this week",
        body: "Crews posted their schedules on the yard board; apprentices can claim hours.",
        tags: ["projects", "construction", "trades", "equipment"],
      },
      {
        id: "ah-2",
        source: "Studio District",
        title: "Booth time opened for community members",
        body: "Two free hours a week, first come, first recorded.",
        tags: ["music", "recording", "artists"],
      },
      {
        id: "ah-3",
        source: "Farm District",
        title: "Market day moved to first light",
        body: "Cooler produce, earlier crowd, better prices for the growers.",
        tags: ["agriculture", "markets", "harvest", "community farms"],
      },
      {
        id: "ah-4",
        source: "Luxury House",
        title: "Atelier opened three commission slots",
        body: "Made-to-order work, booked by appointment through the estate desk.",
        to: "/frass-luxury-house",
        cta: "Visit the House",
        tags: ["luxury stories", "craftsmanship", "fashion", "runway events"],
      },
      {
        id: "ah-5",
        source: "Frass District",
        title: "Flash drop on the promenade tonight",
        body: "One hour, one rail, real markdowns in the Liquidation Room.",
        to: "/sales-clearance",
        cta: "See the room",
        tags: ["marketplace", "fashion", "business"],
      },
      {
        id: "ah-6",
        source: "Children's Village",
        title: "New passport badges arrived",
        body: "Three badges added for building, reading and growing.",
        to: "/kids-world",
        cta: "Open the village",
        tags: ["children", "family", "education"],
      },
    ],
  },
  {
    id: "celebrations",
    glyph: "🎉",
    name: "Community Celebrations",
    purpose: "Milestones belong to everybody.",
    stories: [
      {
        id: "ce-1",
        source: "Marketplace",
        title: "A vendor reached their hundredth order",
        body: "Started with six items and a borrowed table on market day.",
        tags: ["marketplace", "business", "community"],
      },
      {
        id: "ce-2",
        source: "Academy",
        title: "Nine graduations this month",
        body: "Trades, agriculture and creative practice. Certificates are in the Vault.",
        tags: ["education", "mentorship", "trades"],
      },
      {
        id: "ce-3",
        source: "Town Square",
        title: "Two business launches announced from the stage",
        body: "Both opened with a community discount for their first week.",
        tags: ["business", "community", "events"],
      },
    ],
  },
  {
    id: "foundation",
    glyph: "🤝",
    name: "The Foundation Wall",
    purpose: "Where the money goes, who it reached, and what it made possible.",
    stories: [
      {
        id: "fo-1",
        source: "Foundation Office",
        title: "Three classrooms received new learning resources",
        body: "Funded by last month's community support. Books, tablets and a repaired roof — receipts posted on the wall, as always.",
        tags: ["foundation", "education", "children", "community"],
      },
      {
        id: "fo-2",
        source: "Foundation Office",
        title: "Volunteer roster is open for the next build weekend",
        body: "Painting, planting, and a kitchen fit-out. No experience needed; lunch is on the Hill.",
        to: "/opportunity",
        cta: "Volunteer",
        tags: ["foundation", "volunteer", "community"],
      },
      {
        id: "fo-3",
        source: "Foundation Office",
        title: "Where this season's podcast revenue went",
        body: "A share of every episode goes to the Foundation. This season funded two school supply drives and one apprenticeship stipend.",
        tags: ["foundation", "podcasts", "business", "education"],
      },
    ],
  },
  {
    id: "behind_the_build",
    glyph: "🏗️",
    name: "Behind the Build",
    purpose: "The permanent record of how Frass was built, one milestone at a time.",
    stories: [
      {
        id: "bb-1",
        source: "Founder Hall",
        title: "The Frass Hill Town Plan was completed",
        body: "Eight core districts, each with its own venues. The Hill stopped being a metaphor and became a map.",
        to: "/frass-hill",
        cta: "Walk the Hill",
        tags: ["history", "platform development", "community"],
      },
      {
        id: "bb-2",
        source: "Children's Village",
        title: "The first learning spaces opened",
        body: "Four age-safe environments, a parent dashboard, and the first published activities.",
        to: "/kids-world",
        cta: "Visit the Village",
        tags: ["children", "education", "family", "platform development"],
      },
      {
        id: "bb-3",
        source: "Community Hall",
        title: "For Us opened its doors",
        body: "The Community Hall in Town Square became the shared gathering place of Frass — one click from anywhere you work, learn, create or shop.",
        tags: ["community", "history", "platform development"],
      },
    ],
  },
];

/** FRASS-0921 — context-aware ordering. Same page, intelligent priority. */

export type ForUsContext = {
  /** Where the member came from. */
  label: string;
  /** Tags promoted to the top of every section. */
  priority: string[];
};

const CONTEXTS: { match: (path: string) => boolean; context: ForUsContext }[] = [
  {
    match: (p) => p.startsWith("/studio") || p.startsWith("/music-media"),
    context: { label: "Studio District", priority: ["music", "artists", "podcasts", "recording", "events"] },
  },
  {
    match: (p) => p.startsWith("/builders") || p.startsWith("/creation") || p.startsWith("/opportunity"),
    context: { label: "Builders Village", priority: ["projects", "construction", "mentorship", "trades", "equipment"] },
  },
  {
    match: (p) => p.startsWith("/farm"),
    context: { label: "Farm District", priority: ["agriculture", "harvest", "markets", "growing", "community farms"] },
  },
  {
    match: (p) => p.startsWith("/frass-luxury-house"),
    context: { label: "Frass Luxury House", priority: ["fashion", "editorials", "craftsmanship", "luxury stories", "runway events"] },
  },
  {
    match: (p) => p.startsWith("/kids-world") || p.startsWith("/frass-kids"),
    context: { label: "Children's Village", priority: ["family", "education", "foundation", "parent resources", "children"] },
  },
  {
    match: (p) => p.startsWith("/workspace") || p.startsWith("/room"),
    context: { label: "My Workspace", priority: ["projects", "business", "opportunity", "mentorship"] },
  },
  {
    match: (p) => p.startsWith("/founder"),
    context: { label: "Founder Hall", priority: ["business", "foundation", "community", "marketplace"] },
  },
  {
    match: (p) => p.startsWith("/academy"),
    context: { label: "Builder Academy", priority: ["education", "mentorship", "trades"] },
  },
  {
    match: (p) => p.startsWith("/frass-hill") || p.startsWith("/welcome-hall") || p.startsWith("/gateway"),
    context: { label: "Frass Town Square", priority: ["community", "foundation", "events"] },
  },
  {
    match: (p) =>
      p.startsWith("/shop-frass") ||
      p.startsWith("/frass-kicks") ||
      p.startsWith("/frass-drip") ||
      p.startsWith("/bare-drip") ||
      p.startsWith("/frass-plus") ||
      p.startsWith("/afro-designers") ||
      p.startsWith("/capsules") ||
      p.startsWith("/sales-clearance"),
    context: { label: "Frass District", priority: ["fashion", "marketplace", "business", "editorials"] },
  },
];

export function resolveForUsContext(from: string | undefined): ForUsContext {
  if (!from) return { label: "Frass Hill", priority: [] };
  const hit = CONTEXTS.find((c) => c.match(from));
  return hit ? hit.context : { label: "Frass Hill", priority: [] };
}

/** Stable, non-addictive ordering: promoted tags first, original order preserved otherwise. */
export function orderStories(stories: ForUsStory[], priority: string[]): ForUsStory[] {
  if (priority.length === 0) return stories;
  const score = (s: ForUsStory) => (s.tags.some((t) => priority.includes(t)) ? 0 : 1);
  return stories
    .map((s, i) => ({ s, i }))
    .sort((a, b) => score(a.s) - score(b.s) || a.i - b.i)
    .map((x) => x.s);
}

/** Sections whose subject matter matches the arriving context are surfaced first. */
const SECTION_TAGS: Record<ForUsSectionId, string[]> = {
  today: [],
  good_news: [],
  walk_with_power: ["foundation", "community", "family"],
  creator_spotlight: ["artists", "craftsmanship", "recording"],
  style: ["fashion", "editorials", "luxury stories"],
  music: ["music", "podcasts", "recording"],
  learn: ["education", "mentorship"],
  around_the_hill: [],
  celebrations: ["business", "marketplace"],
};

export function orderSections(priority: string[]): ForUsSection[] {
  if (priority.length === 0) return FOR_US_SECTIONS;
  const pinned: ForUsSectionId[] = ["today", "good_news"];
  const rank = (s: ForUsSection) => {
    if (pinned.includes(s.id)) return -1;
    return SECTION_TAGS[s.id].some((t) => priority.includes(t)) ? 0 : 1;
  };
  return FOR_US_SECTIONS.map((s, i) => ({ s, i }))
    .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
    .map((x) => x.s);
}

/** Where Frassy points members once the day's community highlights are read. */
export const CAUGHT_UP_ACTIONS: { label: string; to: string }[] = [
  { label: "Visit the Town Square", to: "/frass-hill" },
  { label: "Continue your current project", to: "/workspace" },
  { label: "Explore another district", to: "/shop-frass" },
  { label: "Learn something new", to: "/academy" },
  { label: "Support the Foundation", to: "/opportunity" },
];
