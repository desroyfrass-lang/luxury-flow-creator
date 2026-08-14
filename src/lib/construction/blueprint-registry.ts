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
    registry: ["FRASS-0200", "The Frass Daily (Universal Daily Control Room)"],
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
  "Impact forecast",
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
  // ── Principle 13 · Constitutional Change Governance ──────────────────────
  /** Blueprint version this decision was archived as. */
  version?: string;
  /** Why this change mattered, in the Founder's own words. Permanent history. */
  founderIntent?: string;
  /** The Architectural Impact Report summary at the moment of approval. */
  impactSummary?: string;
  /** The credit forecast at the moment of approval. */
  creditForecast?: string;
  /** Registry references this decision answers to. */
  registry?: string[];
  /** Components modified by this decision. */
  componentsModified?: string[];
  approvedBy?: string;
  // ── Principle 14 · Regression Protection ─────────────────────────────────
  /** Expected behaviour established by the approved Blueprint. */
  expected?: string[];
  /** Behaviours confirmed present after implementation. */
  verified?: string[];
  verification?: "pending" | "verified" | "failed";
  implementationSummary?: string;
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

export function recordDecision(
  entry: Omit<ArchitecturalDecision, "id" | "approvedAt">,
): ArchitecturalDecision {
  const next: ArchitecturalDecision = {
    approvedBy: "Founder",
    verification: "pending",
    ...entry,
    id: `${entry.componentId}-${Date.now()}`,
    approvedAt: new Date().toISOString(),
  };
  const all = [next, ...loadDecisions()].slice(0, 200);
  if (typeof window !== "undefined") window.localStorage.setItem(LOG_KEY, JSON.stringify(all));
  return next;
}

/** Principle 14 — verification is written back into the permanent record. */
export function updateDecision(
  id: string,
  patch: Partial<ArchitecturalDecision>,
): ArchitecturalDecision[] {
  const all = loadDecisions().map((d) => (d.id === id ? { ...d, ...patch } : d));
  if (typeof window !== "undefined") window.localStorage.setItem(LOG_KEY, JSON.stringify(all));
  return all;
}

export function decisionsFor(componentId: string): ArchitecturalDecision[] {
  return loadDecisions().filter((d) => d.componentId === componentId);
}


// ── FRASS-0200 Amendment — Blueprint-first constitution ────────────────────
/** The final constitutional principle of Construction Mode. */
export const BLUEPRINT_PRINCIPLE =
  "The Founder never edits production directly. The Founder edits the Blueprint.";

/** Principle 12 — nothing is approved until its ripple effects are understood. */
export const IMPACT_PRINCIPLE =
  "Before any Blueprint is approved, Frassy answers one final question: what else changes because of this?";

/** The full disciplined lifecycle of every platform evolution. */
export const BLUEPRINT_LIFECYCLE = [
  "Vision",
  "Blueprint",
  "Simulation",
  "Impact Report",
  "Credit Forecast",
  "Founder Intent",
  "Founder Approval",
  "Implementation",
  "Verification",
  "Version Archive",
  "Architectural Memory",
  "Continuous Integrity Review",
] as const;

// ── Relationship mapping ───────────────────────────────────────────────────
export type Relationship = {
  /** Components this one relies on. */
  upstream: BlueprintComponent[];
  /** Components that rely on this one. */
  downstream: BlueprintComponent[];
  /** Components that share a dependency or a connected system with this one. */
  siblings: BlueprintComponent[];
};

export function relationshipMap(component: BlueprintComponent): Relationship {
  const others = BLUEPRINT_COMPONENTS.filter((c) => c.id !== component.id);
  const mentions = (c: BlueprintComponent, label: string) =>
    c.connectedSystems.some((s) => s.toLowerCase() === label.toLowerCase()) ||
    c.dependencies.some((s) => s.toLowerCase() === label.toLowerCase());

  const upstream = others.filter((c) => component.dependencies.concat(component.connectedSystems).some((d) => d.toLowerCase() === c.label.toLowerCase()));
  const downstream = others.filter((c) => mentions(c, component.label));
  const siblings = others.filter(
    (c) =>
      !upstream.includes(c) &&
      !downstream.includes(c) &&
      (c.dependencies.some((d) => component.dependencies.includes(d)) ||
        c.connectedSystems.some((s) => component.connectedSystems.includes(s))),
  );
  return { upstream, downstream, siblings };
}

// ── Blueprint versioning — every approved state can be restored ────────────
export type BlueprintVersion = {
  id: string;
  label: string;
  createdAt: string;
  decisions: ArchitecturalDecision[];
};

const VERSION_KEY = "frass.construction.versions";

export function loadVersions(): BlueprintVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VERSION_KEY);
    return raw ? (JSON.parse(raw) as BlueprintVersion[]) : [];
  } catch {
    return [];
  }
}

export function saveVersion(label: string): BlueprintVersion[] {
  const version: BlueprintVersion = {
    id: `v-${Date.now()}`,
    label,
    createdAt: new Date().toISOString(),
    decisions: loadDecisions(),
  };
  const all = [version, ...loadVersions()].slice(0, 30);
  if (typeof window !== "undefined") window.localStorage.setItem(VERSION_KEY, JSON.stringify(all));
  return all;
}

/** Restore the architecture log to a saved version. Nothing in production is touched. */
export function revertToVersion(id: string): ArchitecturalDecision[] {
  const version = loadVersions().find((v) => v.id === id);
  if (!version) return loadDecisions();
  if (typeof window !== "undefined") window.localStorage.setItem(LOG_KEY, JSON.stringify(version.decisions));
  return version.decisions;
}

// ── Sandbox — try architecture without touching the live platform ──────────
const SANDBOX_KEY = "frass.construction.sandbox";

export function isSandbox(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SANDBOX_KEY) === "1";
}

export function setSandbox(on: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(SANDBOX_KEY, on ? "1" : "0");
}
