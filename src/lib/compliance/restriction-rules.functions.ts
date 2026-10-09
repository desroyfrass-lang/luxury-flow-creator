// Founder Control Room — Global Restrictions panel server functions.
// Every call runs as the signed-in user; row rules and the database decision
// function are the final authority (approval is super_admin-only in the DB).
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseRuleDraft } from "./restriction-rules";
import { resolveEnforcementMode } from "./restriction-preflight";

async function roles(ctx: { supabase: any; userId: string }) {
  const [a, s] = await Promise.all([
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" }),
  ]);
  if (a.error || s.error) throw new Error("Could not verify access");
  return { admin: Boolean(a.data), superAdmin: Boolean(s.data) };
}
async function requireStaff(ctx: { supabase: any; userId: string }) {
  const r = await roles(ctx);
  if (!r.admin && !r.superAdmin) throw new Error("Forbidden");
  return r;
}

export const listRestrictionRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const r = await requireStaff(context);
    const { data, error } = await context.supabase
      .from("restriction_rules").select("*").order("updated_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    const mode = resolveEnforcementMode(getRequestHeader("host"), {
      production: process.env["RESTRICTIONS_ENFORCEMENT_PRODUCTION"],
      preview: process.env["RESTRICTIONS_ENFORCEMENT_PREVIEW"],
    });
    return { rules: data ?? [], canDecide: r.superAdmin, enforcementMode: mode };
  });

export const restrictionRuleHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => {
    const id = (i as { ruleId?: unknown })?.ruleId;
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid rule");
    return { ruleId: id };
  })
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const { data: rows, error } = await context.supabase
      .from("restriction_rule_history").select("id, action, actor, snapshot, created_at")
      .eq("rule_id", data.ruleId).order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const saveRestrictionRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => {
    const o = (i ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" && /^[0-9a-f-]{36}$/i.test(o.id) ? o.id : null;
    return { id, input: o.rule };
  })
  .handler(async ({ context, data }) => {
    await requireStaff(context);
    const parsed = parseRuleDraft(data.input);
    if (!parsed.ok) return { ok: false as const, errors: parsed.errors };
    // Approval fields are never sent; the database trigger also resets approval on any edit.
    const q = data.id
      ? context.supabase.from("restriction_rules").update(parsed.draft).eq("id", data.id).select("id").single()
      : context.supabase.from("restriction_rules").insert({ ...parsed.draft, created_by: context.userId }).select("id").single();
    const { data: row, error } = await q;
    if (error) return { ok: false as const, errors: [error.message] };
    return { ok: true as const, id: row.id as string };
  });

export const decideRestrictionRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => {
    const o = (i ?? {}) as Record<string, unknown>;
    if (typeof o.ruleId !== "string" || !/^[0-9a-f-]{36}$/i.test(o.ruleId)) throw new Error("Invalid rule");
    if (o.decision !== "approved" && o.decision !== "rejected") throw new Error("Invalid decision");
    return { ruleId: o.ruleId, decision: o.decision as "approved" | "rejected", note: typeof o.note === "string" ? o.note.slice(0, 2000) : "" };
  })
  .handler(async ({ context, data }) => {
    // No UI shortcut: the database function itself refuses anyone who is not super_admin.
    const { data: res, error } = await context.supabase.rpc("founder_decide_restriction_rule", {
      _rule_id: data.ruleId, _decision: data.decision, _note: data.note,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, result: res };
  });
