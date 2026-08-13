// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0547 — Founder Success Dashboard  ·  FRASS-0548 — Founder Visibility.
//
// "Measure progress. Protect privacy."
//
// The Founder is a principal, not an auditor. This module describes progress —
// momentum, streaks, blueprint completion, legacy work — and deliberately
// refuses to describe money in exact terms. Personal earnings are shown as a
// RANGE and nothing finer, unless the member has explicitly opted into Founder
// Coaching. Bank balances, cards, tax records and personal accounts are never
// available to the Founder at all, under any condition.
//
// Plain English: you can see who is thriving and who needs a hand. You cannot
// see anybody's bank account. Those are two different things on purpose.
// ─────────────────────────────────────────────────────────────────────────────

export const FOUNDER_VISIBILITY_PRINCIPLE =
  "The Founder should have visibility into member progress to better support the community, but never more visibility than is necessary to fulfil that responsibility. Member dignity, privacy and trust always come first.";

export const FOUNDER_CONFIDENTIAL_BANNER =
  "Founder Confidential — Support & Mentorship Only. This information exists to support members, improve the platform and guide the Frass ecosystem. It is never publicly visible and is never shared with other members.";

export const FOUNDER_CONFIDENTIAL_LABEL = "Founder Confidential — Support & Mentorship Only";

/** FRASS-0548 — Founder Responsibility. What this insight may and may never do. */
export const FOUNDER_RESPONSIBILITY = {
  mayBeUsedTo: [
    "Support members",
    "Improve the platform",
    "Celebrate achievements",
    "Offer guidance",
  ],
  mayNeverBeUsedTo: [
    "Rank members publicly",
    "Shame members",
    "Sell member analytics",
    "Create public leaderboards without member consent",
  ],
} as const;

/** Things the Founder may never see about a member, whatever the surface. */
export const NEVER_VISIBLE_TO_FOUNDER = [
  "Bank balances",
  "Credit card balances",
  "Exact personal income",
  "Tax records",
  "Personal financial accounts",
] as const;

/** Things the Founder may see, for mentorship and platform improvement. */
export const FOUNDER_MAY_VIEW = [
  "Overall momentum",
  "Achievement style",
  "Blueprint progress",
  "Business Vault progress",
  "Money Move progress",
  "Daily completion",
  "Digital legacy progress",
  "Project completion",
  "Engagement trends",
  "Milestone progress",
  "Frassy's coaching recommendations",
  "Revenue ranges — never exact personal balances",
] as const;

/* ── Momentum tone ──────────────────────────────────────────────────────── */

export type SuccessTone = "thriving" | "growing" | "encouragement" | "support";

export const TONE_META: Record<SuccessTone, { glyph: string; label: string; plain: string }> = {
  thriving: {
    glyph: "🟢",
    label: "Thriving",
    plain: "Moving well on their own. Celebrate, don't interrupt.",
  },
  growing: {
    glyph: "🟡",
    label: "Growing",
    plain: "Steady progress. A nudge helps; nothing is wrong.",
  },
  encouragement: {
    glyph: "🟠",
    label: "Needs encouragement",
    plain: "Slowing down. A short message from you would land well.",
  },
  support: {
    glyph: "🔴",
    label: "Needs support",
    plain: "Stalled or quiet for a while. Reach out personally.",
  },
};

/* ── Revenue ranges — the only money the Founder ever sees ──────────────── */

export type RevenueBand =
  | "none"
  | "first"
  | "100"
  | "500"
  | "1k"
  | "5k"
  | "10k"
  | "50k";

const BANDS: { id: RevenueBand; min: number; label: string }[] = [
  { id: "none", min: 0, label: "Not yet earning" },
  { id: "first", min: 0.01, label: "First income earned" },
  { id: "100", min: 100, label: "$100+" },
  { id: "500", min: 500, label: "$500+" },
  { id: "1k", min: 1_000, label: "$1,000+" },
  { id: "5k", min: 5_000, label: "$5,000+" },
  { id: "10k", min: 10_000, label: "$10,000+" },
  { id: "50k", min: 50_000, label: "$50,000+" },
];

/**
 * Converts an amount into a range. Deliberately lossy: the exact number never
 * leaves the server, and the Founder never receives it.
 */
export function revenueBand(amount: number | null | undefined): RevenueBand {
  const n = Number(amount ?? 0);
  let band: RevenueBand = "none";
  for (const b of BANDS) if (n >= b.min) band = b.id;
  return band;
}

export function revenueBandLabel(band: RevenueBand): string {
  return BANDS.find((b) => b.id === band)?.label ?? "Not yet earning";
}

/* ── One member, as the Founder sees them ───────────────────────────────── */

export type MemberProgress = {
  userId: string;
  name: string;
  tone: SuccessTone;
  /** 0–100, blended from the progress signals below. Never money-weighted. */
  progress: number;
  achievementStyle: string | null;
  momentumLevel: string | null;
  /** FRASS-0550 — 👤 Who: the member's public Frass Card handle, if claimed. */
  handle: string | null;
  builderStage: string | null;
  learningLevel: string | null;
  /** Active Business Vaults, by name. Never their contents. */
  vaults: string[];
  dailyStreak: number;
  daysQuiet: number;
  blueprintProgress: number;
  moneyMovesActive: number;
  moneyMovesCompleted: number;
  projectsCompleted: number;
  booksInProgress: number;
  booksPublished: number;
  revenue: RevenueBand;
  coachingOptIn: boolean;
  insight: string;
  /** Why Frassy classified this member's achievement style the way she did. */
  archetypeReason: string;
  /** The single thing the Founder should do about this member today. */
  recommendedAction: string;
  /* ── FRASS-0550 — Founder Coaching Engine. The five questions. ────────── */
  /** 📈 Why — observable behaviours only, never vague AI statements. */
  observedBehaviours: string[];
  /** ❤️ What do they need — the member's current opportunity. */
  need: MemberNeed;
  /** 🎯 What should the Founder do — recommendations, never instructions. */
  founderActions: FounderAction[];
  /** 🌱 What is the likely outcome — why Frassy suggested that action. */
  likelyOutcome: string;
  /** Ordering weight so the Founder never has to hunt for who needs them. */
  coachingPriority: number;
};


const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function toneFor(input: {
  daysQuiet: number;
  progress: number;
  moneyMovesCompleted: number;
}): SuccessTone {
  if (input.daysQuiet >= 14) return "support";
  if (input.daysQuiet >= 7) return "encouragement";
  if (input.progress >= 70 || input.moneyMovesCompleted >= 3) return "thriving";
  if (input.progress >= 35) return "growing";
  return "encouragement";
}

/** A blended progress score. Money is never an input — only work completed. */
export function progressScore(p: {
  blueprintProgress: number;
  moneyMovesCompleted: number;
  projectsCompleted: number;
  booksPublished: number;
  dailyStreak: number;
}): number {
  return clamp(
    p.blueprintProgress * 0.35 +
      Math.min(p.moneyMovesCompleted, 6) * 6 +
      Math.min(p.projectsCompleted, 6) * 4 +
      Math.min(p.booksPublished, 3) * 6 +
      Math.min(p.dailyStreak, 14) * 1.5,
  );
}

/** The raw signals every derived read is computed from. */
export type MemberSignals = Omit<
  MemberProgress,
  | "insight"
  | "tone"
  | "archetypeReason"
  | "recommendedAction"
  | "observedBehaviours"
  | "need"
  | "founderActions"
  | "likelyOutcome"
  | "coachingPriority"
>;

/**
 * Frassy's one-line read on a member. Observational and kind — never a verdict
 * on the person, always a description of the work.
 */
export function memberInsight(m: MemberSignals, tone: SuccessTone): string {
  if (tone === "support") {
    return m.daysQuiet >= 30
      ? "Quiet for over a month. A personal check-in matters more than another notification."
      : "This member appears to have stalled. Consider reaching out yourself.";
  }
  if (tone === "encouragement") {
    if (m.moneyMovesActive > 0)
      return "Work is started but not finishing. One completed Money Move would restore momentum.";
    return "Progress has slowed. A short encouraging message would likely restart them.";
  }
  if (tone === "thriving") {
    if (m.booksInProgress > 0 && m.booksPublished === 0)
      return "Excellent progress, and a book is close. A nudge to publish could be the milestone.";
    return "Making excellent progress independently. Celebrate rather than intervene.";
  }
  return "Steady and consistent. Nothing needed today beyond recognition.";
}

/* ── Why: the reasoning behind the label ────────────────────────────────── */

const STYLE_REASONS: Record<string, string> = {
  shark: "Chosen style: Shark — takes on ambitious challenges and finishes them early.",
  sprinter: "Chosen style: Sprinter — works in intense bursts followed by quiet periods.",
  climber: "Chosen style: Climber — long, steady ascents towards one large goal.",
  gardener: "Chosen style: Gardener — steady weekly progress with high consistency.",
  navigator: "Chosen style: Navigator — plans the route first, then moves deliberately.",
};

/**
 * Explains, in one or two plain sentences, WHY this member reads the way they do.
 * The Founder should understand the reasoning, not just see a label.
 */
export function archetypeReason(m: MemberSignals, tone: SuccessTone): string {
  const parts: string[] = [];
  const style = (m.achievementStyle ?? "").toLowerCase();
  if (STYLE_REASONS[style]) parts.push(STYLE_REASONS[style]);
  else parts.push("No achievement style chosen yet — this read comes from behaviour alone.");

  if (m.dailyStreak >= 7) parts.push(`Opened their Daily ${m.dailyStreak} days in a row.`);
  else if (m.daysQuiet >= 7) parts.push(`Last active ${m.daysQuiet} days ago.`);
  else parts.push("Active recently, without a long streak yet.");

  if (m.moneyMovesCompleted > 0)
    parts.push(
      `Completed ${m.moneyMovesCompleted} Money Move${m.moneyMovesCompleted === 1 ? "" : "s"}${
        m.moneyMovesActive ? ` with ${m.moneyMovesActive} still open` : ""
      }.`,
    );
  else if (m.moneyMovesActive > 0)
    parts.push(`${m.moneyMovesActive} Money Move(s) started, none finished yet.`);

  parts.push(
    `Blueprint ${m.blueprintProgress}% complete — that is why they read as ${TONE_META[tone].label.toLowerCase()}.`,
  );
  return parts.join(" ");
}

/* ── Recommended Founder Action ─────────────────────────────────────────── */

/**
 * The one thing worth doing about this member today. Frassy interprets the data
 * so the Founder does not have to.
 */
export function recommendedAction(m: MemberSignals, tone: SuccessTone): string {
  if (m.daysQuiet >= 14)
    return `Check in personally. They have not opened their Daily in ${m.daysQuiet} days.`;
  if (tone === "support") return "Reach out yourself — a message from you carries more weight than a notification.";
  if (m.booksPublished > 0) return "Celebrate their published book publicly, with their permission.";
  if (m.booksInProgress > 0 && m.progress >= 55)
    return "Encourage them to finish and publish — they are close to a milestone.";
  if (m.revenue === "first") return "Congratulate them on their first sale. First income deserves a real message.";
  if (m.moneyMovesCompleted === 0 && m.moneyMovesActive > 0)
    return "Help them finish one Money Move. Finishing matters more than starting another.";
  if (m.blueprintProgress >= 90) return "Celebrate their Business Vault completion.";
  if (tone === "encouragement") return "Send a short encouraging note — no task attached.";
  if (tone === "thriving") return "Nothing needed. Celebrate, don't interrupt.";
  return "Recognise their consistency. Steady members are easy to overlook.";
}

/* ── Founder Radar — the morning attention list ─────────────────────────── */

export type RadarBucket = {
  id: string;
  glyph: string;
  label: string;
  count: number;
  members: { userId: string; name: string }[];
};

export function buildRadar(members: MemberProgress[]): RadarBucket[] {
  const pick = (f: (m: MemberProgress) => boolean) =>
    members.filter(f).map((m) => ({ userId: m.userId, name: m.name }));

  const encouragement = pick((m) => m.tone === "encouragement" || m.tone === "support");
  const nearMilestone = pick(
    (m) => m.tone !== "support" && m.progress >= 55 && m.progress < 75,
  );
  const launched = pick((m) => m.moneyMovesCompleted > 0 && m.revenue !== "none");
  const published = pick((m) => m.booksPublished > 0);
  const independent = pick((m) => m.revenue === "5k" || m.revenue === "10k" || m.revenue === "50k");

  return [
    { id: "encouragement", glyph: "❤️", label: "members need encouragement", count: encouragement.length, members: encouragement },
    { id: "milestone", glyph: "🔥", label: "members are close to a milestone", count: nearMilestone.length, members: nearMilestone },
    { id: "launched", glyph: "🎉", label: "members launched something that earned", count: launched.length, members: launched },
    { id: "published", glyph: "📚", label: "members published a book", count: published.length, members: published },
    { id: "independent", glyph: "🚀", label: "members reached serious recurring income", count: independent.length, members: independent },
  ].filter((b) => b.count > 0);
}

/** The journey bar: where a member started, and where they are now. */
export const JOURNEY_STAGES = [
  { id: "explorer", glyph: "🌱", label: "Explorer", at: 0 },
  { id: "builder", glyph: "🚀", label: "Builder", at: 35 },
  { id: "momentum", glyph: "🏔️", label: "Momentum", at: 65 },
  { id: "high", glyph: "👑", label: "High performer", at: 85 },
] as const;

export function journeyFill(progress: number, stageAt: number): number {
  const next = JOURNEY_STAGES.find((s) => s.at > stageAt)?.at ?? 100;
  if (progress <= stageAt) return 0;
  if (progress >= next) return 100;
  return Math.round(((progress - stageAt) / (next - stageAt)) * 100);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FRASS-0550 — Founder Coaching Engine.  "Lead people, not dashboards."
 *
 * Every member insight must answer five questions: Who? Why? What do they
 * need? What should the Founder do? What is the likely outcome?
 * Frassy recommends. The Founder decides — always.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const FOUNDER_COACHING_PRINCIPLE =
  "The purpose of leadership is not to measure people. It is to help people become more than they believed possible. Every insight in Frass should ultimately lead to encouragement, opportunity, or growth.";

export const FOUNDER_COACHING_QUESTIONS = [
  { id: "who", glyph: "👤", label: "Who?", guide: "Who is this member — card, vaults, learning style, momentum." },
  { id: "why", glyph: "📈", label: "Why?", guide: "Observable behaviours only. Never vague AI statements." },
  { id: "need", glyph: "❤️", label: "What do they need?", guide: "Their current opportunity, in one word." },
  { id: "action", glyph: "🎯", label: "What should the Founder do?", guide: "One recommended action. Editable, ignorable." },
  { id: "outcome", glyph: "🌱", label: "What is the likely outcome?", guide: "Why Frassy suggested it." },
] as const;

export const FOUNDER_DECIDES_NOTE =
  "Frassy recommends. You decide. Every suggestion can be edited or ignored.";

/* ── ❤️ What do they need ───────────────────────────────────────────────── */

export type MemberNeed =
  | "encouragement"
  | "recognition"
  | "guidance"
  | "accountability"
  | "celebration"
  | "rest"
  | "resources";

export const NEED_META: Record<MemberNeed, { glyph: string; label: string; plain: string }> = {
  encouragement: { glyph: "💬", label: "Encouragement", plain: "A kind word, with no task attached." },
  recognition: { glyph: "👀", label: "Recognition", plain: "To be seen. Quiet consistency is easy to miss." },
  guidance: { glyph: "🧭", label: "Guidance", plain: "Direction on what to do next." },
  accountability: { glyph: "🤝", label: "Accountability", plain: "Someone expecting them to finish." },
  celebration: { glyph: "🎉", label: "Celebration", plain: "A real milestone deserves a real moment." },
  rest: { glyph: "🌙", label: "Rest", plain: "They are pushing hard. Protect them from more pressure." },
  resources: { glyph: "🧰", label: "Resources", plain: "Tools, credits or a vault they don't have yet." },
};

/** Frassy's read on the member's current opportunity. */
export function memberNeed(m: MemberSignals, tone: SuccessTone): MemberNeed {
  if (m.booksPublished > 0 || m.revenue === "first") return "celebration";
  if (m.daysQuiet >= 14) return "encouragement";
  if (m.daysQuiet >= 7) return "encouragement";
  if (m.moneyMovesActive >= 3 && m.moneyMovesCompleted === 0) return "guidance";
  if (m.moneyMovesActive > 0 && m.moneyMovesCompleted === 0) return "accountability";
  if (m.dailyStreak >= 21 && m.progress < 50) return "recognition";
  if (m.dailyStreak >= 30 && m.moneyMovesActive >= 2) return "rest";
  if (m.blueprintProgress < 25 && !m.vaults.length) return "resources";
  if (tone === "thriving") return "recognition";
  if (tone === "encouragement") return "encouragement";
  return "recognition";
}

/* ── 📈 Why: observable behaviours only ─────────────────────────────────── */

export function observedBehaviours(m: MemberSignals): string[] {
  const out: string[] = [];
  if (m.dailyStreak > 0)
    out.push(`Completed ${m.dailyStreak} Daily session${m.dailyStreak === 1 ? "" : "s"} consecutively.`);
  if (m.daysQuiet >= 3)
    out.push(`Hasn't opened their Daily in ${m.daysQuiet} day${m.daysQuiet === 1 ? "" : "s"}.`);
  if (m.moneyMovesCompleted > 0)
    out.push(`Completed ${m.moneyMovesCompleted} Money Move${m.moneyMovesCompleted === 1 ? "" : "s"}.`);
  if (m.moneyMovesActive > 0)
    out.push(`${m.moneyMovesActive} Money Move${m.moneyMovesActive === 1 ? " is" : "s are"} still open.`);
  if (m.projectsCompleted > 0)
    out.push(`Finished ${m.projectsCompleted} project${m.projectsCompleted === 1 ? "" : "s"}.`);
  if (m.booksPublished > 0)
    out.push(`Published ${m.booksPublished} book${m.booksPublished === 1 ? "" : "s"} from their journey.`);
  if (m.booksInProgress > 0)
    out.push(`${m.booksInProgress} book${m.booksInProgress === 1 ? " is" : "s are"} in progress.`);
  if (m.revenue === "first") out.push("Reached their first online income milestone.");
  else if (m.revenue !== "none") out.push(`Earned in the ${revenueBandLabel(m.revenue)} range.`);
  if (m.blueprintProgress > 0) out.push(`Business blueprint is ${m.blueprintProgress}% complete.`);
  if (m.vaults.length) out.push(`Active Business Vaults: ${m.vaults.join(", ")}.`);
  return out.length ? out : ["No activity recorded yet — this member has not started."];
}

/* ── 🎯 What should the Founder do ──────────────────────────────────────── */

export type FounderAction = {
  id: "celebrate" | "encourage" | "credits" | "vault" | "conversation" | "note";
  glyph: string;
  label: string;
  detail: string;
};

const ACTION = {
  celebrate: (detail: string): FounderAction => ({ id: "celebrate", glyph: "👏", label: "Celebrate a milestone", detail }),
  encourage: (detail: string): FounderAction => ({ id: "encourage", glyph: "💬", label: "Send encouragement", detail }),
  credits: (detail: string): FounderAction => ({ id: "credits", glyph: "🎁", label: "Award bonus credits", detail }),
  vault: (detail: string): FounderAction => ({ id: "vault", glyph: "📚", label: "Recommend a Business Vault", detail }),
  conversation: (detail: string): FounderAction => ({ id: "conversation", glyph: "🤝", label: "Schedule a Founder conversation", detail }),
  note: (detail: string): FounderAction => ({ id: "note", glyph: "📝", label: "Leave a personal note", detail }),
};

/**
 * Up to three recommendations, best first. Frassy never assumes the Founder
 * wants to intervene — these are offers, not instructions.
 */
export function founderActions(m: MemberSignals, need: MemberNeed): FounderAction[] {
  const first = m.name.split(" ")[0] || m.name;
  switch (need) {
    case "celebration":
      return [
        ACTION.celebrate(
          m.booksPublished > 0
            ? `${first} published a book. Celebrate it publicly, with their permission.`
            : `${first} earned their first income. First money deserves a real message.`,
        ),
        ACTION.note(`Write ${first} a short personal note about what this milestone means.`),
        ACTION.credits("Award bonus credits so the next build starts with momentum."),
      ];
    case "encouragement":
      return [
        ACTION.encourage(
          m.daysQuiet >= 14
            ? `${first} has been quiet for ${m.daysQuiet} days. One warm message, no task attached.`
            : `A short encouraging message would likely restart ${first}.`,
        ),
        ACTION.note(`Leave ${first} a personal note they'll see on their next Daily.`),
        ACTION.conversation(`Offer ${first} fifteen minutes with you.`),
      ];
    case "accountability":
      return [
        ACTION.conversation(`Ask ${first} which single Money Move they'll finish this week.`),
        ACTION.encourage("Finishing one thing matters more than starting another."),
      ];
    case "guidance":
      return [
        ACTION.vault(`${first} has several things open at once. Point them at one vault and one path.`),
        ACTION.conversation(`Help ${first} choose what to drop, not what to add.`),
      ];
    case "recognition":
      return [
        ACTION.note(`Tell ${first} you noticed their consistency. Steady members are easy to overlook.`),
        ACTION.celebrate(`Recognise ${first}'s ${m.dailyStreak}-day streak.`),
      ];
    case "rest":
      return [
        ACTION.note(`Tell ${first} it's fine to pause. Protect them from more pressure this week.`),
        ACTION.encourage("Acknowledge the effort without adding another goal."),
      ];
    case "resources":
    default:
      return [
        ACTION.vault(`${first} is early. Recommend one Business Vault that fits what they already know.`),
        ACTION.credits("Award starter credits so the first build costs them nothing."),
      ];
  }
}

/* ── 🌱 What is the likely outcome ──────────────────────────────────────── */

export function likelyOutcome(m: MemberSignals, need: MemberNeed): string {
  switch (need) {
    case "celebration":
      return "Recognising this achievement now is likely to reinforce consistent publishing and selling habits.";
    case "encouragement":
      return m.daysQuiet >= 14
        ? "This member has drifted rather than quit. A personal message now measurably reduces the risk of them leaving for good."
        : "This member has remained engaged despite slow progress. Encouragement now may reduce the risk of disengagement.";
    case "accountability":
      return "Work is started but unfinished. A named commitment usually converts one open Money Move into a completed one.";
    case "guidance":
      return "Too many open threads is the most common cause of stalling. Narrowing focus usually restores completion.";
    case "recognition":
      return "Consistency without visible reward fades. Being noticed by you tends to extend the streak.";
    case "rest":
      return "Protecting a hard-working member from more pressure prevents the burnout drop-off that usually follows.";
    case "resources":
    default:
      return "Early members stall on the first step, not the hard ones. Removing cost and choice usually produces a first build.";
  }
}

/**
 * Ordering weight. The Founder should never have to search for opportunities
 * to make a positive impact — the highest-impact people rise to the top.
 */
export function coachingPriority(m: MemberSignals, need: MemberNeed, tone: SuccessTone): number {
  let score = 0;
  if (tone === "support") score += 100;
  if (need === "celebration") score += 90;
  if (m.daysQuiet >= 21) score += 60;
  else if (m.daysQuiet >= 7) score += 40;
  if (need === "accountability") score += 35;
  if (m.progress >= 55 && m.progress < 75) score += 30; // close to a milestone
  if (m.dailyStreak >= 21) score += 25; // exceptional consistency
  if (need === "guidance") score += 20;
  if (need === "resources") score += 15;
  return score;
}
