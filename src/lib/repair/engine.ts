// FRASS-0515 — Frass Repair Engine.
//
// Frassy is the first-line support engineer of Frass. She understands, diagnoses,
// verifies, repairs what is SAFE and pre-approved, confirms, and escalates with a
// complete engineering report when a code change or deployment is required.
//
// She never guesses, never edits source code, never deploys, never touches
// security policies, financial records, constitutional rules or permissions.

export type RepairCategory =
  | "routing"
  | "deployment"
  | "permission"
  | "data"
  | "preferences"
  | "navigation"
  | "search"
  | "cache"
  | "unknown";

export type RepairSeverity = "low" | "medium" | "high" | "critical";

export type RepairActionId =
  | "refresh_cache"
  | "rebuild_search_index"
  | "restart_background_service"
  | "repair_configuration"
  | "repair_internal_links"
  | "regenerate_navigation"
  | "repair_user_preferences";

export type SafeRepair = {
  id: RepairActionId;
  label: string;
  /** Plain English, member-facing. */
  plain: string;
  categories: RepairCategory[];
  /** Requires the caller to be the owner of the data being repaired. */
  scope: "member" | "platform";
};

/** The complete, closed list of repairs Frassy may perform on her own. */
export const SAFE_REPAIRS: SafeRepair[] = [
  {
    id: "refresh_cache",
    label: "Refresh caches",
    plain: "Clear the stale copy of a page so the newest version loads.",
    categories: ["cache", "deployment", "navigation", "routing"],
    scope: "platform",
  },
  {
    id: "rebuild_search_index",
    label: "Rebuild search index",
    plain: "Re-file everything so search can find it again.",
    categories: ["search", "data"],
    scope: "platform",
  },
  {
    id: "restart_background_service",
    label: "Restart a non-critical background service",
    plain: "Switch a background helper off and on again.",
    categories: ["data", "search", "cache"],
    scope: "platform",
  },
  {
    id: "repair_configuration",
    label: "Repair a configuration entry",
    plain: "Put a setting back to a known-good value.",
    categories: ["navigation", "routing", "preferences"],
    scope: "platform",
  },
  {
    id: "repair_internal_links",
    label: "Correct broken internal links",
    plain: "Point links that lead nowhere back at the real page.",
    categories: ["navigation", "routing"],
    scope: "platform",
  },
  {
    id: "regenerate_navigation",
    label: "Regenerate navigation metadata",
    plain: "Rebuild the menu so every room appears where it should.",
    categories: ["navigation", "routing"],
    scope: "platform",
  },
  {
    id: "repair_user_preferences",
    label: "Repair corrupted preferences",
    plain: "Reset a broken personal setting to its default without touching your work.",
    categories: ["preferences", "data"],
    scope: "member",
  },
];

/** Actions that are permanently outside Frassy's repair authority. */
export const REPAIR_FORBIDDEN = [
  "Deploy production code",
  "Edit source code",
  "Change constitutional rules",
  "Modify security policies",
  "Change financial records",
  "Bypass permissions",
] as const;

export function safeRepairsFor(category: RepairCategory): SafeRepair[] {
  return SAFE_REPAIRS.filter((r) => r.categories.includes(category));
}

export function isSafeRepair(id: string): id is RepairActionId {
  return SAFE_REPAIRS.some((r) => r.id === id);
}

const CATEGORY_HINTS: Array<{ category: RepairCategory; patterns: RegExp[] }> = [
  { category: "routing", patterns: [/404/i, /not found/i, /page (is )?missing/i, /broken link/i, /dead link/i] },
  { category: "deployment", patterns: [/white screen/i, /black screen/i, /blank page/i, /didn'?t load/i, /something went wrong/i, /500/] },
  { category: "permission", patterns: [/forbidden/i, /unauthor/i, /access denied/i, /can'?t (see|open|access)/i, /403/] },
  { category: "search", patterns: [/search/i, /can'?t find/i, /no results/i] },
  { category: "preferences", patterns: [/settings/i, /preference/i, /layout/i, /theme/i] },
  { category: "navigation", patterns: [/menu/i, /navigation/i, /nav bar/i, /tab/i] },
  { category: "data", patterns: [/missing data/i, /didn'?t save/i, /not saving/i, /disappeared/i, /empty/i] },
  { category: "cache", patterns: [/old version/i, /stale/i, /not updating/i, /cached/i] },
];

export function classifyReport(text: string): RepairCategory {
  for (const hint of CATEGORY_HINTS) {
    if (hint.patterns.some((p) => p.test(text))) return hint.category;
  }
  return "unknown";
}

export function severityFor(category: RepairCategory, text: string): RepairSeverity {
  if (/payment|checkout|payout|money|charged|sign ?in|log ?in|password/i.test(text)) return "critical";
  if (category === "deployment" || category === "permission") return "high";
  if (category === "routing" || category === "data") return "medium";
  return "low";
}

/** Stable fingerprint used to recognise a repeat of a known issue. */
export function patternSignature(category: RepairCategory, text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8)
    .sort()
    .join("-");
  return `${category}:${words}`.slice(0, 180);
}

export type RouteEvidence = {
  requestedPath: string | null;
  routeExists: boolean;
  closestRoutes: string[];
  requiresAuth: boolean;
};

export type RepairDiagnosis = {
  category: RepairCategory;
  severity: RepairSeverity;
  signature: string;
  rootCause: string;
  plainEnglish: string;
  evidence: Record<string, unknown>;
  suggestedRepairs: SafeRepair[];
  requiresEngineering: boolean;
  knownPattern: {
    root_cause: string | null;
    repair_action: string | null;
    guidance: string | null;
    times_seen: number;
  } | null;
};

/** A complete, ready-to-send engineering ticket — no member repeats themselves. */
export function buildEngineeringReport(input: {
  reportedText: string;
  contextPath: string | null;
  diagnosis: RepairDiagnosis;
  release?: { id: string; version: string } | null;
  blockingLaunch: boolean;
}): string {
  const d = input.diagnosis;
  const files = likelyFiles(d, input.contextPath);
  return [
    `FRASS REPAIR ENGINE — ENGINEERING REPORT`,
    ``,
    `Reported: "${input.reportedText.trim()}"`,
    `Where: ${input.contextPath ?? "unknown"}`,
    `Category: ${d.category}`,
    `Severity: ${d.severity}`,
    `Blocking launch: ${input.blockingLaunch ? "YES" : "no"}`,
    input.release ? `Release under observation: ${input.release.version} (${input.release.id})` : ``,
    ``,
    `ROOT CAUSE`,
    d.rootCause,
    ``,
    `EVIDENCE`,
    ...Object.entries(d.evidence).map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`),
    ``,
    `FILES LIKELY AFFECTED`,
    ...files.map((f) => `- ${f}`),
    ``,
    `RECOMMENDED FIX`,
    recommendedFix(d),
    ``,
    `REPAIR AUTHORITY`,
    d.requiresEngineering
      ? `Outside Frassy's authority — requires a source change and a deployment (FRASS-0502-D gate applies).`
      : `Inside Frassy's authority — safe repair available: ${d.suggestedRepairs.map((r) => r.label).join(", ")}.`,
  ]
    .filter((l) => l !== ``ateNever)
    .join("\n");
}

function recommendedFix(d: RepairDiagnosis): string {
  switch (d.category) {
    case "routing":
      return "Confirm the route file exists under src/routes, correct the link target, and regenerate routing metadata. If the route exists in preview but not production, redeploy.";
    case "deployment":
      return "Check worker/SSR logs for the failing module, reproduce against a production build, then redeploy through the deployment gate.";
    case "permission":
      return "Review the RLS policies and GRANTs for the affected table, and the route guard for the affected page.";
    case "data":
      return "Verify the write path and its server function, then confirm the record exists before adjusting the UI.";
    case "preferences":
      return "Reset the stored preference to its default shape and add a validator so a bad value cannot be written again.";
    case "search":
      return "Rebuild the search index and confirm the source records are present.";
    case "navigation":
      return "Regenerate navigation metadata and correct the broken destination.";
    case "cache":
      return "Invalidate the cached response and confirm the fresh version loads.";
    default:
      return "Reproduce the issue with the member's exact steps, capture console and server logs, then diagnose.";
  }
}

function likelyFiles(d: RepairDiagnosis, path: string | null): string[] {
  const out: string[] = [];
  if (path) out.push(`src/routes${path === "/" ? "/index" : path.replace(/\/$/, "")}.tsx`);
  switch (d.category) {
    case "routing":
    case "navigation":
      out.push("src/routeTree.gen.ts (generated)", "src/lib/districts.ts", "src/components/gateway-nav.tsx");
      break;
    case "deployment":
      out.push("vite.config.ts", "src/server.ts", "src/lib/deploy/current.ts");
      break;
    case "permission":
      out.push("src/integrations/supabase/auth-middleware.ts", "supabase/migrations (RLS policies)");
      break;
    case "preferences":
      out.push("src/hooks/use-frassy-prefs.ts");
      break;
    default:
      break;
  }
  return [...new Set(out)];
}
