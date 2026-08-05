import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  stage: string;
  potential_value: number | null;
  currency: string;
  effort: string;
  target_date: string | null;
  next_step: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FinanceEntry = {
  id: string;
  label: string;
  entry_type: string;
  amount: number;
  currency: string;
  category: string | null;
  occurred_on: string;
  created_at: string;
};

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Opportunity[]> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data, error } = await sb
      .from("builder_opportunities")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Opportunity[];
  });

export const createOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      title: string;
      description?: string;
      kind?: string;
      stage?: string;
      potential_value?: string | number | null;
      effort?: string;
      target_date?: string | null;
      next_step?: string;
    }) => {
      const title = (input.title ?? "").trim();
      if (!title) throw new Error("Give the opportunity a name.");
      const raw = input.potential_value;
      const value =
        raw === null || raw === undefined || raw === "" ? null : Number(raw);
      if (value !== null && !Number.isFinite(value))
        throw new Error("Potential value must be a number.");
      return {
        title: title.slice(0, 200),
        description: (input.description ?? "").trim() || null,
        kind: input.kind || "idea",
        stage: input.stage || "spotted",
        potential_value: value,
        effort: input.effort || "medium",
        target_date: (input.target_date ?? "") || null,
        next_step: (input.next_step ?? "").trim() || null,
      };
    },
  )
  .handler(async ({ data, context }): Promise<Opportunity> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data: row, error } = await sb
      .from("builder_opportunities")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Opportunity;
  });

export const updateOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; stage?: string; next_step?: string | null; notes?: string | null }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const patch: Record<string, unknown> = {};
    if (data.stage) patch["stage"] = data.stage;
    if (data.next_step !== undefined) patch["next_step"] = data.next_step;
    if (data.notes !== undefined) patch["notes"] = data.notes;
    const { error } = await sb
      .from("builder_opportunities")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { error } = await sb
      .from("builder_opportunities")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listFinanceEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FinanceEntry[]> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data, error } = await sb
      .from("builder_finance_entries")
      .select("*")
      .eq("user_id", context.userId)
      .order("occurred_on", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as FinanceEntry[];
  });

export const createFinanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      label: string;
      entry_type?: string;
      amount: string | number;
      category?: string;
      occurred_on?: string;
    }) => {
      const label = (input.label ?? "").trim();
      if (!label) throw new Error("Give this entry a short label.");
      const amount = Number(input.amount);
      if (!Number.isFinite(amount) || amount < 0)
        throw new Error("Enter an amount of 0 or more.");
      return {
        label: label.slice(0, 200),
        entry_type: input.entry_type === "expense" ? "expense" : "income",
        amount,
        category: (input.category ?? "").trim() || null,
        occurred_on: (input.occurred_on ?? "") || new Date().toISOString().slice(0, 10),
      };
    },
  )
  .handler(async ({ data, context }): Promise<FinanceEntry> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data: row, error } = await sb
      .from("builder_finance_entries")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as FinanceEntry;
  });

export const deleteFinanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { error } = await sb
      .from("builder_finance_entries")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
