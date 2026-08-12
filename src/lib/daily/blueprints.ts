// ─────────────────────────────────────────────────────────────────────────────
// FRASS-P001-Z / FRASS-P002-Z — The Two Founding Blueprints
//
// Kanko validates the ENTREPRENEURIAL journey: someone actively building toward
// financial independence.
// Mother validates the KNOWLEDGE ECONOMY: someone whose lifetime of experience
// becomes both a source of income and a lasting legacy.
//
// From this point on, no new partner needs a brand-new architecture. Each one
// inherits one of these two foundations and Frassy adapts it to who they are
// and where they are in life. (Audit first. Extend second. Never duplicate —
// FRASS-0494.)
// ─────────────────────────────────────────────────────────────────────────────

import type { LayerId } from "@/lib/business/financial-layers";

export type BlueprintId = "entrepreneurial" | "knowledge-economy";

export type DailyBlueprint = {
  id: BlueprintId;
  origin: string;
  label: string;
  validates: string;
  /** The silent question Frassy asks before assembling the day. */
  morningQuestion: string;
  /** The balance every day must contain. */
  pillars: { emoji: string; label: string; plain: string; layer?: LayerId }[];
  /** What the Daily measures. */
  measures: string[];
  /** What it explicitly never measures. */
  neverMeasures: string[];
  founderPrinciple: string;
};

export const ENTREPRENEURIAL_BLUEPRINT: DailyBlueprint = {
  id: "entrepreneurial",
  origin: "Kanko · FRASS-P001-Z",
  label: "The builder's Daily",
  validates: "Someone actively building toward financial independence.",
  morningQuestion:
    "If these are the only hours this member has today, what combination of actions creates the greatest long-term improvement in their financial future?",
  pillars: [
    { emoji: "💰", label: "Immediate Income", plain: "Generate income now.", layer: "immediate-income" },
    { emoji: "🏗", label: "Business Builder", plain: "Strengthen the businesses being built.", layer: "business-builder" },
    { emoji: "🕊", label: "Financial Freedom", plain: "Build systems that eventually replace employment.", layer: "financial-freedom" },
  ],
  measures: [
    "Immediate income generated",
    "Businesses strengthened",
    "Financial freedom progress",
    "Systems completed",
    "Customers served",
    "Time invested efficiently",
    "Confidence gained",
  ],
  neverMeasures: ["Number of clicks", "Number of tasks", "Hours online"],
  founderPrinciple:
    "This Daily transforms limited time into lasting opportunity. Every session should leave the member " +
    "measurably closer to financial independence than when they logged in.",
};

export const KNOWLEDGE_ECONOMY_BLUEPRINT: DailyBlueprint = {
  id: "knowledge-economy",
  origin: "Mother · FRASS-P002-Z",
  label: "The experienced member's Daily",
  validates:
    "Someone whose lifetime of experience becomes both a source of income and a lasting legacy.",
  morningQuestion:
    "What single combination of opportunities will most improve her financial security today while continuing to preserve the wisdom she has built over a lifetime?",
  pillars: [
    { emoji: "💰", label: "Immediate Income", plain: "The best opportunity available today.", layer: "immediate-income" },
    { emoji: "📚", label: "Knowledge Preservation", plain: "A lifetime of wisdom, kept safely.", layer: "financial-freedom" },
    { emoji: "🏗", label: "Business Development", plain: "Businesses that emerge from experience — never forced.", layer: "business-builder" },
    { emoji: "❤️", label: "Personal Well-being", plain: "One gentle note. Never another task list." },
  ],
  measures: [
    "Financial progress",
    "Knowledge preserved",
    "People helped",
    "Services created",
    "Legacy built",
    "Business opportunities unlocked",
    "Confidence gained",
  ],
  neverMeasures: ["Tasks completed", "Documents written", "Hours online"],
  founderPrinciple:
    "A lifetime of wisdom deserves both respect and opportunity. Frass exists to help experienced members " +
    "improve their financial lives today while preserving the knowledge, stories and experience that can " +
    "continue helping others for generations.",
};

export const FOUNDING_BLUEPRINTS: DailyBlueprint[] = [
  ENTREPRENEURIAL_BLUEPRINT,
  KNOWLEDGE_ECONOMY_BLUEPRINT,
];

export function blueprint(id: BlueprintId): DailyBlueprint {
  return id === "knowledge-economy" ? KNOWLEDGE_ECONOMY_BLUEPRINT : ENTREPRENEURIAL_BLUEPRINT;
}

/**
 * Every future personalized Daily inherits one of the two founding blueprints.
 * Frassy adapts the words, the order and the pace — never the architecture.
 */
export function inheritBlueprint(input: {
  /** Does this member already have decades of expertise to preserve? */
  lifetimeExpertise?: boolean;
  /** Are they actively building a business toward independence? */
  activelyBuilding?: boolean;
}): DailyBlueprint {
  if (input.lifetimeExpertise && !input.activelyBuilding) return KNOWLEDGE_ECONOMY_BLUEPRINT;
  return ENTREPRENEURIAL_BLUEPRINT;
}

/**
 * Validation Phase (both specifications). Both Dailies are constitutionally
 * complete. Improvements come from real-world observation — never speculation.
 */
export const VALIDATION_PHASE = {
  status: "Constitutionally complete",
  rule: "Future improvements must come from real-world observation rather than assumption.",
  sources: [
    "How the member actually uses Frass",
    "Their conversations with Frassy",
    "The needs they express themselves",
  ],
} as const;
