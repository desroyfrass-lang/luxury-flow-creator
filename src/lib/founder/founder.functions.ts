// FRASS-0519 / FRASS-0520 / FRASS-0521 — Founder-only server functions.
// Every one of these re-verifies the Founder role server-side; a route gate is
// UX, never the security boundary.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ChangeAnalysis } from "./change-advisor";
import type { ChecklistState, ExperienceReport, ObservationRow } from "./walkthrough";

type Ctx = { supabase: any; userId: string };

async function assertFounder(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Founder access only.");
}

export type FounderSession = {
  id: string;
  label: string;
  release_ref: string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  checklist: ChecklistState;
  report: ExperienceReport | null;
};

// ── FRASS-0519 — walkthrough sessions ───────────────────────────────────────

export const startFounderSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { label?: string; releaseRef?: string | null }) =>
    z
      .object({ label: z.string().max(80).default("Founder walkthrough"), releaseRef: z.string().max(60).nullable().default(null) })
      .parse(i),
  )
  .handler(async ({ data, context }): Promise<FounderSession> => {
    await assertFounder(context as unknown as Ctx);
    // Restarting never creates a duplicate account — it opens a new session.
    const { data: row, error } = await context.supabase
      .from("founder_sessions")
      .insert({ user_id: context.userId, label: data.label, release_ref: data.releaseRef })
      .select("*")
      .single();
    if (error) throw error;
    return row as FounderSession;
  });

export const activeFounderSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ session: FounderSession | null; observations: ObservationRow[] }> => {
    await assertFounder(context as unknown as Ctx);
    const { data: rows } = await context.supabase
      .from("founder_sessions")
      .select("*")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1);
    const session = (rows?.[0] ?? null) as FounderSession | null;
    if (!session) return { session: null, observations: [] };
    const { data: obs } = await context.supabase
      .from("founder_observations")
      .select("id, step_id, step_label, kind, signal, note, area, amendment_ref, created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    return { session, observations: (obs ?? []) as ObservationRow[] };
  });

export const recordFounderObservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        stepId: z.string().max(60).nullable().default(null),
        stepLabel: z.string().max(120).nullable().default(null),
        kind: z.enum(["improvement", "bug", "amendment", "idea"]).default("improvement"),
        signal: z.enum(["smooth", "neutral", "confusing", "blocked"]).default("neutral"),
        note: z.string().min(2).max(2000),
        area: z.string().max(80).nullable().default(null),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertFounder(context as unknown as Ctx);
    const { error } = await context.supabase.from("founder_observations").insert({
      session_id: data.sessionId,
      user_id: context.userId,
      step_id: data.stepId,
      step_label: data.stepLabel,
      kind: data.kind,
      signal: data.signal,
      note: data.note,
      area: data.area,
    });
    if (error) throw error;
    return { ok: true };
  });

export const setFounderChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ sessionId: z.string().uuid(), checklist: z.record(z.string(), z.boolean()) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertFounder(context as unknown as Ctx);
    const { error } = await context.supabase
      .from("founder_sessions")
      .update({ checklist: data.checklist })
      .eq("id", data.sessionId)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const completeFounderSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ sessionId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }): Promise<ExperienceReport> => {
    await assertFounder(context as unknown as Ctx);
    const { data: session, error } = await context.supabase
      .from("founder_sessions")
      .select("*")
      .eq("id", data.sessionId)
      .eq("user_id", context.userId)
      .single();
    if (error) throw error;
    const { data: obs } = await context.supabase
      .from("founder_observations")
      .select("id, step_id, step_label, kind, signal, note, area, amendment_ref, created_at")
      .eq("session_id", data.sessionId);

    const { buildExperienceReport } = await import("./walkthrough");
    const completedAt = new Date().toISOString();
    const report = buildExperienceReport(
      (obs ?? []) as ObservationRow[],
      (session.checklist ?? {}) as ChecklistState,
      session.started_at as string,
      completedAt,
    );
    await context.supabase
      .from("founder_sessions")
      .update({
        status: "complete",
        completed_at: completedAt,
        duration_seconds: report.durationMinutes * 60,
        report,
      })
      .eq("id", data.sessionId)
      .eq("user_id", context.userId);
    return report;
  });

export const listFounderSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FounderSession[]> => {
    await assertFounder(context as unknown as Ctx);
    const { data } = await context.supabase
      .from("founder_sessions")
      .select("*")
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(20);
    return (data ?? []) as FounderSession[];
  });

// ── FRASS-0520 — Founder Design Authority ───────────────────────────────────

/** JSON-safe snapshot of an interface state. Flat, serializable values only. */
export type DesignSnapshot = Record<string, string | number | boolean | null>;

export type DesignChangeRow = {
  id: string;
  instruction: string;
  surface: string;
  change_type: string;
  reason: string | null;
  before_state: DesignSnapshot | null;
  after_state: DesignSnapshot | null;
  status: string;
  approved_at: string | null;
  reverted_at: string | null;
  created_at: string;
};

export const prepareDesignChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ instruction: z.string().min(2).max(600), reason: z.string().max(400).nullable().default(null) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertFounder(context as unknown as Ctx);
    const { proposeDesignChange } = await import("./design-authority");
    const proposal = proposeDesignChange(data.instruction);
    if (!proposal.allowed) return { proposal, change: null as DesignChangeRow | null };

    // Nothing is applied here — every edit enters Preview Mode first.
    const { data: row, error } = await context.supabase
      .from("founder_design_changes")
      .insert({
        user_id: context.userId,
        instruction: data.instruction,
        surface: proposal.surface,
        change_type: proposal.changeType ?? "layout",
        reason: data.reason,
        status: "preview",
      })
      .select("*")
      .single();
    if (error) throw error;
    return { proposal, change: row as DesignChangeRow };
  });

export const decideDesignChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected", "reverted"]),
        beforeState: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .nullable()
          .default(null),
        afterState: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .nullable()
          .default(null),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertFounder(context as unknown as Ctx);
    const now = new Date().toISOString();
    const patch: {
      status: string;
      approved_at?: string;
      reverted_at?: string;
      before_state?: DesignSnapshot;
      after_state?: DesignSnapshot;
    } = { status: data.decision };
    if (data.decision === "approved") patch.approved_at = now;
    if (data.decision === "reverted") patch.reverted_at = now;
    if (data.beforeState) patch.before_state = data.beforeState;
    if (data.afterState) patch.after_state = data.afterState;
    const { error } = await context.supabase
      .from("founder_design_changes")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const listDesignChanges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DesignChangeRow[]> => {
    await assertFounder(context as unknown as Ctx);
    const { data } = await context.supabase
      .from("founder_design_changes")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []) as DesignChangeRow[];
  });

// ── FRASS-0521 — Founder Change Advisor ─────────────────────────────────────

export const adviseChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ idea: z.string().min(3).max(20000) }).parse(i))
  .handler(async ({ data, context }): Promise<ChangeAnalysis> => {
    await assertFounder(context as unknown as Ctx);
    const { analyzeChangeRequest } = await import("./change-advisor");
    return analyzeChangeRequest(data.idea);
  });
