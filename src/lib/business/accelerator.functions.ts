// FRASS-0459 — Launch Accelerator persistence + founder oversight.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LaunchRow = {
  user_id: string;
  mission: string | null;
  hours_per_day: number;
  income_goal: number;
  state: unknown;
  updated_at: string;
};

type Sb = { from: (t: string) => any; rpc: (n: string, a?: unknown) => any };

export const getLaunchState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LaunchRow | null> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("partner_launch_state")
      .select("user_id, mission, hours_per_day, income_goal, state, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as LaunchRow) ?? null;
  });

export const saveLaunchState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { mission?: string; hoursPerDay?: number; incomeGoal?: number; state?: unknown }) => input,
  )
  .handler(async ({ data, context }): Promise<LaunchRow> => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = { user_id: context.userId };
    if (data.mission !== undefined) patch['mission'] = data.mission.slice(0, 500);
    if (data.hoursPerDay !== undefined) patch['hours_per_day'] = Math.min(16, Math.max(0.25, data.hoursPerDay));
    if (data.incomeGoal !== undefined) patch['income_goal'] = Math.max(0, data.incomeGoal);
    if (data.state !== undefined) patch['state'] = data.state;

    const { data: row, error } = await sb
      .from("partner_launch_state")
      .upsert(patch, { onConflict: "user_id" })
      .select("user_id, mission, hours_per_day, income_goal, state, updated_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as LaunchRow;
  });

export type PartnerOversightRow = LaunchRow & { display_name: string | null; email: string | null };

/** Founder visibility only — never editing. */
export const listPartnerLaunchStates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerOversightRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: isSuper } = await sb.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isAdmin && !isSuper) throw new Error("Forbidden");

    const { data, error } = await sb
      .from("partner_launch_state")
      .select("user_id, mission, hours_per_day, income_goal, state, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as LaunchRow[];
    if (!rows.length) return [];

    const { data: profiles } = await sb
      .from("profiles")
      .select("id, display_name, email")
      .in("id", rows.map((r) => r.user_id));
    const byId = new Map<string, { display_name: string | null; email: string | null }>(
      ((profiles ?? []) as any[]).map((p) => [p.id, { display_name: p.display_name ?? null, email: p.email ?? null }]),
    );

    return rows.map((r) => ({
      ...r,
      display_name: byId.get(r.user_id)?.display_name ?? null,
      email: byId.get(r.user_id)?.email ?? null,
    }));
  });
