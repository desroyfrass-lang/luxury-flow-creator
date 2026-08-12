// FRASS-5P000 — Daily layout preferences follow the member across devices.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DailyPrefs } from "./customization";

type StoredPrefs = Partial<DailyPrefs>;

type Sb = { from: (t: string) => any };

export const getDailyLayout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StoredPrefs | null> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("daily_layout_prefs")
      .select("prefs")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.prefs as StoredPrefs) ?? null;
  });

export const saveDailyLayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prefs: StoredPrefs }) => {
    if (!input?.prefs || typeof input.prefs !== "object") throw new Error("No layout supplied.");
    const raw = JSON.stringify(input.prefs);
    // Presentation only — a layout is small by definition.
    if (raw.length > 8000) throw new Error("That layout is too large to save.");
    return { prefs: input.prefs };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("daily_layout_prefs")
      .upsert(
        { user_id: context.userId, prefs: data.prefs, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export type SavedLayout = { id: string; name: string; shared: boolean; prefs: StoredPrefs };

export const listSavedLayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedLayout[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("daily_layout_presets")
      .select("id, name, shared, prefs")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []) as SavedLayout[];
  });

export const saveLayoutPreset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; prefs: StoredPrefs; shared?: boolean }) => {
    const name = String(input?.name ?? "").trim();
    if (name.length < 1 || name.length > 60) throw new Error("Give the layout a short name.");
    if (!input?.prefs || JSON.stringify(input.prefs).length > 8000) throw new Error("That layout can't be saved.");
    return { name, prefs: input.prefs, shared: Boolean(input.shared) };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb.from("daily_layout_presets").insert({
      owner_id: context.userId,
      name: data.name,
      prefs: data.prefs,
      shared: data.shared,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
