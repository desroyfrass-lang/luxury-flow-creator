// FRASS-0524 — Founder-only server functions for the Guided Platform Audit.
// Every handler re-verifies the Founder role; the route gate is UX, never the
// security boundary.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AuditReport, DimensionScores } from "./platform-audit";

export type PlatformAuditRow = {
  id: string;
  label: string;
  status: string;
  overall_trust_score: number | null;
  report: AuditReport | null;
  started_at: string;
  completed_at: string | null;
};

export type PlatformAuditPageRow = {
  id: string;
  page_id: string;
  scores: DimensionScores;
  trust_score: number;
  findings: string[];
  notes: string;
};

export const startPlatformAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ label: z.string().max(80).default("Platform audit") }).parse(i ?? {}),
  )
  .handler(async ({ data, context }): Promise<PlatformAuditRow> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { data: row, error } = await context.supabase
      .from("platform_audits")
      .insert({ user_id: context.userId, label: data.label })
      .select("id, label, status, overall_trust_score, report, started_at, completed_at")
      .single();
    if (error) throw new Error(error.message);
    return row as PlatformAuditRow;
  });

export const currentPlatformAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      audit: PlatformAuditRow | null;
      pages: PlatformAuditPageRow[];
      history: PlatformAuditRow[];
    }> => {
      const role = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (role.data !== true) throw new Error("Founder access only.");

      const { data: rows } = await context.supabase
        .from("platform_audits")
        .select("id, label, status, overall_trust_score, report, started_at, completed_at")
        .eq("user_id", context.userId)
        .order("started_at", { ascending: false })
        .limit(12);

      const all = (rows ?? []) as PlatformAuditRow[];
      const audit = all.find((a) => a.status === "active") ?? null;
      if (!audit) return { audit: null, pages: [], history: all };

      const { data: pages } = await context.supabase
        .from("platform_audit_pages")
        .select("id, page_id, scores, trust_score, findings, notes")
        .eq("audit_id", audit.id);

      return {
        audit,
        pages: (pages ?? []) as PlatformAuditPageRow[],
        history: all.filter((a) => a.id !== audit.id),
      };
    },
  );

export const savePlatformAuditPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        auditId: z.string().uuid(),
        pageId: z.string().max(60),
        scores: z.record(z.string(), z.number().min(0).max(5)),
        trustScore: z.number().int().min(0).max(100),
        findings: z.array(z.string().max(400)).max(40).default([]),
        notes: z.string().max(4000).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { error } = await context.supabase.from("platform_audit_pages").upsert(
      {
        audit_id: data.auditId,
        page_id: data.pageId,
        scores: data.scores,
        trust_score: data.trustScore,
        findings: data.findings,
        notes: data.notes,
      },
      { onConflict: "audit_id,page_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const completePlatformAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        auditId: z.string().uuid(),
        overallTrustScore: z.number().int().min(0).max(100),
        report: z.any(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { error } = await context.supabase
      .from("platform_audits")
      .update({
        status: "complete",
        overall_trust_score: data.overallTrustScore,
        report: data.report,
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.auditId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
