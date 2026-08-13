// FRASS-0525 — Founder Command Center.
//
// The Founder's instruments were scattered across the platform: some on the
// launch feedback page, some under admin, some inside the Daily. This registry
// is the single map of where everything is. Nothing here is a new capability —
// it is one door onto the ones that already exist.
//
// Rule: a Founder tool is registered here or it does not exist. If it lives in
// two places, the Command Center is the one that stays.

export type CommandSectionId = "home" | "platform" | "design" | "frassy" | "operations" | "innovation";

export type CommandTool = {
  id: string;
  label: string;
  /** Plain English — what this actually does for the Founder. */
  plain: string;
  /** Rendered inline in the Command Center, or a destination elsewhere. */
  kind: "panel" | "link";
  /** Only for kind "link". */
  path?: string;
  amendment?: string;
};

export type CommandSection = {
  id: CommandSectionId;
  icon: string;
  label: string;
  purpose: string;
  tools: CommandTool[];
};

export const COMMAND_SECTIONS: CommandSection[] = [
  {
    id: "home",
    icon: "🏠",
    label: "Home",
    purpose: "How is Frass doing today? One page, five honest answers.",
    tools: [
      {
        id: "founder-home",
        label: "Founder Home",
        plain: "Platform, member, business and intelligence health, plus what's waiting on you.",
        kind: "panel",
        amendment: "FRASS-0528",
      },
      {
        id: "release-approval",
        label: "Release Approval",
        plain: "The final go/no-go before anything reaches production.",
        kind: "panel",
        amendment: "FRASS-0529",
      },
    ],
  },
  {
    id: "platform",
    icon: "🧭",
    label: "Platform",
    purpose: "Walk it, measure it, and see what keeps breaking.",
    tools: [
      {
        id: "founder-workflow",
        label: "Founder Workflow",
        plain: "The seven steps every change follows. Talk to Frassy first; engineering last.",
        kind: "panel",
        amendment: "FRASS-0527",
      },
      {
        id: "founder-path",
        label: "Founder Path",
        plain: "Walk the exact front door every member walks. Start every release here.",
        kind: "link",
        path: "/onboarding",
        amendment: "FRASS-0519",
      },
      {
        id: "guided-audit",
        label: "Guided Platform Audit",
        plain: "Review every page with Frassy: features, costs, promises, Trust Score.",
        kind: "panel",
        amendment: "FRASS-0524",
      },
      {
        id: "platform-intelligence",
        label: "Platform Intelligence",
        plain: "What the platform has learned from its own repairs.",
        kind: "panel",
        amendment: "FRASS-0518",
      },
      {
        id: "repair-history",
        label: "Repair History",
        plain: "Every problem reported, how it was resolved, and whether it came back.",
        kind: "panel",
        amendment: "FRASS-0515",
      },
    ],
  },
  {
    id: "design",
    icon: "🎨",
    label: "Design",
    purpose: "Change how Frass looks and moves, without engineering.",
    tools: [
      {
        id: "design-authority",
        label: "Design Authority",
        plain: "Describe an interface change in words. Preview it, approve it, revert it.",
        kind: "panel",
        amendment: "FRASS-0520",
      },
      {
        id: "navigation",
        label: "Navigation management",
        plain: "Every core destination, checked. A dead core route is a launch blocker.",
        kind: "panel",
        amendment: "FRASS-0514",
      },
      {
        id: "simplified-view",
        label: "Simplified View testing",
        plain: "See Frass the way a member who wants conversation only sees it.",
        kind: "link",
        path: "/room",
        amendment: "FRASS-0517",
      },
      {
        id: "theme",
        label: "Words and imagery",
        plain: "The written voice of the platform and the images it uses.",
        kind: "link",
        path: "/admin/text",
      },
    ],
  },
  {
    id: "frassy",
    icon: "🤖",
    label: "Frassy",
    purpose: "One voice, one personality, one Frassy.",
    tools: [
      {
        id: "voice-studio",
        label: "Voice Studio",
        plain: "Audition, tune and approve the official voice. Personality and pronunciation live here too.",
        kind: "link",
        path: "/admin/voice",
        amendment: "FRASS-0522",
      },
      {
        id: "brand-personality",
        label: "Brand Personality Guide",
        plain: "Who Frassy is: what she always is, what she never is, how she speaks.",
        kind: "panel",
        amendment: "FRASS-0522-A",
      },
      {
        id: "knowledge-vault",
        label: "Knowledge Vault",
        plain: "What Frassy remembers, and what members chose to keep.",
        kind: "link",
        path: "/vault",
      },
    ],
  },
  {
    id: "operations",
    icon: "📊",
    label: "Operations",
    purpose: "Is Frass healthy, safe, and affordable to run today?",
    tools: [
      {
        id: "founder-daily",
        label: "Founder Daily",
        plain: "Today's briefing — what needs you, and what can wait.",
        kind: "link",
        path: "/room",
        amendment: "FRASS-0425",
      },
      {
        id: "health",
        label: "Platform health",
        plain: "Live signals across the platform, in plain language.",
        kind: "panel",
      },
      {
        id: "observation",
        label: "Deployment observation",
        plain: "The latest release stays under watch until it proves stable.",
        kind: "panel",
        amendment: "FRASS-0506",
      },
      {
        id: "security",
        label: "Security Center",
        plain: "Blocked attempts, alerts, and the emergency freeze switch.",
        kind: "panel",
        amendment: "FRASS-0476",
      },
      {
        id: "sustainability",
        label: "Financial Sustainability",
        plain: "What Frass costs to run, and who pays for it.",
        kind: "panel",
        amendment: "FRASS-0523",
      },
      {
        id: "member-blueprints",
        label: "Member Success Blueprints",
        plain: "Teach Frassy who a member is — she builds their Daily from it.",
        kind: "link",
        path: "/blueprints",
        amendment: "FRASS-0532-B",
      },
      {
        id: "vault-health",
        label: "Business Vault health",
        plain: "Which entrepreneurial pathways members are actually building in.",
        kind: "link",
        path: "/business-vaults",
      },
    ],
  },
  {
    id: "innovation",
    icon: "💡",
    label: "Innovation",
    purpose: "Decide what Frass becomes next — on evidence, not assumption.",
    tools: [
      {
        id: "constitution-health",
        label: "Constitution Health",
        plain: "Which amendments worked, which caused new problems, which should be revised or retired.",
        kind: "panel",
        amendment: "FRASS-0518-A",
      },
      {
        id: "change-advisor",
        label: "Change Advisor queue",
        plain: "Sort every idea before it becomes engineering. Drafts and specifications live here.",
        kind: "panel",
        amendment: "FRASS-0521",
      },
    ],
  },
];

export function sectionById(id: string): CommandSection | undefined {
  return COMMAND_SECTIONS.find((s) => s.id === id);
}
