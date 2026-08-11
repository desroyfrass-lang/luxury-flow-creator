/**
 * FRASS-0475 — Non-financial security events.
 *
 * The Founder Security Center is not only about money. Privilege escalation,
 * unauthorised Founder access and policy violations belong in the same book,
 * marked critical so they sort to the top.
 */

export type SecurityEventInput = {
  category: "privilege" | "access" | "policy" | "account" | "session";
  severity?: "info" | "medium" | "high" | "critical";
  rule: string;
  surface: string;
  userId?: string | null;
  detail: string;
  plainEnglish: string;
  context?: Record<string, unknown>;
};

/** Best-effort: recording an event must never break the guard that caught it. */
export async function recordSecurityEvent(input: SecurityEventInput): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("security_alerts").insert({
      user_id: input.userId ?? null,
      category: input.category,
      severity:
        input.severity ??
        (input.category === "privilege" || input.category === "access" || input.category === "policy"
          ? "critical"
          : "info"),
      rule: input.rule,
      surface: input.surface,
      attempted_value: null,
      allowed_min: null,
      allowed_max: null,
      enforced_value: null,
      halted: true,
      detail: input.detail,
      plain_english: input.plainEnglish,
      context: JSON.parse(JSON.stringify(input.context ?? {})),
    });
  } catch {
    /* the refusal already happened; the note is secondary */
  }
}
