// FRASS-0469 — Future Business Vault Library persistence.
// A deferred vault is a memory, not a workload: nothing here feeds the Daily,
// Money Moves or Launch Readiness.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { FutureVaultRow } from "@/lib/business/future-vaults";

type Sb = { from: (t: string) => any };

const COLS =
  "id, user_id, key, emoji, label, summary, rationale, status, notes, activated_at, created_at, updated_at";

export const listFutureVaults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FutureVaultRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("future_business_vaults")
      .select(COLS)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as FutureVaultRow[];
  });

export const saveFutureVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      key: string;
      emoji?: string;
      label: string;
      summary?: string;
      rationale?: string;
      notes?: string;
    }) => input,
  )
  .handler(async ({ data, context }): Promise<FutureVaultRow> => {
    const sb = context.supabase as unknown as Sb;
    const patch = {
      user_id: context.userId,
      key: data.key.slice(0, 60),
      emoji: (data.emoji || "💡").slice(0, 8),
      label: data.label.slice(0, 120),
      summary: data.summary?.slice(0, 400) ?? null,
      rationale: data.rationale?.slice(0, 1200) ?? null,
      notes: data.notes?.slice(0, 4000) ?? null,
    };
    const { data: row, error } = await sb
      .from("future_business_vaults")
      .upsert(patch, { onConflict: "user_id,key" })
      .select(COLS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as FutureVaultRow;
  });

export const updateFutureVaultNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; notes: string }) => input)
  .handler(async ({ data, context }): Promise<FutureVaultRow> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("future_business_vaults")
      .update({ notes: data.notes.slice(0, 4000) })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select(COLS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as FutureVaultRow;
  });

/**
 * Activation is deliberate and explicit. Only the partner can call this —
 * Frassy never activates a vault on her own.
 */
export const activateFutureVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<FutureVaultRow> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("future_business_vaults")
      .update({ status: "activated", activated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select(COLS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as FutureVaultRow;
  });

export const removeFutureVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("future_business_vaults")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
