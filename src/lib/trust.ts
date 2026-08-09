// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0431 — Frass Trust & Fraud Protection Constitution
//
// Constitutional principle: "Privacy by Default. Security by Design."
//
// Frass does not promise that fraud is impossible — no honest platform can.
// Frass is designed so fraud is extremely difficult to commit, quick to detect,
// and fast to resolve.
//
// What this means in plain English: we build the shop like a bank branch, not
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
