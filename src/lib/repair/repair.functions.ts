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
    const { runSafeRepair } = await import("./repair.server");
    return runSafeRepair(data.action, { userId: context.userId });
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
        "id, reported_text, context_path, category, severity, status, root_cause, repairs_applied, engineering_report, blocking_launch, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as unknown as RepairIncident[];
  });
