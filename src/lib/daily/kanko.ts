// ─────────────────────────────────────────────────────────────────────────────
// FRASS-P001 — Kanko · Personalized Daily Intelligence · MEMBER DNA (Version 1)
//
// Status: First Partner Profile · Priority: P0
//
// This is more than a Daily. It is the Member DNA Frassy uses for years. Every
// decision Kanko's Daily makes comes from this document.
//
// Constitutional rule followed here: Audit first. Build second. (FRASS-0494)
// Nothing in this file changes capability (FRASS-0500) — it is personalization:
// her words, her businesses, her order, her pace. It rides on top of the
// engines that already exist: Money Moves (FRASS-0461), the Three-Layer
// Financial Engine (FRASS-0501), Daily ROI / Energy / Momentum (FRASS-0502),
// the Customization Engine (FRASS-5P000) and the Future Business Vault
// (FRASS-0469).
// ─────────────────────────────────────────────────────────────────────────────

import { balanceDay, type DailyBalance, type LayerId } from "@/lib/business/financial-layers";
import { planByReturnOnTime, type RoiPlan, type TimedMove } from "./time-roi";

// ── Identity ────────────────────────────────────────────────────────────────

export const KANKO_IDENTITY = {
  name: "Kanko",
  role: "First Partner",
  relationship:
    "Kanko is the first real partner to experience the complete Frass ecosystem from onboarding " +
    "through financial independence. Her journey helps validate the platform while building her own future.",
} as const;

// ── Mission ─────────────────────────────────────────────────────────────────
// Frassy's mission is not simply to help Kanko build businesses.
// Her mission is to help Kanko become financially free.

export const KANKO_MISSION = {
  statement: "Help Kanko become financially free.",
  test: "Will this move Kanko closer to financial independence?",
  ifNot: "If not — it waits.",
} as const;

/** The gate every recommendation passes through before it reaches her screen. */
export function servesMission(movesHerCloser: boolean): boolean {
  return movesHerCloser;
}

// ── Current situation ───────────────────────────────────────────────────────

export const KANKO_SITUATION = {
  employment: "Full-time employee",
  status: "Currently on medical leave following a car accident",
  income: "Receiving temporary benefits",
  timePerDay: "Approximately 2 hours per day available",
  framing:
    "Frassy recognises this as a temporary opportunity to build a better future — not a setback to recover from quietly.",
} as const;

// ── Long-term vision ────────────────────────────────────────────────────────
// These are constitutional goals of Frass. They are never presented as optional.

export const KANKO_VISION: { id: string; label: string }[] = [
  { id: "replace-income", label: "Replace employment income" },
  { id: "multiple-businesses", label: "Build multiple businesses" },
  { id: "multiple-streams", label: "Develop multiple income streams" },
  { id: "passive", label: "Build passive income" },
  { id: "retirement", label: "Create retirement security" },
  { id: "family", label: "Extend opportunities to her family" },
  { id: "independence", label: "Achieve complete financial independence" },
];

// ── Active business priority ────────────────────────────────────────────────

export type BusinessPriority = {
  rank: number;
  id: string;
  emoji: string;
  label: string;
  layer: LayerId;
  state: "active" | "preparation" | "vault";
  summary: string;
  details: string[];
  rule?: string;
};

export const KANKO_PRIORITIES: BusinessPriority[] = [
  {
    rank: 1,
    id: "immediate-income",
    emoji: "💵",
    label: "Immediate Income",
    layer: "immediate-income",
    state: "active",
    summary: "Frassy always searches for the fastest ethical opportunities to generate income.",
    details: [
      "Existing skills",
      "Existing inventory",
      "High-return Money Moves",
      "Short-term opportunities",
    ],
    rule: "Immediate cash flow comes first.",
  },
  {
    rank: 2,
    id: "coco-vintage",
    emoji: "👜",
    label: "Coco Vintage",
    layer: "business-builder",
    state: "active",
    summary: "Primary long-term business. One product at a time, done beautifully.",
    details: [
      "Upload one product at a time",
      "Professional product photography guidance",
      "Historical research (where appropriate)",
      "SEO optimization",
      "Product storytelling",
      "Beautiful product pages",
      "Collection organization",
      "Inventory management",
    ],
    rule: "Frassy performs the preparation. Kanko reviews and approves.",
  },
  {
    rank: 3,
    id: "affiliate-prep",
    emoji: "🤝",
    label: "Affiliate Preparation",
    layer: "financial-freedom",
    state: "preparation",
    summary:
      "Affiliate marketing stays in Preparation Mode until Marketplace inventory is established and Frass products are available.",
    details: ["Content", "Audience", "Brand assets", "Strategy"],
    rule: "Frassy never recommends promoting empty shelves.",
  },
  {
    rank: 4,
    id: "freight",
    emoji: "📦",
    label: "Freight Brokerage",
    layer: "business-builder",
    state: "vault",
    summary:
      "Future Business Vault. Not immediate. Begins after Coco Vintage reaches stable momentum.",
    details: [
      "Freight brokerage",
      "International shipping coordination",
      "Customer service",
      "Carrier sourcing",
      "Documentation",
      "Customs guidance",
      "Logistics coordination",
    ],
    rule: "No trucks. No warehouses. No fleet ownership. Frass coordinates trusted service providers.",
  },
];

// ── Available time ──────────────────────────────────────────────────────────

export const KANKO_MINUTES_PER_DAY = 120;

export const TIME_PROMISE =
  "Approximately two focused hours each day. Frassy protects this time carefully: no wasted work, no busywork, every task creates measurable progress.";

/**
 * How today's two hours are split across the three financial layers
 * (FRASS-0501). Kanko's benefits cover today, so the balance is "moderate":
 * earn something real, and use the calm window to build.
 */
export function kankoBalance(minutes: number = KANKO_MINUTES_PER_DAY): DailyBalance {
  return balanceDay(minutes, "moderate");
}

// ── Working style ───────────────────────────────────────────────────────────

export const KANKO_WORKING_STYLE = [
  "Encouraging",
  "Organized",
  "Calm",
  "Practical",
  "Confidence-building",
  "Never overwhelming",
] as const;

export const WORKING_STYLE_RULE = "Large goals become small daily victories.";

// ── The Founder's own words, recorded the morning her profile was opened ────

export const KANKO_GREETING = {
  from: "Desroy (Founder)",
  title: "A message from the Founder",
  occasion: "The opening of Kanko's business",
  /** Played once on her first Daily, then kept forever in her Founding record. */
  transcript:
    "Hey, Kanko. We are finally here. We're finally starting your profile. I'm so excited. " +
    "Anyways, I don't wanna keep you 'cause I know you have a lot of things to do, but I'm so " +
    "happy that you're here. I'm so happy that you're starting this with me and that we are " +
    "doing this together. It's actually really touching my heart, and I'm really excited that " +
    "you are going to be making some money moves, girl. So no long talking. Let's get it.",
} as const;

const GREETED_KEY = "frass.kanko.greeting.played";

export function greetingPlayed(): boolean {
  try {
    return localStorage.getItem(GREETED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGreetingPlayed() {
  try {
    localStorage.setItem(GREETED_KEY, "1");
  } catch {
    /* private browsing — the message simply plays again next time */
  }
}

/** Kanko's Daily is hers. Everyone else keeps the standard Daily. */
export function isKankoDaily(name?: string | null): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return n === "kanko" || n.startsWith("kanko ");
}

// ── Morning Brief ───────────────────────────────────────────────────────────

export const KANKO_HEADER = {
  focus: "One step closer to financial freedom.",
  workingTime: "2 hours",
  priority: "Generate income",
} as const;

export const MORNING_BRIEF: { id: string; label: string }[] = [
  { id: "highest-move", label: "Highest-impact Money Move" },
  { id: "coco", label: "Coco Vintage progress" },
  { id: "milestone", label: "Business milestone" },
  { id: "quick-win", label: "One quick financial win" },
  { id: "long-term", label: "One long-term building task" },
];

// ── Freedom Progress — progress toward the goal, not just money ─────────────

export type FreedomMetric = {
  id: string;
  emoji: string;
  label: string;
  /** 0–100. Honest: 0 until the real record exists. */
  pct: number;
  plain: string;
};

export const FREEDOM_PROGRESS: FreedomMetric[] = [
  {
    id: "income",
    emoji: "💵",
    label: "Income progress",
    pct: 0,
    plain: "How much of this month's income goal has actually landed.",
  },
  {
    id: "coco",
    emoji: "👜",
    label: "Coco Vintage progress",
    pct: 0,
    plain: "How much of the first collection is published and ready to sell.",
  },
  {
    id: "independence",
    emoji: "🕊",
    label: "Business independence",
    pct: 0,
    plain: "How much of your income comes from your own business instead of a job.",
  },
  {
    id: "systems",
    emoji: "⚙️",
    label: "Systems built",
    pct: 0,
    plain: "The parts of your business that now run without you repeating the work.",
  },
  {
    id: "time",
    emoji: "⏳",
    label: "Time saved",
    pct: 0,
    plain: "Work Frassy carried for you instead of you doing it by hand.",
  },
];

// ── ⭐ Freedom Countdown — milestones, not days ─────────────────────────────
// Far more meaningful than tracking revenue. It measures progress toward the
// life she is trying to build, and keeps her motivated through slow stretches.

export type FreedomMilestone = {
  id: string;
  label: string;
  /** What it proves. Frassy explains why every milestone matters. */
  meaning: string;
  reached: boolean;
};

export const FREEDOM_COUNTDOWN: FreedomMilestone[] = [
  { id: "first-product", label: "First product published", meaning: "The shelf exists. Nothing can sell before this.", reached: false },
  { id: "first-sale", label: "First sale", meaning: "Proof that a stranger will pay you.", reached: false },
  { id: "repeat-customer", label: "First repeat customer", meaning: "Proof it wasn't luck.", reached: false },
  { id: "first-1000", label: "First $1,000 earned", meaning: "This is a business now, not an experiment.", reached: false },
  { id: "first-bill", label: "First month covering a household bill", meaning: "Your business started paying for your life.", reached: false },
  { id: "ten-percent", label: "First month replacing 10% of employment income", meaning: "The paycheck loosened its grip.", reached: false },
  { id: "twenty-five", label: "25% of employment income replaced", meaning: "A quarter of your freedom is yours.", reached: false },
  { id: "fifty", label: "50% of employment income replaced", meaning: "Halfway. This is where it stops feeling like a side thing.", reached: false },
  { id: "seventy-five", label: "75% of employment income replaced", meaning: "Most of your life is funded by what you built.", reached: false },
  { id: "hundred", label: "100% — Employment Optional", meaning: "Work becomes a choice, not a necessity.", reached: false },
];

export function countdownPosition(milestones: FreedomMilestone[] = FREEDOM_COUNTDOWN) {
  const reached = milestones.filter((m) => m.reached).length;
  const next = milestones.find((m) => !m.reached) ?? null;
  return {
    reached,
    total: milestones.length,
    pct: Math.round((reached / milestones.length) * 100),
    next,
  };
}

// ── Daily Sections (her screen, top to bottom) ──────────────────────────────

export type KankoSection = {
  id: string;
  emoji: string;
  title: string;
  purpose: string;
  rule?: string;
};

export const KANKO_SECTIONS: KankoSection[] = [
  {
    id: "freedom-move",
    emoji: "🚀",
    title: "Freedom Move",
    purpose: "The one action most likely to improve Kanko's financial future today.",
  },
  {
    id: "quick-income",
    emoji: "💰",
    title: "Quick Income",
    purpose: "Fastest ethical income opportunities.",
  },
  {
    id: "coco-vintage",
    emoji: "👜",
    title: "Coco Vintage",
    purpose: "Today's publishing goal.",
  },
  {
    id: "business-builder",
    emoji: "📈",
    title: "Business Builder",
    purpose: "One action that strengthens her long-term businesses.",
  },
  {
    id: "learning",
    emoji: "🎓",
    title: "Learning",
    purpose: "Only shown when it directly unlocks income.",
    rule: "Never learning for learning's sake.",
  },
  {
    id: "balance",
    emoji: "❤️",
    title: "Balance",
    purpose: "One gentle reminder from Frassy if appropriate.",
    rule: "Never becomes another task list.",
  },
];

// ── Today's moves ───────────────────────────────────────────────────────────
// Only the highest-impact moves. Three, never ten (FRASS-0500). Every move
// carries its financial layer so she always knows why it appeared (FRASS-0501).

export const KANKO_MOVE_LIMIT = 3;

export type KankoMove = {
  id: string;
  label: string;
  why: string;
  impact: string;
  minutes: number;
  href: string;
  layer: LayerId;
  /** 1–5, used by the Return-on-Time planner. */
  weight: number;
  section: "freedom-move" | "quick-income" | "coco-vintage" | "business-builder";
};

export const KANKO_MOVES: KankoMove[] = [
  {
    id: "publish-two",
    label: "Publish 2 Coco Vintage products",
    why: "Nothing can sell until it is live. This is the fastest money in the day.",
    impact: "Highest financial impact",
    minutes: 45,
    href: "/workspace/coco-vintage",
    layer: "business-builder",
    weight: 5,
    section: "freedom-move",
  },
  {
    id: "share-card",
    label: "Share your Frass Card with 3 people",
    why: "Your card is your storefront. Three shares a day builds the first customers.",
    impact: "Builds demand",
    minutes: 15,
    href: "/workspace/wallet",
    layer: "immediate-income",
    weight: 4,
    section: "quick-income",
  },
  {
    id: "price-check",
    label: "Approve Frassy's pricing on the new pieces",
    why: "Pricing decides your profit. I've done the research — you only approve it.",
    impact: "Protects profit",
    minutes: 20,
    href: "/workspace/coco-vintage",
    layer: "business-builder",
    weight: 4,
    section: "coco-vintage",
  },
  {
    id: "sell-existing",
    label: "List one thing you already own",
    why: "Existing inventory is the fastest ethical money there is — it needs no new work.",
    impact: "Money this week",
    minutes: 20,
    href: "/workspace/coco-vintage",
    layer: "immediate-income",
    weight: 4,
    section: "quick-income",
  },
  {
    id: "collection-system",
    label: "Set up the collection template once",
    why: "Do it once and every future product publishes in half the time. That's a system, not a task.",
    impact: "Buys back your hours",
    minutes: 15,
    href: "/workspace/coco-vintage",
    layer: "financial-freedom",
    weight: 3,
    section: "business-builder",
  },
];

export function movesForSection(section: KankoMove["section"]): KankoMove[] {
  return KANKO_MOVES.filter((m) => m.section === section);
}

/** Return on Time (FRASS-0502): the best combination for the hours she has. */
export function kankoRoiPlan(minutes: number = KANKO_MINUTES_PER_DAY): RoiPlan {
  const timed: TimedMove[] = KANKO_MOVES.map((m) => ({
    id: m.id,
    label: m.label,
    minutes: m.minutes,
    impact: m.weight,
    layer: m.layer,
  }));
  return planByReturnOnTime(timed, minutes);
}

// ── Coco Vintage — today's publishing goal ──────────────────────────────────

export const COCO_TODAY = {
  goal: 2,
  prepared: [
    { id: "description", label: "Description", note: "Written in your voice, ready to read." },
    { id: "history", label: "History", note: "The story behind the piece." },
    { id: "seo", label: "SEO", note: "So people searching actually find it." },
    { id: "pricing", label: "Pricing suggestion", note: "Based on comparable sold pieces." },
    { id: "photography", label: "Photography guidance", note: "Exactly how to shoot the next piece." },
    { id: "story", label: "Product storytelling", note: "Why someone should want it." },
  ],
  promise: "Frassy prepares everything. You review and approve — that's the whole job.",
  workflow: "One product at a time. Never a pile.",
} as const;

// ── Affiliate — prepared, never promoted early (FRASS-0472) ─────────────────

export const AFFILIATE_STATUS = {
  state: "Preparation Mode",
  active: false,
  why: "Affiliate opens when Marketplace inventory is established and Frass products are available.",
  plain: "I won't ask you to promote empty shelves. While we wait, we build the content, audience, brand assets and strategy so day one is loud.",
  preparing: ["Content", "Audience", "Brand assets", "Strategy"],
} as const;

// ── Freight — shelved on purpose (FRASS-0469) ───────────────────────────────

export const FREIGHT_STATUS = {
  state: "Preparation Mode",
  active: false,
  why: "We'll build this after Coco Vintage reaches stable momentum.",
  plain:
    "This one is parked, not cancelled. It creates no tasks and no pressure until you say it's time.",
  model: [
    "Freight brokerage",
    "International shipping coordination",
    "Customer service",
    "Carrier sourcing",
    "Documentation",
    "Customs guidance",
    "Logistics coordination",
  ],
  never: "No trucks. No warehouses. No fleet ownership.",
} as const;

// ── Constitutional rules for Kanko's Daily ──────────────────────────────────

export const KANKO_ALWAYS = [
  "Prioritize income-producing work",
  "Respect Kanko's available time",
  "Build confidence",
  "Explain why each task matters",
  "Celebrate progress",
  "Keep tomorrow easier than yesterday",
] as const;

export const KANKO_NEVER = [
  "Overwhelm Kanko",
  "Recommend businesses out of sequence",
  "Push affiliate marketing before the Marketplace is ready",
  "Suggest unnecessary learning",
  "Create duplicate work",
] as const;

// ── Success Dashboard — outcomes, not activity ──────────────────────────────

export type OutcomeMetric = { id: string; emoji: string; label: string; value: string };

export const SUCCESS_OUTCOMES: OutcomeMetric[] = [
  { id: "income", emoji: "💵", label: "Income generated", value: "—" },
  { id: "products", emoji: "👜", label: "Products published", value: "—" },
  { id: "businesses", emoji: "🏗", label: "Businesses launched", value: "—" },
  { id: "systems", emoji: "⚙️", label: "Systems completed", value: "—" },
  { id: "customers", emoji: "🧡", label: "Customers served", value: "—" },
  { id: "independence", emoji: "🕊", label: "Financial independence progress", value: "—" },
  { id: "time", emoji: "⏳", label: "Time saved", value: "—" },
  { id: "freedom", emoji: "🔓", label: "Freedom gained", value: "—" },
];

// ── Learning — only when it unlocks income ──────────────────────────────────

export type LearningUnlock = { id: string; label: string; unlocks: string; minutes: number } | null;

export function kankoLearning(published: number): LearningUnlock {
  if (published === 0) {
    return {
      id: "first-listing",
      label: "How a listing sells itself (5 minutes)",
      unlocks: "Unlocks: your first published product today.",
      minutes: 5,
    };
  }
  return null; // Nothing to teach today. Never learning for learning's sake.
}

// ── Balance — one gentle reminder, never a task list ────────────────────────

export function kankoBalanceNote(day: number, published: number): string | null {
  if (published >= COCO_TODAY.goal) return "You hit today's goal. Close the laptop and enjoy that.";
  const notes = [
    "Stretch — you're still healing, and that matters more than one more listing.",
    "Take a short walk before the next piece.",
    "Rest is part of the plan, not a break from it.",
    null,
  ];
  return notes[day % notes.length] ?? null;
}

// ── Frassy's one morning message ────────────────────────────────────────────

export function kankoEncouragement(day: number): string {
  const lines = [
    "You don't have to do everything today. Two products is a real day's work.",
    "Momentum beats perfection. Publish, then improve.",
    "Every piece you list is one less reason to depend on a paycheck.",
    "You're building something that keeps earning after you close the laptop.",
    "Small and steady is exactly how this works. Let's get it.",
  ];
  return lines[day % lines.length] as string;
}

// ── End of day ──────────────────────────────────────────────────────────────

export type EndOfDay = {
  accomplished: string[];
  incomeMoved: string[];
  tomorrow: string;
};

export function kankoEndOfDay(input: {
  published: number;
  movesDone: string[];
}): EndOfDay {
  const accomplished: string[] = [];
  if (input.published > 0) {
    accomplished.push(`${input.published} Coco Vintage product${input.published === 1 ? "" : "s"} published`);
  }
  for (const id of input.movesDone) {
    const move = KANKO_MOVES.find((m) => m.id === id);
    if (move) accomplished.push(move.label);
  }
  if (!accomplished.length) accomplished.push("Nothing published yet — that's fine. Tomorrow is a fresh start.");

  const incomeMoved = input.published > 0
    ? [`${input.published} new piece${input.published === 1 ? "" : "s"} can now be bought`]
    : ["No new income paths opened today"];

  const tomorrow =
    input.published >= COCO_TODAY.goal
      ? "Start Collection #3 — same rhythm, two pieces."
      : `Finish today's goal: publish ${Math.max(0, COCO_TODAY.goal - input.published)} more piece(s).`;

  return { accomplished, incomeMoved, tomorrow };
}

// ── Founder Principle ───────────────────────────────────────────────────────

export const KANKO_FOUNDER_PRINCIPLE =
  "Kanko's Daily exists to transform two focused hours a day into a future where employment becomes " +
  "optional. Every recommendation should move her closer to lasting financial independence while " +
  "building businesses she can be proud of.";
