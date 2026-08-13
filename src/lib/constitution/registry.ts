// FRASS-0518-A — The Constitution Register.
//
// The Constitution stops being a document the moment we can measure it. Every
// amendment listed here declares three things: what problem it was meant to
// solve, where in the platform that problem lives, and when the fix actually
// went live. Those three facts are what allow Frassy to answer, honestly,
// whether the amendment worked.
//
// Rule: an amendment with no implementation date is an intention, not a rule.

export type AmendmentArea = string;

export type Amendment = {
  /** FRASS-0518, FRASS-0522, … */
  ref: string;
  title: string;
  /** Plain English — what this amendment promised to change. */
  intent: string;
  /** The problem it was written to reduce, in the Founder's language. */
  targetProblem: string;
  /**
   * Where the effect should show up. Matched against the area of a repair
   * incident (Workspace, Onboarding, Payments…). Empty = platform-wide.
   */
  areas: AmendmentArea[];
  /** Repair categories this amendment should quiet down. */
  categories: string[];
  /** ISO date the amendment went live. Null means declared but not shipped. */
  implementedAt: string | null;
  /** Files that prove it exists. Empty = nothing to point at. */
  evidence: string[];
  /** Amendments this one builds on, so a retirement never orphans a rule. */
  extends?: string[];
};

/**
 * The measured Constitution. Add a row the same day an amendment is recorded in
 * FRASS_OS_CONSTITUTION.md — an unregistered amendment can never be reviewed.
 */
export const AMENDMENTS: Amendment[] = [
  {
    ref: "FRASS-0513",
    title: "Welcome Hall Owns Onboarding",
    intent:
      "No member is ever told to type a URL. Welcome Hall and Frassy carry the member to the next step.",
    targetProblem: "Members getting lost between signing up and starting their journey.",
    areas: ["Welcome Hall", "Onboarding"],
    categories: ["navigation", "onboarding"],
    implementedAt: "2026-07-28",
    evidence: [
      "src/lib/navigation/core-routes.ts",
      "src/routes/welcome-hall.tsx",
      "src/components/frassy-chat.tsx",
    ],
  },
  {
    ref: "FRASS-0514",
    title: "Core Route Restoration",
    intent: "Every core destination resolves. A 404 on a core route is a launch blocker.",
    targetProblem: "Onboarding returning 404 and members hitting dead ends.",
    areas: ["Onboarding", "Navigation"],
    categories: ["navigation", "broken_link", "page_error"],
    implementedAt: "2026-07-28",
    evidence: ["src/lib/navigation/core-routes.ts", "src/components/founder/core-route-audit.tsx"],
  },
  {
    ref: "FRASS-0515",
    title: "Frassy Self-Healing & Troubleshooting Engine",
    intent:
      "Members report problems to Frassy in their own words; she diagnoses, repairs what is safe, and escalates the rest with a real engineering report.",
    targetProblem: "Members carrying problems alone with nowhere safe to report them.",
    areas: [],
    categories: [],
    implementedAt: "2026-07-27",
    evidence: [
      "src/lib/repair/engine.ts",
      "src/components/founder/repair-center.tsx",
    ],
  },
  {
    ref: "FRASS-0517",
    title: "Simplified View Mode",
    intent:
      "One platform, two presentation modes. Anyone can use Frass through conversation alone.",
    targetProblem: "Members overwhelmed by dashboards and unable to find the next action.",
    areas: [],
    categories: ["confusion", "usability", "navigation"],
    implementedAt: "2026-08-05",
    evidence: [
      "src/components/view-mode/view-mode-frame.tsx",
      "src/components/view-mode/simplified-view.tsx",
    ],
  },
  {
    ref: "FRASS-0518",
    title: "Platform Intelligence Engine",
    intent:
      "The Repair History teaches the platform. Patterns become recommendations before they become complaints.",
    targetProblem: "The same issues repeating because nothing analysed them together.",
    areas: [],
    categories: [],
    implementedAt: "2026-08-06",
    evidence: ["src/lib/repair/intelligence.ts", "src/components/founder/platform-intelligence.tsx"],
    extends: ["FRASS-0515"],
  },
  {
    ref: "FRASS-0519",
    title: "Founder Onboarding Experience",
    intent:
      "The Founder walks the same front door as every member — no Founder-only onboarding.",
    targetProblem: "Founder blind spots about the real first-time experience.",
    areas: ["Onboarding", "Welcome Hall"],
    categories: ["onboarding", "confusion"],
    implementedAt: "2026-08-08",
    evidence: ["src/lib/founder/walkthrough.ts", "src/components/founder/founder-walkthrough.tsx"],
  },
  {
    ref: "FRASS-0520",
    title: "Founder Design Authority",
    intent:
      "The Founder changes the interface conversationally, with preview, approval and revert — never by editing code.",
    targetProblem: "Small presentation changes queuing behind engineering.",
    areas: [],
    categories: ["layout", "usability"],
    implementedAt: "2026-08-08",
    evidence: [
      "src/lib/founder/design-authority.ts",
      "src/components/founder/design-authority-panel.tsx",
    ],
  },
  {
    ref: "FRASS-0521",
    title: "Founder Change Advisor",
    intent:
      "Frassy sorts every idea into already possible, Founder editable, engineering, or constitutional — only real engineering reaches Lovable.",
    targetProblem: "Paying for engineering on things the platform could already do.",
    areas: [],
    categories: [],
    implementedAt: "2026-08-08",
    evidence: ["src/lib/founder/change-advisor.ts", "src/components/founder/change-advisor-panel.tsx"],
  },
  {
    ref: "FRASS-0522",
    title: "Frassy Voice Identity",
    intent: "One voice, one personality, one Frassy — resolved on the server, never per page.",
    targetProblem: "Frassy sounding like a different person in different places.",
    areas: [],
    categories: ["voice", "audio"],
    implementedAt: "2026-08-11",
    evidence: [
      "src/lib/voice/frassy-voice.ts",
      "src/lib/voice/voice-identity.server.ts",
      "src/routes/api/tts.ts",
    ],
  },
  {
    ref: "FRASS-0523",
    title: "Financial Sustainability",
    intent:
      "Free to build, sustainable to operate. Every feature carries a Cost Impact Statement and degrades instead of blocking.",
    targetProblem: "Members surprised by costs and features that cannot scale.",
    areas: ["Payments", "Credits"],
    categories: ["billing", "credits"],
    implementedAt: "2026-08-13",
    evidence: [
      "src/lib/finance/sustainability.ts",
      "src/components/founder/financial-sustainability-panel.tsx",
    ],
  },
  {
    ref: "FRASS-0524",
    title: "Founder Guided Platform Audit",
    intent: "The Founder and Frassy walk every page, every feature and every promise together.",
    targetProblem: "Growth outpacing review; pages nobody has looked at in months.",
    areas: [],
    categories: [],
    implementedAt: "2026-08-13",
    evidence: ["src/lib/founder/platform-audit.ts", "src/routes/_authenticated/admin.audit.tsx"],
  },
  {
    ref: "FRASS-0518-A",
    title: "Constitution Effectiveness Review",
    intent:
      "Every amendment is measured against real incidents: did it reduce the problem, did it cause a new one, should it be revised, expanded or retired.",
    targetProblem: "A Constitution that grows on assumption instead of evidence.",
    areas: [],
    categories: [],
    implementedAt: "2026-08-13",
    evidence: [
      "src/lib/constitution/registry.ts",
      "src/lib/constitution/effectiveness.ts",
      "src/components/founder/constitution-health.tsx",
    ],
    extends: ["FRASS-0518"],
  },
  {
    ref: "FRASS-0525",
    title: "Founder Command Center",
    intent: "One operational headquarters instead of Founder tools scattered across the platform.",
    targetProblem: "The Founder hunting for his own instruments.",
    areas: ["Founder Console"],
    categories: ["navigation"],
    implementedAt: "2026-08-13",
    evidence: ["src/routes/_authenticated/command.tsx", "src/lib/founder/command-center.ts"],
  },
  {
    ref: "FRASS-0522-A",
    title: "Frassy Brand Personality Guide",
    intent:
      "Define the person behind the voice: what Frassy always is, never is, and how she speaks — constitutional on every surface.",
    targetProblem: "A consistent voice with an inconsistent character.",
    areas: ["Frassy"],
    categories: ["voice", "content"],
    implementedAt: "2026-08-13",
    evidence: [
      "src/lib/frassy/brand-personality.ts",
      "src/components/founder/brand-personality-panel.tsx",
    ],
    extends: ["FRASS-0522"],
  },
  {
    ref: "FRASS-0527",
    title: "Founder Workflow Standard",
    intent:
      "Discuss, Analyze, Edit, Approve, Engineer, Validate, Learn. Every engineering request is the last step, not the first.",
    targetProblem: "Engineering requests raised before Frass has been asked whether it can already do it.",
    areas: ["Founder Console"],
    categories: ["governance", "navigation"],
    implementedAt: "2026-08-13",
    evidence: [
      "src/lib/founder/workflow.ts",
      "src/components/founder/founder-workflow-panel.tsx",
    ],
    extends: ["FRASS-0519", "FRASS-0520", "FRASS-0521"],
  },
];

export function amendmentByRef(ref: string): Amendment | undefined {
  const needle = ref.trim().toUpperCase();
  return AMENDMENTS.find((a) => a.ref.toUpperCase() === needle);
}
