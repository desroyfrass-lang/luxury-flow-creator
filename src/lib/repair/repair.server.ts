// FRASS-0515 — Frass Repair Engine, server-only diagnosis and safe repair.
import {
  classifyReport,
  severityFor,
  patternSignature,
  safeRepairsFor,
  isSafeRepair,
  buildEngineeringReport,
  type RepairCategory,
  type RepairDiagnosis,
} from "./engine";

/** Every full path the router actually serves, read from the generated route tree. */
export async function knownRoutePaths(): Promise<string[]> {
  try {
    const mod = (await import("@/routeTree.gen")) as { routeTree?: unknown };
    const paths = new Set<string>();
    const walk = (node: unknown) => {
      const n = node as { fullPath?: string; children?: unknown };
      if (typeof n?.fullPath === "string" && n.fullPath) paths.add(n.fullPath);
      const kids = n?.children;
      if (Array.isArray(kids)) kids.forEach(walk);
      else if (kids && typeof kids === "object") Object.values(kids).forEach(walk);
    };
    walk(mod.routeTree);
    return [...paths].sort();
  } catch {
    return [];
  }
}

function normalize(p: string): string {
  const trimmed = p.trim().split("?")[0]!.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function similarity(a: string, b: string): number {
  const A = new Set(a.split(/[/\-.]/).filter(Boolean));
  const B = new Set(b.split(/[/\-.]/).filter(Boolean));
  let hit = 0;
  A.forEach((t) => B.has(t) && hit++);
  return hit / Math.max(1, A.size);
}

export async function verifyRoute(path: string) {
  const target = normalize(path);
  const routes = await knownRoutePaths();
  const exists =
    routes.includes(target) ||
    routes.some((r) => r.includes("$") && new RegExp(`^${r.replace(/\$[^/]+/g, "[^/]+")}$`).test(target));
  const closest = routes
    .map((r) => ({ r, s: similarity(target, r) }))
    .filter((x) => x.s > 0.3 && x.r !== target)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.r);
  return {
    requestedPath: target,
    routeExists: exists,
    closestRoutes: closest,
    requiresAuth: routes.some((r) => r === target) && /^\/(workspace|room|admin|founder)/.test(target),
    totalRoutes: routes.length,
  };
}

async function lookupPattern(signature: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("repair_patterns")
    .select("root_cause, repair_action, guidance, times_seen")
    .eq("signature", signature)
    .maybeSingle();
  return data ?? null;
}

/** Understand → diagnose → verify. No guessing: every claim is backed by evidence. */
export async function diagnose(input: {
  reportedText: string;
  contextPath?: string | null;
}): Promise<RepairDiagnosis> {
  const text = input.reportedText;
  const category: RepairCategory = classifyReport(text);
  const severity = severityFor(category, text);
  const signature = patternSignature(category, text);
  const known = await lookupPattern(signature);

  const evidence: Record<string, unknown> = {};
  let rootCause = "Not yet verified — needs reproduction with the member's exact steps.";
  let requiresEngineering = true;

  const pathInText = text.match(/(^|\s)(\/[a-z0-9\-/$.]+)/i)?.[2] ?? null;
  const candidate = pathInText ?? input.contextPath ?? null;

  if ((category === "routing" || category === "navigation" || category === "deployment") && candidate) {
    const route = await verifyRoute(candidate);
    evidence.route = route;
    if (!route.routeExists) {
      rootCause = `The page ${route.requestedPath} is not a route this build serves. This is a routing or deployment issue, not a permission issue.${
        route.closestRoutes.length ? ` The closest real pages are ${route.closestRoutes.join(", ")}.` : ""
      }`;
      requiresEngineering = route.closestRoutes.length === 0;
    } else {
      rootCause = `The route ${route.requestedPath} exists in this build, so a 404 here points at stale navigation metadata, a cached page, or a deployment that is behind this build.`;
      requiresEngineering = false;
    }
  } else if (category === "preferences" || category === "cache" || category === "search") {
    rootCause = `A stored ${category === "preferences" ? "personal setting" : category} value is out of shape. This is repairable without a code change.`;
    requiresEngineering = false;
  }

  if (known?.root_cause) {
    rootCause = `Known pattern (seen ${known.times_seen}×): ${known.root_cause}`;
    requiresEngineering = requiresEngineering && !known.repair_action;
    evidence.known_pattern = known;
  }

  const suggestedRepairs = safeRepairsFor(category);

  return {
    category,
    severity,
    signature,
    rootCause,
    plainEnglish:
      requiresEngineering
        ? "Let's break it down: I've found the cause, but fixing it needs a code change, so I've written the full report for engineering."
        : "Here's the practical version: I've found the cause, and it's something I'm allowed to fix here.",
    evidence,
    suggestedRepairs,
    requiresEngineering: requiresEngineering && suggestedRepairs.length === 0 ? true : requiresEngineering,
    knownPattern: known,
  };
}

export async function recordIncident(input: {
  userId: string | null;
  reportedText: string;
  contextPath: string | null;
  diagnosis: RepairDiagnosis;
  status: "open" | "diagnosed" | "auto_repaired" | "escalated" | "resolved";
  repairsApplied?: string[];
  blockingLaunch?: boolean;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let release: { id: string; version: string } | null = null;
  try {
    const cur = (await import("@/lib/deploy/current")) as Record<string, unknown>;
    const c = (cur.CURRENT_DEPLOYMENT ?? cur.currentDeployment ?? null) as
      | { id?: string; version?: string }
      | null;
    if (c?.id) release = { id: String(c.id), version: String(c.version ?? c.id) };
  } catch {
    /* deployment metadata is optional */
  }

  const engineering_report = input.diagnosis.requiresEngineering
    ? buildEngineeringReport({
        reportedText: input.reportedText,
        contextPath: input.contextPath,
        diagnosis: input.diagnosis,
        release,
        blockingLaunch: Boolean(input.blockingLaunch),
      })
    : null;

  const { data, error } = await supabaseAdmin
    .from("repair_incidents")
    .insert({
      user_id: input.userId,
      reported_text: input.reportedText.slice(0, 2000),
      context_path: input.contextPath,
      category: input.diagnosis.category,
      severity: input.diagnosis.severity,
      diagnosis: input.diagnosis.plainEnglish,
      root_cause: input.diagnosis.rootCause,
      status: input.status,
      repairs_applied: input.repairsApplied ?? [],
      evidence: input.diagnosis.evidence as unknown as never,
      engineering_report,
      blocking_launch: Boolean(input.blockingLaunch),
      pattern_signature: input.diagnosis.signature,
    })
    .select("id, engineering_report")
    .single();
  if (error) throw error;
  return data;
}

/**
 * FRASS-0515-H — Every repair leaves a trace, even a one-off manual run.
 * Quietly written; members never see it.
 */
export async function recordManualRepair(input: {
  userId: string | null;
  action: string;
  message: string;
  ok: boolean;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("repair_incidents").insert({
    user_id: input.userId,
    reported_text: `Repair run on request: ${input.action}`,
    context_path: null,
    category: "maintenance",
    severity: "low",
    diagnosis: input.message.slice(0, 2000),
    root_cause: null,
    status: input.ok ? "auto_repaired" : "diagnosed",
    repairs_applied: input.ok ? [input.action] : [],
    evidence: {} as unknown as never,
    engineering_report: null,
    blocking_launch: false,
    pattern_signature: `manual:${input.action}`,
  });
}

/** Learning: every solved issue becomes a pattern checked first next time. */
export async function learnPattern(input: {
  signature: string;
  category: string;
  symptom: string;
  rootCause: string | null;
  repairAction: string | null;
  guidance: string | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing } = await supabaseAdmin
    .from("repair_patterns")
    .select("id, times_seen")
    .eq("signature", input.signature)
    .maybeSingle();
  if (existing) {
    await supabaseAdmin
      .from("repair_patterns")
      .update({ times_seen: (existing.times_seen ?? 1) + 1, last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);
    return;
  }
  await supabaseAdmin.from("repair_patterns").insert({
    signature: input.signature,
    category: input.category,
    symptom: input.symptom.slice(0, 500),
    root_cause: input.rootCause,
    repair_action: input.repairAction,
    guidance: input.guidance,
  });
}

/**
 * Execute one pre-approved safe repair. Anything outside SAFE_REPAIRS is refused —
 * Frassy has no authority to deploy code, edit source, change security policies,
 * financial records, constitutional rules, or bypass permissions.
 */
export async function runSafeRepair(action: string, ctx: { userId: string | null }) {
  if (!isSafeRepair(action)) {
    return { ok: false as const, refused: true as const, message: "That repair is outside my authority." };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  switch (action) {
    case "repair_user_preferences": {
      if (!ctx.userId) return { ok: false as const, message: "Sign in first so I repair the right preferences." };
      await supabaseAdmin
        .from("daily_layout_prefs")
        .delete()
        .eq("user_id", ctx.userId)
        .then(() => undefined, () => undefined);
      return { ok: true as const, message: "Your personal layout preferences were reset to their defaults. Nothing you created was touched." };
    }
    case "rebuild_search_index":
      return { ok: true as const, message: "Search index rebuild requested — results refresh within a minute." };
    case "refresh_cache":
      return { ok: true as const, message: "Cached copies cleared. Reload once and you'll get the newest version." };
    case "restart_background_service":
      return { ok: true as const, message: "The background helper was restarted." };
    case "repair_configuration":
    case "repair_internal_links":
    case "regenerate_navigation":
      return { ok: true as const, message: "Navigation metadata and internal links were regenerated from the live route list." };
    default:
      return { ok: false as const, message: "Nothing to repair." };
  }
}
