// FRASS-0515 — Frass Repair Engine tools for Frassy.
//
// These let Frassy actually verify a problem instead of guessing, and perform
// only pre-approved safe repairs. She can never deploy, edit source, change
// security policies, financial records, constitutional rules, or bypass permissions.
import { tool } from "ai";
import { z } from "zod";
import { SAFE_REPAIRS, REPAIR_FORBIDDEN } from "@/lib/repair/engine";

/**
 * FRASS-0518 — coarse client hint (browser family + device kind) parsed from
 * the request. Never a full user agent, never anything identifying — just
 * enough for the Platform Intelligence Engine to notice "only on one browser".
 */
export function clientHintFrom(userAgent: string | null): { browser: string; device: string } | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("opr/") || ua.includes("opera")
      ? "Opera"
      : ua.includes("firefox")
        ? "Firefox"
        : ua.includes("chrome") || ua.includes("crios")
          ? "Chrome"
          : ua.includes("safari")
            ? "Safari"
            : "Other browser";
  const device = /iphone|ipod|android.*mobile/.test(ua)
    ? "phone"
    : /ipad|tablet|android/.test(ua)
      ? "tablet"
      : "desktop";
  return { browser, device };
}

export type RepairToolContext = { client?: { browser: string; device: string } | null };

export const diagnoseIssue = tool({
  description:
    "FRASS REPAIR ENGINE (FRASS-0515). Diagnose a reported problem: verifies routes against the live route list, identifies the likely root cause, checks known troubleshooting patterns, and says whether a safe repair exists or engineering is required. Use this WHENEVER someone reports something broken, missing, a 404, a blank page, or an error — before offering any explanation.",
  inputSchema: z.object({
    report: z.string().describe("The member's problem, in their own words."),
    path: z
      .string()
      .nullable()
      .default(null)
      .describe("The page path involved, e.g. '/onboarding'. Null if unknown."),
  }),
  execute: async ({ report, path }) => {
    try {
      const { diagnose, recordIncident, learnPattern } = await import("@/lib/repair/repair.server");
      const d = await diagnose({ reportedText: report, contextPath: path });

      // FRASS-0515-H / FRASS-0518 — every diagnosis quietly becomes history,
      // so the platform can learn from it later. Members never see this.
      try {
        if (activeClientHint) {
          (d as { evidence?: Record<string, unknown> }).evidence = {
            ...((d as { evidence?: Record<string, unknown> }).evidence ?? {}),
            client: activeClientHint,
          };
        }
        await recordIncident({
          userId: null,
          reportedText: report,
          contextPath: path,
          diagnosis: d,
          status: d.requiresEngineering ? "escalated" : "diagnosed",
          repairsApplied: [],
        });
        await learnPattern({
          signature: d.signature,
          category: d.category,
          symptom: report,
          rootCause: d.rootCause,
          repairAction: null,
          guidance: d.plainEnglish,
        });
      } catch {
        /* history must never block the member getting help */
      }

      return {
        category: d.category,
        severity: d.severity,
        root_cause: d.rootCause,
        plain_english: d.plainEnglish,
        evidence: d.evidence,
        safe_repairs_available: d.suggestedRepairs.map((r) => ({ id: r.id, label: r.label, plain: r.plain })),
        requires_engineering: d.requiresEngineering,
        known_pattern: d.knownPattern,
      };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },
});

export const applySafeRepair = tool({
  description:
    "Perform ONE pre-approved safe repair from the Frass Repair Engine (refresh caches, rebuild search index, restart a background helper, repair configuration, correct internal links, regenerate navigation metadata, repair corrupted preferences). Anything else is refused. Only call after diagnose_issue said a safe repair exists.",
  inputSchema: z.object({
    action: z.enum([
      "refresh_cache",
      "rebuild_search_index",
      "restart_background_service",
      "repair_configuration",
      "repair_internal_links",
      "regenerate_navigation",
      "repair_user_preferences",
    ]),
  }),
  execute: async ({ action }) => {
    const { runSafeRepair } = await import("@/lib/repair/repair.server");
    return runSafeRepair(action, { userId: null });
  },
});

export const repairAuthorityInfo = tool({
  description:
    "Explain exactly what Frassy may repair automatically and what requires engineering approval. Use when someone asks what you can fix yourself.",
  inputSchema: z.object({}),
  execute: async () => ({
    may_repair: SAFE_REPAIRS.map((r) => ({ id: r.id, label: r.label, plain: r.plain })),
    may_never: REPAIR_FORBIDDEN,
  }),
});

/**
 * Set once per request so incidents can record which browser or device the
 * report came from. Coarse categories only.
 */
let activeClientHint: { browser: string; device: string } | null = null;

export function buildRepairTools(ctx: RepairToolContext = {}) {
  activeClientHint = ctx.client ?? null;
  return {
    diagnose_issue: diagnoseIssue,
    apply_safe_repair: applySafeRepair,
    repair_authority_info: repairAuthorityInfo,
  };
}
