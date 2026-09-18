// ─────────────────────────────────────────────────────────────────────────────
// FAST TRACK PROGRESS — account-backed, owner-scoped (Step 2).
//
// public.fast_track_progress is the ONE authoritative record of a Builder's
// Fast Track step progress. member_actions stays the authoritative record of
// Daily/Workshop work execution — the two are not merged and do not compete.
//
// Recording a Fast Track is task progress ONLY. It never creates income, a
// sale, a payment, a settlement, a commission or a receipt.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FastTrackProgress = {
  id: string;
  owner_id: string;
  track_key: string;
  vault_key: string;
  parent_move_id: string | null;
  title: string;
  status: "active" | "done";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Sb = { from: (t: string) => any };

type UpsertInput = {
  trackKey: string;
  vaultKey: string;
  title: string;
  status: "active" | "done";
  parentMoveId?: string | null;
};

function cleanUpsert(input: UpsertInput): UpsertInput {
  const trackKey = (input.trackKey ?? "").trim();
  const vaultKey = (input.vaultKey ?? "").trim();
  const title = (input.title ?? "").trim();
  if (!trackKey || !vaultKey || !title) throw new Error("Which Fast Track is this?");
  if (input.status !== "active" && input.status !== "done") throw new Error("Unknown Fast Track state.");
  return {
    trackKey: trackKey.slice(0, 160),
    vaultKey: vaultKey.slice(0, 60),
    title: title.slice(0, 200),
    status: input.status,
    parentMoveId: input.parentMoveId || null,
  };
}

/** Every Fast Track this Builder has actually touched. */
export const listFastTrackProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FastTrackProgress[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("fast_track_progress")
      .select("*")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data ?? []) as FastTrackProgress[];
  });

/** Records a Fast Track as started or finished. Progress only — never money. */
export const setFastTrackState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpsertInput) => cleanUpsert(input))
  .handler(async ({ data, context }): Promise<FastTrackProgress> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("fast_track_progress")
      .upsert(
        {
          owner_id: context.userId,
          track_key: data.trackKey,
          vault_key: data.vaultKey,
          parent_move_id: data.parentMoveId ?? null,
          title: data.title,
          status: data.status,
          completed_at: data.status === "done" ? new Date().toISOString() : null,
        },
        { onConflict: "owner_id,track_key" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as FastTrackProgress;
  });

/**
 * One-time move of old browser-only ticks into the Builder's account.
 * Existing account rows always win — the browser is never authoritative again.
 */
export const importLegacyFastTracks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { tracks: { trackKey: string; vaultKey: string; title: string; parentMoveId?: string | null }[] }) => ({
      tracks: (input?.tracks ?? [])
        .slice(0, 400)
        .map((t) => cleanUpsert({ ...t, status: "done" as const })),
    }),
  )
  .handler(async ({ data, context }): Promise<{ imported: number }> => {
    if (data.tracks.length === 0) return { imported: 0 };
    const sb = context.supabase as unknown as Sb;

    const { data: existing } = await sb
      .from("fast_track_progress")
      .select("track_key")
      .eq("owner_id", context.userId);
    const have = new Set(((existing ?? []) as { track_key: string }[]).map((r) => r.track_key));

    const rows = data.tracks
      .filter((t) => !have.has(t.trackKey))
      .map((t) => ({
        owner_id: context.userId,
        track_key: t.trackKey,
        vault_key: t.vaultKey,
        parent_move_id: t.parentMoveId ?? null,
        title: t.title,
        status: "done",
        completed_at: new Date().toISOString(),
      }));
    if (rows.length === 0) return { imported: 0 };

    const { error } = await sb.from("fast_track_progress").insert(rows);
    if (error) throw new Error(error.message);
    return { imported: rows.length };
  });
