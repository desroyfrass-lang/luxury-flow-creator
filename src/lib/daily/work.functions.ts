// ─────────────────────────────────────────────────────────────────────────────
// FRASS DAILY + WORKSHOP — the one shared work record.
//
// A "work item" (public.member_actions) is the only thing Daily and Workshop
// both write to. It never copies a Vault record, an opportunity or a lesson —
// it points at the source system so the source stays authoritative.
// Every read and write is scoped by the signed-in member's session (RLS).
// ─────────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WorkItem = {
  id: string;
  owner_id: string;
  title: string;
  detail: string | null;
  source_system: string;
  source_ref: string | null;
  vault_id: string | null;
  context: string | null;
  status: "active" | "done" | "dismissed" | "archived";
  priority: number;
  due_at: string | null;
  scheduled_for: string | null;
  snoozed_until: string | null;
  completed_at: string | null;
  href: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

type Sb = { from: (t: string) => any };

export const listWorkItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WorkItem[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("member_actions")
      .select("*")
      .eq("owner_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkItem[];
  });

export const createWorkItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      title: string;
      detail?: string;
      context?: string | null;
      vaultId?: string | null;
      priority?: number;
      dueAt?: string | null;
      scheduledFor?: string | null;
      sourceSystem?: string;
      sourceRef?: string | null;
      href?: string | null;
    }) => {
      const title = (input.title ?? "").trim();
      if (!title) throw new Error("Give the work a name so you can find it again.");
      return {
        title: title.slice(0, 200),
        detail: (input.detail ?? "").trim() || null,
        context: (input.context ?? "")?.toString().trim() || null,
        vaultId: input.vaultId || null,
        priority: Math.min(3, Math.max(1, Number(input.priority ?? 2))),
        dueAt: input.dueAt || null,
        scheduledFor: input.scheduledFor || null,
        sourceSystem: (input.sourceSystem ?? "workshop").slice(0, 40),
        sourceRef: input.sourceRef || null,
        href: input.href || null,
      };
    },
  )
  .handler(async ({ data, context }): Promise<WorkItem> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("member_actions")
      .insert({
        owner_id: context.userId,
        title: data.title,
        detail: data.detail,
        context: data.context,
        vault_id: data.vaultId,
        priority: data.priority,
        due_at: data.dueAt,
        scheduled_for: data.scheduledFor,
        source_system: data.sourceSystem,
        source_ref: data.sourceRef,
        href: data.href,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as WorkItem;
  });

export const updateWorkItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      detail?: string | null;
      context?: string | null;
      vaultId?: string | null;
      priority?: number;
      dueAt?: string | null;
      scheduledFor?: string | null;
    }) => {
      if (!input?.id) throw new Error("Which piece of work?");
      return input;
    },
  )
  .handler(async ({ data, context }): Promise<WorkItem> => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) {
      const t = data.title.trim();
      if (!t) throw new Error("Work needs a name.");
      patch["title"] = t.slice(0, 200);
    }
    if (data.detail !== undefined) patch["detail"] = (data.detail ?? "").toString().trim() || null;
    if (data.context !== undefined) patch["context"] = (data.context ?? "")?.toString().trim() || null;
    if (data.vaultId !== undefined) patch["vault_id"] = data.vaultId || null;
    if (data.priority !== undefined) patch["priority"] = Math.min(3, Math.max(1, Number(data.priority)));
    if (data.dueAt !== undefined) patch["due_at"] = data.dueAt || null;
    if (data.scheduledFor !== undefined) patch["scheduled_for"] = data.scheduledFor || null;

    const { data: row, error } = await sb
      .from("member_actions")
      .update(patch)
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as WorkItem;
  });

/** Done / reopen / snooze / dismiss — the member's controls, persisted. */
export const setWorkItemState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; action: "done" | "reopen" | "snooze" | "tomorrow" | "dismiss" | "archive"; days?: number }) => {
      if (!input?.id) throw new Error("Which piece of work?");
      return input;
    },
  )
  .handler(async ({ data, context }): Promise<WorkItem> => {
    const sb = context.supabase as unknown as Sb;
    const now = new Date();
    const patch: Record<string, unknown> = {};

    if (data.action === "done") {
      patch["status"] = "done";
      patch["completed_at"] = now.toISOString();
    } else if (data.action === "reopen") {
      patch["status"] = "active";
      patch["completed_at"] = null;
      patch["snoozed_until"] = null;
    } else if (data.action === "snooze" || data.action === "tomorrow") {
      const days = data.action === "tomorrow" ? 1 : Math.min(30, Math.max(1, Number(data.days ?? 1)));
      const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      patch["snoozed_until"] = until.toISOString();
      patch["status"] = "active";
    } else if (data.action === "dismiss") {
      patch["status"] = "dismissed";
    } else {
      patch["status"] = "archived";
    }

    const { data: row, error } = await sb
      .from("member_actions")
      .update(patch)
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as WorkItem;
  });
