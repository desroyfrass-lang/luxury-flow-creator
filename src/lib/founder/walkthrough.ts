// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0519 — Founder Onboarding Experience. "The Founder walks the same
// front door."
//
// There is NO separate Founder onboarding. This is the Founder Path inside the
// existing onboarding engine (the "owner" track): same engine, same route,
// same journey — only the conversation and this validation layer change.
// ─────────────────────────────────────────────────────────────────────────────

export type ObservationKind = "improvement" | "bug" | "amendment" | "idea";
export type ObservationSignal = "smooth" | "neutral" | "confusing" | "blocked";

export const OBSERVATION_KINDS: Array<{ id: ObservationKind; label: string; plain: string }> = [
  { id: "improvement", label: "Improvement", plain: "It works, but it could be better." },
  { id: "bug", label: "Bug", plain: "Something is actually broken." },
  { id: "amendment", label: "Constitutional amendment", plain: "This should become a platform rule." },
  { id: "idea", label: "Future idea", plain: "Worth keeping, not for now." },
];

export const OBSERVATION_SIGNALS: Array<{
  id: ObservationSignal;
  label: string;
  dot: string;
}> = [
  { id: "smooth", label: "Exceptionally smooth", dot: "🟢" },
  { id: "neutral", label: "Fine", dot: "⚪" },
  { id: "confusing", label: "Confusing", dot: "🟡" },
  { id: "blocked", label: "Blocked me", dot: "🔴" },
];

/** The end-to-end validation the Founder confirms while walking the journey. */
export const FOUNDER_OBJECTIVES: Array<{ id: string; label: string; plain: string }> = [
  { id: "profile", label: "Founder profile", plain: "Your identity is correct and complete." },
  { id: "daily", label: "Personal Daily", plain: "Your Daily opens and reads like it should." },
  { id: "permissions", label: "Founder permissions", plain: "You can reach what only you should reach." },
  { id: "security", label: "Founder Security Center", plain: "Signals, alerts and the freeze switch respond." },
  { id: "dashboard", label: "Founder Dashboard", plain: "The command surfaces load with real data." },
  { id: "money-moves", label: "Money Moves", plain: "Today's moves appear and can be worked." },
  { id: "vaults", label: "Business Vault access", plain: "Vaults open and explain themselves." },
  { id: "welcome-hall", label: "Welcome Hall experience", plain: "The front door feels right to a stranger." },
  { id: "voice", label: "Voice experience", plain: "Frassy hears you and answers out loud." },
  { id: "navigation", label: "Navigation", plain: "Frassy takes you places; you never type a URL." },
  { id: "simplified", label: "Simplified View", plain: "The conversation-first view works everywhere." },
  { id: "repair", label: "Repair Engine", plain: "Reporting a problem gets a real diagnosis." },
];

export type ChecklistState = Record<string, boolean>;

export type ObservationRow = {
  id: string;
  step_id: string | null;
  step_label: string | null;
  kind: string;
  signal: string;
  note: string;
  area: string | null;
  amendment_ref: string | null;
  created_at: string;
};

export type ExperienceReport = {
  durationMinutes: number;
  confusionPoints: number;
  navigationIssues: number;
  smoothMoments: number;
  bugs: number;
  amendments: number;
  ideas: number;
  improvements: number;
  objectivesConfirmed: number;
  objectivesTotal: number;
  /** What worked well / what to fix — plain sentences, ready for engineering. */
  workedWell: string[];
  issues: string[];
  recommendations: string[];
  headline: string;
};

/** FRASS-0519 — turn a walkthrough into a measurable usability study. */
export function buildExperienceReport(
  observations: ObservationRow[],
  checklist: ChecklistState,
  startedAt: string,
  completedAt: string = new Date().toISOString(),
): ExperienceReport {
  const durationMinutes = Math.max(
    1,
    Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000),
  );
  const by = (fn: (o: ObservationRow) => boolean) => observations.filter(fn);
  const confusion = by((o) => o.signal === "confusing" || o.signal === "blocked");
  const nav = by((o) => /navigat|menu|link|route|404|find/i.test(o.note));
  const smooth = by((o) => o.signal === "smooth");
  const bugs = by((o) => o.kind === "bug");
  const amendments = by((o) => o.kind === "amendment");
  const ideas = by((o) => o.kind === "idea");
  const improvements = by((o) => o.kind === "improvement");
  const confirmed = FOUNDER_OBJECTIVES.filter((o) => checklist[o.id]).length;

  const recommendations = [
    ...bugs.map((o) => `Fix: ${o.note}`),
    ...confusion.map((o) => `Clarify ${o.step_label ?? "this step"}: ${o.note}`),
    ...amendments.map((o) => `Amend the Constitution: ${o.note}`),
  ].slice(0, 8);

  const headline = bugs.length
    ? `${bugs.length} bug${bugs.length === 1 ? "" : "s"} found — fix before inviting partners.`
    : confusion.length
      ? `${confusion.length} point${confusion.length === 1 ? "" : "s"} of confusion — the journey works but needs smoothing.`
      : confirmed === FOUNDER_OBJECTIVES.length
        ? "Clean walkthrough. Every objective confirmed."
        : "Walkthrough recorded. Some objectives are still unconfirmed.";

  return {
    durationMinutes,
    confusionPoints: confusion.length,
    navigationIssues: nav.length,
    smoothMoments: smooth.length,
    bugs: bugs.length,
    amendments: amendments.length,
    ideas: ideas.length,
    improvements: improvements.length,
    objectivesConfirmed: confirmed,
    objectivesTotal: FOUNDER_OBJECTIVES.length,
    workedWell: smooth.map((o) => o.note).slice(0, 6),
    issues: [...bugs, ...confusion].map((o) => o.note).slice(0, 8),
    recommendations,
    headline,
  };
}
