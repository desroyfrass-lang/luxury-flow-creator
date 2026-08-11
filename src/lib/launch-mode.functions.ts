// FRASS-0462 — Launch Mode persistence, partner progress and Founder coaching.
// Reuses `launch_program_settings` and `partner_launch_state`. No new tables.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_LAUNCH_MODE, LAUNCH_SETTINGS_ID, type LaunchMode } from "@/lib/launch-mode";

type Sb = { from: (t: string) => any; rpc: (n: string, a?: unknown) => any };

async function isFounder(sb: Sb, userId: string): Promise<boolean> {
  const { data: admin } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: sup } = await sb.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  return Boolean(admin || sup);
}

export const getLaunchMode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LaunchMode> => {
    const sb = context.supabase as unknown as Sb;
    const { data } = await sb
      .from("launch_program_settings")
      .select("enabled, notice")
      .eq("id", LAUNCH_SETTINGS_ID)
      .maybeSingle();
    if (!data) return DEFAULT_LAUNCH_MODE;
    const notice = (data.notice as string | null) ?? null;
    return {
      paymentsLive: Boolean(data.enabled),
      launchDate: notice && /^\d{4}-\d{2}-\d{2}$/.test(notice) ? notice : null,
    };
  });

export const setLaunchMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { paymentsLive?: boolean; launchDate?: string | null }) => ({
    paymentsLive: input?.paymentsLive,
    launchDate:
      input?.launchDate === undefined
        ? undefined
        : input.launchDate && /^\d{4}-\d{2}-\d{2}$/.test(input.launchDate)
          ? input.launchDate
          : null,
  }))
  .handler(async ({ data, context }): Promise<LaunchMode> => {
    const sb = context.supabase as unknown as Sb;
    if (!(await isFounder(sb, context.userId))) throw new Error("Founder access only.");

    const { data: current } = await sb
      .from("launch_program_settings")
      .select("enabled, notice")
      .eq("id", LAUNCH_SETTINGS_ID)
      .maybeSingle();

    const next = {
      id: LAUNCH_SETTINGS_ID,
      enabled: data.paymentsLive ?? Boolean(current?.enabled),
      notice: data.launchDate === undefined ? ((current?.notice as string | null) ?? null) : data.launchDate,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("launch_program_settings").upsert(next);
    if (error) throw new Error(error.message);
    return { paymentsLive: next.enabled, launchDate: next.notice };
  });

/** Founder coaching attached to a real milestone. Written into the partner's own state. */
export const addCoachingNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; about: string; text: string }) => {
    if (!input?.userId) throw new Error("Which partner is this for?");
    if (!input?.text?.trim()) throw new Error("Write the note first.");
    return {
      userId: input.userId,
      about: String(input.about ?? "Progress").slice(0, 120),
      text: input.text.trim().slice(0, 1000),
    };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    if (!(await isFounder(sb, context.userId))) throw new Error("Founder access only.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Sb;
    const { data: row, error } = await admin
      .from("partner_launch_state")
      .select("state")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("That partner hasn't started a launch plan yet.");

    const state = (row.state ?? {}) as Record<string, unknown>;
    const coaching = Array.isArray(state['coaching']) ? (state['coaching'] as unknown[]) : [];
    coaching.push({
      id: `${Date.now()}`,
      at: new Date().toISOString(),
      about: data.about,
      text: data.text,
      seen: false,
    });

    const { error: upErr } = await admin
      .from("partner_launch_state")
      .update({ state: { ...state, coaching } })
      .eq("user_id", data.userId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });
