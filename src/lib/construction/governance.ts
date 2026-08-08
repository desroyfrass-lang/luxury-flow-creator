// FRASS-0200 Amendment — Principles 13, 14 and 15.
//
//  13 · Constitutional Change Governance — every approved Blueprint becomes a
//       permanent Decision Record, and the record remembers WHY, not just what.
//  14 · Regression Protection — an implementation is not complete until the
//       approved behaviour actually exists.
//  15 · Continuous Architectural Integrity — Construction Mode does not only
//       help build Frass, it continuously protects Frass.
//
// Truth Before Beauty applies here too: nothing reports healthy unless a real
// signal says so. Anything unverified reads grey.

import {
  BLUEPRINT_COMPONENTS,
  loadDecisions,
  loadVersions,
  type ArchitecturalDecision,
  type BlueprintComponent,
} from "@/lib/construction/blueprint-registry";

export const PRINCIPLE_13 =
  "Every approved architectural change becomes part of the permanent constitutional history of Frass OS — including why it was made.";

export const PRINCIPLE_14 =
  "Every approved Blueprint establishes expected behaviour. Implementation is not complete until the result matches the approved specification.";

export const PRINCIPLE_15 =
  "Construction Mode does not only help build Frass — it continuously protects Frass. Frassy reports; the Founder decides.";

export const TRUTH_BEFORE_BEAUTY =
  "Truth before beauty. A dashboard should never appear healthier than reality: green means verified, grey means unknown, yellow means attention needed, red means action required.";

/** The question asked before every approval — the answer is permanent history. */
export const FOUNDER_INTENT_QUESTION = "What problem are we solving, and why is this change important?";

// ── Principle 13 · Architectural Memory ────────────────────────────────────

export type ArchitecturalConflict = {
  decision: ArchitecturalDecision;
  reason: string;
};

/** Actions that reverse or erode a previously established principle. */
const REVERSALS: Record<string, string[]> = {
  hide: ["always visible", "pin", "persistent"],
  "always visible": ["hide", "founder only"],
  "founder only": ["always visible", "role based"],
  "role based": ["founder only"],
  duplicate: ["merge"],
  merge: ["duplicate"],
  archive: ["pin", "always visible", "new panel", "new section"],
  disconnect: [
    "connect to the daily",
    "connect to my workspace",
    "connect to marketplace",
    "connect to vault",
    "connect to frassy",
    "connect to search",
    "connect to academy",
    "connect to foundation",
  ],
};

/**
 * Before proceeding, check the Decision Records for the same area. If a proposal
 * conflicts with a previous architectural principle, explain the conflict first.
 */
export function architecturalMemory(componentId: string, action: string): ArchitecturalConflict[] {
  const a = action.toLowerCase();
  const opposites = REVERSALS[a] ?? [];
  const same = loadDecisions().filter((d) => d.componentId === componentId);

  return same
    .map((d) => {
      const prior = d.action.toLowerCase();
      if (opposites.includes(prior)) {
        return {
          decision: d,
          reason: `This proposal would reverse the principle established on ${new Date(d.approvedAt).toLocaleDateString()}, when "${d.action}" was approved${d.founderIntent ? ` because: "${d.founderIntent}"` : ""}. Would you like to amend that principle or preserve it?`,
        };
      }
      if (prior === a) {
        return {
          decision: d,
          reason: `"${d.action}" was already approved for this component on ${new Date(d.approvedAt).toLocaleDateString()}. Extending the existing decision is cheaper than repeating it.`,
        };
      }
      return null;
    })
    .filter(Boolean) as ArchitecturalConflict[];
}

// ── Principle 14 · Regression Protection ───────────────────────────────────

/** The behaviour each component is constitutionally required to exhibit. */
export const EXPECTED_BEHAVIOUR: Record<string, string[]> = {
  daily: [
    "The Daily opens once per calendar day",
    "It reopens on demand from the menu",
    "It does not replay the Frassy introduction",
    "Daily progress is preserved across reopening",
    "Every metric carries a status badge and a source",
  ],
  "daily-priorities": [
    "Every priority opens a project or a route",
    "Delegated items move out of the Founder's list",
    "Completed items persist for the calendar day",
  ],
  "workspace-navigation": [
    "My Workspace, The Daily, Projects, Vault, Search and Profile are always reachable",
    "No navigation entry is duplicated",
    "Role-specific links appear only for the right role",
  ],
  "workspace-modes": [
    "Switching a mode never reloads the workspace",
    "The last mode is restored on return",
  ],
  "workspace-projects": [
    "A project reopens on its last focus, not just its last project",
    "A resume summary is shown before anything else",
  ],
  "workspace-conversation": ["Exactly one conversation surface exists", "No second composer is introduced"],
  "workspace-composer": ["One composer and one upload manager platform-wide"],
  "workspace-panel": ["Context collapses on request and never covers the work"],
  "founder-dashboard": ["Oversight only — work happens in My Workspace", "My Workspace is one click away"],
  "site-navigation": ["Public wayfinding stays quiet", "Every district is reachable"],
  "frassy-companion": [
    "Frassy greets once per session at the entrance only",
    "She never re-introduces herself elsewhere",
    "She never interrupts simply because time has passed",
  ],
  "platform-status": [
    "Green only appears from a real signal",
    "Unverified signals read grey and name their source",
    "Every light is an entry point into that system",
  ],
  "development-credits": ["Every change shows a credit forecast before approval"],
};

export function expectedBehaviour(component: BlueprintComponent, action: string): string[] {
  const base = EXPECTED_BEHAVIOUR[component.id] ?? [
    `${component.label} continues to satisfy: ${component.specification}`,
  ];
  return [`After "${action}", ${component.label} still honours its specification`, ...base];
}

export type VerificationStatus = "pending" | "verified" | "failed";

export function verificationVerdict(
  checks: string[],
  passed: string[],
): { status: VerificationStatus; missing: string[] } {
  const missing = checks.filter((c) => !passed.includes(c));
  if (passed.length === 0) return { status: "pending", missing };
  return { status: missing.length === 0 ? "verified" : "failed", missing };
}

// ── Principle 15 · Continuous Architectural Integrity ──────────────────────

export type HealthLevel = "green" | "amber" | "red" | "unknown";

export type ArchHealthRow = {
  id: string;
  label: string;
  level: HealthLevel;
  detail: string;
  /** Where this reading came from. Nothing is unexplainable. */
  source: string;
  items: string[];
};

export const HEALTH_DOT: Record<HealthLevel, string> = {
  green: "🟢",
  amber: "🟡",
  red: "🔴",
  unknown: "⚪",
};

/**
 * Architectural Integrity Review. Reads only real signals: the registry, the
 * Decision Records, the version archive, and the components actually tagged on
 * this screen. Nothing is changed automatically — the Founder decides.
 */
export function architecturalIntegrityReview(taggedOnScreen: string[] = []): ArchHealthRow[] {
  const decisions = loadDecisions();
  const versions = loadVersions();

  // Duplicate components — two registry entries claiming the same purpose.
  const byPurpose = new Map<string, string[]>();
  BLUEPRINT_COMPONENTS.forEach((c) => {
    const key = c.purpose.trim().toLowerCase();
    byPurpose.set(key, [...(byPurpose.get(key) ?? []), c.label]);
  });
  const duplicates = Array.from(byPurpose.values()).filter((v) => v.length > 1).flat();

  // Route consistency — every connected system should resolve to a known component or a district.
  const known = new Set(BLUEPRINT_COMPONENTS.map((c) => c.label.toLowerCase()));
  const orphanEdges = BLUEPRINT_COMPONENTS.flatMap((c) =>
    c.connectedSystems
      .filter((s) => !known.has(s.toLowerCase()) && /workspace|daily|vault|search/i.test(s))
      .map((s) => `${c.label} → ${s}`),
  );

  // Untagged components — verified only for what this screen actually rendered.
  const seen = BLUEPRINT_COMPONENTS.filter((c) => taggedOnScreen.includes(c.id));

  // Blueprint coverage — specification + registry reference on every component.
  const uncovered = BLUEPRINT_COMPONENTS.filter((c) => !c.specification || c.registry.length === 0);

  // Registry compliance — approval provenance recorded.
  const noncompliant = BLUEPRINT_COMPONENTS.filter((c) => !c.lastApprovedBy || !c.lastModified);

  // Pending consolidations — merges/duplicates approved but never verified.
  const consolidations = decisions.filter(
    (d) => /merge|duplicate/i.test(d.action) && d.verification !== "verified",
  );

  // Construction queue — approved work awaiting verification (Principle 14).
  const queue = decisions.filter((d) => d.verification !== "verified");

  return [
    {
      id: "duplicates",
      label: "Duplicate Components",
      level: duplicates.length ? "amber" : "green",
      detail: duplicates.length
        ? `${duplicates.length} registry entries share a purpose`
        : "No component claims another component's purpose",
      source: "Blueprint registry purpose comparison",
      items: duplicates,
    },
    {
      id: "routes",
      label: "Route Consistency",
      level: orphanEdges.length ? "amber" : "green",
      detail: orphanEdges.length
        ? `${orphanEdges.length} connections point at a surface with no registry entry`
        : "Every internal connection resolves to a registered component",
      source: "Registry relationship resolution",
      items: orphanEdges,
    },
    {
      id: "tagged",
      label: "Untagged Components",
      level: taggedOnScreen.length === 0 ? "unknown" : seen.length === taggedOnScreen.length ? "green" : "amber",
      detail:
        taggedOnScreen.length === 0
          ? "Not verified — no blueprint tags were read on this screen yet."
          : `${seen.length} of ${taggedOnScreen.length} tagged nodes on this screen resolve to the registry`,
      source: "Live DOM read of data-blueprint on this screen",
      items: seen.map((c) => c.label),
    },
    {
      id: "coverage",
      label: "Blueprint Coverage",
      level: uncovered.length ? "amber" : "green",
      detail: uncovered.length
        ? `${uncovered.length} components lack a specification or registry reference`
        : `All ${BLUEPRINT_COMPONENTS.length} components carry a specification and a registry reference`,
      source: "Blueprint registry",
      items: uncovered.map((c) => c.label),
    },
    {
      id: "compliance",
      label: "Registry Compliance",
      level: noncompliant.length ? "amber" : "green",
      detail: noncompliant.length
        ? `${noncompliant.length} components have no recorded approval provenance`
        : "Every component records who approved it and when",
      source: "Blueprint registry provenance fields",
      items: noncompliant.map((c) => c.label),
    },
    {
      id: "consolidations",
      label: "Pending Consolidations",
      level: consolidations.length ? "amber" : "green",
      detail: consolidations.length
        ? `${consolidations.length} merge or duplicate decisions are not yet verified`
        : "No consolidation is waiting",
      source: "Decision Records",
      items: consolidations.map((d) => `${d.componentLabel} — ${d.action}`),
    },
    {
      id: "versions",
      label: "Version History",
      level: versions.length ? "green" : "unknown",
      detail: versions.length
        ? `${versions.length} restorable architecture versions archived`
        : "No version archived yet — the first approval creates one.",
      source: "Blueprint version archive",
      items: versions.slice(0, 6).map((v) => v.label),
    },
    {
      id: "queue",
      label: "Construction Queue",
      level: queue.length === 0 ? "green" : queue.length > 5 ? "red" : "amber",
      detail:
        queue.length === 0
          ? "Every approved Blueprint has been verified"
          : `${queue.length} approved Blueprint${queue.length > 1 ? "s are" : " is"} awaiting verification`,
      source: "Decision Records (Principle 14)",
      items: queue.slice(0, 8).map((d) => `${d.componentLabel} — ${d.action}`),
    },
  ];
}

export function integrityHeadline(rows: ArchHealthRow[]): string {
  const red = rows.filter((r) => r.level === "red").length;
  const amber = rows.filter((r) => r.level === "amber").length;
  const unknown = rows.filter((r) => r.level === "unknown").length;
  if (red) return `${red} architectural area${red > 1 ? "s need" : " needs"} action.`;
  if (amber) return `${amber} architectural area${amber > 1 ? "s are" : " is"} worth reviewing.`;
  if (unknown) return `Architecture is sound · ${unknown} reading${unknown > 1 ? "s" : ""} not verified yet.`;
  return "The architecture is healthy.";
}
