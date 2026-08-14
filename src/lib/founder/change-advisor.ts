// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0521 — Founder Change Advisor. "Optimize before engineering."
//
// Frassy is the Founder's Engineering Chief of Staff. Lovable remains the
// software engineer; Frassy decides whether the engineer is needed at all.
//
// Pure analysis. No database, no side effects, no UI. Every idea the Founder
// describes is split into individual changes and each one lands in exactly one
// of four buckets, with an honest cost of change.
// ─────────────────────────────────────────────────────────────────────────────

/** The four constitutional buckets. Order matters — it is the escalation ladder. */
export type ChangeBucket =
  | "already_possible" // 🟢 the feature exists; Frassy just does it
  | "founder_editable" // 🟡 interface only; Founder Design Authority (FRASS-0520)
  | "engineering" // 🟠 source code or architecture
  | "constitutional"; // 🔴 changes how Frass fundamentally operates

/** Cost is expressed in engineering effort, never dollars. */
export type ChangeCost = "quick" | "moderate" | "major";

export type AnalyzedChange = {
  /** The Founder's sentence, trimmed. Always shown back in their own words. */
  text: string;
  bucket: ChangeBucket;
  cost: ChangeCost;
  /** everyday language — why it landed in this bucket. */
  why: string;
  /** What Frassy can do right now, if anything. */
  action: string | null;
  /** Existing systems this touches — the reuse-before-build check. */
  affects: string[];
};

export type ChangeAnalysis = {
  changes: AnalyzedChange[];
  counts: Record<ChangeBucket, number>;
  /** The one-paragraph summary Frassy reads to the Founder. */
  summary: string;
  /** Engineering specification, ready to send as ONE request. Null if none needed. */
  spec: EngineeringSpec | null;
  /** Reuse / bundling opportunities Frassy spotted. */
  optimizations: string[];
};

export type EngineeringSpec = {
  title: string;
  goal: string;
  changes: string[];
  systemsAffected: string[];
  componentsToAudit: string[];
  risks: string[];
  scope: ChangeCost;
  constitutionalFirst: string[];
};

export const BUCKET_META: Record<
  ChangeBucket,
  { dot: string; label: string; plain: string }
> = {
  already_possible: {
    dot: "🟢",
    label: "Already possible",
    plain: "This exists today. Frassy can just do it.",
  },
  founder_editable: {
    dot: "🟡",
    label: "Founder editable",
    plain: "Interface only. Frassy can change it without engineering.",
  },
  engineering: {
    dot: "🟠",
    label: "Engineering required",
    plain: "This needs code or architecture work.",
  },
  constitutional: {
    dot: "🔴",
    label: "Constitutional change",
    plain: "This changes how Frass fundamentally operates. Write the amendment first.",
  },
};

export const COST_META: Record<ChangeCost, { dot: string; label: string; plain: string }> = {
  quick: { dot: "🟢", label: "Quick change", plain: "Existing functionality or configuration." },
  moderate: {
    dot: "🟡",
    label: "Moderate change",
    plain: "Engineering, but it builds on systems that already exist.",
  },
  major: {
    dot: "🔴",
    label: "Major change",
    plain: "Significant engineering effort or architectural impact.",
  },
};

// ── Signal tables ────────────────────────────────────────────────────────────
// Kept as data, not logic, so the ladder stays readable and easy to extend.

type Rule = { any: RegExp; why: string; affects: string[] };

const CONSTITUTIONAL: Rule[] = [
  {
    any: /\b(constitution|constitutional|amendment|principle|governance|philosophy|how frass (works|operates)|never again|always must|platform rule)\b/i,
    why: "It sets or changes a rule the whole platform must obey.",
    affects: ["FRASS_OS_CONSTITUTION.md"],
  },
  {
    any: /\b(who owns|data ownership|privacy promise|profit split|commission (rate|cap)|payout rule|founder authority|permission model)\b/i,
    why: "It redefines money, ownership or authority — that is constitutional ground.",
    affects: ["Financial Center", "Permissions", "Constitution"],
  },
];

const ENGINEERING: Rule[] = [
  {
    any: /\b(database|table|column|schema|migration|rls|row level)\b/i,
    why: "It needs new or changed data structures.",
    affects: ["Database"],
  },
  {
    any: /\b(auth|authentication|sign ?in|sign ?up|login|password|passkey|session|role|permission)\b/i,
    why: "It touches authentication or permissions.",
    affects: ["Auth", "Permissions"],
  },
  {
    any: /\b(security|fraud|encryption|policy|audit trail|abuse)\b/i,
    why: "Security logic is never edited from the interface.",
    affects: ["Security Center"],
  },
  {
    any: /\b(payment|checkout|payout|invoice|receipt|refund|tax|stripe|pricing logic|commission)\b/i,
    why: "Financial logic must be server-derived and reviewed.",
    affects: ["Financial Center"],
  },
  {
    any: /\b(api|integration|webhook|third[- ]party|sync|import|export|connect to)\b/i,
    why: "It requires an integration with something outside Frass.",
    affects: ["Integrations"],
  },
  {
    any: /\b(new (page|feature|district|vault|engine|system|tool)|build (a|an|out)|create a (page|feature|system)|add a (page|feature|system))\b/i,
    why: "It adds capability that does not exist yet.",
    affects: ["Platform"],
  },
  {
    any: /\b(performance|slow|speed up|optimi[sz]e load|caching layer|scal(e|ing))\b/i,
    why: "Performance work happens in code, not configuration.",
    affects: ["Infrastructure"],
  },
  {
    any: /\b(ai|frassy) (model|prompt|memory|knowledge|voice engine)\b/i,
    why: "It changes how Frassy reasons or remembers.",
    affects: ["Frassy"],
  },
];

const FOUNDER_EDITABLE: Rule[] = [
  {
    any: /\b(move|reorder|rearrange|reorganis|reorganiz|position|above|below|top|bottom|left|right|cent(er|re))\b/i,
    why: "Layout and positioning are Founder Design Authority.",
    affects: ["Layout engine"],
  },
  {
    any: /\b(hide|show|remove from view|collapse|reveal|visib)/i,
    why: "Visibility is a preference, never a deletion.",
    affects: ["Layout engine"],
  },
  {
    any: /\b(rename|call it|label|title it|wording|copy change)\b/i,
    why: "Labels are content, not code.",
    affects: ["Labels"],
  },
  {
    any: /\b(bigger|larger|smaller|spacing|padding|tighter|wider|narrower|cluttered|busy|simpler|cleaner|font|typography|colou?r|theme|icon)\b/i,
    why: "Presentation stays inside the design system.",
    affects: ["Design system"],
  },
  {
    any: /\b(navigation|nav bar|menu order|tab order)\b/i,
    why: "Navigation arrangement is editable; navigation destinations are not.",
    affects: ["Navigation"],
  },
];

const ALREADY_POSSIBLE: Rule[] = [
  {
    any: /\b(simplified view|simple mode|standard view)\b/i,
    why: "Simplified View already exists (FRASS-0517).",
    affects: ["View Mode"],
  },
  {
    any: /\b(open|go to|take me to|show me) (the )?(daily|workspace|marketplace|business vault|vault|financial center|money moves|security center)\b/i,
    why: "Frassy already navigates for you (FRASS-0513).",
    affects: ["Navigation"],
  },
  {
    any: /\b(customi[sz]e|personali[sz]e) (my )?daily\b/i,
    why: "The Daily Customization Engine already does this (FRASS-5P000).",
    affects: ["Daily"],
  },
  {
    any: /\b(repair|fix|diagnose|troubleshoot) (this|it|the )/i,
    why: "The Repair Engine already diagnoses and safely repairs (FRASS-0515).",
    affects: ["Repair Engine"],
  },
];

function firstMatch(text: string, rules: Rule[]): Rule | null {
  for (const r of rules) if (r.any.test(text)) return r;
  return null;
}

/** Split a Founder's message into individual requested changes. */
export function splitChanges(input: string): string[] {
  return input
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z"“'])|^\s*[-•*\d]+[.)]?\s+/gm)
    .map((s) => s.replace(/^\s*[-•*]\s*/, "").trim())
    .filter((s) => s.length > 3);
}

function costFor(bucket: ChangeBucket, text: string): ChangeCost {
  if (bucket === "already_possible" || bucket === "founder_editable") return "quick";
  if (bucket === "constitutional") return "major";
  const major =
    /\b(database|schema|migration|auth|authentication|security|payment|payout|architecture|new (district|engine|system|platform)|rebuild|redesign the|scal(e|ing)|realtime)\b/i;
  if (major.test(text)) return "major";
  return "moderate";
}

export function classifyChange(text: string): AnalyzedChange {
  const t = text.trim();

  const con = firstMatch(t, CONSTITUTIONAL);
  if (con)
    return {
      text: t,
      bucket: "constitutional",
      cost: "major",
      why: con.why,
      action: "Frassy drafts the amendment first; engineering follows the amendment.",
      affects: con.affects,
    };

  const eng = firstMatch(t, ENGINEERING);
  if (eng)
    return {
      text: t,
      bucket: "engineering",
      cost: costFor("engineering", t),
      why: eng.why,
      action: "Frassy writes the specification so it goes out as one clean request.",
      affects: eng.affects,
    };

  const already = firstMatch(t, ALREADY_POSSIBLE);
  if (already)
    return {
      text: t,
      bucket: "already_possible",
      cost: "quick",
      why: already.why,
      action: "Frassy does it now.",
      affects: already.affects,
    };

  const edit = firstMatch(t, FOUNDER_EDITABLE);
  if (edit)
    return {
      text: t,
      bucket: "founder_editable",
      cost: "quick",
      why: edit.why,
      action: "Frassy prepares a preview under Founder Design Authority (FRASS-0520).",
      affects: edit.affects,
    };

  return {
    text: t,
    bucket: "engineering",
    cost: "moderate",
    why: "Frassy could not match this to an existing system, so it is treated as engineering until proven otherwise.",
    action: "Frassy includes it in the specification with a note to confirm scope first.",
    affects: ["Unclassified — confirm with the Founder"],
  };
}

function uniq(list: string[]): string[] {
  return [...new Set(list.filter(Boolean))];
}

const COMPONENT_HINTS: Array<{ any: RegExp; audit: string }> = [
  { any: /daily/i, audit: "src/components/workspace/frass-daily.tsx" },
  { any: /workspace|room/i, audit: "src/routes/_authenticated/room.tsx" },
  { any: /onboarding|welcome/i, audit: "src/routes/_authenticated/onboarding.tsx" },
  { any: /vault/i, audit: "src/lib/business/vault-family.ts" },
  { any: /money move/i, audit: "src/lib/money-moves" },
  { any: /financial|payment|payout/i, audit: "src/lib/finance" },
  { any: /security|fraud/i, audit: "src/components/founder/security-center" },
  { any: /repair/i, audit: "src/lib/repair" },
  { any: /navigation|menu/i, audit: "src/lib/navigation/core-routes.ts" },
  { any: /frassy|voice|chat/i, audit: "src/routes/api/chat.ts" },
  { any: /marketplace/i, audit: "src/lib/marketplace" },
];

const RISK_HINTS: Array<{ any: RegExp; risk: string }> = [
  { any: /database|schema|migration/i, risk: "Schema change — needs grants, RLS and a rollback path." },
  { any: /auth|permission|role/i, risk: "Auth change — re-run the security review cycle (FRASS-0505)." },
  { any: /payment|payout|commission|tax/i, risk: "Financial logic must stay server-derived (FRASS-0474)." },
  { any: /navigation|route/i, risk: "Route changes must keep every core destination reachable (FRASS-0513)." },
  { any: /new (page|feature|system)/i, risk: "Check reuse first — an existing system may already cover this." },
];

function buildSpec(changes: AnalyzedChange[]): EngineeringSpec | null {
  const eng = changes.filter((c) => c.bucket === "engineering");
  if (!eng.length) return null;
  const text = eng.map((c) => c.text).join(" ");
  const scope: ChangeCost = eng.some((c) => c.cost === "major") ? "major" : "moderate";
  return {
    title:
      eng.length === 1
        ? eng[0]!.text.slice(0, 80)
        : `${eng.length} related changes bundled into one request`,
    goal: "Deliver the Founder's intent with the fewest possible engineering touches, reusing existing systems wherever they already do the job.",
    changes: eng.map((c) => c.text),
    systemsAffected: uniq(eng.flatMap((c) => c.affects)),
    componentsToAudit: uniq(COMPONENT_HINTS.filter((h) => h.any.test(text)).map((h) => h.audit)),
    risks: uniq(RISK_HINTS.filter((h) => h.any.test(text)).map((h) => h.risk)),
    scope,
    constitutionalFirst: changes.filter((c) => c.bucket === "constitutional").map((c) => c.text),
  };
}

function buildOptimizations(changes: AnalyzedChange[]): string[] {
  const out: string[] = [];
  const eng = changes.filter((c) => c.bucket === "engineering");
  if (eng.length > 1)
    out.push(
      `${eng.length} engineering items can travel as one specification instead of ${eng.length} separate requests.`,
    );
  const areas = new Map<string, number>();
  for (const c of eng) for (const a of c.affects) areas.set(a, (areas.get(a) ?? 0) + 1);
  for (const [area, n] of areas) {
    if (n > 1) out.push(`${n} items touch ${area} — build them together so it is opened once.`);
  }
  const quickWins = changes.filter(
    (c) => c.bucket === "already_possible" || c.bucket === "founder_editable",
  ).length;
  if (quickWins)
    out.push(
      `${quickWins} item${quickWins === 1 ? "" : "s"} need no engineering at all — Frassy handles ${quickWins === 1 ? "it" : "them"} today.`,
    );
  if (changes.some((c) => c.bucket === "constitutional"))
    out.push("Write the amendment before the code so the build only happens once.");
  return out;
}

function buildSummary(counts: Record<ChangeBucket, number>, total: number): string {
  if (!total) return "Tell me the idea in your own words and I'll sort it out before any of it reaches engineering.";
  const bits: string[] = [];
  if (counts.already_possible) bits.push(`${counts.already_possible} I can do right now`);
  if (counts.founder_editable)
    bits.push(`${counts.founder_editable} ${counts.founder_editable === 1 ? "is" : "are"} Founder-editable — I'll prepare previews`);
  if (counts.engineering) bits.push(`${counts.engineering} need engineering`);
  if (counts.constitutional)
    bits.push(
      `${counts.constitutional} should become a constitutional amendment before anything is built`,
    );
  return `You've proposed ${total} change${total === 1 ? "" : "s"}. ${bits.join(", ")}.`;
}

/** FRASS-0521 — the whole advisor, in one pure call. */
export function analyzeChangeRequest(input: string): ChangeAnalysis {
  const changes = splitChanges(input).map(classifyChange);
  const counts: Record<ChangeBucket, number> = {
    already_possible: 0,
    founder_editable: 0,
    engineering: 0,
    constitutional: 0,
  };
  for (const c of changes) counts[c.bucket] += 1;
  return {
    changes,
    counts,
    summary: buildSummary(counts, changes.length),
    spec: buildSpec(changes),
    optimizations: buildOptimizations(changes),
  };
}

/** Render the specification as text the Founder can paste straight to engineering. */
export function specToMarkdown(spec: EngineeringSpec): string {
  const lines = [
    `# ${spec.title}`,
    "",
    `**Scope:** ${COST_META[spec.scope].label} — ${COST_META[spec.scope].plain}`,
    "",
    "## Goal",
    spec.goal,
    "",
    "## Changes requested",
    ...spec.changes.map((c) => `- ${c}`),
  ];
  if (spec.constitutionalFirst.length) {
    lines.push("", "## Write these amendments first", ...spec.constitutionalFirst.map((c) => `- ${c}`));
  }
  if (spec.systemsAffected.length) {
    lines.push("", "## Existing systems affected", ...spec.systemsAffected.map((s) => `- ${s}`));
  }
  if (spec.componentsToAudit.length) {
    lines.push("", "## Audit before building", ...spec.componentsToAudit.map((s) => `- ${s}`));
  }
  if (spec.risks.length) lines.push("", "## Risks", ...spec.risks.map((s) => `- ${s}`));
  lines.push(
    "",
    "## Reuse rule",
    "Audit and extend existing systems before creating anything new. No duplicate routes, dashboards or subsystems.",
  );
  return lines.join("\n");
}
