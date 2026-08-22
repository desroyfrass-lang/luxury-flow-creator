// ─────────────────────────────────────────────────────────────────────────────
// Frassy's Money Moves Desk — server side (Step 1: the desk itself).
//
// Only two things live here for now: reading the partner's autonomy setting and
// changing it. Every change is stamped with a time so the record of who asked
// Frassy to do what, and when, is permanent.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_AUTONOMY,
  isAutonomyMode,
  type AutonomyMode,
} from "@/lib/frassy/autonomy";

export type DeskAutonomy = {
  mode: AutonomyMode;
  paused: boolean;
  freedomNumber: number | null;
  changedAt: string | null;
  firstName: string;
};

export const getDeskAutonomy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeskAutonomy> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const uid = context.userId;

    const [settingRes, profileRes] = await Promise.all([
      sb
        .from("frassy_autonomy_settings")
        .select("autonomy_mode,paused,freedom_number,changed_at")
        .eq("partner_id", uid)
        .maybeSingle(),
      sb.from("profiles").select("full_name,display_name").eq("id", uid).maybeSingle(),
    ]);

    const row = settingRes?.data ?? null;
    const profile = profileRes?.data ?? null;
    const name: string =
      (profile?.display_name as string | null) || (profile?.full_name as string | null) || "";

    return {
      mode: isAutonomyMode(row?.autonomy_mode) ? row.autonomy_mode : DEFAULT_AUTONOMY,
      paused: Boolean(row?.paused),
      freedomNumber: row?.freedom_number == null ? null : Number(row.freedom_number),
      changedAt: (row?.changed_at as string | null) ?? null,
      firstName: name.trim().split(" ")[0] ?? "",
    };
  });

export const setDeskAutonomy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { mode?: string; paused?: boolean }) => {
    if (data.mode !== undefined && !isAutonomyMode(data.mode)) {
      throw new Error("Unknown way of working.");
    }
    return {
      mode: data.mode as AutonomyMode | undefined,
      paused: typeof data.paused === "boolean" ? data.paused : undefined,
    };
  })
  .handler(async ({ context, data }): Promise<DeskAutonomy> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const uid = context.userId;

    const current = await sb
      .from("frassy_autonomy_settings")
      .select("autonomy_mode,paused,freedom_number")
      .eq("partner_id", uid)
      .maybeSingle();

    const payload = {
      partner_id: uid,
      autonomy_mode:
        data.mode ??
        (isAutonomyMode(current?.data?.autonomy_mode)
          ? current.data.autonomy_mode
          : DEFAULT_AUTONOMY),
      paused: data.paused ?? Boolean(current?.data?.paused),
      changed_at: new Date().toISOString(),
    };

    const { data: saved, error } = await sb
      .from("frassy_autonomy_settings")
      .upsert(payload, { onConflict: "partner_id" })
      .select("autonomy_mode,paused,freedom_number,changed_at")
      .single();

    if (error) throw new Error("I couldn't save that just now. Try once more.");

    return {
      mode: isAutonomyMode(saved?.autonomy_mode) ? saved.autonomy_mode : DEFAULT_AUTONOMY,
      paused: Boolean(saved?.paused),
      freedomNumber: saved?.freedom_number == null ? null : Number(saved.freedom_number),
      changedAt: (saved?.changed_at as string | null) ?? null,
      firstName: "",
    };
  });
