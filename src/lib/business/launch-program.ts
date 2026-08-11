// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0460 — First 30 Days · The Frass Partner Launch Program
//
// This is the reusable launch framework for EVERY Frass Hill Partner. Nothing
// about any individual partner is hard-coded here: the businesses come from
// the partner's own Launch Accelerator state (FRASS-0459), the pace comes from
// their real available hours, and the roadmap adapts to both.
//
// Extension, never replacement. It reuses:
//   • src/lib/business/accelerator.ts  — journeys, money moves, coaching
//   • partner_launch_state.state       — the same saved record (a `program` key)
//   • The Daily, Workspace, Vault, Frass Card, Frass Link, FV Studios, Wallet,
//     Affiliate, Brand Partnerships, Financial Center — all linked, not rebuilt.
// ─────────────────────────────────────────────────────────────────────────────

import {
  allMoves,
  businessById,
  estimatedLaunchDays,
  readiness,
  todaysMoves,
  type LaunchState,
  type ResolvedMove,
} from "./accelerator";

// ── Day One — Foundation Day ────────────────────────────────────────────────
// No income tasks. Today prepares everything success will later need. Every
// item points at a system that already exists somewhere in Frass.

export type FoundationTask = {
  id: string;
  label: string;
  /** Plain English: why this matters before any money move. */
  why: string;
  minutes: number;
  href: string;
};

export const FOUNDATION_TASKS: FoundationTask[] = [
  {
    id: "frass-card",
    label: "Frass Card",
    why: "Your identity across the whole ecosystem. Every link, sale and introduction runs through it.",
    minutes: 10,
    href: "/workspace/card",
  },
  {
    id: "for-me",
    label: "FOR ME page",
    why: "Your personal home inside Frass — what you're building and what you need next.",
    minutes: 6,
    href: "/for-me",
  },
  {
    id: "hero-media",
    label: "Hero media",
    why: "The first image anyone sees. One strong photo does more than ten paragraphs.",
    minutes: 8,
    href: "/workspace/card",
  },
  {
    id: "living-bio",
    label: "Living bio",
    why: "Three lines that say who you are and who you help. It goes everywhere with you.",
    minutes: 6,
    href: "/workspace/card",
  },
  {
    id: "about",
    label: "About page",
    why: "The longer story, for the people who want it before they buy.",
    minutes: 8,
    href: "/workspace/card",
  },
  {
    id: "vaults",
    label: "Business Vaults",
    why: "One vault per business, so nothing you create ever gets lost between ideas.",
    minutes: 10,
    href: "/workspace/vault",
  },
  {
    id: "daily",
    label: "The Daily",
    why: "Where each morning starts. Once it knows you, you never wonder what to work on.",
    minutes: 4,
    href: "/room",
  },
  {
    id: "workspace",
    label: "Workspace",
    why: "One place for every project, upload and conversation — not five scattered tools.",
    minutes: 5,
    href: "/room",
  },
  {
    id: "wallet",
    label: "Wallet",
    why: "Where money arrives. Set it up before there is money, not after.",
    minutes: 8,
    href: "/workspace/wallet",
  },
  {
    id: "affiliate",
    label: "Affiliate settings",
    why: "Tracked links only work if the settings behind them are right first.",
    minutes: 8,
    href: "/workspace/affiliate",
  },
  {
    id: "brand-profile",
    label: "Brand partnership profile",
    why: "Brands look you up before they reach out. This is what they'll find.",
    minutes: 8,
    href: "/brand-partnerships",
  },
  {
    id: "podcast-workspace",
    label: "Podcast workspace",
    why: "A home for episodes, art and notes so recording never waits on admin.",
    minutes: 6,
    href: "/room",
  },
  {
    id: "fv-studios",
    label: "FV Studios profile",
    why: "Your production account — video, covers and content all come from here.",
    minutes: 6,
    href: "/studio",
  },
  {
    id: "social-prefs",
    label: "Social preferences",
    why: "Which platforms you'll actually use. Choosing fewer, on purpose, wins.",
    minutes: 4,
    href: "/workspace/card",
  },
  {
    id: "frass-link",
    label: "Frass Link",
    why: "One permanent link for life — identity, storefront, referral and QR in one address.",
    minutes: 5,
    href: "/workspace/link",
  },
  {
    id: "creator-prefs",
    label: "Creator preferences",
    why: "How you want to work: voice, tone, and how much Frassy should handle for you.",
    minutes: 4,
    href: "/room",
  },
  {
    id: "content-categories",
    label: "Content categories",
    why: "The handful of subjects you'll be known for. Focus is what makes an audience.",
    minutes: 5,
    href: "/for-me",
  },
];

// ── The 30-day roadmap ──────────────────────────────────────────────────────
// One roadmap, not thirty pages.

export type ProgramWeek = {
  index: 1 | 2 | 3 | 4;
  label: string;
  objective: string;
  /** What Frassy is pushing toward all week. */
  focus: string;
};

export const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    index: 1,
    label: "Week 1",
    objective: "Build Foundation",
    focus: "Every system set up once, properly, so nothing slows you down later.",
  },
  {
    index: 2,
    label: "Week 2",
    objective: "Publish Content",
    focus: "Things go live. An audience can't find work that only exists in drafts.",
  },
  {
    index: 3,
    label: "Week 3",
    objective: "Monetize",
    focus: "Links, listings and offers attached to the work already published.",
  },
  {
    index: 4,
    label: "Week 4",
    objective: "Optimize & Scale",
    focus: "Keep what earns, drop what doesn't, and repeat the part that worked.",
  },
];

export const PROGRAM_DAYS = 30;

// ── State ───────────────────────────────────────────────────────────────────

export type Reflection = {
  date: string;
  question: string;
  answer: string;
};

export type ProgramState = {
  /** ISO date the program began. */
  startedOn: string | null;
  /** Completed Day One foundation task ids. */
  foundation: string[];
  /** Milestone id → ISO date first recognised. */
  milestones: Record<string, string>;
  /** Founder-visibility answers, gathered one question at a time. */
  reflections: Reflection[];
  /** Last ISO date a reflection question was asked. */
  lastAskedOn: string | null;
  /** ISO date the completion message was acknowledged. */
  completedOn: string | null;
};

export const EMPTY_PROGRAM: ProgramState = {
  startedOn: null,
  foundation: [],
  milestones: {},
  reflections: [],
  lastAskedOn: null,
  completedOn: null,
};

export function normalizeProgram(raw: unknown): ProgramState {
  const p = (raw ?? {}) as Partial<ProgramState>;
  return {
    startedOn: typeof p.startedOn === "string" ? p.startedOn : null,
    foundation: Array.isArray(p.foundation) ? p.foundation : [],
    milestones: (p.milestones as Record<string, string>) ?? {},
    reflections: Array.isArray(p.reflections) ? (p.reflections as Reflection[]) : [],
    lastAskedOn: typeof p.lastAskedOn === "string" ? p.lastAskedOn : null,
    completedOn: typeof p.completedOn === "string" ? p.completedOn : null,
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Day number in the program, 1-based. Day 1 until the program starts. */
export function programDay(p: ProgramState): number {
  if (!p.startedOn) return 1;
  const diff = Math.floor((Date.parse(todayISO()) - Date.parse(p.startedOn)) / 86400000);
  return Math.max(1, diff + 1);
}

export function currentWeek(p: ProgramState): ProgramWeek {
  const week = Math.min(4, Math.ceil(programDay(p) / 7)) as 1 | 2 | 3 | 4;
  return PROGRAM_WEEKS.find((w) => w.index === week) ?? PROGRAM_WEEKS[0]!;
}

export function foundationComplete(p: ProgramState): boolean {
  return FOUNDATION_TASKS.every((t) => p.foundation.includes(t.id));
}

export function foundationPct(p: ProgramState): number {
  return Math.round((p.foundation.length / FOUNDATION_TASKS.length) * 100);
}

// ── Momentum meter ──────────────────────────────────────────────────────────
// Not a game. A visual indicator of how ready this business actually is.

export function launchMomentum(p: ProgramState, s: LaunchState): number {
  const foundation = foundationPct(p); // setup complete
  const build = readiness(s); // journeys progressed
  const rhythm = Math.min(100, (s.activeDays.length / 20) * 100); // consistency
  const income = s.earned > 0 ? 100 : 0; // money is real proof
  const score = foundation * 0.25 + build * 0.45 + rhythm * 0.2 + income * 0.1;
  return Math.round(Math.min(100, score));
}

// ── Daily income focus ──────────────────────────────────────────────────────
// One highest-value action, and always the reasoning behind it.

export type DailyFocus = {
  kind: "foundation" | "money" | "complete";
  headline: string;
  reason: string;
  move?: ResolvedMove;
  task?: FoundationTask;
};

export function dailyFocus(p: ProgramState, s: LaunchState, hoursPerDay: number): DailyFocus {
  if (!foundationComplete(p)) {
    const next = FOUNDATION_TASKS.find((t) => !p.foundation.includes(t.id))!;
    return {
      kind: "foundation",
      headline: `Today's highest-value action is finishing your ${next.label.toLowerCase()}.`,
      reason: `${next.why} Day One carries no income tasks on purpose — we prepare everything first, then every move after this one earns.`,
      task: next,
    };
  }

  const moves = todaysMoves(s, hoursPerDay);
  if (!moves.length) {
    return {
      kind: "complete",
      headline: "Everything I planned for you is done.",
      reason: "That is not a small thing. Rest is part of the plan — tomorrow's list is already waiting.",
    };
  }

  const best = [...moves].sort((a, b) => (b.potential - a.potential) || Number(b.major) - Number(a.major))[0]!;
  const b = businessById(best.businessId);
  const stages = b?.stages ?? [];
  const idx = stages.findIndex((st) => st.id === best.stageId);
  const next = stages[idx + 1];
  return {
    kind: "money",
    headline: `Today's highest-value opportunity is ${best.label.toLowerCase()}.`,
    reason: next
      ? `${best.why} We're doing it today because tomorrow ${b?.label} moves into ${next.label.toLowerCase()} — and that step only works once this one is done.`
      : `${best.why} This is the last step in ${b?.label}'s journey, which is why it sits at the top of the day.`,
    move: best,
  };
}

// ── Milestones ──────────────────────────────────────────────────────────────
// Recognised naturally, celebrated professionally and warmly.

export type Milestone = {
  id: string;
  label: string;
  line: (name: string) => string;
  reached: (p: ProgramState, s: LaunchState) => boolean;
};

const hasDoneMatching = (s: LaunchState, needle: string) => s.done.some((k) => k.includes(needle));

export const MILESTONES: Milestone[] = [
  {
    id: "foundation",
    label: "Foundation complete",
    line: (n) => `${n}, every system you'll need is now set up. From here, everything we do is meant to earn.`,
    reached: (p) => foundationComplete(p),
  },
  {
    id: "first-publish",
    label: "First published post",
    line: (n) => `${n}, that's your first published piece of work. It's live, and it works while you sleep.`,
    reached: (_p, s) => hasDoneMatching(s, ":publish:"),
  },
  {
    id: "first-campaign",
    label: "First affiliate campaign live",
    line: (n) => `${n}, your first affiliate campaign is live. Most people never get this far.`,
    reached: (_p, s) => hasDoneMatching(s, "affiliate:publish:"),
  },
  {
    id: "first-sale",
    label: "First sale",
    line: (n) => `${n}, money moved because of something you built. That changes the conversation entirely.`,
    reached: (_p, s) => s.earned > 0,
  },
  {
    id: "first-podcast",
    label: "First podcast episode",
    line: (n) => `${n}, episode one exists. Every show that matters started with somebody pressing record.`,
    reached: (_p, s) => hasDoneMatching(s, "podcast:publish:"),
  },
  {
    id: "first-partnership",
    label: "First brand inquiry",
    line: (n) => `${n}, a brand conversation has started. That's authority turning into income.`,
    reached: (_p, s) => hasDoneMatching(s, "pod-partner") || hasDoneMatching(s, ":grow:"),
  },
  {
    id: "first-100",
    label: "First $100 earned",
    line: (n) => `${n}, the first $100 is the hardest one. The rest is repetition.`,
    reached: (_p, s) => s.earned >= 100,
  },
];

export function reachedMilestones(p: ProgramState, s: LaunchState): Milestone[] {
  return MILESTONES.filter((m) => m.reached(p, s));
}

/** Milestones newly reached but not yet recorded — worth saying out loud once. */
export function freshMilestones(p: ProgramState, s: LaunchState): Milestone[] {
  return reachedMilestones(p, s).filter((m) => !p.milestones[m.id]);
}

// ── Weekly review ───────────────────────────────────────────────────────────

export type ProgramReview = {
  week: number;
  hoursInvested: number;
  tasksCompleted: number;
  businessesProgressed: number;
  contentPublished: number;
  earned: number;
  momentum: number;
  readinessPct: number;
  launchDays: number;
  nextWeek: string;
};

export function programReview(p: ProgramState, s: LaunchState, hoursPerDay: number): ProgramReview {
  const done = allMoves(s).filter((x) => x.done);
  const minutes = done.reduce((n, x) => n + x.minutes, 0);
  const businessesProgressed = new Set(done.map((x) => x.businessId)).size;
  const contentPublished = done.filter((x) => x.stageId.includes("publish") || x.stageId.includes("content")).length;
  const week = Math.min(4, Math.ceil(programDay(p) / 7));
  const mo = launchMomentum(p, s);

  const nextWeek =
    !foundationComplete(p)
      ? "Next week starts by closing the last of your setup — then every day after that is a money move."
      : s.earned > 0
        ? "Next week I'll pull more of the moves that already earned to the front, and quietly park the ones that didn't."
        : "Next week leans harder into publishing and links, because that's where the first dollar comes from.";

  return {
    week,
    hoursInvested: Math.round((minutes / 60) * 10) / 10,
    tasksCompleted: done.length + p.foundation.length,
    businessesProgressed,
    contentPublished,
    earned: s.earned,
    momentum: mo,
    readinessPct: readiness(s),
    launchDays: estimatedLaunchDays(s, hoursPerDay),
    nextWeek,
  };
}

// ── Founder visibility — one thoughtful question, never a survey ────────────

export const REFLECTION_QUESTIONS = [
  "Was anything confusing today?",
  "What part of today's work felt easiest?",
  "If you could improve one thing, what would it be?",
  "Did anything take much longer than you expected?",
  "What would have made today's work feel lighter?",
];

/** Ask at most once a day, and never on the very first minute of the program. */
export function reflectionForToday(p: ProgramState): string | null {
  if (p.lastAskedOn === todayISO()) return null;
  const day = programDay(p);
  if (day < 1) return null;
  return REFLECTION_QUESTIONS[(day - 1) % REFLECTION_QUESTIONS.length]!;
}

// ── Completion ──────────────────────────────────────────────────────────────

export function programComplete(p: ProgramState): boolean {
  return programDay(p) >= PROGRAM_DAYS;
}

export function completionMessage(name: string): string[] {
  return [
    `Congratulations, ${name}.`,
    "Thirty days ago you joined Frass with ideas.",
    "Today you have businesses, systems, content, and income streams that are fully operational.",
    "This is only the beginning.",
  ];
}
