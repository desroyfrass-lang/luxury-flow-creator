/**
 * FRASS-0474 — Server-side enforcement of the Financial Trust Boundary.
 *
 * Two jobs, and only two:
 *   1. Clamp a submitted money value to the written rule.
 *   2. When it had to be clamped, write a security alert the Founder can read
 *      and — for anything that moves money — halt the transaction.
 *
 * In plain English: if someone hands the till a made-up price, the till refuses
 * the sale AND leaves a note in the manager's book saying who tried it.
 */

import { MONEY_RULES, clampToRule, type MoneyRuleKey } from "./guardrails";

type AlertInput = {
  key: MoneyRuleKey;
  submitted: number;
  enforced: number;
  surface: string;
  userId?: string | null;
  halted: boolean;
  detail?: string;
  context?: Record<string, unknown>;
};

/** Never let alert-writing break the caller — a lost note must not lose the guard. */
async function writeAlert(input: AlertInput): Promise<void> {
  try {
    const rule = MONEY_RULES[input.key];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("security_alerts").insert({
      user_id: input.userId ?? null,
      category: "financial",
      severity: input.halted ? "high" : "medium",
      rule: rule.rule,
      surface: input.surface,
      attempted_value: input.submitted,
      allowed_min: rule.min,
      allowed_max: rule.max,
      enforced_value: input.enforced,
      halted: input.halted,
      detail:
        input.detail ??
        `${rule.label}: ${input.submitted} was submitted; the allowed range is ${rule.min}–${rule.max}.`,
      plain_english: rule.plainEnglish,
      context: JSON.parse(JSON.stringify(input.context ?? {})),
    });
  } catch {
    // Alerting is best-effort. The clamp and the halt below are the real control.
  }
}

/**
 * Clamp a value and record the attempt. Returns the safe value.
 * Use when correcting silently is the honest outcome (a rate being tidied up).
 */
export async function clampAndLog(
  key: MoneyRuleKey,
  submitted: unknown,
  surface: string,
  userId?: string | null,
  context?: Record<string, unknown>,
): Promise<number> {
  const result = clampToRule(key, submitted);
  if (result.violated) {
    await writeAlert({
      key,
      submitted: result.submitted,
      enforced: result.value,
      surface,
      userId,
      halted: false,
      context,
    });
  }
  return result.value;
}

/**
 * Verify a value and stop the transaction if it is out of bounds.
 * Use anywhere money actually moves — a charge, a payout, a discount, a price.
 */
export async function assertWithinRule(
  key: MoneyRuleKey,
  submitted: unknown,
  surface: string,
  userId?: string | null,
  context?: Record<string, unknown>,
): Promise<number> {
  const result = clampToRule(key, submitted);
  if (!result.violated) return result.value;

  await writeAlert({
    key,
    submitted: result.submitted,
    enforced: result.value,
    surface,
    userId,
    halted: true,
    context,
  });

  const rule = MONEY_RULES[key];
  throw new Error(
    `${rule.label} must be between ${rule.min} and ${rule.max}. This request was stopped and recorded.`,
  );
}

/**
 * Compare a client's arithmetic against the server's own. Any disagreement is
 * a halt, because the two sides should never differ on money.
 */
export async function assertMatchesServerTotal(
  key: MoneyRuleKey,
  clientTotal: unknown,
  serverTotal: number,
  surface: string,
  userId?: string | null,
  context?: Record<string, unknown>,
): Promise<number> {
  const submitted = Number(clientTotal);
  const agrees = Number.isFinite(submitted) && Math.abs(submitted - serverTotal) < 0.005;
  if (agrees) return serverTotal;

  await writeAlert({
    key,
    submitted: Number.isFinite(submitted) ? submitted : 0,
    enforced: serverTotal,
    surface,
    userId,
    halted: true,
    detail: `The browser claimed ${clientTotal}; Frass calculated ${serverTotal} from the official rate card.`,
    context,
  });

  throw new Error(
    "The amount sent doesn't match what Frass calculated. Nothing was charged — reload and try again.",
  );
}
