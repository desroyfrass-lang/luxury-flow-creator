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
    if (!isAdmin && !isSuper) throw new Error("Founder access only.");

    const { data, error } = await context.supabase
      .from("security_alerts")
      .select(
        "id, user_id, category, severity, rule, surface, attempted_value, allowed_min, allowed_max, enforced_value, halted, detail, plain_english, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as SecurityAlert[];
  });
