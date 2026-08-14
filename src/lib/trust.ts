// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0431 — Frass Trust & Fraud Protection Constitution
//
// Constitutional principle: "Privacy by Default. Security by Design."
//
// Frass does not promise that fraud is impossible — no honest platform can.
// Frass is designed so fraud is extremely difficult to commit, quick to detect,
// and fast to resolve.
//
// Here's the practical version: we build the shop like a bank branch, not
// like a market stall with a cash box. The money passes through an armoured
// channel, the cameras are always on, and every receipt is filed — so if
// something goes wrong, we can see exactly what happened and fix it quickly.
// ─────────────────────────────────────────────────────────────────────────────

export const TRUST_PRINCIPLE = "Privacy by Default. Security by Design.";

export const FRAUD_POSTURE =
  "We design Frass so fraud is extremely difficult to commit, quick to detect, and fast to resolve.";

export const NEVER_TRUST_BLINDLY =
  "Frass should never ask members to trust blindly. The platform earns trust through transparent systems, strong privacy protections and secure financial practices.";

/** What one member can never see about another — not even the last four digits. */
export const NEVER_EXPOSED = [
  "Debit card number",
  "Credit card number",
  "Expiration date",
  "CVV",
  "Bank account number",
  "Routing number",
  "Digital wallet credentials",
  "Security tokens",
  "Billing credentials",
  "Banking login information",
] as const;

/** The only things a seller receives — nothing beyond what fulfilment needs. */
export const SELLER_SEES = [
  "Customer display name",
  "Order number",
  "Products or services purchased",
  "Transaction amount",
  "Payment status",
  "Shipping information (only when the order must be shipped)",
  "Contact information only when fulfilment requires it, and only per the buyer's privacy choices",
] as const;

/** Signals every financial transaction is evaluated against. */
export const FRAUD_SIGNALS = [
  "Multiple failed payment attempts",
  "Unusual purchasing patterns",
  "Rapid changes in payment methods",
  "Suspicious login activity",
  "High-risk geographic anomalies",
  "Device reputation",
  "Velocity checks",
  "Known fraud indicators",
] as const;

export const ACCOUNT_PROTECTIONS = [
  "Multi-factor authentication",
  "Device recognition",
  "Login alerts",
  "New device verification",
  "Optional biometric authentication where supported",
] as const;

/** Every transaction keeps a complete record, so a dispute is answerable. */
export const TRANSACTION_RECORD = [
  "Unique transaction ID",
  "Audit trail",
  "Timestamp",
  "Device log",
  "Payment status",
  "Settlement status",
  "Refund history",
  "Dispute history",
] as const;

/* ── Trust signals shown on a Frass Card ─────────────────────────────────── */

export type TrustBadgeId =
  | "identity_verified"
  | "business_verified"
  | "community_verified"
  | "frass_verified";

export const TRUST_BADGES: Record<TrustBadgeId, { label: string; icon: string; plain: string }> = {
  identity_verified: {
    label: "Identity Verified",
    icon: "✅",
    plain: "Frass has confirmed this is a real, named person.",
  },
  business_verified: {
    label: "Business Verified",
    icon: "🏛",
    plain: "This member's business details have been checked.",
  },
  community_verified: {
    label: "Community Verified",
    icon: "🤝",
    plain: "Long-standing members of the community vouch for this person.",
  },
  frass_verified: {
    label: "Frass Verified",
    icon: "🛡",
    plain: "Reviewed and verified directly by Frass.",
  },
};

/* ── Fraud reporting ─────────────────────────────────────────────────────── */

export const FRAUD_REPORT_KINDS = [
  { id: "fraud", label: "Fraud" },
  { id: "scam", label: "Scam" },
  { id: "identity_misuse", label: "Identity misuse" },
  { id: "counterfeit", label: "Counterfeit goods" },
  { id: "unauthorized_activity", label: "Unauthorised activity" },
  { id: "suspicious_message", label: "Suspicious message" },
  { id: "other", label: "Something else" },
] as const;
export type FraudReportKind = (typeof FRAUD_REPORT_KINDS)[number]["id"];

export function fraudKindLabel(kind: string): string {
  return FRAUD_REPORT_KINDS.find((k) => k.id === kind)?.label ?? "Report";
}

export const FRAUD_STATUS_LABEL: Record<string, string> = {
  received: "Received",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Closed — no action needed",
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

export function memberSinceLabel(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Zeros stay honest: a rating only exists when real reviews exist. */
export function ratingLabel(average: number | null, count: number): string {
  if (!count || average == null) return "No ratings yet";
  return `${average.toFixed(1)} ★ · ${count} ${count === 1 ? "review" : "reviews"}`;
}

/* ── FRASS-0493 — Trust & Reputation Engine ──────────────────────────────── */

/**
 * Trust on Frass is a profile, not a score.
 *
 * There is deliberately no "92/100" anywhere in this file. A number turns
 * members into a leaderboard and invites gaming. Verified facts do the same
 * job with more dignity: what someone has actually completed, and how reliably.
 *
 * This extends the existing Frass identity architecture — the same Frass Card,
 * the same profile, the same verifications table. It is not a review platform.
 */

export const REPUTATION_PRINCIPLE =
  "Trust is earned through integrity, consistency and completed commitments — never through popularity.";

export const REPUTATION_PLAIN_ENGLISH =
  "It works like a tradesperson's reputation in a small town. Nobody hires the plumber with the most followers; they hire the one who showed up, finished the job and didn't disappear. Frass counts the jobs finished, not the applause.";

export const REPUTATION_NEVER = [
  "Followers",
  "Likes",
  "Views",
  "Popularity",
  "Viral content",
] as const;

export const REPUTATION_NEVER_RULE =
  "Followers, likes, views, popularity and viral reach never increase trust on Frass. Not by a fraction, not indirectly, not ever.";

export const REPUTATION_SOURCES = [
  "Services completed successfully",
  "Marketplace transactions",
  "Shipping deliveries completed",
  "Projects delivered",
  "Businesses launched",
  "Verified partnerships",
  "Long-term reliability",
  "Community contributions",
  "Educational achievements",
  "Professional certifications",
  "Founder recognition",
  "Verified customer feedback",
] as const;

export const REPUTATION_TRANSPARENCY =
  "No hidden scoring. A member can always see why their trust changed, what helped and what needs work.";

export const REPUTATION_RECOVERY =
  "Trust should not permanently punish an honest mistake. Members can always rebuild through completed commitments. Repeated misconduct, however, carries lasting consequences.";

export const FOR_ME_BOUNDARY =
  "FOR ME tells your story. Trust reflects your reliability. They sit beside each other and never merge.";

/* Builder growth — consistency, never status. */

export type BuilderStage = "new" | "growing" | "trusted" | "established";

export const BUILDER_STAGES: Record<
  BuilderStage,
  { label: string; icon: string; plain: string; minCompleted: number; minMonths: number }
> = {
  new: {
    label: "New Builder",
    icon: "🌱",
    plain: "Just getting started. Everyone begins here — it says nothing bad about anyone.",
    minCompleted: 0,
    minMonths: 0,
  },
  growing: {
    label: "Growing Builder",
    icon: "🌿",
    plain: "Real completed work is starting to stack up.",
    minCompleted: 3,
    minMonths: 1,
  },
  trusted: {
    label: "Trusted Builder",
    icon: "🏆",
    plain: "A consistent record of finishing what they started.",
    minCompleted: 15,
    minMonths: 4,
  },
  established: {
    label: "Established Builder",
    icon: "⭐",
    plain: "Years of reliability behind them, not weeks.",
    minCompleted: 50,
    minMonths: 12,
  },
};

export const STAGE_ORDER: BuilderStage[] = ["new", "growing", "trusted", "established"];

/** Stage is time plus completed commitments. Nothing else can move it. */
export function builderStage(completed: number, monthsActive: number): BuilderStage {
  let stage: BuilderStage = "new";
  for (const id of STAGE_ORDER) {
    const s = BUILDER_STAGES[id];
    if (completed >= s.minCompleted && monthsActive >= s.minMonths) stage = id;
  }
  return stage;
}

export function nextStage(stage: BuilderStage): BuilderStage | null {
  const i = STAGE_ORDER.indexOf(stage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

/** What the member must actually do to reach the next stage — no mystery. */
export function stageGuidance(
  stage: BuilderStage,
  completed: number,
  monthsActive: number,
): string | null {
  const next = nextStage(stage);
  if (!next) return null;
  const target = BUILDER_STAGES[next];
  const needJobs = Math.max(0, target.minCompleted - completed);
  const needMonths = Math.max(0, target.minMonths - monthsActive);
  const parts: string[] = [];
  if (needJobs > 0) parts.push(`${needJobs} more completed ${needJobs === 1 ? "commitment" : "commitments"}`);
  if (needMonths > 0) parts.push(`${needMonths} more ${needMonths === 1 ? "month" : "months"} of activity`);
  if (!parts.length) return `You have met everything ${target.label} asks for.`;
  return `${target.icon} ${target.label} needs ${parts.join(" and ")}.`;
}

/* Verified feedback — only from people who actually transacted. */

export const FEEDBACK_SOURCES = [
  { id: "marketplace_order", label: "Marketplace purchase" },
  { id: "service", label: "Service booking" },
  { id: "shipping", label: "Shipping transaction" },
  { id: "project", label: "Project or invoice" },
  { id: "commission", label: "Commissioned work" },
] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number]["id"];

export const FEEDBACK_RULE =
  "Only someone who genuinely completed a transaction with this member through Frass can leave feedback, once per transaction, and it can never be rewritten afterwards.";

export type FeedbackExperience = "positive" | "mixed" | "negative";

export const FEEDBACK_EXPERIENCE: Record<FeedbackExperience, { label: string; icon: string }> = {
  positive: { label: "It went well", icon: "✔️" },
  mixed: { label: "Mixed", icon: "◐" },
  negative: { label: "It didn't go well", icon: "✕" },
};

/** A single verified fact on someone's Trust Profile. */
export type TrustFact = { icon: string; label: string; plain: string };

export function reliabilityLabel(met: number, total: number): string | null {
  if (total < 3) return null;
  const pct = Math.round((met / total) * 100);
  return `${pct}% of commitments met`;
}
