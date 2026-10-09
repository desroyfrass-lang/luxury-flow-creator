// FRASS Global Restrictions — Founder panel input validation (pure).
// The database re-checks everything; this keeps bad drafts out early and
// gives the Founder plain-English reasons.

export const TARGET_LEVELS = ["variant", "offer", "listing", "category", "vendor"] as const;
export const REASONS = ["legal_prohibition", "shipping_unavailable", "age_gated", "needs_review", "verified_permitted"] as const;
export const EFFECTS = ["allow", "prohibit"] as const;
export const APPLIES_TO = ["product", "service", "both"] as const;

export type RuleDraft = {
  target_level: (typeof TARGET_LEVELS)[number];
  target_ref: string;
  country: string;
  subdivision: string | null;
  effect: (typeof EFFECTS)[number];
  reason: (typeof REASONS)[number];
  applies_to: (typeof APPLIES_TO)[number];
  min_age: number | null;
  evidence_source: string | null;
  evidence_reference: string | null;
  verified_at: string | null;
  expires_at: string | null;
};

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v: unknown, max = 500) => str(v, max) || null;
const oneOf = <T extends readonly string[]>(list: T, v: unknown): T[number] | null =>
  (list as readonly string[]).includes(v as string) ? (v as T[number]) : null;
const isoDate = (v: unknown) => {
  const s = str(v, 40);
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? "invalid" : new Date(t).toISOString();
};

/** Returns a clean draft, or a list of problems. Never trusts approval fields — they are dropped. */
export function parseRuleDraft(input: unknown, now = new Date()): { ok: true; draft: RuleDraft } | { ok: false; errors: string[] } {
  const o = (input ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  const target_level = oneOf(TARGET_LEVELS, o.target_level);
  const effect = oneOf(EFFECTS, o.effect);
  const reason = oneOf(REASONS, o.reason);
  const applies_to = oneOf(APPLIES_TO, o.applies_to ?? "both");
  const target_ref = str(o.target_ref, 200);
  const country = str(o.country, 10).toUpperCase();
  const subdivision = opt(o.subdivision, 6)?.toUpperCase() ?? null;
  const minRaw = o.min_age === "" || o.min_age == null ? null : Number(o.min_age);
  const verified_at = isoDate(o.verified_at);
  const expires_at = isoDate(o.expires_at);

  if (!target_level) errors.push("Choose what the rule applies to.");
  if (!target_ref) errors.push("Enter the item, vendor or category reference.");
  if (!/^[A-Z]{2}$/.test(country)) errors.push("Country must be a 2-letter code, e.g. JM.");
  if (subdivision && !(new RegExp(`^${country}-[A-Z0-9]{1,3}$`).test(subdivision))) errors.push("Region must look like US-CA and match the country.");
  if (!effect) errors.push("Choose allow or prohibit.");
  if (!reason) errors.push("Choose a reason.");
  if (!applies_to) errors.push("Choose product, service or both.");
  if (reason === "verified_permitted" && effect === "prohibit") errors.push("A 'permitted' reason cannot prohibit.");
  if ((reason === "legal_prohibition" || reason === "shipping_unavailable") && effect === "allow") errors.push("That reason can only prohibit.");
  if (minRaw !== null && (!Number.isInteger(minRaw) || minRaw <= 0 || minRaw > 120)) errors.push("Minimum age must be a whole number 1–120.");
  if (reason === "age_gated" && minRaw === null) errors.push("Age rules need a minimum age.");
  if (verified_at === "invalid") errors.push("Verified date is not a valid date.");
  else if (verified_at && Date.parse(verified_at) > now.getTime()) errors.push("Verified date cannot be in the future.");
  if (expires_at === "invalid") errors.push("Expiry date is not a valid date.");
  else if (expires_at && verified_at && verified_at !== "invalid" && expires_at <= verified_at) errors.push("Expiry must be after the verified date.");

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    draft: {
      target_level: target_level!, target_ref, country, subdivision, effect: effect!, reason: reason!,
      applies_to: applies_to!, min_age: minRaw, evidence_source: opt(o.evidence_source),
      evidence_reference: opt(o.evidence_reference, 1000),
      verified_at: verified_at as string | null, expires_at: expires_at as string | null,
    },
  };
}

/** Plain-English list of what still blocks approval (database enforces the same). */
export function approvalBlockers(r: Pick<RuleDraft, "evidence_source" | "evidence_reference" | "verified_at" | "expires_at" | "reason" | "min_age">, now = new Date()): string[] {
  const b: string[] = [];
  if ((r.evidence_source ?? "").trim().length < 3) b.push("Evidence source missing");
  if ((r.evidence_reference ?? "").trim().length < 3) b.push("Evidence reference missing");
  if (!r.verified_at) b.push("Verified date missing");
  if (r.reason === "age_gated" && !r.min_age) b.push("Minimum age missing");
  if (r.expires_at && Date.parse(r.expires_at) <= now.getTime()) b.push("Already expired");
  return b;
}
