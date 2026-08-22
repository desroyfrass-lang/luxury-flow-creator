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

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — The Build Queue.
//
// Frassy's finished work waits here for one word from the partner: launch it,
// change it, or leave it. Nothing goes live on its own.
// Reuses the existing frassy_oracle_tasks table — no second store of work.
// ─────────────────────────────────────────────────────────────────────────────

export type QueueItem = {
  id: string;
  oracle: string;
  moveName: string;
  moveType: string;
  moneyLayer: string;
  status: string;
  progress: number;
  frassyNote: string | null;
  reasoning: string | null;
  output: Record<string, unknown> | null;
  updatedAt: string;
};

const QUEUE_COLUMNS =
  "id,oracle,move_name,move_type,money_layer,status,progress,frassy_note,reasoning,output,updated_at";

function toQueueItem(r: any): QueueItem {
  return {
    id: String(r.id),
    oracle: String(r.oracle ?? ""),
    moveName: String(r.move_name ?? ""),
    moveType: String(r.move_type ?? ""),
    moneyLayer: String(r.money_layer ?? "immediate-income"),
    status: String(r.status ?? "queued"),
    progress: Number(r.progress ?? 0),
    frassyNote: (r.frassy_note as string | null) ?? null,
    reasoning: (r.reasoning as string | null) ?? null,
    output: (r.output && typeof r.output === "object" ? (r.output as Record<string, unknown>) : null),
    updatedAt: String(r.updated_at ?? ""),
  };
}

export const listBuildQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QueueItem[]> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data, error } = await sb
      .from("frassy_oracle_tasks")
      .select(QUEUE_COLUMNS)
      .eq("partner_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(40);

    if (error) throw new Error("I couldn't open your queue just now.");
    return (data ?? []).map(toQueueItem);
  });

const DECISIONS = ["approved", "changes_requested", "shelved"] as const;
type Decision = (typeof DECISIONS)[number];

export const decideBuildQueueItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; decision?: string; note?: string }) => {
    if (!data?.id || typeof data.id !== "string") throw new Error("Which piece of work?");
    if (!DECISIONS.includes(data.decision as Decision)) throw new Error("Unknown decision.");
    return {
      id: data.id,
      decision: data.decision as Decision,
      note: typeof data.note === "string" ? data.note.slice(0, 2000) : "",
    };
  })
  .handler(async ({ context, data }): Promise<QueueItem> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };

    const { data: saved, error } = await sb
      .from("frassy_oracle_tasks")
      .update({
        status: data.decision,
        progress: data.decision === "approved" ? 100 : undefined,
        reasoning: data.note || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("partner_id", context.userId)
      .select(QUEUE_COLUMNS)
      .maybeSingle();

    if (error || !saved) throw new Error("I couldn't record that decision. Try once more.");
    return toQueueItem(saved);
  });
