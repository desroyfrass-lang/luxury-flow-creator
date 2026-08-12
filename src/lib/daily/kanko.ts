// ─────────────────────────────────────────────────────────────────────────────
// FRASS-P001 — Kanko's Personalized Daily (Version 1)
//
// The engine (FRASS-5P000) decides how a Daily is arranged. This file decides
// what Kanko's Daily actually SAYS. It is the reference implementation for
// every personalized Daily that follows — her mother, father, brother, son,
// Laka Joe, Chiki, Sheldon, BimBim, Vladimir.
//
// Nothing here changes capability (FRASS-0500). It is personalization only:
// her words, her businesses, her order, her pace.
// ─────────────────────────────────────────────────────────────────────────────

/** The Founder's own words, recorded the morning Kanko's profile was opened. */
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

// ── The top of her screen ───────────────────────────────────────────────────

export const KANKO_HEADER = {
  focus: "One step closer to financial freedom.",
  workingTime: "2 hours",
  priority: "Generate income",
} as const;

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

/** Only the highest-impact moves. Three, never ten (FRASS-0500). */
export const KANKO_MOVE_LIMIT = 3;

export type KankoMove = {
  id: string;
  label: string;
  why: string;
  impact: string;
  minutes: number;
  href: string;
};

export const KANKO_MOVES: KankoMove[] = [
  {
    id: "publish-two",
    label: "Publish 2 Coco Vintage products",
    why: "Nothing can sell until it is live. This is the fastest money in the day.",
    impact: "Highest financial impact",
    minutes: 45,
    href: "/workspace/coco-vintage",
  },
  {
    id: "share-card",
    label: "Share your Frass Card with 3 people",
    why: "Your card is your storefront. Three shares a day builds the first customers.",
    impact: "Builds demand",
    minutes: 15,
    href: "/workspace/wallet",
  },
  {
    id: "price-check",
    label: "Approve Frassy's pricing on the new pieces",
    why: "Pricing decides your profit. I've done the research — you only approve it.",
    impact: "Protects profit",
    minutes: 20,
    href: "/workspace/coco-vintage",
  },
];

// ── Coco Vintage — today's publishing goal ──────────────────────────────────

export const COCO_TODAY = {
  goal: 2,
  prepared: [
    { id: "description", label: "Description", note: "Written in your voice, ready to read." },
    { id: "history", label: "History", note: "The story behind the piece." },
    { id: "seo", label: "SEO", note: "So people searching actually find it." },
    { id: "pricing", label: "Pricing suggestion", note: "Based on comparable sold pieces." },
  ],
  promise: "Frassy prepares everything. You review and approve — that's the whole job.",
} as const;

// ── Freight — shelved on purpose (FRASS-0469) ───────────────────────────────

export const FREIGHT_STATUS = {
  state: "Preparation Mode",
  active: false,
  why: "We'll build this after Coco Vintage reaches stable momentum.",
  plain:
    "This one is parked, not cancelled. It creates no tasks and no pressure until you say it's time.",
} as const;

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
