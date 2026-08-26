// FRASS-0610 — Vault Engine server functions.
// Every read and write is scoped by the signed-in user's Supabase session, so
// row-level security decides what is visible. No client-side filtering is
// trusted for data separation.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type VaultRow = {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  subtype: string | null;
  description: string | null;
  status: string;
  setup_step: string;
  setup_answers: Record<string, unknown>;
  enabled_modules: string[];
  hidden_modules: string[];
  settings: Record<string, unknown>;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type VaultRecordRow = {
  id: string;
  vault_id: string;
  module_id: string;
  title: string;
  body: string | null;
  status: string;
  data: Record<string, unknown>;
  due_at: string | null;
  amount: number | null;
  created_by: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VaultActivityRow = {
  id: string;
  vault_id: string;
  kind: string;
  summary: string;
  created_at: string;
};

type Sb = { from: (t: string) => any; rpc: (fn: string, args: Record<string, unknown>) => any };

async function log(sb: Sb, vaultId: string, actorId: string, kind: string, summary: string) {
  await sb.from("vault_activity").insert({ vault_id: vaultId, actor_id: actorId, kind, summary });
  await sb.from("vaults").update({ last_activity_at: new Date().toISOString() }).eq("id", vaultId);
}

export const listMyVaults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VaultRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("vaults")
      .select("*")
      .order("last_activity_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as VaultRow[];
  });

export const getVault = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string }) => input)
  .handler(async ({ data, context }): Promise<{ vault: VaultRow; role: string } | null> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb.from("vaults").select("*").eq("id", data.vaultId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const role = row.owner_id === context.userId ? "owner" : "member";
    return { vault: row as VaultRow, role };
  });

export const createVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; category: string; subtype?: string; description?: string }) => {
    const name = (input.name ?? "").trim();
    if (!name) throw new Error("Give the Vault a name you'd actually say out loud.");
    if (!["business", "creator", "personal"].includes(input.category))
      throw new Error("Pick a Vault type first.");
    return {
      name: name.slice(0, 120),
      category: input.category,
      subtype: (input.subtype ?? "").trim() || null,
      description: (input.description ?? "").trim() || null,
    };
  })
  .handler(async ({ data, context }): Promise<VaultRow> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("vaults")
      .insert({ ...data, owner_id: context.userId, status: "setup_in_progress", setup_step: "interview" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await sb.from("vault_members").insert({ vault_id: row.id, user_id: context.userId, role: "owner" });
    await log(sb, row.id, context.userId, "vault_created", `Vault created: ${row.name}`);
    return row as VaultRow;
  });

export const saveSetupAnswers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string; answers: Record<string, unknown>; step?: string; name?: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = { setup_answers: data.answers };
    if (data.step) patch["setup_step"] = data.step;
    if (data.name && data.name.trim()) patch["name"] = data.name.trim().slice(0, 120);
    const { error } = await sb.from("vaults").update(patch).eq("id", data.vaultId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const activateVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string; modules: string[] }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const modules = Array.from(new Set(["home", ...data.modules])).slice(0, 40);
    const { error } = await sb
      .from("vaults")
      .update({ enabled_modules: modules, status: "active", setup_step: "complete" })
      .eq("id", data.vaultId);
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "setup_completed", "Setup completed and the workspace was approved.");
    return { ok: true };
  });

export const updateVaultModules = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string; enabled?: string[]; hidden?: string[] }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = {};
    if (data.enabled) patch["enabled_modules"] = Array.from(new Set(["home", ...data.enabled]));
    if (data.hidden) patch["hidden_modules"] = Array.from(new Set(data.hidden.filter((m) => m !== "home")));
    const { error } = await sb.from("vaults").update(patch).eq("id", data.vaultId);
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "modules_changed", "The workspace layout was changed.");
    return { ok: true };
  });

export const updateVaultDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string; name?: string; description?: string; status?: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = {};
    if (data.name?.trim()) patch["name"] = data.name.trim().slice(0, 120);
    if (data.description !== undefined) patch["description"] = data.description.trim() || null;
    if (data.status && ["active", "archived", "setup_in_progress"].includes(data.status))
      patch["status"] = data.status;
    const { error } = await sb.from("vaults").update(patch).eq("id", data.vaultId);
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "vault_updated", "Vault details were updated.");
    return { ok: true };
  });

export const deleteVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb.from("vaults").delete().eq("id", data.vaultId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Records ──────────────────────────────────────────────────────────────────

export const listVaultRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string; moduleId?: string }) => input)
  .handler(async ({ data, context }): Promise<VaultRecordRow[]> => {
    const sb = context.supabase as unknown as Sb;
    let q = sb.from("vault_records").select("*").eq("vault_id", data.vaultId);
    if (data.moduleId) q = q.eq("module_id", data.moduleId);
    const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []) as VaultRecordRow[];
  });

export const createVaultRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      vaultId: string;
      moduleId: string;
      title: string;
      body?: string;
      dueAt?: string;
      amount?: number;
    }) => {
      const title = (input.title ?? "").trim();
      if (!title) throw new Error("Give it a name so you can find it again.");
      return {
        vaultId: input.vaultId,
        moduleId: input.moduleId,
        title: title.slice(0, 200),
        body: (input.body ?? "").trim() || null,
        dueAt: input.dueAt || null,
        amount: typeof input.amount === "number" && !Number.isNaN(input.amount) ? input.amount : null,
      };
    },
  )
  .handler(async ({ data, context }): Promise<VaultRecordRow> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("vault_records")
      .insert({
        vault_id: data.vaultId,
        module_id: data.moduleId,
        title: data.title,
        body: data.body,
        due_at: data.dueAt,
        amount: data.amount,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "record_created", `${data.moduleId}: ${data.title}`);
    return row as VaultRecordRow;
  });

export const updateVaultRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; vaultId: string; status?: string; title?: string; body?: string; archived?: boolean }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = {};
    if (data.status) patch["status"] = data.status;
    if (data.title?.trim()) patch["title"] = data.title.trim().slice(0, 200);
    if (data.body !== undefined) patch["body"] = data.body.trim() || null;
    if (typeof data.archived === "boolean")
      patch["archived_at"] = data.archived ? new Date().toISOString() : null;
    const { error } = await sb.from("vault_records").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "record_updated", "A record was updated.");
    return { ok: true };
  });

export const deleteVaultRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; vaultId: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb.from("vault_records").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(sb, data.vaultId, context.userId, "record_deleted", "A record was deleted.");
    return { ok: true };
  });

export const listVaultActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { vaultId: string }) => input)
  .handler(async ({ data, context }): Promise<VaultActivityRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data: rows, error } = await sb
      .from("vault_activity")
      .select("id, vault_id, kind, summary, created_at")
      .eq("vault_id", data.vaultId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (rows ?? []) as VaultActivityRow[];
  });
