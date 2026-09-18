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
import {
  RESULT_KIND_SPECS,
  isWorkResultKind,
  type WorkResultKind,
} from "@/lib/daily/work-result";

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
  /** Step 4 — a REAL saved thing a specialist tool created for this work. */
  result_kind: string | null;
  result_ref: string | null;
  result_label: string | null;
  result_at: string | null;
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

/**
 * One work item by id, owner-scoped. Used by specialist tools so they can tell
 * the member, in plain English, what they came there to do. Read only.
 */
export const getWorkItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Which piece of work?");
    return { id: input.id };
  })
  .handler(async ({ data, context }): Promise<WorkItem | null> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("member_actions")
      .select("*")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as WorkItem | null;
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
      /** Links the work item to the record its tool created (e.g. a listing). */
      sourceRef?: string | null;
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
    if (data.sourceRef !== undefined) patch["source_ref"] = data.sourceRef || null;

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

/**
 * STEP 4 — a specialist tool reports the REAL thing it just saved.
 *
 * Both sides are proved before anything is written: the saved row must belong
 * to this Builder, and the work item must belong to this Builder. A forged id
 * from another account simply fails. This never touches money, payment,
 * verification or completion — only "a real thing now exists".
 */
export const linkWorkResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workItemId: string; kind: string; resultRef: string }) => {
    if (!input?.workItemId) throw new Error("Which piece of work?");
    if (!isWorkResultKind(input.kind)) throw new Error("Unknown kind of result.");
    const ref = (input.resultRef ?? "").trim();
    if (!ref) throw new Error("Nothing was saved, so there is nothing to link.");
    return { workItemId: input.workItemId, kind: input.kind as WorkResultKind, resultRef: ref };
  })
  .handler(async ({ data, context }): Promise<WorkItem> => {
    const sb = context.supabase as unknown as Sb;
    const spec = RESULT_KIND_SPECS[data.kind];

    // 1. The saved row must exist AND belong to this Builder.
    const columns = [
      "id",
      spec.titleColumn,
      spec.ownerColumn,
      spec.ownerVia?.column,
    ].filter(Boolean) as string[];
    let query = sb.from(spec.table).select([...new Set(columns)].join(",")).eq("id", data.resultRef);
    if (spec.ownerColumn) query = query.eq(spec.ownerColumn, context.userId);
    const { data: resultRow, error: resultError } = await query.maybeSingle();
    if (resultError) throw new Error(resultError.message);
    if (!resultRow) throw new Error("That saved item could not be found on your account.");

    if (spec.ownerVia) {
      const parentId = (resultRow as Record<string, unknown>)[spec.ownerVia.column];
      if (!parentId) throw new Error("That saved item could not be found on your account.");
      const { data: parent } = await sb
        .from(spec.ownerVia.table)
        .select("id")
        .eq("id", parentId)
        .eq(spec.ownerVia.ownerColumn, context.userId)
        .maybeSingle();
      if (!parent) throw new Error("That saved item could not be found on your account.");
    }

    const label = ((resultRow as Record<string, unknown>)[spec.titleColumn] as string | null) ?? null;

    // 2. The work item must belong to this Builder too (owner filter + RLS).
    const { data: row, error } = await sb
      .from("member_actions")
      .update({
        result_kind: data.kind,
        result_ref: data.resultRef,
        result_label: label ? label.slice(0, 200) : null,
        result_at: new Date().toISOString(),
      })
      .eq("id", data.workItemId)
      .eq("owner_id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as WorkItem;
  });
