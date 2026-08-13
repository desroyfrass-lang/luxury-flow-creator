// FRASS-0561 — Founder Seed Vaults server functions (thin wrapper only).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SeedVault, SeedVaultStatus } from "./seed-vaults";

export const listSeedVaults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SeedVault[]> => {
    const { data, error } = await context.supabase
      .from("founder_seed_vaults")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as SeedVault[];
  });

export const createSeedVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = input as Record<string, unknown>;
    const title = String(d?.title ?? "").trim();
    if (!title) throw new Error("A Seed Vault needs a name.");
    return {
      title: title.slice(0, 160),
      summary: d?.summary ? String(d.summary).slice(0, 2000) : null,
      kind: d?.kind ? String(d.kind).slice(0, 60) : "vault",
      origin_persona: d?.origin_persona ? String(d.origin_persona).slice(0, 80) : null,
      origin_session: d?.origin_session ? String(d.origin_session).slice(0, 120) : null,
    };
  })
  .handler(async ({ context, data }): Promise<SeedVault> => {
    const { data: row, error } = await context.supabase
      .from("founder_seed_vaults")
      .insert({ ...data, user_id: context.userId, protected: true, status: "seed" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as SeedVault;
  });

export const updateSeedVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = input as Record<string, unknown>;
    const id = String(d?.id ?? "");
    if (!id) throw new Error("Missing Seed Vault.");
    const allowed: SeedVaultStatus[] = ["seed", "published", "monetized", "academy_path", "transferred"];
    const status = allowed.includes(d?.status as SeedVaultStatus) ? (d.status as SeedVaultStatus) : undefined;
    return {
      id,
      status,
      price_cents:
        d?.price_cents === undefined || d.price_cents === null
          ? undefined
          : Math.max(0, Math.round(Number(d.price_cents))),
      academy_path_title: d?.academy_path_title ? String(d.academy_path_title).slice(0, 160) : undefined,
      transferred_to: d?.transferred_to ? String(d.transferred_to).slice(0, 160) : undefined,
      notes: d?.notes === undefined ? undefined : String(d.notes).slice(0, 2000),
    };
  })
  .handler(async ({ context, data }): Promise<SeedVault> => {
    const { id, ...patch } = data;
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    ) as Record<string, never>;
    const { data: row, error } = await context.supabase
      .from("founder_seed_vaults")
      .update(clean)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as SeedVault;
  });
