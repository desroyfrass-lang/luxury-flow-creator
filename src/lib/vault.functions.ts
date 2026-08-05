import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type VaultItem = {
  id: string;
  title: string;
  kind: string;
  body: string | null;
  url: string | null;
  collection: string | null;
  tags: string[];
  pinned: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export const VAULT_KINDS = [
  { id: "note", label: "Note" },
  { id: "idea", label: "Idea" },
  { id: "link", label: "Link" },
  { id: "lesson", label: "Lesson" },
  { id: "asset", label: "Asset" },
  { id: "decision", label: "Decision" },
] as const;

export const listVaultItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VaultItem[]> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data, error } = await sb
      .from("vault_items")
      .select("*")
      .eq("user_id", context.userId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as VaultItem[];
  });

export const createVaultItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      title: string;
      kind: string;
      body?: string;
      url?: string;
      collection?: string;
      tags?: string[];
    }) => {
      const title = (input.title ?? "").trim();
      if (!title) throw new Error("Give it a title so you can find it later.");
      return {
        title: title.slice(0, 200),
        kind: input.kind || "note",
        body: (input.body ?? "").trim() || null,
        url: (input.url ?? "").trim() || null,
        collection: (input.collection ?? "").trim() || null,
        tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 12),
      };
    },
  )
  .handler(async ({ data, context }): Promise<VaultItem> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data: row, error } = await sb
      .from("vault_items")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as VaultItem;
  });

export const updateVaultItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; pinned?: boolean; archived?: boolean; collection?: string | null }) => input,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const patch: Record<string, unknown> = {};
    if (typeof data.pinned === "boolean") patch["pinned"] = data.pinned;
    if (typeof data.archived === "boolean")
      patch["archived_at"] = data.archived ? new Date().toISOString() : null;
    if (data.collection !== undefined) patch["collection"] = data.collection;
    const { error } = await sb
      .from("vault_items")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVaultItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { error } = await sb
      .from("vault_items")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
