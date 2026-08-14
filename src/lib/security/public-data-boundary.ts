// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0565 — Public Data Boundary & Zero-Trust Privacy
// "Private by Default. Public by Design."
//
// Frass never relies on anyone remembering which columns are safe to expose.
// Every public-facing feature — feed, report, broadcast, marketplace,
// leaderboard, community wall, social experience — passes through this
// boundary. Anything not intentionally designed for public viewing stays private.
//
// Here's the idea: instead of asking "did we accidentally expose something?",
// we make it hard to expose anything in the first place.
// ─────────────────────────────────────────────────────────────────────────────

/** Who is looking. The boundary widens only as trust is proven server-side. */
export type Audience = "public" | "member" | "connection" | "partner" | "founder";

export const AUDIENCE_LABEL: Record<Audience, string> = {
  public: "Anyone (signed out)",
  member: "Signed-in member",
  connection: "A connected member",
  partner: "First Partner",
  founder: "Founder",
};

/** Internal identifiers. Never returned to the public, ever. */
export const FORBIDDEN_IDENTIFIER_FIELDS = [
  "user_id",
  "owner_id",
  "host_id",
  "sender_id",
  "recipient_id",
  "author_id",
  "partner_id",
  "builder_id",
  "member_id",
  "created_by",
  "updated_by",
  "profile_id",
  "account_id",
  "email",
  "phone",
] as const;

/** Money. Never public unless the viewer is explicitly authorized. */
export const FORBIDDEN_FINANCIAL_FIELDS = [
  "credits",
  "balance",
  "amount",
  "amount_cents",
  "currency",
  "gift_value",
  "commission_rate",
  "commission_percent",
  "cost",
  "cost_price",
  "margin",
  "platform_allocation",
  "net_amount",
  "gross_amount",
  "payout",
  "revenue",
] as const;

/** Internal machinery. Never public. */
export const FORBIDDEN_METADATA_FIELDS = [
  "internal_notes",
  "founder_notes",
  "private_note",
  "moderation_flag",
  "moderation_status",
  "risk_score",
  "security_classification",
  "audit_log",
  "audit_trail",
  "ip_address",
  "user_agent",
  "raw_payload",
  "metadata",
  "system_ref",
] as const;

export const PUBLIC_FORBIDDEN_FIELDS: readonly string[] = [
  ...FORBIDDEN_IDENTIFIER_FIELDS,
  ...FORBIDDEN_FINANCIAL_FIELDS,
  ...FORBIDDEN_METADATA_FIELDS,
];

const normalize = (field: string) => field.trim().toLowerCase();

/**
 * Which of the requested columns must never reach an anonymous visitor.
 * Returns an empty list when the selection is constitutionally safe.
 */
export function publicUnsafeFields(fields: readonly string[]): string[] {
  const banned = new Set(PUBLIC_FORBIDDEN_FIELDS);
  return fields.filter((f) => banned.has(normalize(f)));
}

/**
 * Guard for any public read path (server function, public route loader,
 * public view projection). Throws before the data can leave the building.
 */
export function assertPublicSafe(source: string, fields: readonly string[]): void {
  const unsafe = publicUnsafeFields(fields);
  if (unsafe.length === 0) return;
  throw new Error(
    `FRASS-0565 Public Data Boundary: "${source}" tried to expose ${unsafe.join(", ")} publicly. ` +
      "Build a dedicated public view containing only display fields instead.",
  );
}

/**
 * Keep only the fields a given audience is allowed to see. The public list is
 * always an allow-list — never a hide-list.
 */
export function projectForAudience<T extends Record<string, unknown>>(
  row: T,
  allowed: readonly (keyof T & string)[],
  audience: Audience = "public",
): Partial<T> {
  const fields = audience === "public" ? allowed.filter((f) => publicUnsafeFields([f]).length === 0) : allowed;
  const out: Partial<T> = {};
  for (const f of fields) out[f] = row[f];
  return out;
}

/** The four questions every new public surface must answer before release. */
export const BOUNDARY_QUESTIONS = [
  "Who can see this — Founder, Member, Connections, Partners, or the Public?",
  "What is the minimum information that audience needs to trust this feature?",
  "Is the public reading a dedicated public view rather than a raw table?",
  "Does anything here carry an internal identifier, a money value, or internal metadata?",
] as const;

export const PUBLIC_DATA_BOUNDARY_PRINCIPLE =
  "Privacy is not added after a feature is built. Privacy is part of the feature's design. " +
  "Every public experience reveals only what is necessary to create trust, never what is merely available.";
