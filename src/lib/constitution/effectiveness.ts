// FRASS-0518-A — Constitution Effectiveness Review.
//
// Platform Intelligence learns from technical issues. This layer learns from
// our own decisions. For every amendment it answers the six questions the
// Founder asked:
//
//   1. Was this amendment implemented?
//   2. Did it reduce the intended issue?
//   3. Did it create unintended consequences?
//   4. How many support incidents happened before it?
//   5. How many happened after?
//   6. Should it be revised, expanded or retired?
//
// Pure analysis: incidents in, evidence out. It never changes the Constitution
// — it only tells the truth about it. The Founder alone amends.
import { AMENDMENTS, type Amendment } from "./registry";
import { areaOf, type IntelligenceIncident } from "@/lib/repair/intelligence";

const DAY = 24 * 60 * 60 * 1000;
/** Below this many incidents before implementation we refuse to claim a result. */
const MIN_EVIDENCE = 3;

export type EffectivenessVerdict =
  | "not_implemented"
  | "insufficient_evidence"
  | "effective"
  | "holding"
  | "under_review"
  | "recurring_issues";

export type EffectivenessAction = "keep" | "expand" | "revise" | "retire" | "implement" | "observe";

export type AmendmentEffectiveness = {
  ref: string;
  title: string;
  intent: string;
  targetProblem: string;
  implemented: boolean;
  implementedAt: string | null;
  evidence: string[];
  /** Support incidents matching the target problem before it shipped. */
  incidentsBefore: number;
  /** …and after. */
  incidentsAfter: number;
  /** Incidents per 30 days, so a long "before" never flatters the result. */
  ratePerMonthBefore: number | null;
  ratePerMonthAfter: number | null;
  /** Negative means the problem shrank. Null when we cannot say. */
  changePct: number | null;
  daysSince: number | null;
  /** Problems in the same area that only started appearing after it shipped. */
  unintended: Array<{ label: string; occurrences: number; area: string | null }>;
  verdict: EffectivenessVerdict;
  /** One sentence a non-technical Founder can act on. */
  plain: string;
  recommendation: { action: EffectivenessAction; why: string };
};

export type ConstitutionHealth = {
  generatedAt: string;
  totalAmendments: number;
  implemented: number;
  measured: number;
  /** 0–100. How much of the Constitution is proven to be working. */
  healthScore: number;
  mostEffective: AmendmentEffectiveness[];
  underReview: AmendmentEffectiveness[];
  recurringIssues: AmendmentEffectiveness[];
  notImplemented: AmendmentEffectiveness[];
  all: AmendmentEffectiveness[];
  /** What the Constitution should do next, evidence first. */
  recommendations: Array<{
    ref: string | null;
    title: string;
    why: string;
    action: EffectivenessAction;
    priority: "high" | "medium" | "low";
  }>;
  /** One honest line for the Founder Daily. */
  headline: string;
};

/** Does this incident belong to the problem the amendment was written for? */
function matches(a: Amendment, i: IntelligenceIncident): boolean {
  if (!a.areas.length && !a.categories.length) {
    // Platform-wide amendment: every incident is fair evidence.
    return true;
  }
  const area = areaOf(i.context_path);
  const areaHit = a.areas.length > 0 && area != null && a.areas.includes(area);
  const catHit = a.categories.length > 0 && a.categories.includes(i.category);
  return areaHit || catHit;
}

function shortLabel(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 80 ? `${t.slice(0, 77)}…` : t;
}

function ratePerMonth(count: number, spanMs: number): number | null {
  if (spanMs <= 0) return null;
  const months = spanMs / (30 * DAY);
  if (months < 0.25) return null; // too short a window to be honest about
  return Math.round((count / months) * 10) / 10;
}

export function reviewAmendment(
  amendment: Amendment,
  incidents: IntelligenceIncident[],
  now = Date.now(),
): AmendmentEffectiveness {
  const relevant = incidents.filter((i) => matches(amendment, i));
  const implemented = Boolean(amendment.implementedAt) && amendment.evidence.length > 0;
  const shippedAt = amendment.implementedAt ? new Date(amendment.implementedAt).getTime() : null;

  const before = shippedAt
    ? relevant.filter((i) => new Date(i.created_at).getTime() < shippedAt)
    : relevant;
  const after = shippedAt
    ? relevant.filter((i) => new Date(i.created_at).getTime() >= shippedAt)
    : [];

  const earliest = relevant.length
    ? Math.min(...relevant.map((i) => new Date(i.created_at).getTime()))
    : now;
  const beforeSpan = shippedAt ? Math.max(0, shippedAt - earliest) : 0;
  const afterSpan = shippedAt ? Math.max(0, now - shippedAt) : 0;
  const daysSince = shippedAt ? Math.floor(afterSpan / DAY) : null;

  const rateBefore = shippedAt ? ratePerMonth(before.length, beforeSpan) : null;
  const rateAfter = shippedAt ? ratePerMonth(after.length, afterSpan) : null;
  const changePct =
    rateBefore != null && rateAfter != null && rateBefore > 0
      ? Math.round(((rateAfter - rateBefore) / rateBefore) * 100)
      : null;

  // Unintended consequences: signatures that never appeared before the
  // amendment shipped but keep appearing since.
  const beforeSignatures = new Set(
    before.map((i) => i.pattern_signature ?? `free:${i.category}`),
  );
  const newSignatures = new Map<string, IntelligenceIncident[]>();
  for (const i of after) {
    const sig = i.pattern_signature ?? `free:${i.category}`;
    if (beforeSignatures.has(sig)) continue;
    const list = newSignatures.get(sig) ?? [];
    list.push(i);
    newSignatures.set(sig, list);
  }
  const unintended = [...newSignatures.values()]
    .filter((list) => list.length >= 2)
    .map((list) => ({
      label: shortLabel(list[0]!.root_cause ?? list[0]!.reported_text),
      occurrences: list.length,
      area: areaOf(list[0]!.context_path),
    }))
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 3);

  // ---- Verdict ---------------------------------------------------------
  let verdict: EffectivenessVerdict;
  let plain: string;
  let recommendation: { action: EffectivenessAction; why: string };

  if (!implemented) {
    verdict = "not_implemented";
    plain = amendment.implementedAt
      ? "Recorded as live, but nothing in the platform proves it exists yet."
      : "Written down, not yet built. Right now it is an intention, not a rule.";
    recommendation = {
      action: "implement",
      why: "An amendment nobody can point to in the platform cannot protect anyone.",
    };
  } else if (before.length < MIN_EVIDENCE || rateBefore == null || rateAfter == null) {
    verdict = "insufficient_evidence";
    plain =
      daysSince != null && daysSince < 14
        ? `Live for ${daysSince} day${daysSince === 1 ? "" : "s"}. Too early to judge — keep watching.`
        : "Not enough reported issues either side to prove anything. That is usually good news.";
    recommendation = {
      action: "observe",
      why: "Let real usage accumulate before changing a rule that may already be working.",
    };
  } else if (unintended.length > 0 && changePct != null && changePct > -20) {
    verdict = "recurring_issues";
    plain = `The old problem has not really gone, and ${unintended.length} new one${
      unintended.length === 1 ? " has" : "s have"
    } appeared since.`;
    recommendation = {
      action: "revise",
      why: "The rule is producing side effects. Revise it before adding anything on top.",
    };
  } else if (changePct != null && changePct <= -60) {
    verdict = "effective";
    plain = `Reports about this dropped ${Math.abs(changePct)}% after it shipped.`;
    recommendation = {
      action: "expand",
      why: "It worked here. Apply the same rule to the areas that still show the problem.",
    };
  } else if (changePct != null && changePct <= -20) {
    verdict = "holding";
    plain = `Reports fell ${Math.abs(changePct)}%. Real improvement, not yet solved.`;
    recommendation = { action: "keep", why: "Working as intended. Leave it and keep measuring." };
  } else if (changePct != null && changePct >= 25) {
    verdict = "recurring_issues";
    plain = `Reports went up ${changePct}% after this shipped.`;
    recommendation = {
      action: "revise",
      why: "The problem grew after the rule. Either it missed the cause, or it created friction.",
    };
  } else {
    verdict = "under_review";
    plain = "Roughly the same number of reports before and after. It has not moved the needle.";
    recommendation = {
      action: "revise",
      why: "No measurable effect. Change the approach rather than restating the rule.",
    };
  }

  if (unintended.length > 0 && verdict === "effective") {
    verdict = "under_review";
    plain += " But new issues have appeared alongside it.";
    recommendation = {
      action: "revise",
      why: "It solved the original problem and introduced another. Close that gap first.",
    };
  }

  return {
    ref: amendment.ref,
    title: amendment.title,
    intent: amendment.intent,
    targetProblem: amendment.targetProblem,
    implemented,
    implementedAt: amendment.implementedAt,
    evidence: amendment.evidence,
    incidentsBefore: before.length,
    incidentsAfter: after.length,
    ratePerMonthBefore: rateBefore,
    ratePerMonthAfter: rateAfter,
    changePct,
    daysSince,
    unintended,
    verdict,
    plain,
    recommendation,
  };
}

export function reviewConstitution(
  incidents: IntelligenceIncident[],
  amendments: Amendment[] = AMENDMENTS,
  now = Date.now(),
): ConstitutionHealth {
  const all = amendments.map((a) => reviewAmendment(a, incidents, now));

  const implemented = all.filter((a) => a.implemented);
  const measured = all.filter(
    (a) => a.verdict === "effective" || a.verdict === "holding" || a.verdict === "under_review" || a.verdict === "recurring_issues",
  );
  const mostEffective = all
    .filter((a) => a.verdict === "effective" || a.verdict === "holding")
    .sort((x, y) => (x.changePct ?? 0) - (y.changePct ?? 0))
    .slice(0, 5);
  const underReview = all.filter((a) => a.verdict === "under_review");
  const recurringIssues = all.filter((a) => a.verdict === "recurring_issues");
  const notImplemented = all.filter((a) => a.verdict === "not_implemented");

  // Health: proven-working share of everything we can actually measure, with
  // unimplemented amendments counted as a debt against the whole Constitution.
  const provenShare = measured.length
    ? mostEffective.filter((m) => measured.includes(m)).length / measured.length
    : 1;
  const implementedShare = amendments.length ? implemented.length / amendments.length : 1;
  const healthScore = Math.round((provenShare * 0.55 + implementedShare * 0.45) * 100);

  const recommendations = [
    ...notImplemented.map((a) => ({
      ref: a.ref,
      title: `Build ${a.ref} — ${a.title}`,
      why: a.recommendation.why,
      action: a.recommendation.action,
      priority: "high" as const,
    })),
    ...recurringIssues.map((a) => ({
      ref: a.ref,
      title: `Revise ${a.ref} — ${a.title}`,
      why: `${a.plain} ${a.recommendation.why}`,
      action: a.recommendation.action,
      priority: "high" as const,
    })),
    ...underReview.map((a) => ({
      ref: a.ref,
      title: `Rethink ${a.ref} — ${a.title}`,
      why: `${a.plain} ${a.recommendation.why}`,
      action: a.recommendation.action,
      priority: "medium" as const,
    })),
    ...mostEffective
      .filter((a) => a.recommendation.action === "expand")
      .map((a) => ({
        ref: a.ref,
        title: `Expand ${a.ref} — ${a.title}`,
        why: `${a.plain} ${a.recommendation.why}`,
        action: a.recommendation.action,
        priority: "medium" as const,
      })),
  ];

  const headline = notImplemented.length
    ? `${notImplemented.length} amendment${notImplemented.length === 1 ? " is" : "s are"} written but not built.`
    : recurringIssues.length
      ? `${recurringIssues.length} amendment${recurringIssues.length === 1 ? "" : "s"} need${recurringIssues.length === 1 ? "s" : ""} revising — the problem came back.`
      : mostEffective.length
        ? `${mostEffective.length} amendment${mostEffective.length === 1 ? " is" : "s are"} measurably reducing problems. The Constitution is earning its place.`
        : "The Constitution is holding. Not enough reported issues to review anything yet.";

  return {
    generatedAt: new Date(now).toISOString(),
    totalAmendments: amendments.length,
    implemented: implemented.length,
    measured: measured.length,
    healthScore,
    mostEffective,
    underReview,
    recurringIssues,
    notImplemented,
    all,
    recommendations,
    headline,
  };
}
