// FRASS-0200 — Principle 12: Impact Forecast.
//
// Before any Blueprint is approved, Frassy answers one final question:
// "What else changes because of this?"
//
// This module produces the Architectural Impact Report — components, pages,
// roles, mobile, accessibility, performance, maintenance and testing — so the
// Founder sees the ripple effects before any work begins.

import {
  BLUEPRINT_COMPONENTS,
  relationshipMap,
  type BlueprintComponent,
} from "@/lib/construction/blueprint-registry";

export type ImpactLevel = "none" | "low" | "moderate" | "high";

export type ImpactLine = {
  label: string;
  level: ImpactLevel;
  detail: string;
};

export type ArchitecturalImpactReport = {
  question: string;
  componentsAffected: string[];
  pagesAffected: string[];
  rolesAffected: string[];
  untouched: string[];
  lines: ImpactLine[];
  testCount: number;
  testing: string[];
  maintenance: string;
  recommendation: string;
};

/** Where each blueprinted component actually appears in the platform. */
const PAGES: Record<string, string[]> = {
  "workspace-navigation": ["My Workspace", "The Daily", "Founder Dashboard", "Projects", "Vault"],
  "workspace-modes": ["My Workspace"],
  "workspace-projects": ["My Workspace", "The Daily"],
  "workspace-conversation": ["My Workspace", "Founder Dashboard"],
  "workspace-composer": ["My Workspace", "Founder Dashboard"],
  "workspace-panel": ["My Workspace"],
  daily: ["The Daily", "My Workspace", "Founder Dashboard"],
  "daily-priorities": ["The Daily", "My Workspace"],
  "founder-dashboard": ["Founder Dashboard"],
  "site-navigation": ["Every public page", "Districts", "Marketplace", "Kids World", "Luxury House"],
  "frassy-companion": ["Every page"],
  "development-credits": ["Founder Dashboard", "Construction Mode"],
  "platform-status": ["Founder Dashboard"],
};

const PUBLIC_SURFACES = ["site-navigation", "frassy-companion"];

function unique(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean)));
}

function levelFromCount(n: number): ImpactLevel {
  if (n === 0) return "none";
  if (n <= 2) return "low";
  if (n <= 5) return "moderate";
  return "high";
}

/** The Architectural Impact Report for one proposed change. */
export function impactReport(
  component: BlueprintComponent,
  action: string,
): ArchitecturalImpactReport {
  const a = action.toLowerCase();
  const rel = relationshipMap(component);

  const componentsAffected = unique([
    component.label,
    ...rel.downstream.map((c) => c.label),
    ...(a === "merge" || a === "duplicate" || a.startsWith("connect")
      ? rel.siblings.map((c) => c.label)
      : []),
  ]);

  const pagesAffected = unique(
    componentsAffected.flatMap((label) => {
      const match = BLUEPRINT_COMPONENTS.find((c) => c.label === label);
      return match ? (PAGES[match.id] ?? []) : [];
    }),
  );

  const rolesAffected = unique([
    ...component.usersAffected,
    ...rel.downstream.flatMap((c) => c.usersAffected),
  ]);

  const touchesPublic =
    PUBLIC_SURFACES.includes(component.id) ||
    rel.downstream.some((c) => PUBLIC_SURFACES.includes(c.id));

  const untouched = touchesPublic
    ? []
    : ["Public shopping", "Checkout", "Kids World", "Marketplace storefronts"];

  // ── Ripple analysis ─────────────────────────────────────────────────────
  const isLayout = a.startsWith("move") || ["small", "medium", "large", "full width", "automatic", "new panel", "new section"].includes(a);
  const isVisibility = ["hide", "founder only", "role based", "always visible", "collapse", "expand", "docked", "floating", "pin"].includes(a);
  const isStyle = ["background", "spacing", "typography", "lighting", "animation", "motion", "shape", "cards", "glass", "materials"].includes(a);
  const isStructural = ["merge", "duplicate", "archive", "rename"].includes(a) || a.startsWith("connect") || a === "disconnect";

  const lines: ImpactLine[] = [
    {
      label: "Components affected",
      level: levelFromCount(componentsAffected.length - 1),
      detail:
        componentsAffected.length > 1
          ? `${componentsAffected.length} connected components: ${componentsAffected.join(", ")}.`
          : `Only ${component.label} itself. Nothing else depends on it.`,
    },
    {
      label: "Pages affected",
      level: levelFromCount(pagesAffected.length),
      detail: pagesAffected.length ? pagesAffected.join(", ") + "." : "No other page renders this component.",
    },
    {
      label: "Roles affected",
      level: levelFromCount(rolesAffected.length),
      detail: rolesAffected.join(", ") + ".",
    },
    {
      label: "Mobile impact",
      level: isLayout ? "high" : isVisibility ? "moderate" : isStyle ? "low" : "low",
      detail: isLayout
        ? "Layout changes land hardest on small screens — the panel settles to a single column and the order you set on desktop becomes the reading order on mobile. Preview at phone width before approving."
        : isVisibility
          ? "Visibility rules change what a phone user can reach; confirm there is still a path to this surface from the mobile navigation."
          : "Presentation only. Verify contrast and touch targets survive at phone width.",
    },
    {
      label: "Accessibility impact",
      level: isVisibility || isStructural ? "moderate" : isStyle ? "low" : "low",
      detail: isVisibility || isStructural
        ? "Changing what exists changes the keyboard and screen-reader path. Headings must stay in order, focus must never land on a hidden element, and every new control needs a name."
        : isStyle
          ? "Colour, motion and type changes must hold 4.5:1 contrast and respect reduced-motion preferences."
          : "Keep heading order, focus order and control labels intact.",
    },
    {
      label: "Performance impact",
      level: isStructural ? "moderate" : isStyle && ["animation", "motion", "glass", "lighting"].includes(a) ? "moderate" : "low",
      detail: isStructural
        ? "New connections mean new data the surface must wait for. Load it beside the existing request, never in a second round-trip."
        : ["animation", "motion", "glass", "lighting"].includes(a)
          ? "Animation and glass effects cost paint time on older phones — keep them transform-based and honour reduced motion."
          : "Negligible. No new data and no new work at render.",
    },
  ];

  // ── Testing recommendations ─────────────────────────────────────────────
  const testing = unique([
    `${component.label} renders and behaves correctly in its own surface`,
    ...pagesAffected.slice(0, 4).map((p) => `${p} still loads and looks right`),
    ...rolesAffected.slice(0, 4).map((r) => `${r} sees the correct version`),
    "Phone width — single column, nothing clipped",
    "Keyboard only — reach and operate the component",
    "Screen reader — labels and heading order",
    ...(isStructural ? ["No duplicate surface was created", "Existing links still resolve"] : []),
    ...(untouched.length ? ["Public shopping and checkout are unchanged"] : []),
  ]);

  const maintenance = isStructural
    ? "This change alters the shape of the architecture, not just its appearance — every future change to the connected systems must respect it. Record it in the registry so the next decision inherits the reasoning."
    : isLayout || isVisibility
      ? "Layout and visibility rules drift over time. Keep the rule in one place so a future change does not need to be repeated in several surfaces."
      : "Low maintenance. Presentation lives in the design tokens, so future themes inherit it automatically.";

  // ── Recommendation — sequence the work to avoid duplication ─────────────
  const companion = rel.downstream[0] ?? rel.siblings[0];
  const recommendation = companion
    ? `Implement together with ${companion.label} — it renders on the same surfaces, so doing both at once avoids duplicate work and a second round of testing.`
    : componentsAffected.length > 3
      ? "Sequence this after the connected components are settled; changing a widely-shared surface twice costs more than doing it once."
      : "Self-contained. This can be implemented on its own without waiting for anything else.";

  return {
    question: "What else changes because of this?",
    componentsAffected,
    pagesAffected,
    rolesAffected,
    untouched,
    lines,
    testCount: testing.length,
    testing,
    maintenance,
    recommendation,
  };
}

/** One-line executive summary, for Frassy's spoken and written replies. */
export function impactSummary(report: ArchitecturalImpactReport, credits?: { min: number; max: number }): string {
  const parts = [
    `Affects ${report.rolesAffected.join(", ")}.`,
    `Updates ${report.componentsAffected.length} connected component${report.componentsAffected.length === 1 ? "" : "s"}.`,
    `Requires ${report.testCount} interaction test${report.testCount === 1 ? "" : "s"}.`,
  ];
  if (report.untouched.length) parts.push("No impact on public shopping.");
  if (credits) parts.push(`Estimated credit range: ${credits.min}–${credits.max}.`);
  parts.push(`Recommendation: ${report.recommendation}`);
  return parts.join(" ");
}
