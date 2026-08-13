// FRASS-0528 — Founder Home, and FRASS-0529 — Founder Release Approval.
// One question when you open the Command Center: "How is Frass doing today?"
// Every number here is read live; nothing is invented.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AuditReport } from "./platform-audit";

export type FounderSnapshot = {
  generatedAt: string;
  platform: {
    openIncidents: number;
    blockingIncidents: number;
    resolvedLast7Days: number;
    status: "green" | "amber" | "red";
    statusPlain: string;
  };
  members: {
    newLast7Days: number;
    onboardingCompleted: number;
    totalMembers: number;
    activeDailies: number;
  };
  business: {
    opportunitiesActive: number;
    opportunitiesWon: number;
    ordersLast30Days: number;
    revenueLast30Days: number;
    cardOrdersLast30Days: number;
  };
  intelligence: {
    topPatterns: Array<{ signature: string; occurrences: number }>;
  };
  today: {
    lastAuditAt: string | null;
    daysSinceAudit: number | null;
    invitationVerdict: string | null;
    unresolvedFindings: string[];
    lastReleaseDecision: string | null;
    lastReleaseAt: string | null;
  };
};

export type ReleaseApprovalRow = {
  id: string;
  decision: "approved" | "delayed" | "changes_requested";
  note: string;
  outstanding: string[];
  invitation_verdict: string | null;
  summary: Record<string, unknown>;
  created_at: string;
};

async function assertFounder(context: { supabase: any; userId: string }) {
  const role = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (role.data !== true) throw new Error("Founder access only.");
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const founderSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FounderSnapshot> => {
    await assertFounder(context);
    const sb = context.supabase;
    const count = { count: "exact" as const, head: true };

    const [
      openInc,
      blockingInc,
      resolvedInc,
      newMembers,
      onboarded,
      totalMembers,
      activeDailies,
      oppsActive,
      oppsWon,
      orders,
      cardOrders,
      patterns,
      audits,
      releases,
    ] = await Promise.all([
      sb.from("repair_incidents").select("id", count).neq("status", "resolved"),
      sb.from("repair_incidents").select("id", count).eq("blocking_launch", true).neq("status", "resolved"),
      sb.from("repair_incidents").select("id", count).gte("resolved_at", daysAgo(7)),
      sb.from("profiles").select("id", count).gte("created_at", daysAgo(7)),
      sb.from("profiles").select("id", count).not("onboarding_completed_at", "is", null),
      sb.from("profiles").select("id", count),
      sb.from("builder_journeys").select("user_id", count).gte("last_active_at", daysAgo(7)),
      sb.from("builder_opportunities").select("id", count).neq("stage", "won"),
      sb.from("builder_opportunities").select("id", count).eq("stage", "won"),
      sb.from("orders").select("subtotal").gte("created_at", daysAgo(30)),
      sb.from("card_orders").select("id", count).gte("created_at", daysAgo(30)),
      sb
        .from("repair_patterns")
        .select("pattern_signature, occurrences")
        .order("occurrences", { ascending: false })
        .limit(3),
      sb
        .from("platform_audits")
        .select("completed_at, report")
        .eq("status", "complete")
        .order("completed_at", { ascending: false })
        .limit(1),
      sb
        .from("release_approvals")
        .select("decision, created_at")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const openIncidents = openInc.count ?? 0;
    const blockingIncidents = blockingInc.count ?? 0;
    const status: "green" | "amber" | "red" =
      blockingIncidents > 0 ? "red" : openIncidents > 3 ? "amber" : "green";

    const lastAudit = audits.data?.[0] ?? null;
    const report = (lastAudit?.report ?? null) as AuditReport | null;
    const readiness = report?.invitationReadiness ?? null;
    const lastAuditAt = lastAudit?.completed_at ?? null;

    const revenue = (orders.data ?? []).reduce(
      (sum: number, o: { subtotal: number | null }) => sum + Number(o.subtotal ?? 0),
      0,
    );

    return {
      generatedAt: new Date().toISOString(),
      platform: {
        openIncidents,
        blockingIncidents,
        resolvedLast7Days: resolvedInc.count ?? 0,
        status,
        statusPlain:
          status === "green"
            ? "Everything we track is behaving. Nothing is blocking a new member."
            : status === "amber"
              ? "Frass is running, but a few things need attention."
              : "Something is blocking members right now. Fix this before anything else.",
      },
      members: {
        newLast7Days: newMembers.count ?? 0,
        onboardingCompleted: onboarded.count ?? 0,
        totalMembers: totalMembers.count ?? 0,
        activeDailies: activeDailies.count ?? 0,
      },
      business: {
        opportunitiesActive: oppsActive.count ?? 0,
        opportunitiesWon: oppsWon.count ?? 0,
        ordersLast30Days: (orders.data ?? []).length,
        revenueLast30Days: Math.round(revenue * 100) / 100,
        cardOrdersLast30Days: cardOrders.count ?? 0,
      },
      intelligence: {
        topPatterns: (patterns.data ?? []).map(
          (p: { pattern_signature: string; occurrences: number }) => ({
            signature: p.pattern_signature,
            occurrences: p.occurrences,
          }),
        ),
      },
      today: {
        lastAuditAt,
        daysSinceAudit: lastAuditAt
          ? Math.floor((Date.now() - new Date(lastAuditAt).getTime()) / 86_400_000)
          : null,
        invitationVerdict: readiness?.verdict ?? null,
        unresolvedFindings:
          readiness && readiness.verdict !== "yes" ? (readiness.unresolved ?? []) : [],
        lastReleaseDecision: releases.data?.[0]?.decision ?? null,
        lastReleaseAt: releases.data?.[0]?.created_at ?? null,
      },
    };
  });

export const recentReleaseApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReleaseApprovalRow[]> => {
    await assertFounder(context);
    const { data } = await context.supabase
      .from("release_approvals")
      .select("id, decision, note, outstanding, invitation_verdict, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    return (data ?? []) as ReleaseApprovalRow[];
  });

export const recordReleaseApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        decision: z.enum(["approved", "delayed", "changes_requested"]),
        note: z.string().max(2000).default(""),
        outstanding: z.array(z.string().max(400)).max(50).default([]),
        invitationVerdict: z.string().max(40).nullable().default(null),
        summary: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { error } = await context.supabase.from("release_approvals").insert({
      user_id: context.userId,
      decision: data.decision,
      note: data.note,
      outstanding: data.outstanding,
      invitation_verdict: data.invitationVerdict,
      summary: data.summary,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
