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

export function buildFounderTools() {
  return {
    analyze_change_request: analyzeChangeRequestTool,
    design_authority_scope: designAuthorityScope,
  };
}
