// FRASS-0518 — Platform Intelligence Engine.
//
// The Knowledge Vault remembers what members learn.
// The Repair History remembers what the platform learns.
// This is the third layer: it learns FROM the Repair History so the platform
// gets more reliable, more intuitive and easier to use over time.
//
// Founder principle: the best repair is the one that never becomes necessary.
//
// Pure analysis. No database, no side effects — it reads incidents and returns
// insight, so it can be reasoned about, tested, and trusted.

export type IntelligenceIncident = {
  id: string;
  category: string;
  severity: string;
  status: string;
  context_path: string | null;
  reported_text: string;
  root_cause: string | null;
  created_at: string;
  pattern_signature: string | null;
  resolution_mode: string | null;
  amendment_ref: string | null;
  /** Optional client hints captured at report time (never PII). */
  evidence?: Record<string, unknown> | null;
};

/**
 * Configurable thresholds. A pattern only becomes a recommendation once it has
 * genuinely repeated — Frassy never turns a single bad day into a directive.
 */
export type IntelligenceThresholds = {
  /** Times a signature must repeat before it is called recurring. */
  recurring: number;
  /** Times an area must appear before it is flagged as support-heavy. */
  supportHeavyArea: number;
  /** Repeats before Frassy recommends a product or UX change. */
  recommend: number;
  /** Repeats before Frassy recommends a constitutional amendment. */
  amendment: number;
  /** Repeats of the same onboarding step before it is called a blocker. */
  onboardingFriction: number;
  /** Days considered "this month". */
  windowDays: number;
};

export const DEFAULT_THRESHOLDS: IntelligenceThresholds = {
  recurring: 2,
  supportHeavyArea: 3,
  recommend: 3,
  amendment: 5,
  onboardingFriction: 3,
  windowDays: 30,
};

export type RecommendationKind =
  | "product_improvement"
  | "ux_improvement"
  | "documentation"
  | "constitutional_amendment"
  | "development_review";

export type Recommendation = {
  id: string;
  kind: RecommendationKind;
  /** everyday language, written for the Founder, not for an engineer. */
  title: string;
  why: string;
  /** What we would actually do. */
  proposal: string;
  occurrences: number;
  area: string | null;
  signature: string | null;
  priority: "high" | "medium" | "low";
};

export type RecurringIssue = {
  signature: string;
  label: string;
  category: string;
  area: string | null;
  occurrences: number;
  lastSeen: string;
  firstSeen: string;
  resolvedByAmendment: string | null;
  /** True when the last occurrence predates the amendment that addressed it. */
  eliminated: boolean;
};

export type AreaHealth = {
  area: string;
  incidents: number;
  escalations: number;
  /** 0-100. Higher is calmer. */
  stability: number;
};

export type TrendPoint = { week: string; incidents: number; escalations: number; auto: number };

export type PlatformIntelligence = {
  generatedAt: string;
  windowDays: number;
  totalIncidents: number;
  windowIncidents: number;
  topRecurring: RecurringIssue[];
  mostStable: AreaHealth[];
  supportHeavy: AreaHealth[];
  amendmentsThatWorked: Array<{ ref: string; issue: string; occurrencesBefore: number; sinceAmendment: number }>;
  trend: TrendPoint[];
  deploymentPattern: { after: number; total: number; note: string } | null;
  clientPattern: Array<{ client: string; incidents: number }>;
  onboardingFriction: Array<{ step: string; members: number }>;
  recommendations: Recommendation[];
  /** One honest line for the Founder Daily. */
  headline: string;
};

const AREA_LABELS: Record<string, string> = {
  "/room": "My Workspace",
  "/welcome-hall": "Welcome Hall",
  "/onboarding": "Onboarding",
  "/business-vaults": "Business Vaults",
  "/marketplace": "Marketplace",
  "/money-moves": "Money Moves",
  "/manufacturing": "Manufacturing Network",
  "/workspace": "Workspace tools",
  "/control-room": "Founder Console",
  "/shop": "Shop",
  "/pay": "Payments",
};

/** Turn a path into a human area name a Founder recognises without decoding URLs. */
export function areaOf(path: string | null): string | null {
  if (!path) return null;
  const clean = path.split("?")[0]!.replace(/\/+$/, "") || "/";
  if (clean === "/") return "Front door";
  for (const [prefix, label] of Object.entries(AREA_LABELS)) {
    if (clean === prefix || clean.startsWith(`${prefix}/`)) return label;
  }
  const first = clean.split("/").filter(Boolean)[0] ?? "";
  return first
    ? first.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Front door";
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7; // Monday-first
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function shortLabel(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 90 ? `${t.slice(0, 87)}…` : t;
}

const ONBOARDING_STEPS: Array<{ step: string; match: RegExp }> = [
  { step: "Creating an account", match: /sign ?up|create.*account|register/i },
  { step: "Signing in", match: /sign ?in|log ?in|password|verification code/i },
  { step: "Accepting the agreements", match: /agreement|terms|privacy|accept/i },
  { step: "Finding where to start", match: /where do i|can'?t find|how do i start|lost/i },
  { step: "Starting the Builder Journey", match: /onboarding|journey|welcome hall|get started/i },
  { step: "Setting up the Frass Card", match: /frass card|business card|profile photo/i },
];

function clientOf(ev: Record<string, unknown> | null | undefined): string | null {
  if (!ev) return null;
  const c = ev["client"];
  if (c && typeof c === "object") {
    const o = c as Record<string, unknown>;
    const browser = typeof o["browser"] === "string" ? o["browser"] : null;
    const device = typeof o["device"] === "string" ? o["device"] : null;
    if (browser || device) return [browser, device].filter(Boolean).join(" · ");
  }
  return null;
}

/**
 * Read the Repair History and return what the platform should learn from it.
 */
export function analyzePlatform(
  incidents: IntelligenceIncident[],
  thresholds: Partial<IntelligenceThresholds> = {},
): PlatformIntelligence {
  const T = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const now = Date.now();
  const cutoff = now - T.windowDays * 24 * 60 * 60 * 1000;
  const inWindow = incidents.filter((i) => new Date(i.created_at).getTime() >= cutoff);

  // ---- Recurring issues -----------------------------------------------
  const bySignature = new Map<string, IntelligenceIncident[]>();
  for (const i of incidents) {
    const sig = i.pattern_signature ?? `free:${i.category}`;
    const list = bySignature.get(sig) ?? [];
    list.push(i);
    bySignature.set(sig, list);
  }

  const recurring: RecurringIssue[] = [];
  for (const [signature, list] of bySignature) {
    if (list.length < T.recurring) continue;
    const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    const amendment = sorted.map((i) => i.amendment_ref).filter(Boolean).pop() ?? null;
    const amendedAt = amendment
      ? sorted.filter((i) => i.amendment_ref === amendment).pop()?.created_at ?? null
      : null;
    const after = amendedAt
      ? sorted.filter((i) => i.created_at > amendedAt).length
      : 0;
    recurring.push({
      signature,
      label: shortLabel(first.root_cause ?? first.reported_text),
      category: first.category,
      area: areaOf(last.context_path),
      occurrences: list.length,
      firstSeen: first.created_at,
      lastSeen: last.created_at,
      resolvedByAmendment: amendment,
      eliminated: Boolean(amendment) && after === 0,
    });
  }
  recurring.sort((a, b) => b.occurrences - a.occurrences || b.lastSeen.localeCompare(a.lastSeen));

  // ---- Area health -----------------------------------------------------
  const byArea = new Map<string, { incidents: number; escalations: number }>();
  for (const i of incidents) {
    const area = areaOf(i.context_path) ?? "Unattributed";
    const cur = byArea.get(area) ?? { incidents: 0, escalations: 0 };
    cur.incidents += 1;
    if (i.status === "escalated") cur.escalations += 1;
    byArea.set(area, cur);
  }
  const worst = Math.max(1, ...[...byArea.values()].map((v) => v.incidents));
  const areas: AreaHealth[] = [...byArea.entries()]
    .filter(([area]) => area !== "Unattributed")
    .map(([area, v]) => ({
      area,
      incidents: v.incidents,
      escalations: v.escalations,
      stability: Math.max(
        0,
        Math.round(100 - (v.incidents / worst) * 60 - (v.escalations / Math.max(1, v.incidents)) * 40),
      ),
    }));
  const mostStable = [...areas].sort((a, b) => b.stability - a.stability).slice(0, 5);
  const supportHeavy = [...areas]
    .filter((a) => a.incidents >= T.supportHeavyArea)
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 5);

  // ---- Amendments that actually eliminated a problem -------------------
  const amendmentsThatWorked = recurring
    .filter((r) => r.eliminated && r.resolvedByAmendment)
    .map((r) => ({
      ref: r.resolvedByAmendment!,
      issue: r.label,
      occurrencesBefore: r.occurrences,
      sinceAmendment: 0,
    }));

  // ---- Trend over time --------------------------------------------------
  const byWeek = new Map<string, TrendPoint>();
  for (const i of incidents) {
    const key = weekKey(i.created_at);
    const cur = byWeek.get(key) ?? { week: key, incidents: 0, escalations: 0, auto: 0 };
    cur.incidents += 1;
    if (i.status === "escalated") cur.escalations += 1;
    if (i.status === "auto_repaired") cur.auto += 1;
    byWeek.set(key, cur);
  }
  const trend = [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week)).slice(-8);

  // ---- Deployment correlation ------------------------------------------
  const deployRelated = incidents.filter(
    (i) => i.category === "deployment" || i.category === "routing" || i.category === "cache",
  ).length;
  const deploymentPattern =
    incidents.length > 0 && deployRelated >= T.recommend
      ? {
          after: deployRelated,
          total: incidents.length,
          note:
            deployRelated / incidents.length > 0.4
              ? "Most reported problems look like they arrive with a release. That points at the deployment checklist, not at members."
              : "A steady share of reports arrive with releases. Worth a smoke test on the affected pages before each publish.",
        }
      : null;

  // ---- Browser / device pattern -----------------------------------------
  const byClient = new Map<string, number>();
  for (const i of incidents) {
    const c = clientOf(i.evidence);
    if (c) byClient.set(c, (byClient.get(c) ?? 0) + 1);
  }
  const clientPattern = [...byClient.entries()]
    .map(([client, count]) => ({ client, incidents: count }))
    .filter((c) => c.incidents >= T.recurring)
    .sort((a, b) => b.incidents - a.incidents)
    .slice(0, 5);

  // ---- Onboarding friction ----------------------------------------------
  const stepCounts = new Map<string, number>();
  for (const i of incidents) {
    for (const { step, match } of ONBOARDING_STEPS) {
      if (match.test(i.reported_text)) stepCounts.set(step, (stepCounts.get(step) ?? 0) + 1);
    }
  }
  const onboardingFriction = [...stepCounts.entries()]
    .map(([step, members]) => ({ step, members }))
    .filter((s) => s.members >= T.onboardingFriction)
    .sort((a, b) => b.members - a.members);

  // ---- Recommendations ---------------------------------------------------
  const recommendations: Recommendation[] = [];

  for (const r of recurring) {
    if (r.eliminated) continue;
    if (r.occurrences >= T.amendment) {
      recommendations.push({
        id: `amend:${r.signature}`,
        kind: "constitutional_amendment",
        title: `Write a rule that ends "${r.label}"`,
        why: `This has come back ${r.occurrences} times${r.area ? ` in ${r.area}` : ""}. Repairing it again only buys time.`,
        proposal:
          "Add a constitutional amendment so the platform can never re-enter this state, then close the recurring incidents against it.",
        occurrences: r.occurrences,
        area: r.area,
        signature: r.signature,
        priority: "high",
      });
    } else if (r.occurrences >= T.recommend) {
      recommendations.push({
        id: `fix:${r.signature}`,
        kind: r.category === "navigation" || r.category === "preferences" ? "ux_improvement" : "product_improvement",
        title: `Fix the cause of "${r.label}"`,
        why: `Seen ${r.occurrences} times${r.area ? ` in ${r.area}` : ""}. Members keep meeting the same wall.`,
        proposal:
          r.category === "navigation"
            ? "Frassy should carry members there directly instead of them searching for it."
            : "Repair the underlying cause in the product so the safe repair stops being needed.",
        occurrences: r.occurrences,
        area: r.area,
        signature: r.signature,
        priority: "medium",
      });
    }
  }

  for (const step of onboardingFriction) {
    recommendations.push({
      id: `onboarding:${step.step}`,
      kind: "ux_improvement",
      title: `Make "${step.step}" easier`,
      why: `${step.members} members got stuck at the same point in their first steps.`,
      proposal:
        "Simplify the step, or have Frassy walk the member through it in Simplified View instead of leaving them to work it out.",
      occurrences: step.members,
      area: "Onboarding",
      signature: null,
      priority: "high",
    });
  }

  for (const area of supportHeavy.slice(0, 2)) {
    recommendations.push({
      id: `docs:${area.area}`,
      kind: area.escalations > area.incidents / 2 ? "development_review" : "documentation",
      title:
        area.escalations > area.incidents / 2
          ? `Book a development review of ${area.area}`
          : `Explain ${area.area} better before members ask`,
      why: `${area.area} produced ${area.incidents} reports${area.escalations ? `, ${area.escalations} of them needing engineering` : ""}.`,
      proposal:
        area.escalations > area.incidents / 2
          ? "The repairs are not holding here. Review the area as a whole rather than patching each report."
          : "Give Frassy a clear explanation for this area so the question is answered before it becomes a report.",
      occurrences: area.incidents,
      area: area.area,
      signature: null,
      priority: area.escalations > area.incidents / 2 ? "high" : "low",
    });
  }

  if (deploymentPattern && deploymentPattern.after >= T.recommend) {
    recommendations.push({
      id: "deployment:checklist",
      kind: "development_review",
      title: "Tighten the pre-publish checks",
      why: `${deploymentPattern.after} of ${deploymentPattern.total} reports look release-related.`,
      proposal:
        "Extend the deployment checklist smoke tests to cover the pages that keep breaking, before the publish rather than after.",
      occurrences: deploymentPattern.after,
      area: "Deployment",
      signature: null,
      priority: "high",
    });
  }

  for (const c of clientPattern) {
    recommendations.push({
      id: `client:${c.client}`,
      kind: "development_review",
      title: `Test Frass on ${c.client}`,
      why: `${c.incidents} reports came from the same browser or device.`,
      proposal: "Reproduce on that browser or device specifically — the platform may be fine everywhere else.",
      occurrences: c.incidents,
      area: null,
      signature: null,
      priority: "medium",
    });
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  recommendations.sort(
    (a, b) => order[a.priority] - order[b.priority] || b.occurrences - a.occurrences,
  );

  const headline = (() => {
    if (incidents.length === 0) return "Nothing has needed repair yet. Quiet is a good result.";
    const top = recurring.find((r) => !r.eliminated);
    if (top && top.occurrences >= T.recommend) {
      return `${top.occurrences} members hit the same problem${top.area ? ` in ${top.area}` : ""}. Worth fixing the cause, not the symptom.`;
    }
    if (inWindow.length === 0) return "No new reports this month. The platform is holding steady.";
    return `${inWindow.length} report${inWindow.length === 1 ? "" : "s"} this month, ${
      inWindow.filter((i) => i.status === "auto_repaired").length
    } repaired without you.`;
  })();

  return {
    generatedAt: new Date().toISOString(),
    windowDays: T.windowDays,
    totalIncidents: incidents.length,
    windowIncidents: inWindow.length,
    topRecurring: recurring.slice(0, 6),
    mostStable,
    supportHeavy,
    amendmentsThatWorked,
    trend,
    deploymentPattern,
    clientPattern,
    onboardingFriction,
    recommendations: recommendations.slice(0, 8),
    headline,
  };
}
