// ─────────────────────────────────────────────────────────────────────────────
// FRASS-P002-Z — Your Mother's Personalized Daily · FINAL
// "Wisdom that provides today and lasts tomorrow."
//
// Second founding blueprint: the knowledge economy. Rides on the engines that
// already exist — Money Moves (FRASS-0461), the Three-Layer Financial Engine
// (FRASS-0501), Daily ROI / Energy / Momentum (FRASS-0502), the Customization
// Engine (FRASS-5P000), the Vault (src/lib/vault.ts) and the Services
// Marketplace (src/lib/services/marketplace.ts). Nothing here is a new system.
// ─────────────────────────────────────────────────────────────────────────────

import { balanceDay, type DailyBalance, type LayerId } from "@/lib/business/financial-layers";
import { KNOWLEDGE_ECONOMY_BLUEPRINT } from "./blueprints";
import { planByReturnOnTime, type RoiPlan, type TimedMove } from "./time-roi";

export const MOTHER_MINUTES_PER_DAY = 90;

export function isMotherDaily(name?: string | null, blueprintId?: string | null): boolean {
  if (blueprintId === "knowledge-economy") return true;
  const n = (name ?? "").trim().toLowerCase();
  return n === "mother" || n === "mom" || n === "mommy" || n.startsWith("mother ");
}

// ── Vision ──────────────────────────────────────────────────────────────────

export const MOTHER_VISION = {
  statement:
    "Improve her financial security while respectfully preserving a lifetime of wisdom.",
  balance:
    "Her experience is valuable. Her immediate financial needs are equally important. Neither is sacrificed for the other.",
} as const;

// ── Constitutional rule ─────────────────────────────────────────────────────
// Money Moves prioritise her current financial reality FIRST. Her expertise is
// a powerful asset, but teaching or consulting is never assumed to be the
// fastest path to income.

export const MOTHER_MONEY_RULE = {
  first: "Her current financial reality comes first.",
  caution:
    "Frassy never assumes teaching or consulting is automatically the fastest path to income.",
  test: "Is this genuinely the best opportunity available to her today?",
} as const;

// ── Knowledge Preservation ──────────────────────────────────────────────────
// Learned through natural conversation. Never interrupted. Never repeatedly
// requested. Offered for preservation only after a conversation concludes.
// She always decides what enters the Vault.

export const KNOWLEDGE_PROTOCOL = {
  never: [
    "Interrupt a conversation to capture knowledge",
    "Ask for the same knowledge twice",
    "Add anything to the Vault without her approval",
  ],
  always: [
    "Listen while she talks naturally",
    "Wait until the conversation reaches a natural end",
    "Offer — once — to preserve what was said",
    "Let her edit, rename, keep private, or decline entirely",
  ],
  control: "She always remains in control of what becomes part of her Knowledge Vault.",
} as const;

export type KnowledgeOffer = {
  id: string;
  title: string;
  summary: string;
  /** Where she can send it. She decides — Frassy never decides for her. */
  futures: KnowledgeFutureId[];
} | null;

export type KnowledgeFutureId = "family-legacy" | "educational" | "personal-history" | "community" | "business";

export const KNOWLEDGE_FUTURES: { id: KnowledgeFutureId; emoji: string; label: string; plain: string }[] = [
  { id: "family-legacy", emoji: "🏡", label: "Family legacy", plain: "Kept for your family, for good." },
  { id: "educational", emoji: "📘", label: "Educational resource", plain: "Something that teaches other people." },
  { id: "personal-history", emoji: "🕰", label: "Personal history", plain: "Your story, in your own words." },
  { id: "community", emoji: "🤝", label: "Community wisdom", plain: "Shared with people who need it." },
  { id: "business", emoji: "🏗", label: "A business one day", plain: "Only if you ever want it to be." },
];

/**
 * Knowledge is offered for preservation ONLY after a conversation naturally
 * concludes — and only once per subject.
 */
export function offerPreservation(input: {
  conversationEnded: boolean;
  subject?: string | null;
  alreadyOffered?: boolean;
}): KnowledgeOffer {
  if (!input.conversationEnded || !input.subject || input.alreadyOffered) return null;
  return {
    id: input.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48),
    title: input.subject,
    summary: "I wrote down what you shared. Would you like me to keep it?",
    futures: KNOWLEDGE_FUTURES.map((f) => f.id),
  };
}

// ── Legacy Principle ────────────────────────────────────────────────────────

export const LEGACY_PRINCIPLE = {
  statement: "Her knowledge is preserved because it has value.",
  rule: "Not every piece of knowledge needs to become a business.",
  decides: "The member — not Frassy — decides its future.",
} as const;

// ── Business Philosophy ─────────────────────────────────────────────────────

export const MOTHER_BUSINESS_PHILOSOPHY = {
  statement: "Businesses emerge from experience. They are never forced.",
  how: "Frassy discovers opportunities by observing patterns in her knowledge, interests and approved conversations.",
  approvedOnly: true,
} as const;

// ── Daily balance ───────────────────────────────────────────────────────────

export type MotherPillarId = "income" | "knowledge" | "business" | "wellbeing";

export const MOTHER_PILLARS = KNOWLEDGE_ECONOMY_BLUEPRINT.pillars;

/** The balance changes as her circumstances evolve. */
export function motherBalance(pressure: "high" | "moderate" | "low" = "moderate"): DailyBalance {
  return balanceDay({ minutes: MOTHER_MINUTES_PER_DAY, pressure });
}

// ── Today's moves ───────────────────────────────────────────────────────────
// Financial reality first. Expertise second — and only when it genuinely is
// today's best opportunity.

export type MotherMove = {
  id: string;
  label: string;
  why: string;
  impact: string;
  minutes: number;
  href: string;
  layer: LayerId;
  pillar: MotherPillarId;
  weight: number;
};

export const MOTHER_MOVE_LIMIT = 3;

export const MOTHER_MOVES: MotherMove[] = [
  {
    id: "sell-existing",
    label: "List one thing you already own",
    why: "Money you can see this week, with no new skill required.",
    impact: "Fastest honest income",
    minutes: 20,
    href: "/workspace/wallet",
    layer: "immediate-income",
    pillar: "income",
    weight: 5,
  },
  {
    id: "one-service",
    label: "Say yes to one small paid job you already know how to do",
    why: "The work you've done for decades is worth money today — not someday.",
    impact: "Income this week",
    minutes: 25,
    href: "/services",
    layer: "immediate-income",
    pillar: "income",
    weight: 5,
  },
  {
    id: "share-card",
    label: "Share your Frass Card with three people",
    why: "The people who already trust you are the first customers.",
    impact: "Brings the work to you",
    minutes: 10,
    href: "/workspace/wallet",
    layer: "immediate-income",
    pillar: "income",
    weight: 4,
  },
  {
    id: "one-conversation",
    label: "Tell me one story about your work",
    why: "Just talk. I'll listen, and afterwards I'll ask if you'd like me to keep it.",
    impact: "Preserves your wisdom",
    minutes: 15,
    href: "/workspace",
    layer: "financial-freedom",
    pillar: "knowledge",
    weight: 4,
  },
  {
    id: "shape-service",
    label: "Look at the service I sketched from your own words",
    why: "It came from your experience — not from a template. You approve or you bin it.",
    impact: "Turns experience into offers",
    minutes: 20,
    href: "/services",
    layer: "business-builder",
    pillar: "business",
    weight: 3,
  },
];

export function movesForPillar(pillar: MotherPillarId): MotherMove[] {
  return MOTHER_MOVES.filter((m) => m.pillar === pillar);
}

/** Return on Time (FRASS-0502) for whatever hours she actually has today. */
export function motherRoiPlan(minutes: number = MOTHER_MINUTES_PER_DAY): RoiPlan {
  const timed: TimedMove[] = MOTHER_MOVES.map((m) => ({
    id: m.id,
    label: m.label,
    minutes: m.minutes,
    impact: m.weight,
    layer: m.layer,
  }));
  return planByReturnOnTime(timed, minutes);
}

// ── Success metrics — outcomes, never activity ──────────────────────────────

export type MotherOutcome = { id: string; emoji: string; label: string; value: string };

export const MOTHER_OUTCOMES: MotherOutcome[] = [
  { id: "financial", emoji: "💵", label: "Financial progress", value: "—" },
  { id: "knowledge", emoji: "📚", label: "Knowledge preserved", value: "—" },
  { id: "people", emoji: "🧡", label: "People helped", value: "—" },
  { id: "services", emoji: "🛠", label: "Services created", value: "—" },
  { id: "legacy", emoji: "🕊", label: "Legacy built", value: "—" },
  { id: "opportunities", emoji: "🔓", label: "Business opportunities unlocked", value: "—" },
  { id: "confidence", emoji: "💪", label: "Confidence gained", value: "—" },
];

export const MOTHER_NEVER_MEASURED = KNOWLEDGE_ECONOMY_BLUEPRINT.neverMeasures;

// ── Well-being — one gentle note, never a list ──────────────────────────────

export function motherWellbeingNote(day: number): string | null {
  const notes = [
    "Nothing here is urgent. Do one thing and let the rest wait.",
    "If today isn't the day, that's allowed. I'll keep everything exactly where it is.",
    "A cup of tea first. The list will still be here.",
    null,
  ];
  return notes[day % notes.length] ?? null;
}

export function motherEncouragement(day: number): string {
  const lines = [
    "What you know is worth money today, and worth keeping forever. We can do both.",
    "You don't have to teach to earn. We start with whatever pays fastest.",
    "Every story you tell me is one more thing your family will always have.",
    "Small and steady. One good thing a day adds up faster than you'd think.",
  ];
  return lines[day % lines.length] as string;
}

// ── Founder principle ───────────────────────────────────────────────────────

export const MOTHER_FOUNDER_PRINCIPLE = KNOWLEDGE_ECONOMY_BLUEPRINT.founderPrinciple;
