// FRASS-0200 — Founder Construction Mode & Blueprint Architecture System.
//
// "The platform belongs to its community, but its architecture belongs to the Founder."
//
// This module is the living architectural blueprint of Frass OS: every component the
// Founder can select in Blueprint Mode, what it is for, what depends on it, who it
// affects, and every architectural decision ever approved. Nothing is forgotten;
// architecture compounds over time.

export type ImplementationStatus = "Live" | "Draft" | "Planned";

export type BlueprintComponent = {
  /** data-blueprint value used to tag the DOM node. */
  id: string;
  label: string;
  purpose: string;
  registry: string[];
  connectedSystems: string[];
  dependencies: string[];
  usersAffected: string[];
  lastApprovedBy: string;
  lastModified: string;
  status: ImplementationStatus;
  /** Registry specification this component answers to. */
  specification: string;
};

export type BlueprintActionGroup = {
  group: string;
  actions: string[];
};

/** Every component the Founder may select. Tag the DOM with data-blueprint="<id>". */
export const BLUEPRINT_COMPONENTS: BlueprintComponent[] = [
  {
    id: "workspace-navigation",
    label: "Permanent Navigation",
    purpose: "The single navigation spine of Frass OS — My Workspace, The Daily, Projects, Vault, Search, Profile.",
    registry: ["FRASS-0200", "Workspace & Daily Navigation Amendment"],
    connectedSystems: ["My Workspace", "The Daily", "Vault", "Search", "Founder Dashboard"],
    dependencies: ["Roles & Permissions", "Router", "Session"],
    usersAffected: ["Founder", "Builders", "Partners", "Affiliates", "Members"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-08",
    status: "Live",
    specification: "One workspace, one navigation. Role-specific links appear automatically; nothing is duplicated.",
  },
  {
    id: "workspace-modes",
    label: "Mode Rail",
    purpose: "Changes the tools without changing the place — Fashion, Music, Marketplace, Farm, Foundation, Finance, Academy, Projects.",
    registry: ["Workspace Experience System v1.0"],
    connectedSystems: ["My Workspace", "Projects", "Marketplace", "Academy"],
    dependencies: ["Workspace config", "Session continuity"],
    usersAffected: ["Founder", "Builders", "Partners"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-06",
    status: "Live",
    specification: "Modes never reload the workspace and never create a second workspace.",
  },
  {
    id: "workspace-projects",
    label: "Project List",
    purpose: "Long-running work that can be paused and resumed without losing context.",
    registry: ["Product Population Project Mode"],
    connectedSystems: ["My Workspace", "The Daily", "Builder Vault", "Frassy Memory"],
    dependencies: ["Builder Memory", "Timeline", "Tasks"],
    usersAffected: ["Founder", "Builders", "Partners"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-06",
    status: "Live",
    specification: "Projects reopen exactly where work stopped, with a resume summary before anything else.",
  },
  {
    id: "workspace-conversation",
    label: "Conversation Surface",
    purpose: "The single conversation with Frassy inside the workspace — one chat, one composer.",
    registry: ["Workspace Experience System v1.0", "One source of truth"],
    connectedSystems: ["Frassy", "Projects", "Vault", "Upload Tray"],
    dependencies: ["Voice state machine", "Builder Memory", "AI Gateway"],
    usersAffected: ["Founder", "Builders"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-06",
    status: "Live",
    specification: "Never add a second composer or a second conversation surface.",
  },
  {
    id: "workspace-composer",
    label: "Composer & Upload Tray",
    purpose: "Universal Builder Composer — text, voice, camera, files, and intelligent content recognition.",
    registry: ["Builder Composer"],
    connectedSystems: ["Frassy", "Builder Vault", "Projects"],
    dependencies: ["Storage", "Voice pipeline", "Attachment analysis"],
    usersAffected: ["Founder", "Builders", "Partners"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-06",
    status: "Live",
    specification: "One composer, one upload manager, everywhere in Frass OS.",
  },
  {
    id: "workspace-panel",
    label: "Context Panel",
    purpose: "Tasks, milestones and live context beside the work, never on top of it.",
    registry: ["Workspace Experience System v1.0"],
    connectedSystems: ["Projects", "The Daily", "Timeline"],
    dependencies: ["Tasks", "Milestones"],
    usersAffected: ["Founder", "Builders"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-06",
    status: "Live",
    specification: "The Builder's work is the hero; context supports it and collapses on request.",
  },
  {
    id: "daily",
    label: "The Frass Daily",
    purpose: "Executive daily command center — one Daily across the entire ecosystem, adapted to role.",
    registry: ["FRASS-0200", "The Frass Daily (Universal Daily Command Center)"],
    connectedSystems: ["My Workspace", "Tasks", "Marketplace", "Foundation", "Academy"],
    dependencies: ["Notifications", "Projects", "Vision Maps", "Roles"],
    usersAffected: ["Founder", "Partners", "Builders", "Affiliates"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-08",
    status: "Live",
    specification: "Opens once per calendar day, reopenable anytime; every item is actionable and status-badged.",
  },
  {
    id: "daily-priorities",
    label: "Daily Priorities Card",
    purpose: "Today's Critical, Important, Optional and Completed work, delegable to Frassy.",
    registry: ["The Frass Daily"],
    connectedSystems: ["Projects", "My Workspace", "Frassy"],
    dependencies: ["Tasks", "Daily state persistence"],
    usersAffected: ["Founder", "Builders", "Partners"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-08",
    status: "Live",
    specification: "Every priority is a target: it opens a project or a route, never a dead card.",
  },
  {
    id: "founder-dashboard",
    label: "Founder Dashboard",
    purpose: "Executive oversight — commissioning, launch readiness, platform memory, governance, security.",
    registry: ["FRASS-0200", "Founder Operations"],
    connectedSystems: ["My Workspace", "The Daily", "Construction Mode", "Governance"],
    dependencies: ["Roles", "Platform events", "Commissioning"],
    usersAffected: ["Founder"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-08",
    status: "Live",
    specification: "Oversight only. Work happens in My Workspace; the dashboard is one click away.",
  },
  {
    id: "site-navigation",
    label: "Site Navigation",
    purpose: "Public wayfinding across the districts of the World of Frass.",
    registry: ["Platform Architecture A-01"],
    connectedSystems: ["Districts", "Marketplace", "Kids World", "Luxury House"],
    dependencies: ["Router", "Region", "Cart"],
    usersAffected: ["Everyone"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-07",
    status: "Live",
    specification: "The world is the hero; navigation stays quiet and elegant.",
  },
  {
    id: "frassy-companion",
    label: "Frassy Companion",
    purpose: "The host of every Frass destination — welcomes once, then accompanies.",
    registry: ["Frassy entrance", "AI Orchestration A-04"],
    connectedSystems: ["Every district", "Workspace", "The Daily"],
    dependencies: ["Voice state machine", "Frassy memory", "AI Gateway"],
    usersAffected: ["Everyone"],
    lastApprovedBy: "Founder",
    lastModified: "2026-08-07",
    status: "Live",
    specification: "Frassy enhances the environment and never competes with it.",
  },
];

export const BLUEPRINT_ACTIONS: BlueprintActionGroup[] = [
  { group: "Placement", actions: ["Move up", "Move down", "Move left", "Move right", "New panel", "New section"] },
  { group: "Size", actions: ["Small", "Medium", "Large", "Full width", "Automatic"] },
  { group: "State", actions: ["Pin", "Hide", "Collapse", "Expand", "Duplicate", "Merge", "Rename", "Archive"] },
  {
    group: "Restyle",
    actions: ["Background", "Spacing", "Typography", "Lighting", "Animation", "Motion", "Shape", "Cards", "Glass", "Materials"],
  },
  { group: "Behavior", actions: ["Always visible", "Founder only", "Role based", "Context aware", "Hidden", "Docked", "Floating", "Persistent"] },
  {
    group: "Connections",
    actions: [
      "Connect to The Daily",
      "Connect to My Workspace",
      "Connect to Marketplace",
      "Connect to Foundation",
      "Connect to Academy",
      "Connect to Vault",
      "Connect to Frassy",
      "Connect to Search",
      "Disconnect",
    ],
  },
  { group: "Inspect", actions: ["Dependencies", "Permissions", "History", "Registry reference", "Open full specification"] },
];

/** The protection sequence Frassy runs before any recommendation. Never redesign blindly. */
export const ARCHITECTURAL_PROTECTION = [
  "Audit",
  "Duplicate detection",
  "Dependency analysis",
  "Impact review",
  "Recommendation",
  "Specification",
  "Founder approval",
  "Implementation brief",
] as const;

export const QUALITY_STANDARD = [
  "Elegance",
  "Clarity",
  "Professionalism",
  "Luxury",
  "Accessibility",
  "Performance",
  "Consistency",
  "Visual harmony",
] as const;

export function getBlueprintComponent(id: string | null): BlueprintComponent | undefined {
  if (!id) return undefined;
  return BLUEPRINT_COMPONENTS.find((c) => c.id === id);
}

/** Live simulation — Frassy describes the outcome before anything is implemented. */
export function simulateAction(component: BlueprintComponent, action: string): string {
  const a = action.toLowerCase();
  if (a.startsWith("move")) {
    return `If we ${a} the ${component.label}, ${component.connectedSystems[0] ?? "the workspace"} keeps its position and the surrounding panels re-flow around it. Nothing that depends on it (${component.dependencies.join(", ")}) breaks. Would you like to preview that layout?`;
  }
  if (["small", "medium", "large", "full width", "automatic"].includes(a)) {
    return `Resizing the ${component.label} to ${action} changes its visual weight on every screen where it appears — affecting ${component.usersAffected.join(", ")}. On smaller screens it will settle to a single column. Preview?`;
  }
  if (a === "hide" || a === "founder only") {
    return `Restricting the ${component.label} removes it for ${component.usersAffected.filter((u) => u !== "Founder").join(", ") || "other roles"}. ${component.connectedSystems.join(", ")} still function, but their entry point from here disappears. I'd recommend keeping a secondary path before we approve this.`;
  }
  if (a.startsWith("connect")) {
    return `Connecting the ${component.label} to ${action.replace(/^connect to /i, "")} creates a new dependency edge. I'd route it through the existing workspace navigation rather than adding a new surface — one feature, one component, one route.`;
  }
  if (a === "merge" || a === "duplicate") {
    return `${action} on the ${component.label} touches ${component.dependencies.length} dependencies and ${component.connectedSystems.length} connected systems. Duplicate detection first: if a surface already does this, we extend it instead of creating a second version.`;
  }
  return `Change requested on the ${component.label}: ${action}. Impact review — connected systems: ${component.connectedSystems.join(", ")}. Dependencies: ${component.dependencies.join(", ")}. Users affected: ${component.usersAffected.join(", ")}. Approving records this decision in the architecture log, and I'll produce the implementation brief.`;
}

// ── Living architecture — every approved decision is recorded ─────────────
export type ArchitecturalDecision = {
  id: string;
  componentId: string;
  componentLabel: string;
  action: string;
  simulation: string;
  note?: string;
  approvedAt: string;
};

const LOG_KEY = "frass.construction.decisions";

export function loadDecisions(): ArchitecturalDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as ArchitecturalDecision[]) : [];
  } catch {
    return [];
  }
}

export function recordDecision(entry: Omit<ArchitecturalDecision, "id" | "approvedAt">): ArchitecturalDecision[] {
  const next: ArchitecturalDecision = {
    ...entry,
    id: `${entry.componentId}-${Date.now()}`,
    approvedAt: new Date().toISOString(),
  };
  const all = [next, ...loadDecisions()].slice(0, 200);
  if (typeof window !== "undefined") window.localStorage.setItem(LOG_KEY, JSON.stringify(all));
  return all;
}

export function decisionsFor(componentId: string): ArchitecturalDecision[] {
  return loadDecisions().filter((d) => d.componentId === componentId);
}
