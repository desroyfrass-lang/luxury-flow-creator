import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// FRASS-0474 — the Founder's view of every blocked money attempt.
// Reading is Founder-only; nothing here can be written from the app.

export type SecurityAlert = {
  id: string;
  user_id: string | null;
  category: string;
  severity: string;
  rule: string;
  surface: string;
  attempted_value: number | null;
  allowed_min: number | null;
  allowed_max: number | null;
  enforced_value: number | null;
  halted: boolean;
  detail: string | null;
  plain_english: string | null;
  created_at: string;
  context: Record<string, unknown> | null;
  review_status: string | null;
  founder_note: string | null;
  reviewed_at: string | null;
};

export const listSecurityAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SecurityAlert[]> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuper) {
      // FRASS-0475 — reaching for a Founder-only door is itself a critical event.
      const { recordSecurityEvent } = await import("@/lib/security/events.server");
      await recordSecurityEvent({
        category: "access",
        rule: "Founder-only surface",
        surface: "security-center.listSecurityAlerts",
        userId: context.userId,
        detail: "A signed-in member without Founder authority requested the security log.",
        plainEnglish: "Somebody tried the manager's office door. It stayed locked.",
      });
      throw new Error("Founder access only.");
    }


    const { data, error } = await context.supabase
      .from("security_alerts")
      .select(
        "id, user_id, category, severity, rule, surface, attempted_value, allowed_min, allowed_max, enforced_value, halted, detail, plain_english, created_at, context, review_status, founder_note, reviewed_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as SecurityAlert[];
  });

/**
 * FRASS-0474 v2 — Founder actions on an alert.
 * Reading is Founder-only and so is triage: the only thing an owner may change
 * is their own verdict on an event. The event itself stays immutable.
 */
export const setSecurityAlertStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string; founderNote?: string }) => {
    const allowed = ["open", "reviewing", "resolved", "ignored"];
    if (!input?.id) throw new Error("Which alert?");
    if (!allowed.includes(input.status)) throw new Error("Unknown status.");
    return {
      id: input.id,
      status: input.status,
      founderNote: (input.founderNote ?? "").slice(0, 1000) || null,
    };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuper } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuper) {
      const { recordSecurityEvent } = await import("@/lib/security/events.server");
      await recordSecurityEvent({
        category: "access",
        rule: "Founder-only surface",
        surface: "security-center.setSecurityAlertStatus",
        userId: context.userId,
        detail: "A member without Founder authority tried to change a security verdict.",
        plainEnglish: "Somebody tried to sign off on the manager's book. It stayed shut.",
      });
      throw new Error("Founder access only.");
    }

    const patch: Record<string, unknown> = {
      review_status: data.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.userId,
    };
    if (data.founderNote !== null) patch["founder_note"] = data.founderNote;

    const { error } = await context.supabase
      .from("security_alerts")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
