// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0523 — Financial Sustainability Audit.
// "Free to Build. Sustainable to Operate."
//
// Here's the takeaway: this file is the platform's grocery bill. Before Frass adds
// anything new, we work out what it costs us to run, what (if anything) it
// costs the member, who pays for it, and whether the sums still work when a
// hundred members become a million. A feature that is brilliant but ruinous is
// as dangerous as a security hole.
// ─────────────────────────────────────────────────────────────────────────────

// ── Cost drivers ────────────────────────────────────────────────────────────
// Unit costs are deliberately conservative estimates in USD, kept in one place
// so a price change is one edit, not a hunt. They are planning figures for the
// Founder, never billing figures for a member.

export type CostDriver =
  | "ai_text"
  | "ai_voice"
  | "ai_transcribe"
  | "ai_image"
  | "ai_video"
  | "storage"
  | "bandwidth"
  | "database"
  | "third_party"
  | "manufacturing";

export const COST_DRIVERS: Record<
  CostDriver,
  { label: string; unit: string; unitCost: number; plain: string }
> = {
  ai_text: {
    label: "AI conversation",
    unit: "per exchange",
    unitCost: 0.004,
    plain: "One back-and-forth with Frassy, including the thinking behind it.",
  },
  ai_voice: {
    label: "Voice generation",
    unit: "per spoken reply",
    unitCost: 0.006,
    plain: "Turning one of Frassy's replies into speech.",
  },
  ai_transcribe: {
    label: "Speech to text",
    unit: "per spoken message",
    unitCost: 0.002,
    plain: "Understanding what a member said out loud.",
  },
  ai_image: {
    label: "Image generation",
    unit: "per image",
    unitCost: 0.04,
    plain: "Creating one original image — mockups, product shots, artwork.",
  },
  ai_video: {
    label: "Video generation",
    unit: "per clip",
    unitCost: 0.6,
    plain: "Creating one short video clip. The single most expensive thing we do.",
  },
  storage: {
    label: "Storage",
    unit: "per GB / month",
    unitCost: 0.023,
    plain: "Keeping a member's files, images and vault safe for a month.",
  },
  bandwidth: {
    label: "Bandwidth",
    unit: "per GB served",
    unitCost: 0.01,
    plain: "Delivering pages, images and video to a member's device.",
  },
  database: {
    label: "Database",
    unit: "per member / month",
    unitCost: 0.012,
    plain: "Holding a member's account, progress and history.",
  },
  third_party: {
    label: "Third-party service",
    unit: "per call",
    unitCost: 0.01,
    plain: "An outside service we pay per request.",
  },
  manufacturing: {
    label: "Manufacturing integration",
    unit: "per order",
    unitCost: 0.25,
    plain: "Coordinating a real production order with a manufacturing partner.",
  },
};

// ── Funding models ──────────────────────────────────────────────────────────

export type FundingModel =
  | "frass_absorbs"
  | "credits"
  | "marketplace_commission"
  | "premium_service"
  | "partner_revenue"
  | "enterprise";

export const FUNDING_MODELS: Record<FundingModel, { label: string; plain: string }> = {
  frass_absorbs: {
    label: "Frass absorbs the cost",
    plain: "We pay for it, on purpose, because it is part of the promise.",
  },
  credits: {
    label: "Frass Credits",
    plain: "Paid for with credits the member earns by taking part — never a surprise bill.",
  },
  marketplace_commission: {
    label: "Marketplace commission",
    plain: "Funded by our small share of sales that only happen when the member earns.",
  },
  premium_service: {
    label: "Premium service",
    plain: "An optional, clearly-priced service a member chooses on purpose.",
  },
  partner_revenue: {
    label: "Partner revenue share",
    plain: "A partner pays because the feature brings them business.",
  },
  enterprise: {
    label: "Enterprise services",
    plain: "Funded by organisations, not by individual builders.",
  },
};

// ── Cost Impact Statement ───────────────────────────────────────────────────

export type MemberCost = "free" | "credits" | "optional_paid";

export type CostLine = { driver: CostDriver; unitsPerUse: number };

export type CostImpactStatement = {
  /** Stable key. */
  id: string;
  feature: string;
  /** Which page a member meets it on — links the financial audit to FRASS-0524. */
  page: string;
  /** What the resource use looks like for one single use. */
  perUse: CostLine[];
  /** Realistic uses per active member per month. */
  usesPerMemberMonth: number;
  /** Share of members who touch this at all (0–1). */
  adoption: number;
  memberCost: MemberCost;
  /** Credits charged to the member per use, when memberCost is "credits". */
  creditsPerUse?: number;
  funding: FundingModel;
  /** What happens when credits run out or costs spike. Never a dead end. */
  degradesTo: string;
  /** Core promise: this must stay free forever. */
  freeForever: boolean;
  notes?: string;
};

/**
 * FREE MEANS FREE. These experiences are constitutionally free and may never
 * be moved behind credits or payment.
 */
export const FREE_FOREVER = [
  "Welcome Hall",
  "Onboarding",
  "The Daily",
  "Frassy conversations",
  "Money Moves",
  "Business Builder",
  "Business Vaults",
  "Knowledge Vault",
  "Marketplace browsing",
  "Builder Identity (Frass Card)",
] as const;

/**
 * The live register of every cost-bearing feature in Frass. A new AI-powered
 * feature is not finished until it has a line here.
 */
export const COST_IMPACT_REGISTER: CostImpactStatement[] = [
  {
    id: "frassy-conversation",
    feature: "Frassy conversations",
    page: "Everywhere",
    perUse: [{ driver: "ai_text", unitsPerUse: 1 }],
    usesPerMemberMonth: 90,
    adoption: 0.95,
    memberCost: "free",
    funding: "frass_absorbs",
    degradesTo: "Shorter replies and cached answers for repeated questions. Never silence.",
    freeForever: true,
    notes: "The heart of the platform. Cost control lives in prompt size and caching, never in a paywall.",
  },
  {
    id: "frassy-voice",
    feature: "Frassy speaking out loud",
    page: "Everywhere",
    perUse: [
      { driver: "ai_voice", unitsPerUse: 1 },
      { driver: "ai_transcribe", unitsPerUse: 0.6 },
    ],
    usesPerMemberMonth: 25,
    adoption: 0.45,
    memberCost: "free",
    funding: "frass_absorbs",
    degradesTo: "The device's own voice, then the written reply with a small notice (FRASS-0477).",
    freeForever: true,
  },
  {
    id: "daily",
    feature: "The Daily",
    page: "/room",
    perUse: [
      { driver: "ai_text", unitsPerUse: 2 },
      { driver: "database", unitsPerUse: 0 },
    ],
    usesPerMemberMonth: 22,
    adoption: 0.8,
    memberCost: "free",
    funding: "frass_absorbs",
    degradesTo: "Yesterday's plan carried forward with one winnable Money Move.",
    freeForever: true,
  },
  {
    id: "money-moves",
    feature: "Money Moves engine",
    page: "/money-moves",
    perUse: [{ driver: "ai_text", unitsPerUse: 1.5 }],
    usesPerMemberMonth: 15,
    adoption: 0.7,
    memberCost: "free",
    funding: "marketplace_commission",
    degradesTo: "Pre-computed moves from the member's blueprint, no fresh reasoning.",
    freeForever: true,
    notes: "Pays for itself: Money Moves lead to marketplace and affiliate activity.",
  },
  {
    id: "marketplace-browsing",
    feature: "Marketplace browsing",
    page: "/marketplace",
    perUse: [{ driver: "bandwidth", unitsPerUse: 0.02 }],
    usesPerMemberMonth: 20,
    adoption: 0.6,
    memberCost: "free",
    funding: "marketplace_commission",
    degradesTo: "Lighter images and longer cache windows.",
    freeForever: true,
  },
  {
    id: "image-generation",
    feature: "AI image generation (mockups, artwork, product shots)",
    page: "/studio",
    perUse: [
      { driver: "ai_image", unitsPerUse: 1 },
      { driver: "storage", unitsPerUse: 0.004 },
    ],
    usesPerMemberMonth: 8,
    adoption: 0.3,
    memberCost: "credits",
    creditsPerUse: 1,
    funding: "credits",
    degradesTo: "A written description plus a free layout template the member can use immediately.",
    freeForever: false,
  },
  {
    id: "video-generation",
    feature: "AI video generation (FV Studios)",
    page: "/studio/video",
    perUse: [
      { driver: "ai_video", unitsPerUse: 1 },
      { driver: "storage", unitsPerUse: 0.05 },
      { driver: "bandwidth", unitsPerUse: 0.1 },
    ],
    usesPerMemberMonth: 2,
    adoption: 0.12,
    memberCost: "credits",
    creditsPerUse: 12,
    funding: "credits",
    degradesTo: "A storyboard and script the member can film on a phone for nothing.",
    freeForever: false,
    notes: "Highest unit cost on the platform. Always show the credit price before generating.",
  },
  {
    id: "vault-storage",
    feature: "Knowledge Vault storage",
    page: "/vault",
    perUse: [{ driver: "storage", unitsPerUse: 0.5 }],
    usesPerMemberMonth: 1,
    adoption: 0.5,
    memberCost: "free",
    funding: "frass_absorbs",
    degradesTo: "A generous free allowance, then credits for unusually large libraries.",
    freeForever: true,
  },
  {
    id: "manufacturing",
    feature: "Manufacturing Network orders",
    page: "/manufacturing",
    perUse: [
      { driver: "manufacturing", unitsPerUse: 1 },
      { driver: "third_party", unitsPerUse: 3 },
    ],
    usesPerMemberMonth: 0.4,
    adoption: 0.05,
    memberCost: "free",
    funding: "partner_revenue",
    degradesTo: "Manual introduction to the partner — slower, still free.",
    freeForever: false,
    notes: "Costs only arise alongside a real order, which carries partner revenue.",
  },
  {
    id: "platform-baseline",
    feature: "Account, database and page delivery",
    page: "Everywhere",
    perUse: [
      { driver: "database", unitsPerUse: 1 },
      { driver: "bandwidth", unitsPerUse: 0.15 },
    ],
    usesPerMemberMonth: 1,
    adoption: 1,
    memberCost: "free",
    funding: "frass_absorbs",
    degradesTo: "Nothing to degrade — this is the floor of being a member.",
    freeForever: true,
  },
];

// ── Maths ───────────────────────────────────────────────────────────────────

export function costPerUse(statement: CostImpactStatement): number {
  return statement.perUse.reduce(
    (sum, line) => sum + COST_DRIVERS[line.driver].unitCost * line.unitsPerUse,
    0,
  );
}

export function monthlyCostForMembers(statement: CostImpactStatement, members: number): number {
  return costPerUse(statement) * statement.usesPerMemberMonth * statement.adoption * members;
}

export const SCALE_TIERS = [100, 1_000, 10_000, 100_000, 1_000_000] as const;
export type ScaleTier = (typeof SCALE_TIERS)[number];

export type ScaleProjection = { members: number; monthly: number; perMember: number };

export function projectFeature(statement: CostImpactStatement): ScaleProjection[] {
  return SCALE_TIERS.map((members) => {
    const monthly = monthlyCostForMembers(statement, members);
    return { members, monthly, perMember: monthly / members };
  });
}

export function projectPlatform(
  register: CostImpactStatement[] = COST_IMPACT_REGISTER,
): ScaleProjection[] {
  return SCALE_TIERS.map((members) => {
    const monthly = register.reduce((sum, s) => sum + monthlyCostForMembers(s, members), 0);
    return { members, monthly, perMember: monthly / members };
  });
}

/** Cost per member per month, split into what Frass eats and what credits cover. */
export function costSplitPerMember(register: CostImpactStatement[] = COST_IMPACT_REGISTER) {
  const absorbed = register
    .filter((s) => s.memberCost === "free")
    .reduce((sum, s) => sum + monthlyCostForMembers(s, 1), 0);
  const credited = register
    .filter((s) => s.memberCost !== "free")
    .reduce((sum, s) => sum + monthlyCostForMembers(s, 1), 0);
  return { absorbed, credited, total: absorbed + credited };
}

export function costByDriver(
  members: number,
  register: CostImpactStatement[] = COST_IMPACT_REGISTER,
): Array<{ driver: CostDriver; label: string; monthly: number }> {
  const totals = new Map<CostDriver, number>();
  for (const s of register) {
    for (const line of s.perUse) {
      const cost =
        COST_DRIVERS[line.driver].unitCost *
        line.unitsPerUse *
        s.usesPerMemberMonth *
        s.adoption *
        members;
      totals.set(line.driver, (totals.get(line.driver) ?? 0) + cost);
    }
  }
  return [...totals.entries()]
    .map(([driver, monthly]) => ({ driver, label: COST_DRIVERS[driver].label, monthly }))
    .sort((a, b) => b.monthly - a.monthly);
}

// ── The four questions ──────────────────────────────────────────────────────

export type SustainabilityVerdict = "sustainable" | "watch" | "unsustainable";

export type FeatureAudit = {
  statement: CostImpactStatement;
  costPerUse: number;
  perMemberMonth: number;
  projections: ScaleProjection[];
  verdict: SustainabilityVerdict;
  /** The four constitutional questions, answered in simple terms. */
  answers: {
    costsFrass: string;
    costsMember: string;
    sustainedBy: string;
    scales: string;
  };
  warnings: string[];
};

const money = (n: number) =>
  n >= 1000
    ? `$${Math.round(n).toLocaleString()}`
    : n >= 1
      ? `$${n.toFixed(2)}`
      : `$${n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;

export function auditFeature(statement: CostImpactStatement): FeatureAudit {
  const per = costPerUse(statement);
  const perMemberMonth = monthlyCostForMembers(statement, 1);
  const projections = projectFeature(statement);
  const atMillion = projections[projections.length - 1].monthly;

  const warnings: string[] = [];
  if (statement.memberCost === "free" && statement.funding === "frass_absorbs" && per > 0.05) {
    warnings.push(
      "Frass absorbs an expensive per-use cost. Either move it to credits or make the cheap path the default.",
    );
  }
  if (statement.freeForever && statement.memberCost !== "free") {
    warnings.push(
      "CRITICAL TRUST ISSUE: this is on the free-forever list but charges the member. One of the two is wrong.",
    );
  }
  if (!statement.degradesTo.trim()) {
    warnings.push("No graceful degradation. Every feature needs a free fallback, never a dead end.");
  }
  if (atMillion > 250_000 && statement.funding === "frass_absorbs") {
    warnings.push("At one million members this alone would dominate operating costs.");
  }

  const verdict: SustainabilityVerdict = warnings.some((w) => w.startsWith("CRITICAL"))
    ? "unsustainable"
    : warnings.length > 0
      ? "watch"
      : "sustainable";

  return {
    statement,
    costPerUse: per,
    perMemberMonth,
    projections,
    verdict,
    answers: {
      costsFrass: `${money(per)} each time it is used — ${statement.perUse
        .map((l) => `${COST_DRIVERS[l.driver].label} ×${l.unitsPerUse}`)
        .join(", ")}. About ${money(perMemberMonth)} per member per month.`,
      costsMember:
        statement.memberCost === "free"
          ? "Nothing. Free while learning, building and exploring."
          : statement.memberCost === "credits"
            ? `${statement.creditsPerUse ?? 1} credit${(statement.creditsPerUse ?? 1) === 1 ? "" : "s"}, shown before the member commits. Credits are earned by taking part.`
            : "An optional, clearly-priced service the member chooses on purpose.",
      sustainedBy: FUNDING_MODELS[statement.funding].plain,
      scales: projections
        .map((p) => `${p.members.toLocaleString()} → ${money(p.monthly)}/mo`)
        .join(" · "),
    },
    warnings,
  };
}

export function auditPlatform(register: CostImpactStatement[] = COST_IMPACT_REGISTER) {
  const audits = register.map(auditFeature);
  return {
    audits,
    projections: projectPlatform(register),
    split: costSplitPerMember(register),
    critical: audits.filter((a) => a.verdict === "unsustainable"),
    watch: audits.filter((a) => a.verdict === "watch"),
  };
}

export function formatMoney(n: number) {
  return money(n);
}

/**
 * The Cost Impact Statement every new AI-powered feature must complete before
 * a line of it is written.
 */
export const COST_IMPACT_QUESTIONS = [
  "Estimated cost per use?",
  "Estimated monthly cost at 1,000 / 100,000 / 1,000,000 members?",
  "Is it free to the member?",
  "If not, what pays for it?",
  "Can the existing Frass Credit System absorb it?",
  "Can it degrade gracefully — text instead of images when credits run out?",
] as const;

export const NO_SURPRISE_BILLING = [
  "The member always knows what is free.",
  "The member always knows what uses credits, before it is used.",
  "The member can always see how many credits remain.",
  "The member always knows how to earn more.",
  "No hidden charges, no automatic upgrades, no surprise invoices.",
] as const;
