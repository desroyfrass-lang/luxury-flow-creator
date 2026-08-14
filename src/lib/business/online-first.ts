// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0532-A — Online-First Money Moves Principle
// "Retire experience. Monetize wisdom."
//
// Constitutional Amendment · P0.
//
// Money Moves is NOT a job recommendation engine. It is a FINANCIAL FREEDOM
// ENGINE. The objective was never "the fastest way to make money" — it is
// "the fastest way to financial freedom through online income."
//
// Everything Frassy recommends defaults to income that can be built online,
// can scale, can recur, and can keep earning without constant physical effort.
// Offline labour and traditional employment remain fully supported — they are
// simply never the default.
// ─────────────────────────────────────────────────────────────────────────────

export const ONLINE_FIRST_PRINCIPLE = {
  id: "FRASS-0532-A",
  title: "Online-First Money Moves",
  vision:
    "Frass exists to help people stop exchanging time for money whenever possible — building " +
    "businesses, digital assets and scalable online income that give members back their time.",
  rule:
    "Money Moves default to online-first opportunities. Offline employment, local service work " +
    "and manual labour are recommended only when the member asks for them, their situation " +
    "requires them, or no reasonable online alternative exists.",
  // FRASS-0532-A (amended) — the one question every Money Move answers.
  constitutionalQuestion:
    "What's the best online Money Move today that moves this member closer to financial freedom?",
  memberQuestion:
    "What's the best online Money Move today that moves you closer to financial freedom?",
  retired:
    "What's the easiest way to make money today? — retired: it kept sending experienced people back to labour.",
  founderPrinciple:
    "Employment remains an option. Financial freedom remains the objective.",
  reframe: {
    never: "Here's a local job you could take today.",
    instead:
      "How can we turn your experience into an online business that keeps earning while you enjoy your time?",
  },
} as const;

/** How an opportunity earns. Ranked best → last. */
export type EarningShape =
  | "recurring" // subscriptions, memberships, royalties, courses that keep selling
  | "digital-asset" // guides, templates, e-books, downloads, content libraries
  | "leveraged" // affiliate, referral, licensing — earns without your hands
  | "online-service" // consultations, coaching, remote work — online but hourly
  | "offline-service" // local jobs, call-outs, contracts — hands and travel
  | "employment"; // a job

export const SHAPE_RANK: Record<EarningShape, number> = {
  recurring: 0,
  "digital-asset": 1,
  leveraged: 2,
  "online-service": 3,
  "offline-service": 4,
  employment: 5,
};

export const SHAPE_META: Record<
  EarningShape,
  { emoji: string; label: string; plain: string; online: boolean; scalable: boolean }
> = {
  recurring: {
    emoji: "🔁",
    label: "Recurring income",
    plain: "It pays again next month without you doing it again.",
    online: true,
    scalable: true,
  },
  "digital-asset": {
    emoji: "📦",
    label: "Digital asset",
    plain: "You make it once; it can be sold many times.",
    online: true,
    scalable: true,
  },
  leveraged: {
    emoji: "🪄",
    label: "Leveraged income",
    plain: "You earn from a recommendation or referral, not from your hands.",
    online: true,
    scalable: true,
  },
  "online-service": {
    emoji: "💻",
    label: "Online service",
    plain: "Paid work you do from wherever you are — no travel.",
    online: true,
    scalable: false,
  },
  "offline-service": {
    emoji: "🧰",
    label: "Hands-on work",
    plain: "Real money, but it stops the day your hands stop.",
    online: false,
    scalable: false,
  },
  employment: {
    emoji: "🏢",
    label: "Employment",
    plain: "A job. Supported when it's what you want — never the destination.",
    online: false,
    scalable: false,
  },
};

/** The only reasons an offline move may be surfaced ahead of online ones. */
export type OfflineReason = "member-requested" | "situation-requires" | "no-online-alternative";

export const OFFLINE_REASONS: Record<OfflineReason, string> = {
  "member-requested": "The member asked for this kind of work.",
  "situation-requires": "Their situation needs it right now.",
  "no-online-alternative": "There is no reasonable online alternative yet.",
};

export type OnlineFirstContext = {
  /** The member explicitly asked for local/offline/employment work. */
  requestsOffline?: boolean;
  /** Their situation genuinely requires cash from hands-on work today. */
  situationRequiresOffline?: boolean;
  /** Retirement posture — never encourage more physical labour. */
  retiringFromLabour?: boolean;
};

/** Is an offline move allowed to appear at all? */
export function offlineAllowed(ctx: OnlineFirstContext = {}): boolean {
  if (ctx.retiringFromLabour && !ctx.requestsOffline) return false;
  return Boolean(ctx.requestsOffline || ctx.situationRequiresOffline);
}

export type ShapedMove<T> = T & { shape: EarningShape };

/**
 * The constitutional sort. Online, scalable and recurring income rises; offline
 * labour and employment sink, and are removed entirely unless permitted.
 */
export function rankOnlineFirst<T>(
  moves: ShapedMove<T>[],
  ctx: OnlineFirstContext = {},
): ShapedMove<T>[] {
  const allowOffline = offlineAllowed(ctx);
  return moves
    .filter((m) => (SHAPE_META[m.shape].online ? true : allowOffline))
    .slice()
    .sort((a, b) => SHAPE_RANK[a.shape] - SHAPE_RANK[b.shape]);
}

/** Everyday-language explanation of why a move is where it is. */
export function whyThisOrder(shape: EarningShape): string {
  const m = SHAPE_META[shape];
  if (m.scalable) return `${m.plain} That's why it comes first.`;
  if (m.online) return `${m.plain} Good income, but it still costs you hours.`;
  return `${m.plain} Only here because you asked for it.`;
}

/** What Frassy avoids by default, for every member, unless they ask. */
export const AVOID_BY_DEFAULT = [
  "Local job boards",
  "Contracts that need you on site",
  "Physical labour and manual work",
  "Daily commuting",
  "Anything that only pays while your hands are moving",
];

/**
 * The prompt fragment injected wherever Frassy recommends income, so her
 * spoken and written guidance follows the same constitution as the code.
 */
export const CONSTITUTIONAL_QUESTION = ONLINE_FIRST_PRINCIPLE.constitutionalQuestion;

export const ONLINE_FIRST_PROMPT = `━━━ FRASS-0532-A — ONLINE-FIRST MONEY MOVES ━━━
THE CONSTITUTIONAL QUESTION, asked before every recommendation:
"What's the best online Money Move today that moves this member closer to
financial freedom?"
The old question — "What's the easiest way to make money today?" — is retired.
It kept sending experienced people back to labour.
Money Moves is a FINANCIAL FREEDOM ENGINE, not a job board. Default every
recommendation to income that can be built online, can scale, can recur, and can
keep earning without constant physical effort — digital knowledge products,
educational and faceless content, affiliate recommendations, online consultation,
courses, memberships and downloadable resources.
Only recommend local service work, contracts, manual labour or employment when the
member asks for it, their situation requires it, or no reasonable online
alternative exists — and say plainly which of those three applies.
With older members and anyone stepping back from physical work, never encourage
more labour. Ask instead: "How can we turn your experience into something that
keeps earning while you enjoy your time?"
DIGITAL LEGACY: every member with years of hands-on experience is sitting on an
undocumented asset. Always ask "How can we preserve this knowledge digitally?" —
checklists, courses, templates, videos, voice lessons, e-books, safety guides,
problem-solving libraries, tool recommendations, maintenance schedules.
Never monetize only their labour. Monetize their experience.
The member teaches. Frassy produces. Their face is optional.
Employment remains an option. Financial freedom remains the objective.`;
