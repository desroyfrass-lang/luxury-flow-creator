// ─────────────────────────────────────────────────────────────────────────────
// FRASS-5P000 — Personalized Daily Customization Engine
// "Your Daily. Your Workflow."
//
// There is still exactly ONE Daily (FRASS-0425 / FRASS-0481). This engine only
// changes how that Daily is ORGANISED and PRESENTED for one member. It never
// changes what Frass does: Money Moves, Frassy, businesses, the Financial
// Center, security and data all behave identically under every layout.
//
// FRASS-0500 (Simplicity Constitution) applies here too: the simplest path is
// presented first, and a member can always say "make my Daily simpler".
// ─────────────────────────────────────────────────────────────────────────────

/** Every arrangeable block of The Daily. Stable ids — never renamed. */
export type SectionId =
  | "celebrate-first"
  | "since-last"
  | "financial-snapshot"
  | "todays-priorities"
  | "pending-approvals"
  | "opportunities"
  | "goals-vision"
  | "daily-performance"
  | "founder-command"
  | "recent-activity"
  | "evening-reflection"
  | "launch-feedback"
  | "fv-studios"
  | "continue-working"
  | "daily-briefing"
  | "personal-welcome"
  | "freedom-progress"
  | "money-moves-today"
  | "coco-vintage"
  | "freight-prep"
  | "frassy-note"
  | "time-plan"
  | "freedom-countdown"
  | "freedom-move"
  | "quick-income"
  | "business-builder"
  | "learning-unlock"
  | "balance-check"
  | "affiliate-prep"
  | "success-dashboard"
  | "balance-of-day"
  | "knowledge-preservation"
  | "business-development"
  | "first-venture"
  | "wellbeing"
  | "partner-progress"
  | "legacy-dashboard"
  // FRASS-0532 — Tradesperson Daily sections.
  | "frassy-handles-tech"
  | "proof-of-work"
  | "digital-presence"
  // FRASS-0532-C — Digital Legacy: preserve a lifetime of knowledge as assets.
  | "digital-legacy"
  // FRASS-0533 — recurring creative projects (a series, a channel, a book).
  | "episode-progress"
  // FRASS-0534 — Legacy Publication Engine: a completed journey becoming a book.
  | "legacy-publication";

export type SectionMeta = {
  id: SectionId;
  /** The words the member sees and speaks. */
  label: string;
  /** Plain English — what this block is for. No jargon. */
  plain: string;
  /** Other things a member might call it, for conversational customization. */
  aliases: string[];
  /** Safety blocks can never be hidden — see the Safety rule below. */
  locked?: boolean;
};

/**
 * Safety rule (FRASS-5P000): customization must never hide security alerts,
 * critical account warnings, fraud notifications or required legal notices.
 * Those live outside this registry entirely — they are rendered unconditionally
 * in The Daily and are not arrangeable, which is the strongest guarantee.
 */
export const DAILY_SECTIONS: SectionMeta[] = [
  {
    id: "celebrate-first",
    label: "Celebrate first",
    plain: "The wins from yesterday, before anything that needs fixing.",
    aliases: ["wins", "celebrate", "celebrations", "progress"],
  },
  {
    id: "since-last",
    label: "Since you were last here",
    plain: "Everything that moved while you were away.",
    aliases: ["briefing", "what changed", "updates", "since last"],
  },
  {
    id: "financial-snapshot",
    label: "Financial snapshot",
    plain: "Money in, money waiting, money you can take out today.",
    aliases: ["financial center", "finances", "money", "earnings", "wallet", "financials"],
  },
  {
    id: "todays-priorities",
    label: "Today's Priorities",
    plain: "The short list of things worth doing today.",
    aliases: ["priorities", "tasks", "money moves", "today", "to do", "steps"],
  },
  {
    id: "pending-approvals",
    label: "Pending Approvals",
    plain: "Anything waiting on your yes or no.",
    aliases: ["approvals", "waiting on me", "review"],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    plain: "Things worth a look that you might otherwise miss.",
    aliases: ["opportunity", "chances", "leads"],
  },
  {
    id: "goals-vision",
    label: "Goals & Vision Map",
    plain: "How close you are to the future you're building.",
    aliases: ["goals", "vision", "targets", "freedom"],
  },
  {
    id: "daily-performance",
    label: "Daily Performance",
    plain: "One glance at how the business is running.",
    aliases: ["performance", "stats", "numbers", "metrics"],
  },
  {
    id: "founder-command",
    label: "Founder Command Center",
    plain: "The executive view of the whole platform.",
    aliases: ["founder", "command center", "executive"],
  },
  {
    id: "recent-activity",
    label: "Recent activity",
    plain: "What happened since your last session.",
    aliases: ["activity", "history", "recent"],
  },
  {
    id: "evening-reflection",
    label: "Evening reflection",
    plain: "A quiet place to close the day. Always optional.",
    aliases: ["reflection", "journal", "evening", "diary"],
  },
  {
    id: "launch-feedback",
    label: "Launch Feedback",
    plain: "Tell Frassy what's working and what isn't.",
    aliases: ["feedback", "launch"],
  },
  {
    id: "fv-studios",
    label: "Frass Vision Studios",
    plain: "Filming, editing and publishing your videos.",
    aliases: ["studios", "studio", "video", "fv studios", "content"],
  },
  {
    id: "continue-working",
    label: "Continue Working",
    plain: "Picks you up exactly where you stopped.",
    aliases: ["continue", "resume", "where i left off"],
  },
  {
    id: "daily-briefing",
    label: "Daily Briefing",
    plain: "The health of each part of your Daily at a glance.",
    aliases: ["health", "system briefing", "overview"],
  },
  // FRASS-P001 — personalized blocks (Kanko's Daily, Version 1).
  {
    id: "personal-welcome",
    label: "Your morning welcome",
    plain: "Your personal greeting and today's one focus.",
    aliases: ["welcome", "greeting", "good morning", "message"],
  },
  {
    id: "freedom-progress",
    label: "Freedom Progress",
    plain: "How close you are to living off your own business.",
    aliases: ["freedom", "progress to freedom", "independence"],
  },
  {
    id: "money-moves-today",
    label: "Today's Money Moves",
    plain: "The three highest-earning things you can do today.",
    aliases: ["money moves", "moves", "earning", "income today"],
  },
  {
    id: "coco-vintage",
    label: "Coco Vintage",
    plain: "Today's publishing goal, already prepared for you.",
    aliases: ["coco", "vintage", "products", "publishing"],
  },
  {
    id: "freight-prep",
    label: "Freight Brokerage",
    plain: "Parked on purpose until your first business is steady.",
    aliases: ["freight", "logistics", "brokerage"],
  },
  {
    id: "frassy-note",
    label: "A word from Frassy",
    plain: "One encouraging message. Never ten.",
    aliases: ["encouragement", "frassy", "message of the day"],
  },
  // FRASS-0501 / FRASS-0502 — purpose, time and milestones.
  {
    id: "time-plan",
    label: "How today's time is spent",
    plain: "Your hours split between money now, business building and lasting freedom.",
    aliases: ["time", "time plan", "my hours", "schedule", "balance of time", "layers"],
  },
  {
    id: "freedom-countdown",
    label: "Freedom Countdown",
    plain: "Milestones on the way to employment being optional.",
    aliases: ["countdown", "milestones", "freedom countdown", "road to freedom"],
  },
  {
    id: "freedom-move",
    label: "Freedom Move",
    plain: "The one action most likely to improve your financial future today.",
    aliases: ["freedom move", "one thing", "first thing", "top move"],
  },
  {
    id: "quick-income",
    label: "Quick Income",
    plain: "The fastest honest ways to bring money in.",
    aliases: ["quick income", "fast money", "cash now", "immediate income"],
  },
  {
    id: "business-builder",
    label: "Business Builder",
    plain: "One action that strengthens the business you're building.",
    aliases: ["business builder", "long term", "build my business"],
  },
  {
    id: "learning-unlock",
    label: "Learning",
    plain: "Only appears when learning something unlocks income today.",
    aliases: ["learning", "lesson", "training", "academy"],
  },
  {
    id: "balance-check",
    label: "Balance",
    plain: "One gentle reminder. Never another task list.",
    aliases: ["balance", "wellbeing", "rest", "health"],
  },
  {
    id: "affiliate-prep",
    label: "Affiliate Preparation",
    plain: "Getting ready so day one of affiliate is loud, not empty.",
    aliases: ["affiliate", "affiliate prep", "promotion"],
  },
  {
    id: "success-dashboard",
    label: "Success Dashboard",
    plain: "Outcomes, not activity — what actually changed in your life.",
    aliases: ["success", "outcomes", "results", "dashboard"],
  },
  // FRASS-P002-Z — knowledge-economy blueprint blocks (Mother's Daily).
  {
    id: "balance-of-day",
    label: "Today's balance",
    plain: "How today splits between money, knowledge, business and rest.",
    aliases: ["balance of day", "today's balance", "my day", "shape of my day"],
  },
  {
    id: "knowledge-preservation",
    label: "Knowledge Preservation",
    plain: "Your stories and know-how, kept exactly the way you want them.",
    aliases: ["knowledge", "vault", "stories", "wisdom", "legacy", "preserve"],
  },
  {
    id: "business-development",
    label: "Business Development",
    plain: "Businesses that grew out of your own experience.",
    aliases: ["business development", "services", "my services", "offers"],
  },
  // FRASS-P002-E — the first business is something she already owns.
  {
    id: "first-venture",
    label: "First Business Venture",
    plain: "The valuables you already own, organised and prepared for sale.",
    aliases: [
      "first venture",
      "first business",
      "hidden assets",
      "my collection",
      "coins",
      "coin collection",
    ],
  },
  {
    id: "wellbeing",
    label: "Well-being",
    plain: "One gentle note. Never another list.",
    aliases: ["wellbeing", "well being", "rest", "take care"],
  },
  // Founder Daily Amendment — Founder-only widgets.
  {
    id: "partner-progress",
    label: "Partner Progress Center",
    plain: "How every partner is doing, without opening their Daily.",
    aliases: ["partners", "partner progress", "team", "everyone"],
  },
  {
    id: "legacy-dashboard",
    label: "Legacy Dashboard",
    plain: "Lives changed, not money earned.",
    aliases: ["legacy", "impact", "lives changed"],
  },
  {
    id: "frassy-handles-tech",
    label: "I'll handle the computer part",
    plain: "The paperwork, forms, adverts and invoices Frassy does for you.",
    aliases: ["paperwork", "computer part", "frassy does it"],
  },
  {
    id: "proof-of-work",
    label: "Your proof of work",
    plain: "Photos, years of experience and reviews that win jobs.",
    aliases: ["proof", "experience", "reviews", "photos"],
  },
  {
    id: "digital-presence",
    label: "Where people find you",
    plain: "Your profile, Frass Card, listings and booking details.",
    aliases: ["profile", "listing", "where people find me"],
  },
  {
    id: "digital-legacy",
    label: "Your Digital Legacy",
    plain: "Turning what you know into guides, lessons and templates that keep earning.",
    aliases: ["legacy", "knowledge", "what i know", "digital legacy"],
  },
  {
    id: "episode-progress",
    label: "Episode Progress",
    plain: "Where this week's episode of your series stands.",
    aliases: ["episode", "series", "youtube", "show", "creative project"],
  },
  {
    id: "legacy-publication",
    label: "Legacy Publication",
    plain: "Turning a finished journey into a book — and the same knowledge into an audiobook, a course and more.",
    aliases: ["book", "manuscript", "e-book", "publish", "legacy publication", "my book"],
  },
];

export const SECTION_BY_ID = Object.fromEntries(
  DAILY_SECTIONS.map((s) => [s.id, s]),
) as Record<SectionId, SectionMeta>;

export const ALL_SECTION_IDS = DAILY_SECTIONS.map((s) => s.id);

/** Frass's recommended order — what a member gets before they change anything. */
export const RECOMMENDED_ORDER: SectionId[] = [
  "personal-welcome",
  "celebrate-first",
  "freedom-progress",
  "freedom-countdown",
  "time-plan",
  "freedom-move",
  "quick-income",
  "money-moves-today",
  "coco-vintage",
  "business-builder",
  "learning-unlock",
  "affiliate-prep",
  "freight-prep",
  "balance-of-day",
  "knowledge-preservation",
  "business-development",
  "first-venture",
  "balance-check",
  "wellbeing",
  "success-dashboard",
  "todays-priorities",
  "partner-progress",
  "legacy-dashboard",
  "frassy-handles-tech",
  "proof-of-work",
  "digital-presence",
  "digital-legacy",
  "episode-progress",
  "legacy-publication",
  "frassy-note",
  "since-last",
  "financial-snapshot",
  "pending-approvals",
  "opportunities",
  "goals-vision",
  "continue-working",
  "daily-performance",
  "fv-studios",
  "recent-activity",
  "daily-briefing",
  "founder-command",
  "launch-feedback",
  "evening-reflection",
];

// ── Presentation preferences ────────────────────────────────────────────────

export type Density = "spacious" | "comfortable" | "compact";
export type TextSize = "normal" | "large" | "largest";

export type DailyPrefs = {
  /** Which design in the library this Daily started from. */
  designId: string;
  /** The member's own name for this Daily. */
  name: string;
  /** Section order, first to last. Ids missing from this list fall back to RECOMMENDED_ORDER. */
  order: SectionId[];
  /** Hidden from view. Nothing is deleted — the data stays exactly where it was. */
  hidden: SectionId[];
  /** Pinned blocks always rise to the top, in pin order. */
  pinned: SectionId[];
  /** Collapsed blocks show their heading only until opened. */
  collapsed: SectionId[];
  density: Density;
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  /** FRASS-0500 — simplified layout: only the first few blocks, everything else on request. */
  simplified: boolean;
  /** How many blocks a simplified Daily shows. */
  simplifiedCount: number;
};

export function defaultPrefs(designId = "frass-recommended"): DailyPrefs {
  const design = DESIGN_BY_ID[designId] ?? DESIGN_BY_ID["frass-recommended"];
  return {
    designId: design.id,
    name: design.name,
    order: [...design.order],
    hidden: [...(design.hidden ?? [])],
    pinned: [],
    collapsed: [...(design.collapsed ?? [])],
    density: design.density,
    textSize: "normal",
    highContrast: false,
    reducedMotion: false,
    simplified: design.simplified ?? false,
    simplifiedCount: 3,
  };
}

// ── The Daily Design Library ────────────────────────────────────────────────
//
// Twenty layouts. Every one of them shows the SAME information with the SAME
// capability — only the arrangement, density and emphasis differ. No layout is
// more powerful than another, and no layout is aimed at a job title.

export type DailyDesign = {
  id: string;
  /** Design names, not personas. Members rename their own copy anyway. */
  name: string;
  /** One honest sentence about how it feels to use. */
  feel: string;
  density: Density;
  /** Visual arrangement class applied to the Daily body. */
  shape: "stack" | "two-column" | "wide-cards" | "tight-list" | "focus" | "mosaic";
  order: SectionId[];
  hidden?: SectionId[];
  collapsed?: SectionId[];
  simplified?: boolean;
};

const rest = (lead: SectionId[]): SectionId[] => [
  ...lead,
  ...RECOMMENDED_ORDER.filter((id) => !lead.includes(id)),
];

export const DAILY_DESIGNS: DailyDesign[] = [
  {
    id: "frass-recommended",
    name: "Frass Recommended",
    feel: "The balanced arrangement Frassy builds from your Discovery Interview.",
    density: "comfortable",
    shape: "stack",
    order: RECOMMENDED_ORDER,
  },
  {
    id: "first-light",
    name: "First Light",
    feel: "Wins at the very top, then one short list of work. Gentle mornings.",
    density: "spacious",
    shape: "stack",
    order: rest(["celebrate-first", "todays-priorities", "goals-vision"]),
  },
  {
    id: "ledger",
    name: "Ledger",
    feel: "Money first. Every figure sits above every task.",
    density: "compact",
    shape: "tight-list",
    order: rest(["financial-snapshot", "daily-performance", "todays-priorities", "pending-approvals"]),
  },
  {
    id: "one-thing",
    name: "One Thing",
    feel: "Three blocks, nothing else, until you ask for more.",
    density: "spacious",
    shape: "focus",
    order: rest(["todays-priorities", "celebrate-first", "financial-snapshot"]),
    simplified: true,
  },
  {
    id: "workbench",
    name: "Workbench",
    feel: "Pick up where you stopped, then keep going. Built for long sessions.",
    density: "comfortable",
    shape: "two-column",
    order: rest(["continue-working", "todays-priorities", "pending-approvals", "since-last"]),
  },
  {
    id: "storefront",
    name: "Storefront",
    feel: "Sales, customers and listings lead the day.",
    density: "comfortable",
    shape: "wide-cards",
    order: rest(["financial-snapshot", "since-last", "todays-priorities", "opportunities"]),
  },
  {
    id: "quiet-room",
    name: "Quiet Room",
    feel: "Very little on screen. Large text, wide spacing, slow pace.",
    density: "spacious",
    shape: "focus",
    order: rest(["todays-priorities", "evening-reflection", "celebrate-first"]),
    collapsed: ["daily-performance", "recent-activity", "daily-briefing"],
  },
  {
    id: "control-tower",
    name: "Control Tower",
    feel: "Everything visible at once, tightly packed. Nothing hidden.",
    density: "compact",
    shape: "mosaic",
    order: rest(["daily-performance", "financial-snapshot", "todays-priorities", "pending-approvals", "since-last"]),
  },
  {
    id: "two-hands",
    name: "Two Hands",
    feel: "Two columns — work on the left, numbers on the right.",
    density: "comfortable",
    shape: "two-column",
    order: rest(["todays-priorities", "financial-snapshot", "continue-working", "daily-performance"]),
  },
  {
    id: "long-game",
    name: "Long Game",
    feel: "Goals and the road ahead sit above today's work.",
    density: "comfortable",
    shape: "stack",
    order: rest(["goals-vision", "opportunities", "todays-priorities", "financial-snapshot"]),
  },
  {
    id: "studio-floor",
    name: "Studio Floor",
    feel: "Making things comes first — filming, publishing, then the rest.",
    density: "comfortable",
    shape: "wide-cards",
    order: rest(["fv-studios", "todays-priorities", "continue-working", "celebrate-first"]),
  },
  {
    id: "market-day",
    name: "Market Day",
    feel: "What moved overnight, then what to do about it.",
    density: "compact",
    shape: "tight-list",
    order: rest(["since-last", "opportunities", "todays-priorities", "financial-snapshot"]),
  },
  {
    id: "inbox",
    name: "Inbox",
    feel: "Anything waiting on you rises to the top and clears down.",
    density: "compact",
    shape: "tight-list",
    order: rest(["pending-approvals", "since-last", "todays-priorities", "recent-activity"]),
  },
  {
    id: "sunrise-sunset",
    name: "Sunrise & Sunset",
    feel: "Opens with the morning, closes with reflection. A full day, bookended.",
    density: "spacious",
    shape: "stack",
    order: rest(["celebrate-first", "todays-priorities", "continue-working", "goals-vision", "evening-reflection"]),
  },
  {
    id: "big-type",
    name: "Big Type",
    feel: "Oversized headings and numbers. Easy on tired eyes.",
    density: "spacious",
    shape: "wide-cards",
    order: rest(["todays-priorities", "financial-snapshot", "celebrate-first"]),
  },
  {
    id: "checklist",
    name: "Checklist",
    feel: "One vertical list, top to bottom, tick as you go.",
    density: "compact",
    shape: "tight-list",
    order: rest(["todays-priorities", "pending-approvals", "continue-working", "celebrate-first"]),
  },
  {
    id: "mosaic",
    name: "Mosaic",
    feel: "A grid of equal cards. Scan the whole day in one look.",
    density: "comfortable",
    shape: "mosaic",
    order: RECOMMENDED_ORDER,
  },
  {
    id: "night-shift",
    name: "Night Shift",
    feel: "Low glare, calm spacing, reflection close at hand.",
    density: "comfortable",
    shape: "stack",
    order: rest(["todays-priorities", "evening-reflection", "since-last", "financial-snapshot"]),
  },
  {
    id: "pocket",
    name: "Pocket",
    feel: "Built for a phone in one hand. Short blocks, big tap targets.",
    density: "comfortable",
    shape: "focus",
    order: rest(["todays-priorities", "financial-snapshot", "since-last"]),
    collapsed: ["daily-performance", "daily-briefing", "recent-activity"],
  },
  {
    id: "founder-desk",
    name: "Founder Desk",
    feel: "Platform-wide view first, then your own day underneath.",
    density: "compact",
    shape: "two-column",
    order: rest(["founder-command", "daily-performance", "financial-snapshot", "todays-priorities"]),
  },
];

export const DESIGN_BY_ID = Object.fromEntries(
  DAILY_DESIGNS.map((d) => [d.id, d]),
) as Record<string, DailyDesign>;

// ── Resolving what actually renders ─────────────────────────────────────────

export type Arrangement = {
  /** Visible ids, already in final order (pins first). */
  visible: SectionId[];
  hidden: SectionId[];
  collapsed: Set<SectionId>;
  /** CSS order value per section id. */
  orderOf: (id: SectionId) => number;
  shape: DailyDesign["shape"];
};

export function resolveArrangement(prefs: DailyPrefs): Arrangement {
  const known = new Set(ALL_SECTION_IDS);
  const seen = new Set<SectionId>();
  const ordered: SectionId[] = [];
  for (const id of prefs.order) {
    if (known.has(id) && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  for (const id of RECOMMENDED_ORDER) {
    if (!seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }

  const hiddenSet = new Set(prefs.hidden);
  const pins = prefs.pinned.filter((id) => known.has(id) && !hiddenSet.has(id));
  const body = ordered.filter((id) => !hiddenSet.has(id) && !pins.includes(id));
  let visible = [...pins, ...body];

  // FRASS-0500 — a simplified Daily shows only the first few blocks. The rest
  // are not deleted; they are one tap away behind "Show everything".
  if (prefs.simplified) visible = visible.slice(0, Math.max(1, prefs.simplifiedCount));

  const index = new Map(visible.map((id, i) => [id, i]));
  return {
    visible,
    hidden: ordered.filter((id) => hiddenSet.has(id) || !index.has(id)),
    collapsed: new Set(prefs.collapsed),
    orderOf: (id) => index.get(id) ?? 999,
    shape: DESIGN_BY_ID[prefs.designId]?.shape ?? "stack",
  };
}

/** Body classes that carry density, text size, contrast and shape. */
export function layoutClasses(prefs: DailyPrefs): string {
  return [
    "daily-arranged",
    `daily-shape-${DESIGN_BY_ID[prefs.designId]?.shape ?? "stack"}`,
    `daily-density-${prefs.density}`,
    `daily-text-${prefs.textSize}`,
    prefs.highContrast ? "daily-contrast" : "",
    prefs.reducedMotion ? "daily-still" : "",
    prefs.simplified ? "daily-simple" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Apply a design without losing the member's own name for their Daily. */
export function applyDesign(prefs: DailyPrefs, designId: string): DailyPrefs {
  const design = DESIGN_BY_ID[designId];
  if (!design) return prefs;
  return {
    ...prefs,
    designId: design.id,
    order: [...design.order],
    hidden: [...(design.hidden ?? [])],
    collapsed: [...(design.collapsed ?? [])],
    density: design.density,
    simplified: design.simplified ?? false,
  };
}
