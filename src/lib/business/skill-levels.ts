// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0511-A — Adaptive Learning Engine
//
// A Vault must never assume how much a member already knows. Frassy discovers
// it through ordinary conversation and then changes the DEPTH of guidance —
// never her personality, and never the destination.
//
// Applies to EVERY Business Vault, not only the Seamstress Vault.
// ─────────────────────────────────────────────────────────────────────────────

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export const SKILL_LABEL: Record<SkillLevel, string> = {
  beginner: "Just starting",
  intermediate: "Getting good",
  advanced: "Doing this professionally",
};

export const SKILL_PLAIN: Record<SkillLevel, string> = {
  beginner: "You've never really done this, or only once or twice. That's a fine place to start.",
  intermediate: "You can already make something decent. Now it needs to become a business.",
  advanced: "You know the craft. Frassy stays out of the way and helps you scale.",
};

/** How Frassy talks at each level. Same person, different depth. */
export const COACHING_STYLE: Record<SkillLevel, string> = {
  beginner: "More encouragement, smaller steps, everything explained plainly. Every lesson ends with something real you made.",
  intermediate: "Fewer explanations, more craft. Frassy focuses on quality, fit, pricing and your first collection.",
  advanced: "Straight to the work. Advanced tooling, production preparation and business strategy — no tutorials.",
};

/** Conversation, not an exam. Frassy weaves these in naturally. */
export type SkillQuestion = { id: string; ask: string; signalsAdvanced?: boolean };

export const FASHION_SKILL_QUESTIONS: SkillQuestion[] = [
  { id: "sewn-before", ask: "Have you ever sewn anything before — even a hem?" },
  { id: "machine", ask: "Are you comfortable on a sewing machine, or is it still a bit intimidating?" },
  { id: "designed", ask: "Have you ever designed a piece of clothing yourself, or worked from patterns?" },
  { id: "professional", ask: "Do you make garments for other people already — paid work?", signalsAdvanced: true },
  { id: "goal", ask: "Are you thinking custom pieces for people, or your own clothing brand?" },
  { id: "long-term", ask: "Where do you want this to be a year from now?" },
];

/** Generic version for every other Vault. */
export function skillQuestionsFor(craft: string): SkillQuestion[] {
  return [
    { id: "done-before", ask: `Have you done any ${craft} before?` },
    { id: "tools", ask: `Are you comfortable with the tools, or still learning them?` },
    { id: "paid", ask: `Have you ever been paid for ${craft}?`, signalsAdvanced: true },
    { id: "goal", ask: "Are you after some extra income, or a real business?" },
    { id: "long-term", ask: "Where do you want this to be a year from now?" },
  ];
}

export type SkillTrack = {
  level: SkillLevel;
  /** What Frassy teaches or unlocks at this level. */
  teaches: string[];
  /** FRASS-0480 — the level's realistic earning outcome. */
  moneyMove: string;
  /** Roughly how long the first result takes. */
  firstResult: string;
};

export const FASHION_TRACKS: SkillTrack[] = [
  {
    level: "beginner",
    teaches: [
      "Basic sewing skills",
      "Fabric terminology",
      "Reading a pattern",
      "Taking measurements",
      "Understanding your sewing machine",
      "Making one simple garment start to finish",
    ],
    moneyMove: "Finish and sell one simple accessory — a tote, a headwrap, a scrunchie set.",
    firstResult: "One finished item in your first week.",
  },
  {
    level: "intermediate",
    teaches: [
      "Garment construction",
      "Modifying patterns",
      "Choosing the right fabric",
      "Fit adjustments",
      "Planning a small collection",
      "Branding fundamentals",
    ],
    moneyMove: "Launch a small clothing collection — five pieces, priced properly, listed in the Marketplace.",
    firstResult: "A first collection inside a month.",
  },
  {
    level: "advanced",
    teaches: [
      "Advanced pattern engineering",
      "Digital fashion workflows",
      "Technical packs",
      "Manufacturing preparation",
      "Production scaling",
      "Brand expansion and international sales",
    ],
    moneyMove: "Build and scale the brand — manufactured production runs sold worldwide.",
    firstResult: "Production-ready files and a manufacturing partner.",
  },
];

/** Generic ladder used by every other Vault until it defines its own. */
export function genericTracks(craft: string): SkillTrack[] {
  return [
    {
      level: "beginner",
      teaches: [`The basics of ${craft}`, "The tools and the words", "One small finished result"],
      moneyMove: `Sell one simple ${craft} result to one real person.`,
      firstResult: "Something finished in your first week.",
    },
    {
      level: "intermediate",
      teaches: ["Quality and consistency", "Pricing that pays you", "Your first proper offer"],
      moneyMove: `Launch a priced ${craft} offer in the Marketplace.`,
      firstResult: "A live listing inside a month.",
    },
    {
      level: "advanced",
      teaches: ["Advanced tooling", "Systems and delegation", "Scaling and expansion"],
      moneyMove: `Scale the ${craft} business — repeat customers and bigger contracts.`,
      firstResult: "A repeatable pipeline, not one-off jobs.",
    },
  ];
}

export function trackFor(tracks: SkillTrack[], level: SkillLevel): SkillTrack {
  return tracks.find((t) => t.level === level) ?? tracks[0];
}

/**
 * Infer a level from the member's own answers. Deliberately generous:
 * nobody gets locked out, and an advanced member can always ask for everything.
 */
export function inferLevel(answers: Record<string, string>): SkillLevel {
  const text = Object.values(answers).join(" ").toLowerCase();
  if (/\b(professional|for clients|paid|years|factory|technical pack|production)\b/.test(text)) return "advanced";
  if (/\b(never|not yet|no idea|beginner|first time|learning)\b/.test(text)) return "beginner";
  return "intermediate";
}

export const ADAPTIVE_PRINCIPLE = {
  headline:
    "Great businesses are built by people at every skill level.",
  plain:
    "What this means in plain English: Frass never assumes you already know how. It asks, then meets you exactly where you are — and you can always ask for the full professional toolkit right away.",
  rule: "Progression unlocks tools as confidence grows. Hidden never means deleted — advanced members may open everything on day one.",
};
