// FRASS-0515 — Frass Repair Engine, client-callable server functions.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { RepairDiagnosis } from "./engine";

export type RepairIncident = {
  id: string;
  reported_text: string;
  context_path: string | null;
  category: string;
  severity: string;
  status: string;
  root_cause: string | null;
  repairs_applied: string[];
  engineering_report: string | null;
  blocking_launch: boolean;
  created_at: string;
  /** FRASS-0515-H — Repair History fields. */
  pattern_signature: string | null;
  resolution_mode: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  amendment_ref: string | null;
  amendment_note: string | null;
  /** How many times this same signature has been seen across the platform. */
  times_seen: number;
  /** Whether an earlier incident shares this signature. */
  recurring: boolean;
};

/** Member reports a problem: Frassy diagnoses, repairs if safe, escalates if not. */
export const reportProblem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        text: z.string().min(3).max(2000),
        path: z.string().max(300).nullable().default(null),
        autoRepair: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { diagnose, recordIncident, runSafeRepair, learnPattern } = await import("./repair.server");
    const diagnosis: RepairDiagnosis = await diagnose({
      reportedText: data.text,
      contextPath: data.path,
    });

    const applied: Array<{ action: string; message: string }> = [];
    if (data.autoRepair && !diagnosis.requiresEngineering) {
      for (const repair of diagnosis.suggestedRepairs.slice(0, 2)) {
        const res = await runSafeRepair(repair.id, { userId: context.userId });
        if (res.ok) applied.push({ action: repair.id, message: res.message });
      }
    }

    const incident = await recordIncident({
      userId: context.userId,
      reportedText: data.text,
      contextPath: data.path,
      diagnosis,
      status: diagnosis.requiresEngineering ? "escalated" : applied.length ? "auto_repaired" : "diagnosed",
      repairsApplied: applied.map((a) => a.action),
    });

    await learnPattern({
      signature: diagnosis.signature,
      category: diagnosis.category,
      symptom: data.text,
      rootCause: diagnosis.rootCause,
      repairAction: applied[0]?.action ?? null,
      guidance: diagnosis.plainEnglish,
    });

    return {
      incidentId: incident.id,
      category: diagnosis.category,
      severity: diagnosis.severity,
      rootCause: diagnosis.rootCause,
      plainEnglish: diagnosis.plainEnglish,
      repairsApplied: applied,
      escalated: diagnosis.requiresEngineering,
      engineeringReport: incident.engineering_report,
      knownPattern: diagnosis.knownPattern,
    };
  });

/** Run one pre-approved safe repair on demand. */
export const runRepair = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ action: z.string().max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { runSafeRepair, recordManualRepair } = await import("./repair.server");
    const result = await runSafeRepair(data.action, { userId: context.userId });
    // FRASS-0515-H — quietly log it to Repair History.
    await recordManualRepair({
      userId: context.userId,
      action: data.action,
      message: result.message,
      ok: result.ok,
    });
    return result;
  });

/** Founder view: every incident, with its engineering report. */
export const listRepairIncidents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RepairIncident[]> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("repair_incidents")
      .select(
        "id, reported_text, context_path, category, severity, status, root_cause, repairs_applied, engineering_report, blocking_launch, created_at, pattern_signature, resolution_mode, resolved_at, resolution_note, amendment_ref, amendment_note",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;

    // FRASS-0515-H — "Has this happened before?" answered from the learned
    // pattern library plus the incident history itself.
    const signatures = [
      ...new Set(rows.map((r) => r["pattern_signature"]).filter(Boolean) as string[]),
    ];
    const seen = new Map<string, number>();
    if (signatures.length > 0) {
      const { data: patterns } = await context.supabase
        .from("repair_patterns")
        .select("signature, times_seen")
        .in("signature", signatures);
      for (const p of patterns ?? []) {
        seen.set(p.signature as string, (p.times_seen as number) ?? 1);
      }
    }
    const countsInHistory = new Map<string, number>();
    for (const r of rows) {
      const sig = r["pattern_signature"] as string | null;
      if (sig) countsInHistory.set(sig, (countsInHistory.get(sig) ?? 0) + 1);
    }

    return rows.map((r) => {
      const sig = (r["pattern_signature"] as string | null) ?? null;
      const times = sig ? Math.max(seen.get(sig) ?? 1, countsInHistory.get(sig) ?? 1) : 1;
      return {
        ...(r as unknown as RepairIncident),
        times_seen: times,
        recurring: times > 1,
      };
    });
  });

/**
 * FRASS-0515-H — Repair History annotation.
 *
 * Frassy writes the incident; the Founder closes the loop: how it was really
 * resolved, and whether the incident produced a constitutional amendment.
 * Nothing here is ever shown to members.
 */
export const annotateRepairIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        resolutionMode: z.enum(["automatic", "manual", "escalated", "no_action"]).nullable().default(null),
        resolutionNote: z.string().max(2000).nullable().default(null),
        amendmentRef: z.string().max(60).nullable().default(null),
        amendmentNote: z.string().max(2000).nullable().default(null),
        markResolved: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const patch: Record<string, unknown> = {
      resolved_by: context.userId,
      updated_at: new Date().toISOString(),
    };
    if (data.resolutionMode) patch["resolution_mode"] = data.resolutionMode;
    if (data.resolutionNote !== null) patch["resolution_note"] = data.resolutionNote;
    if (data.amendmentRef !== null) patch["amendment_ref"] = data.amendmentRef;
    if (data.amendmentNote !== null) patch["amendment_note"] = data.amendmentNote;
    if (data.markResolved) {
      patch["status"] = "resolved";
      patch["resolved_at"] = new Date().toISOString();
    }

    const { error } = await context.supabase
      .from("repair_incidents")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
