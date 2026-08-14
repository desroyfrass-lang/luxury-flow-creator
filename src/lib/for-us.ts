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
    match: (p) => p.startsWith("/control-room"),
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
  foundation: ["foundation", "volunteer", "community", "family"],
  behind_the_build: ["history", "platform development"],
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

// ─────────────────────────────────────────────────────────────
// FRASS-0921 — The Living Community Hall (arrival, before stories)
// You walk into a civic building, not a feed. These are the fixtures
// you see when you step through the doors.
// ─────────────────────────────────────────────────────────────

export type HallExhibit = {
  id: string;
  glyph: string;
  /** What the fixture is called inside the hall. */
  name: string;
  /** What it is showing right now. */
  showing: string;
  to?: string;
  cta?: string;
  tags: string[];
};

export const HALL_EXHIBITS: HallExhibit[] = [
  {
    id: "highlights-screen",
    glyph: "📺",
    name: "The Highlights Screen",
    showing: "Today's community highlights, playing on the big screen above the entrance.",
    tags: ["community", "events"],
  },
  {
    id: "founder-announcement",
    glyph: "🎙️",
    name: "Founder Announcement",
    showing: "A short message from the Founder, playing quietly in the corner by the coffee.",
    to: "/control-room",
    cta: "Founder Hall",
    tags: ["business", "history", "platform development"],
  },
  {
    id: "dj-corner",
    glyph: "🎧",
    name: "The Listening Corner",
    showing: "This week's featured mix from a Studio District DJ, low enough to talk over.",
    to: "/music-media",
    cta: "Listen",
    tags: ["music", "artists", "recording", "podcasts"],
  },
  {
    id: "builder-of-the-month",
    glyph: "🛠️",
    name: "Builder of the Month Exhibit",
    showing: "Photographs, drawings and finished work from one builder, mounted along the east wall.",
    to: "/builders",
    cta: "Builders Village",
    tags: ["projects", "trades", "mentorship", "construction"],
  },
  {
    id: "foundation-wall",
    glyph: "🤝",
    name: "The Foundation Wall",
    showing: "Current community projects, what has been funded, and who it reached.",
    to: "/opportunity",
    cta: "Support a project",
    tags: ["foundation", "volunteer", "community"],
  },
  {
    id: "fashion-display",
    glyph: "👗",
    name: "The Frass District Display",
    showing: "A dressed case from the district promenade, changed every Friday.",
    to: "/shop-frass",
    cta: "Frass District",
    tags: ["fashion", "editorials", "marketplace"],
  },
  {
    id: "events-board",
    glyph: "📅",
    name: "Tonight on the Square",
    showing: "Live music, a market late-open, and a Foundation supper at seven.",
    to: "/frass-hill",
    cta: "Town Square",
    tags: ["events", "community", "music"],
  },
  {
    id: "good-news-board",
    glyph: "🌟",
    name: "Good News Around the Hill",
    showing: "A handwritten board of milestones from every district this week.",
    tags: ["community", "celebrations", "family"],
  },
];

export function orderExhibits(priority: string[]): HallExhibit[] {
  if (priority.length === 0) return HALL_EXHIBITS;
  const score = (e: HallExhibit) => (e.tags.some((t) => priority.includes(t)) ? 0 : 1);
  return HALL_EXHIBITS.map((e, i) => ({ e, i }))
    .sort((a, b) => score(a.e) - score(b.e) || a.i - b.i)
    .map((x) => x.e);
}

// ─────────────────────────────────────────────────────────────
// FRASS-0922 — Community Storytelling & Feed Intelligence
// Frassy proposes; the Founder approves; only then is it published.
// ─────────────────────────────────────────────────────────────

export const FOR_US_CATEGORIES = [
  "Community",
  "Walk With Power",
  "Foundation",
  "Platform Development",
  "Founder Updates",
  "Marketplace",
  "Builders",
  "Music",
  "DJs",
  "Farm District",
  "Luxury House",
  "Frass District",
  "Children's Village",
  "University",
  "Business",
  "Technology",
  "AI",
  "Creators",
  "Events",
  "Celebrations",
  "Milestones",
  "Behind the Build",
  "History",
] as const;

export type ForUsCategory = (typeof FOR_US_CATEGORIES)[number];

export const STORY_STATUSES = ["proposed", "draft", "approved", "published", "archived"] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];

export type ForUsStoryRow = {
  id: string;
  section_id: string;
  series: string | null;
  source_label: string;
  title: string;
  summary: string;
  body: string | null;
  categories: string[];
  tags: string[];
  media_url: string | null;
  media_kind: "none" | "image" | "video" | "audio";
  cta_label: string | null;
  cta_to: string | null;
  impact_note: string | null;
  revenue_note: string | null;
  audience: "everyone" | "members" | "founder";
  status: StoryStatus;
  origin: "frassy" | "founder" | "community";
  occurred_at: string;
  published_at: string | null;
  created_at: string;
};

/** Published rows are rendered exactly like curated stories. */
export function rowToStory(row: ForUsStoryRow): ForUsStory {
  const extra = [row.impact_note, row.revenue_note].filter(Boolean).join(" ");
  return {
    id: `db-${row.id}`,
    source: row.source_label,
    title: row.title,
    body: extra ? `${row.summary} ${extra}` : row.summary,
    to: row.cta_to ?? undefined,
    cta: row.cta_label ?? undefined,
    tags: row.tags,
  };
}

export function isSectionId(value: string): value is ForUsSectionId {
  return FOR_US_SECTIONS.some((s) => s.id === value);
}

/** Merge approved-and-published stories into the finite curated sections. */
export function mergePublished(
  sections: ForUsSection[],
  rows: ForUsStoryRow[],
): ForUsSection[] {
  if (rows.length === 0) return sections;
  return sections.map((section) => {
    const extra = rows
      .filter((r) => r.section_id === section.id)
      .sort((a, b) => (b.published_at ?? b.occurred_at).localeCompare(a.published_at ?? a.occurred_at))
      .map(rowToStory);
    return extra.length ? { ...section, stories: [...extra, ...section.stories] } : section;
  });
}

// ─────────────────────────────────────────────────────────────
// FRASS-0415 — For Us Experience Amendment
// "For Us is designed for discovery." The finite-day rule is retired:
// the feed is continuous, and the page feels like Jamaica at this hour.
// ─────────────────────────────────────────────────────────────

export type FeedStory = ForUsStory & {
  sectionId: ForUsSectionId;
  sectionName: string;
  sectionGlyph: string;
};

/**
 * One continuous discovery stream. Stories are interleaved across sections so
 * every few cards feels like turning another corner in the town, and stories
 * matching where the member came from surface first.
 */
export function buildDiscoveryFeed(
  sections: ForUsSection[],
  priority: string[],
): FeedStory[] {
  const columns = sections.map((section) =>
    orderStories(section.stories, priority).map((story) => ({
      ...story,
      sectionId: section.id,
      sectionName: section.name,
      sectionGlyph: section.glyph,
    })),
  );
  const woven: FeedStory[] = [];
  const depth = Math.max(0, ...columns.map((c) => c.length));
  for (let i = 0; i < depth; i += 1) {
    for (const column of columns) if (column[i]) woven.push(column[i]);
  }
  if (priority.length === 0) return woven;
  const relevant = (s: FeedStory) => (s.tags.some((t) => priority.includes(t)) ? 0 : 1);
  return woven
    .map((s, i) => ({ s, i }))
    .sort((a, b) => relevant(a.s) - relevant(b.s) || a.i - b.i)
    .map((x) => x.s);
}

export type ScenicMoment = {
  id: string;
  glyph: string;
  line: string;
  detail: string;
  /** Tailwind gradient classes for the moment's sky. */
  sky: string;
};

/** Quiet visual rests between groups of posts — rhythm, not content. */
export const SCENIC_MOMENTS: ScenicMoment[] = [
  {
    id: "sunrise",
    glyph: "🌅",
    line: "Sunrise over the hill",
    detail: "The market carts are moving, the sea is flat, and the day hasn't decided anything yet.",
    sky: "from-amber-100 via-orange-50 to-sky-100",
  },
  {
    id: "overlook",
    glyph: "⛰️",
    line: "The overlook",
    detail: "From up here you can see every district at once — and every one of them is somebody's work.",
    sky: "from-emerald-100 via-lime-50 to-sky-100",
  },
  {
    id: "garden",
    glyph: "🌺",
    line: "The garden walk",
    detail: "Hibiscus along the path to the Community Hall. Somebody plants these. Nobody is asked to.",
    sky: "from-rose-100 via-amber-50 to-emerald-50",
  },
  {
    id: "waves",
    glyph: "🌊",
    line: "Ocean side",
    detail: "Turquoise, shallow, loud. The best meetings in Frass have happened on this beach.",
    sky: "from-cyan-100 via-sky-50 to-teal-100",
  },
  {
    id: "founder",
    glyph: "🕊️",
    line: "\u201cWe are not building a store. We are building a place people belong to.\u201d",
    detail: "Founder, Frass Hill",
    sky: "from-stone-100 via-amber-50 to-stone-50",
  },
  {
    id: "village",
    glyph: "🏘️",
    line: "Village street, late afternoon",
    detail: "Shopfronts open, children on bicycles, a speaker box somewhere down the road.",
    sky: "from-orange-100 via-amber-50 to-rose-50",
  },
  {
    id: "evening",
    glyph: "🎶",
    line: "Music drifting across the square",
    detail: "Lanterns on, café tables full, somebody testing a mic on the Square stage.",
    sky: "from-indigo-100 via-violet-50 to-amber-50",
  },
];

export type ForUsHour = "morning" | "afternoon" | "sunset" | "evening";

export type ForUsWeather = {
  hour: ForUsHour;
  glyph: string;
  label: string;
  greeting: string;
  /** Full-page atmospheric wash. */
  wash: string;
};

/** The Weather Principle — For Us feels like visiting Frass at this moment. */
export function resolveForUsWeather(date = new Date()): ForUsWeather {
  const h = date.getHours();
  if (h < 11)
    return {
      hour: "morning",
      glyph: "🌅",
      label: "Morning on the hill",
      greeting: "The town is just opening up.",
      wash: "linear-gradient(180deg, #fff6e8 0%, #f4fbff 45%, #f7fdf6 100%)",
    };
  if (h < 16)
    return {
      hour: "afternoon",
      glyph: "☀️",
      label: "Afternoon in Frass",
      greeting: "Everything is open and everybody is out.",
      wash: "linear-gradient(180deg, #eaf7ff 0%, #f6fff7 50%, #fffdf2 100%)",
    };
  if (h < 19)
    return {
      hour: "sunset",
      glyph: "🌇",
      label: "Golden hour",
      greeting: "The light is going soft over the water.",
      wash: "linear-gradient(180deg, #fff1de 0%, #ffe9d6 45%, #fdf6ec 100%)",
    };
  return {
    hour: "evening",
    glyph: "🌙",
    label: "Evening on the square",
    greeting: "Lanterns are lit and the music has started.",
    wash: "linear-gradient(180deg, #fbf3e8 0%, #f6efe6 50%, #f2f6f4 100%)",
  };
}
