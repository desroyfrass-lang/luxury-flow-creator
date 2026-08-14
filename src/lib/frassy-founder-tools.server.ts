// FRASS-0521 / FRASS-0520 — Frassy as the Founder's Engineering Chief of Staff.
//
// These tools are analysis only. Frassy never writes, deploys or applies
// anything from here: she classifies, prices the effort, and prepares the
// specification. Applying Founder design changes happens through the
// authenticated Founder Design Authority flow, with preview and approval.
import { tool } from "ai";
import { z } from "zod";
import { DESIGN_AUTHORITY_MAY, DESIGN_AUTHORITY_MAY_NEVER } from "@/lib/founder/design-authority";

export const analyzeChangeRequestTool = tool({
  description:
    "FOUNDER CHANGE ADVISOR (FRASS-0521). Use ONLY with the Founder, and only AFTER he has finished explaining the whole idea. Splits everything he described into individual changes and sorts each into already possible, Founder editable, engineering required, or constitutional — with a cost of change and a single bundled engineering specification. Never interrupt him to run this; listen first, then analyze.",
  inputSchema: z.object({
    idea: z
      .string()
      .describe("Everything the Founder described, in his own words. Pass the complete idea, not a summary."),
  }),
  execute: async ({ idea }) => {
    const { analyzeChangeRequest, specToMarkdown } = await import("@/lib/founder/change-advisor");
    const a = analyzeChangeRequest(idea);
    return {
      summary: a.summary,
      counts: a.counts,
      changes: a.changes,
      optimizations: a.optimizations,
      spec: a.spec ? { ...a.spec, markdown: specToMarkdown(a.spec) } : null,
    };
  },
});

export const designAuthorityScope = tool({
  description:
    "FOUNDER DESIGN AUTHORITY (FRASS-0520). Check whether a Founder's requested interface change can be made conversationally, or whether it must go through engineering. Also explains the boundaries of that authority.",
  inputSchema: z.object({
    instruction: z
      .string()
      .nullable()
      .default(null)
      .describe("The Founder's exact words, e.g. 'move this card below the title'. Null to just list the boundaries."),
  }),
  execute: async ({ instruction }) => {
    const { proposeDesignChange } = await import("@/lib/founder/design-authority");
    const boundaries = {
      may_change: DESIGN_AUTHORITY_MAY,
      may_never_change: DESIGN_AUTHORITY_MAY_NEVER,
      rule: "Every approved edit is previewed first and recorded in Change History; it can be reverted individually.",
    };
    if (!instruction) return boundaries;
    return { ...boundaries, proposal: proposeDesignChange(instruction) };
  },
});


// FRASS-0524 — the guided walk through the platform.
export const platformAuditTool = tool({
  description:
    "GUIDED PLATFORM AUDIT (FRASS-0524). Use when the Founder says something like 'let's audit Frass', 'walk me through the platform', or asks what a page does, promises or costs. Returns the walking order, what each page contains, and the private Trust Score criteria. Frassy guides the conversation; the Founder records the scores in the Founder Audit desk.",
  inputSchema: z.object({
    pageId: z
      .string()
      .nullable()
      .default(null)
      .describe("A specific page id to review. Null returns the full walking order."),
  }),
  execute: async ({ pageId }) => {
    const { AUDIT_PAGES, AUDIT_DIMENSIONS, pageFinancials } = await import(
      "@/lib/founder/platform-audit"
    );
    if (!pageId) {
      return {
        where_to_record: "/admin/audit",
        dimensions: AUDIT_DIMENSIONS,
        walking_order: AUDIT_PAGES.map((p) => ({
          id: p.id,
          label: p.label,
          path: p.path,
          purpose: p.purpose,
        })),
      };
    }
    const page = AUDIT_PAGES.find((p) => p.id === pageId);
    if (!page) return { error: `No audit page called ${pageId}.` };
    return { page, financials: pageFinancials(page), dimensions: AUDIT_DIMENSIONS };
  },
});

// FRASS-0523 — what a feature costs before it is built.
export const costImpactTool = tool({
  description:
    "COST IMPACT STATEMENT (FRASS-0523). Use when the Founder asks what a feature costs to run, whether it is free for members, or whether it can scale. Also use before agreeing to build any new AI, voice, image or video feature.",
  inputSchema: z.object({
    featureId: z
      .string()
      .nullable()
      .default(null)
      .describe("A registered feature id. Null returns the whole-platform picture."),
    members: z
      .number()
      .nullable()
      .default(null)
      .describe("Member count to project against, e.g. 10000. Null uses every tier."),
  }),
  execute: async ({ featureId, members }) => {
    const {
      auditPlatform,
      auditFeature,
      COST_IMPACT_REGISTER,
      COST_IMPACT_QUESTIONS,
      FREE_FOREVER,
      projectFeature,
      formatMoney,
    } = await import("@/lib/finance/sustainability");
    if (featureId) {
      const s = COST_IMPACT_REGISTER.find((x) => x.id === featureId);
      if (!s)
        return {
          error: `No cost statement for ${featureId}.`,
          known: COST_IMPACT_REGISTER.map((x) => x.id),
          required_questions: COST_IMPACT_QUESTIONS,
        };
      return { audit: auditFeature(s), projections: projectFeature(s) };
    }
    const p = auditPlatform();
    return {
      free_forever: FREE_FOREVER,
      required_questions: COST_IMPACT_QUESTIONS,
      critical: p.critical.map((a) => ({ feature: a.statement.feature, warnings: a.warnings })),
      watch: p.watch.map((a) => a.statement.feature),
      projections: p.projections
        .filter((x) => members == null || x.members === members)
        .map((x) => ({
          members: x.members,
          monthly: formatMoney(x.monthly),
          perMember: formatMoney(x.perMember),
        })),
    };
  },
});

// FRASS-0518-A — does the Constitution actually work?
export const constitutionHealthTool = tool({
  description:
    "CONSTITUTION EFFECTIVENESS REVIEW (FRASS-0518-A). Use when the Founder asks whether an amendment worked, whether a rule should be revised, expanded or retired, or how healthy the Constitution is. Reports incidents before and after each amendment, unintended consequences, and evidence-based recommendations. Analysis only — the Founder alone amends.",
  inputSchema: z.object({
    ref: z
      .string()
      .nullable()
      .default(null)
      .describe("A specific amendment reference like FRASS-0517. Null reviews the whole Constitution."),
  }),
  execute: async ({ ref }) => {
    const { AMENDMENTS, amendmentByRef } = await import("@/lib/constitution/registry");
    if (ref) {
      const a = amendmentByRef(ref);
      if (!a) return { error: `No registered amendment ${ref}.`, known: AMENDMENTS.map((x) => x.ref) };
      return {
        amendment: a,
        note: "Live before/after incident counts are shown in the Founder Control Room under Innovation.",
      };
    }
    return {
      registered: AMENDMENTS.map((a) => ({
        ref: a.ref,
        title: a.title,
        intent: a.intent,
        implemented: Boolean(a.implementedAt),
      })),
      where_to_review: "/command (Innovation → Constitution Health)",
    };
  },
});

export function buildFounderTools() {
  return {
    analyze_change_request: analyzeChangeRequestTool,
    design_authority_scope: designAuthorityScope,
    platform_audit: platformAuditTool,
    cost_impact: costImpactTool,
    constitution_health: constitutionHealthTool,
  };
}
