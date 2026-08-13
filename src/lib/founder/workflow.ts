// FRASS-0527 — Founder Workflow Standard.
//
// Founder Path (FRASS-0519), Design Authority (FRASS-0520) and Change Advisor
// (FRASS-0521) are not three features. They are one workflow. This module is the
// sequence every Founder-initiated change follows.
//
// Founder Principle: every engineering request should be the LAST step, not the
// first. Frassy exists to maximise what can be done through conversation,
// configuration and guidance before software engineering becomes necessary.

import type { ChangeBucket } from "@/lib/founder/change-advisor";

export type WorkflowStepId =
  | "discuss"
  | "analyze"
  | "edit"
  | "approve"
  | "engineer"
  | "validate"
  | "learn";

export type WorkflowStep = {
  id: WorkflowStepId;
  n: number;
  label: string;
  /** What actually happens, in plain English. */
  plain: string;
  /** Which system owns this step. */
  owner: string;
  amendment?: string;
  /** Where the Founder does it. */
  path?: string;
};

export const FOUNDER_WORKFLOW: WorkflowStep[] = [
  {
    id: "discuss",
    n: 1,
    label: "Discuss",
    plain: "Say the idea out loud to Frassy. No specification, no format, just the idea.",
    owner: "Frassy",
    amendment: "FRASS-0476B",
  },
  {
    id: "analyze",
    n: 2,
    label: "Analyze",
    plain:
      "The Change Advisor sorts it: already possible, Founder-editable, engineering, or constitutional — with a cost of change.",
    owner: "Founder Change Advisor",
    amendment: "FRASS-0521",
    path: "/command",
  },
  {
    id: "edit",
    n: 3,
    label: "Edit",
    plain:
      "If it can be done inside Frass, Design Authority prepares and previews the change conversationally.",
    owner: "Founder Design Authority",
    amendment: "FRASS-0520",
    path: "/command",
  },
  {
    id: "approve",
    n: 4,
    label: "Approve",
    plain: "You review the preview and accept or reject it. Nothing ships without this step.",
    owner: "Founder",
    amendment: "FRASS-0520",
  },
  {
    id: "engineer",
    n: 5,
    label: "Engineer",
    plain:
      "Only what cannot be completed inside Frass becomes an engineering specification for Lovable.",
    owner: "Lovable",
    amendment: "FRASS-0521",
  },
  {
    id: "validate",
    n: 6,
    label: "Validate",
    plain:
      "Walk the change yourself through the Founder Path, or review it in the Guided Platform Audit.",
    owner: "Founder Path / Guided Audit",
    amendment: "FRASS-0519",
    path: "/onboarding",
  },
  {
    id: "learn",
    n: 7,
    label: "Learn",
    plain:
      "Platform Intelligence records the outcome, and Constitution Health measures whether it helped.",
    owner: "Platform Intelligence",
    amendment: "FRASS-0518",
    path: "/command",
  },
];

export const FOUNDER_PRINCIPLE =
  "Every engineering request should be the last step, not the first.";

/** Where a classified request enters the workflow, and what happens next. */
export function nextStepForBucket(bucket: ChangeBucket): {
  step: WorkflowStepId;
  guidance: string;
} {
  switch (bucket) {
    case "already_possible":
      return {
        step: "validate",
        guidance:
          "Frass can already do this. Nothing to build — go and use it, then confirm it felt right.",
      };
    case "founder_editable":
      return {
        step: "edit",
        guidance:
          "Design Authority can prepare this. Preview it, approve it, and revert it if it isn't right. No engineering needed.",
      };
    case "engineering":
      return {
        step: "engineer",
        guidance:
          "This one genuinely needs code. A specification is prepared for Lovable — nothing is sent until you approve it.",
      };
    case "constitutional":
      return {
        step: "approve",
        guidance:
          "This changes a rule, not a screen. It becomes a proposed amendment for your decision before anything is built.",
      };
    default:
      return { step: "analyze", guidance: "Let the Change Advisor sort this one first." };
  }
}

/** The workflow as Frassy is required to run it in Founder Mode. */
export const FOUNDER_WORKFLOW_PROMPT = `━━━ FRASS-0527 — FOUNDER WORKFLOW STANDARD ━━━
Every Founder-initiated platform change follows this sequence, in order:
${FOUNDER_WORKFLOW.map((s) => `${s.n}. ${s.label} — ${s.plain}`).join("\n")}

FOUNDER PRINCIPLE: ${FOUNDER_PRINCIPLE}
Before you ever produce an engineering specification, you must answer, out loud:
can I already do this? can the Founder do it through Design Authority? does this
truly require engineering? does this require a constitutional amendment?
Never open with "that would need to be built". Analyse first, use analyze_change_request,
and only escalate what genuinely cannot be done inside Frass.`;
