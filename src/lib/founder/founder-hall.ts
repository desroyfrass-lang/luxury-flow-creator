// Founder Architecture Amendment (Atlas Recovery Phase 1) —
// ONE HEADQUARTERS, MANY PROTECTED ROOMS.
//
// Founder Hall is the Founder's headquarters: a navigation and attention layer,
// not another admin application. Nothing here is a new capability. Every room
// below already exists as its own route, keeps its own authorization, and works
// exactly as it did before. This file only says which rooms exist and what they
// are for, in everyday language.

export type FounderRoom = {
  id: string;
  icon: string;
  /** What the Founder calls it. */
  label: string;
  /** One line of plain English: what this room is for. */
  purpose: string;
  /** The existing route. Never a new page. */
  path: string;
  /** Shown apart from administration — the customer/member experience. */
  kind: "room" | "experience";
};

export const FOUNDER_ROOMS: FounderRoom[] = [
  {
    id: "control-room",
    icon: "🎛️",
    label: "Control Room",
    purpose: "Run and monitor Frass Hill — platform health, audits, design authority and operations.",
    path: "/control-room",
    kind: "room",
  },
  {
    id: "onboarding-room",
    icon: "🚪",
    label: "Onboarding Room",
    purpose: "Enter the real onboarding experience to inspect, test and manage it.",
    path: "/onboarding",
    kind: "room",
  },
  {
    id: "studios",
    icon: "🎬",
    label: "Frassy Studios",
    purpose: "Create, produce and distribute Frass media.",
    path: "/studios",
    kind: "room",
  },
  {
    id: "vaults",
    icon: "🗄️",
    label: "Vaults",
    purpose: "The Vault ecosystem — the workspaces partners actually build in.",
    path: "/vaults",
    kind: "room",
  },
  {
    id: "business",
    icon: "💼",
    label: "Business & Commerce",
    purpose: "Partners, vendors and the trading side of the house.",
    path: "/admin/partner-vendors",
    kind: "room",
  },
  {
    id: "community",
    icon: "🤝",
    label: "Community & Content",
    purpose: "What gets published, approved and shared across the Hill.",
    path: "/admin/approvals",
    kind: "room",
  },
  {
    id: "analytics",
    icon: "📊",
    label: "Analytics & Money",
    purpose: "Revenue, financial checks and where the money actually goes.",
    path: "/admin/financial-audit",
    kind: "room",
  },
  {
    id: "security",
    icon: "🔐",
    label: "Security & Access",
    purpose: "Who holds which role, and who may enter protected rooms.",
    path: "/admin/roles",
    kind: "room",
  },
  {
    id: "site-management",
    icon: "🧭",
    label: "Site Management",
    purpose: "The everyday site tools — words, images, content and housekeeping.",
    path: "/admin",
    kind: "room",
  },
  {
    id: "kids",
    icon: "🌈",
    label: "Kids World",
    purpose: "Inspect the children's world exactly as a family sees it.",
    path: "/kids-world",
    kind: "room",
  },
  {
    id: "teleporter",
    icon: "🗺️",
    label: "TP · Teleporter",
    purpose: "Jump straight to any authorized Frass system, and come back here.",
    path: "/control-room?tab=world-teleporter",
    kind: "room",
  },
  {
    id: "frass-hill",
    icon: "⛰️",
    label: "Enter Frass Hill",
    purpose: "Step out of administration and walk the Hill as a member does.",
    path: "/frass-hill",
    kind: "experience",
  },
];

/** Rooms the Founder TP pins at the top — the ones used most during a recovery pass. */
export const TP_QUICK_JUMPS = ["onboarding-room", "control-room", "studios", "vaults", "security", "site-management"] as const;
