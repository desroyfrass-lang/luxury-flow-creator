// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0469 — Future Business Vault Library (Deferred Businesses)
//
// Founder Principle: Frass should never distract a Partner from today's
// mission with tomorrow's opportunities. Ideas are remembered — never
// activated until the Partner asks.
//
// Hard rules enforced by this module:
//   · A future vault NEVER produces Daily tasks.
//   · A future vault NEVER produces Money Moves.
//   · A future vault NEVER counts toward Launch Readiness.
//   · Frassy never reminds, nudges or scores a future vault.
//
// Nothing here touches accelerator.ts, money-moves.ts or launch-program.ts.
// It is a library shelf, not a work queue.
// ─────────────────────────────────────────────────────────────────────────────

export type FutureVaultStatus = "future" | "activated";

export type FutureVaultRow = {
  id: string;
  user_id: string;
  key: string;
  emoji: string;
  label: string;
  summary: string | null;
  rationale: string | null;
  status: FutureVaultStatus;
  notes: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

/** The businesses that DO get Daily attention. Everything else waits. */
export const ACTIVE_LAUNCH_PRIORITIES = [
  { emoji: "🌿", label: "Wellness Brand" },
  { emoji: "👗", label: "Coco Vintage" },
  { emoji: "📸", label: "Faceless Content" },
  { emoji: "🤝", label: "Affiliate Marketing" },
  { emoji: "🎙", label: "Podcast" },
] as const;

export type VaultIdea = {
  key: string;
  emoji: string;
  label: string;
  summary: string;
  rationale: string;
  /** What Frassy WOULD build — shown as a preview only, never scheduled. */
  roadmap: string[];
};

/**
 * The seeded shelf. Freight is first because it rests on 15 years of real
 * industry experience — the strongest long-term asset on the shelf.
 */
export const VAULT_IDEAS: VaultIdea[] = [
  {
    key: "freight",
    emoji: "🚛",
    label: "Freight & Logistics",
    summary: "A modern freight company built on ~15 years of industry experience.",
    rationale:
      "This is not a business started from scratch — it is fifteen years of freight and logistics knowledge turned into a company. Long term it is the most scalable idea on this shelf, because the work can be systemised and eventually run with light day-to-day involvement.",
    roadmap: [
      "Organise the business documents in one place",
      "Build the company brand and identity",
      "Register the business when the timing is right",
      "Create the company website inside the Business Builder",
      "Define the service offerings and who they're for",
      "Write the standard operating procedures",
      "Set the pricing structure",
      "Build the customer outreach plan",
      "Prepare the marketing materials",
      "Build the client pipeline",
    ],
  },
  {
    key: "restaurant",
    emoji: "🍽️",
    label: "Restaurant or food business",
    summary: "A kitchen, a menu and a room full of people.",
    rationale: "High effort, high presence. Worth parking until the lighter businesses are earning.",
    roadmap: ["Concept and menu", "Costing and pricing", "Location or kitchen", "Brand and site", "Opening plan"],
  },
  {
    key: "book",
    emoji: "📖",
    label: "Write a book",
    summary: "The story, method or expertise, in print.",
    rationale: "Credibility that keeps paying. Best written once the daily businesses are steady.",
    roadmap: ["Outline", "Draft schedule", "Editing", "Cover and format", "Publish and sell"],
  },
  {
    key: "nonprofit",
    emoji: "💛",
    label: "Nonprofit or foundation",
    summary: "Service work with proper structure behind it.",
    rationale: "Meaningful, but it needs funding behind it — which the other businesses create first.",
    roadmap: ["Cause and mission", "Structure and registration", "Funding model", "Impact reporting"],
  },
  {
    key: "clothing-line",
    emoji: "🧵",
    label: "Clothing line",
    summary: "An original line, designed and produced.",
    rationale: "Coco Vintage teaches the market first. The line comes after the buyers exist.",
    roadmap: ["Design direction", "Sampling", "Production partner", "Drop plan", "Launch"],
  },
];

export function ideaByKey(key: string): VaultIdea | undefined {
  return VAULT_IDEAS.find((i) => i.key === key);
}

/** Exact phrase that switches a vault on. Nothing else activates it. */
export function activationPhrase(label: string): string {
  return `Let's start my ${label} business.`;
}

/**
 * Constitutional guard used by every planner. A deferred vault contributes
 * nothing to today's plan, readiness or income forecast.
 */
export function contributesToDaily(vault: Pick<FutureVaultRow, "status">): boolean {
  return vault.status === "activated";
}

/** Same guard, spelled out for readiness maths. */
export function countsTowardLaunchReadiness(): false {
  return false;
}

export const PLAIN_ENGLISH =
  "What this means in plain English: this is a shelf, not a to-do list. Ideas sit here safely so they're never lost — and Frassy won't mention them again until you say you're ready.";
