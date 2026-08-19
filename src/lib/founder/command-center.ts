// FRASS-0525 — Founder Control Room.
//
// The Founder's instruments were scattered across the platform: some on the
// launch feedback page, some under admin, some inside the Daily. This registry
// is the single map of where everything is. Nothing here is a new capability —
// it is one door onto the ones that already exist.
//
// Rule: a Founder tool is registered here or it does not exist. If it lives in
// two places, the Command Center is the one that stays.

export type CommandSectionId =
  | "home"
  | "platform"
  | "design"
  | "frassy"
  | "ai"
  | "operations"
  | "simulator"
  | "innovation"
  | "conversation"
  | "commissioning"
  | "world-teleporter";

export type CommandTool = {
  id: string;
  label: string;
  /** everyday language — what this actually does for the Founder. */
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
    id: "world-teleporter",
    icon: "\u{1F5FA}\uFE0F",
    label: "World Teleporter",
    purpose:
      "Every page that exists in Frass, whether it can be reached, and a one-tap door into each. Inspection only \u2014 nothing here changes the application.",
    tools: [
      {
        id: "world-teleporter",
        label: "World Teleporter",
        plain: "See live pages, built-but-unlinked pages and legacy doors, then visit any of them.",
        kind: "panel",
        amendment: "FRASS-0570",
      },
    ],
  },
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
        id: "founder-ai-status",
        label: "Founder AI Status",
        plain: "Is her memory recording, is anything rewriting her words, and which step is she on?",
        kind: "panel",
        amendment: "FRASS-0571",
      },
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
    id: "ai",
    icon: "🧠",
    label: "AI Operations",
    purpose: "Know what Frass is thinking, doing, and costing — and what members built with it.",
    tools: [
      {
        id: "ai-operations",
        label: "AI Operations Dashboard",
        plain: "Credits, requests, reliability, speed, cost by feature, trends and alerts.",
        kind: "panel",
        amendment: "FRASS-0540",
      },
      {
        id: "ai-roi",
        label: "Return on intelligence",
        plain: "Businesses started, books published, products created, member revenue influenced.",
        kind: "panel",
        amendment: "FRASS-0541",
      },
      {
        id: "ai-approval",
        label: "AI Approval Rule",
        plain: "Frassy reads freely, but every change waits for your approval — deletes need two.",
        kind: "panel",
        amendment: "FRASS-0539",
      },
      {
        id: "ai-credits",
        label: "Member AI credits",
        plain: "Who is spending studio credits, and on what.",
        kind: "link",
        path: "/admin/ai-credits",
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
        id: "member-success",
        label: "Founder Success Dashboard",
        plain: "How every member is progressing — momentum, milestones and revenue ranges only, never balances.",
        kind: "panel",
        amendment: "FRASS-0547",
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
    id: "simulator",
    icon: "🧪",
    label: "Experience Simulator",
    purpose:
      "Become any member and walk Frass exactly as they would — starting at the front door.",
    tools: [
      {
        id: "experience-simulator",
        label: "Founder Experience Simulator",
        plain: "Pick a persona, start at frasskicks.com, record what you notice, get a score.",
        kind: "panel",
        amendment: "FRASS-0559",
      },
      {
        id: "preview-reset",
        label: "Founder Preview Reset",
        plain: "Every new build returns you to the front door instead of somewhere random.",
        kind: "panel",
        amendment: "FRASS-0560",
      },
      {
        id: "seed-vaults",
        label: "Founder Seed Vaults",
        plain: "Nothing you create while testing is thrown away — every Vault is a real asset you own.",
        kind: "panel",
        amendment: "FRASS-0561",
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
  {
    id: "conversation",
    icon: "🎙️",
    label: "Conversation",
    purpose: "Your direct line to Frassy — the first place to think out loud before anything is built.",
    tools: [
      {
        id: "founder-frassy",
        label: "Talk to Frassy",
        plain: "She knows the districts, the catalog and where commissioning stands. Type or speak.",
        kind: "panel",
        amendment: "FRASS-0568",
      },
      {
        id: "founder-workspace",
        label: "My Workspace",
        plain: "Where the work itself happens — projects, studios, the Daily.",
        kind: "link",
        path: "/room",
      },
    ],
  },
  {
    id: "commissioning",
    icon: "🏗️",
    label: "Commissioning",
    purpose: "Bring Frass to launch: readiness, districts, credits, payments and platform status.",
    tools: [
      {
        id: "commissioning-journey",
        label: "Commissioning Journey",
        plain: "The five phases that take Frass from build to open doors.",
        kind: "panel",
        amendment: "FRASS-0568",
      },
      {
        id: "payment-providers",
        label: "Payment Provider Center",
        plain: "Providers per market, owner compensation, margin floor and the ten-step pipeline.",
        kind: "link",
        path: "/payment-providers",
        amendment: "FRASS-0303",
      },
      {
        id: "global-operations",
        label: "Global Operations",
        plain: "Canada, United Kingdom and United States — capability, campaigns and analytics.",
        kind: "link",
        path: "/global-operations",
        amendment: "FRASS-0305",
      },
      {
        id: "financial-center",
        label: "Financial Center",
        plain: "Every receipt, ledger and payout in one audited place.",
        kind: "link",
        path: "/financial-center",
      },
    ],
  },
];

export function sectionById(id: string): CommandSection | undefined {
  return COMMAND_SECTIONS.find((s) => s.id === id);
}
