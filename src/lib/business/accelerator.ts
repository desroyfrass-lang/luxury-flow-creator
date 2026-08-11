// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0459 — Frass Business Builder · Launch Accelerator
//
// This is not a course, a checklist or a learning centre. It is a business
// coach. Every morning it asks one question:
//
//   "What is the fastest, smartest way to move this partner closer to
//    sustainable income?"
//
// Extension, not replacement: this sits on top of the existing Business
// Builder (src/lib/business-builder.ts), the Daily (src/lib/workspace/daily.ts),
// the Vault and the Academy. It adds sequencing, income weighting and
// adaptive planning — nothing that already exists is rebuilt here.
// ─────────────────────────────────────────────────────────────────────────────

/** ⭐ rating — how much this single move is worth to real income. */
export type Potential = 1 | 2 | 3 | 4;

export const POTENTIAL_LABEL: Record<Potential, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Direct income",
};

export function stars(p: Potential): string {
  return "⭐".repeat(p);
}

/** Just-in-time learning. Never a course — a few minutes, right when needed. */
export type MicroLesson = {
  id: string;
  label: string;
  minutes: number;
  plain: string;
};

export const MICRO_LESSONS: Record<string, MicroLesson> = {
  canva: {
    id: "canva",
    label: "Canva in 3 minutes",
    minutes: 3,
    plain: "How to open a template, change the words and the colours, and export it.",
  },
  "affiliate-links": {
    id: "affiliate-links",
    label: "Affiliate links in 2 minutes",
    minutes: 2,
    plain: "What a tracked link is, where to get yours, and how the sale finds its way back to you.",
  },
  "podcast-rss": {
    id: "podcast-rss",
    label: "Podcast RSS in 5 minutes",
    minutes: 5,
    plain: "The one address that carries your show to Apple, Spotify and everywhere else.",
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest that actually sells",
    minutes: 4,
    plain: "Why Pinterest behaves like a search engine, not a social feed.",
  },
  "product-photos": {
    id: "product-photos",
    label: "Phone product photos",
    minutes: 4,
    plain: "Window light, plain wall, one angle per item. That's the whole trick.",
  },
  pricing: {
    id: "pricing",
    label: "Pricing without guessing",
    minutes: 4,
    plain: "Cost, time and what the market already pays — then a number you can defend.",
  },
  "faceless-video": {
    id: "faceless-video",
    label: "Faceless video in 5 minutes",
    minutes: 5,
    plain: "Voice, b-roll and captions. Your face never has to be in frame.",
  },
  "listing-copy": {
    id: "listing-copy",
    label: "Writing a listing that sells",
    minutes: 3,
    plain: "What it is, who it's for, why it's worth it — in that order.",
  },
};

export type Move = {
  id: string;
  label: string;
  /** Frassy always explains WHY — never a bare task. */
  why: string;
  minutes: number;
  potential: Potential;
  /** Major moves change the business. Minor moves tidy it. */
  major: boolean;
  lesson?: string;
  href?: string;
};

export type Stage = {
  id: string;
  label: string;
  /** The milestone Frassy celebrates when the stage closes. */
  milestone: string;
  moves: Move[];
};

export type LaunchBusiness = {
  id: string;
  emoji: string;
  label: string;
  mission: string;
  stages: Stage[];
};

const m = (
  id: string,
  label: string,
  why: string,
  minutes: number,
  potential: Potential,
  major: boolean,
  extra: { lesson?: string; href?: string } = {},
): Move => ({ id, label, why, minutes, potential, major, ...extra });

// ── The five launch journeys ────────────────────────────────────────────────
// Each vault becomes a journey, not a folder.

export const LAUNCH_BUSINESSES: LaunchBusiness[] = [
  {
    id: "affiliate",
    emoji: "🤝",
    label: "Affiliate Marketing",
    mission: "The fastest route to a first dollar — no stock, no shipping, no staff.",
    stages: [
      {
        id: "niche",
        label: "Choose Niche",
        milestone: "You know exactly who you're talking to.",
        moves: [
          m("aff-niche", "Pick one niche and write it in a sentence", "A narrow niche makes every later decision faster — content, products and audience all fall out of this one line.", 20, 3, true),
          m("aff-audience", "Describe the person who buys", "You can't write for everyone. One person, named and pictured, and the words come easily.", 15, 2, false),
        ],
      },
      {
        id: "products",
        label: "Choose Products",
        milestone: "You have products worth recommending.",
        moves: [
          m("aff-shortlist", "Shortlist 5 products you'd genuinely recommend", "Trust is the whole business. Anything you wouldn't buy yourself costs more than it earns.", 30, 3, true, { href: "/workspace/affiliate" }),
          m("aff-apply", "Apply to the affiliate programs", "Approval takes days, so this starts now and works in the background while you build.", 20, 3, true),
        ],
      },
      {
        id: "platform",
        label: "Learn Platform",
        milestone: "You can create a tracked link on your own.",
        moves: [
          m("aff-links", "Learn tracked affiliate links", "If the link isn't tracked, the sale doesn't come back to you. This is the plumbing.", 10, 2, false, { lesson: "affiliate-links" }),
          m("aff-frasslink", "Wire your Frass Link", "One permanent link that carries your card, your shop and your referrals for life.", 10, 3, false, { href: "/workspace/link" }),
        ],
      },
      {
        id: "content",
        label: "Create Content",
        milestone: "You have something real to publish.",
        moves: [
          m("aff-review", "Write one honest product review", "A review is the highest-converting thing you can make. This is the money asset.", 45, 4, true, { lesson: "listing-copy" }),
          m("aff-pins", "Make 3 Pinterest pins", "Pinterest is a search engine — pins keep working months after you post them.", 25, 2, false, { lesson: "pinterest" }),
        ],
      },
      {
        id: "publish",
        label: "Publish",
        milestone: "Your first campaign is live.",
        moves: [
          m("aff-publish", "Publish the review with your links", "Nothing earns while it's in drafts. Published beats perfect.", 15, 4, true),
        ],
      },
      {
        id: "clicks",
        label: "Generate Clicks",
        milestone: "Real people are reaching your link.",
        moves: [
          m("aff-share", "Share it in 3 places where your buyer already is", "Traffic doesn't arrive on its own for the first month. You carry it there.", 20, 3, true),
          m("aff-track", "Check your click numbers", "Numbers tell you which product to double down on — guessing wastes weeks.", 10, 2, false, { href: "/workspace/affiliate" }),
        ],
      },
      {
        id: "first-sale",
        label: "First Sale",
        milestone: "Someone bought because of you.",
        moves: [
          m("aff-optimise", "Rewrite the weakest section and repost", "The first version rarely converts. The second usually does.", 25, 4, true),
        ],
      },
      {
        id: "scale",
        label: "Scale",
        milestone: "It repeats without starting over.",
        moves: [
          m("aff-repeat", "Repeat the winning format for product 2", "Once one works, you stop inventing and start copying yourself.", 45, 4, true),
        ],
      },
    ],
  },
  {
    id: "wellness",
    emoji: "🌿",
    label: "Wellness Brand",
    mission: "A brand with your name on it — slower to start, biggest ceiling.",
    stages: [
      {
        id: "identity",
        label: "Define the Brand",
        milestone: "The brand knows what it stands for.",
        moves: [
          m("well-promise", "Write the brand promise in one line", "Everything — packaging, pricing, tone — hangs off this one sentence.", 25, 3, true),
          m("well-name", "Lock the name and colours", "Consistency is what makes a small brand look established.", 20, 2, false, { lesson: "canva" }),
        ],
      },
      {
        id: "offer",
        label: "Build the Offer",
        milestone: "There is something to sell.",
        moves: [
          m("well-first", "Choose the first product", "One product launched beats five planned. Range comes after revenue.", 30, 3, true),
          m("well-price", "Price it properly", "Priced too low, you work for free. This decides whether the business survives.", 20, 4, true, { lesson: "pricing" }),
        ],
      },
      {
        id: "shopfront",
        label: "Open the Shop",
        milestone: "People can actually buy.",
        moves: [
          m("well-photos", "Photograph the product", "People buy what they can see. Phone plus window light is enough.", 40, 3, true, { lesson: "product-photos" }),
          m("well-listing", "Write the listing", "The listing does the selling when you're asleep.", 25, 3, true, { lesson: "listing-copy" }),
          m("well-pay", "Turn on payments", "A shop that can't take money isn't a shop.", 15, 4, false, { href: "/workspace/wallet" }),
        ],
      },
      {
        id: "launch",
        label: "Launch",
        milestone: "The wellness brand is live.",
        moves: [
          m("well-launch", "Announce the launch", "A launch day gives people a reason to buy now instead of later.", 30, 4, true),
        ],
      },
      {
        id: "grow",
        label: "First Customers",
        milestone: "Your first wellness sale.",
        moves: [
          m("well-reviews", "Ask your first 3 buyers for a word", "Other people's words sell better than yours ever will.", 15, 3, false),
        ],
      },
    ],
  },
  {
    id: "coco-vintage",
    emoji: "👗",
    label: "Coco Vintage",
    mission: "Stock you already own, turned into cash flow quickly.",
    stages: [
      {
        id: "inventory",
        label: "Count the Stock",
        milestone: "You know what you have and what it's worth.",
        moves: [
          m("coco-count", "List every piece you have", "You can't sell what you can't see. This becomes the catalogue.", 45, 3, true),
          m("coco-price", "Price the first 10 pieces", "Vintage pricing is research, not feeling.", 30, 3, true, { lesson: "pricing" }),
        ],
      },
      {
        id: "shoot",
        label: "Shoot the Pieces",
        milestone: "The collection looks like a store, not a cupboard.",
        moves: [
          m("coco-shoot", "Photograph today's two pieces", "Front, back, detail. Two garments at a time beats a whole-day catalogue shoot you never start.", 20, 4, true, { href: "/collection", lesson: "product-photos" }),
        ],
      },
      {
        id: "list",
        label: "List Them",
        milestone: "The pieces are buyable.",
        moves: [
          m("coco-list", "Publish today's two pieces with their story", "Frassy writes the page from your own words. Two a day and the boutique is full before launch.", 20, 4, true, { href: "/collection", lesson: "listing-copy" }),
        ],
      },
      {
        id: "drop",
        label: "First Drop",
        milestone: "Coco Vintage has launched.",
        moves: [
          m("coco-drop", "Run a dated drop", "A deadline turns browsers into buyers.", 30, 4, true),
        ],
      },
      {
        id: "repeat",
        label: "Repeat Weekly",
        milestone: "The drop rhythm is established.",
        moves: [
          m("coco-rhythm", "Set a weekly drop day", "Rhythm builds a returning audience; random posting doesn't.", 15, 3, false),
        ],
      },
    ],
  },
  {
    id: "faceless",
    emoji: "📸",
    label: "Faceless Content",
    mission: "Reach and income without ever being on camera.",
    stages: [
      {
        id: "format",
        label: "Choose the Format",
        milestone: "You have a repeatable format.",
        moves: [
          m("face-format", "Pick one format and stick to it", "Repeatable beats creative. The format is what makes daily posting possible.", 20, 3, true, { lesson: "faceless-video" }),
        ],
      },
      {
        id: "batch",
        label: "Batch Creation",
        milestone: "A week of content exists in advance.",
        moves: [
          m("face-batch", "Make 5 videos in one sitting", "Batching protects your two hours. One setup, five outputs.", 60, 3, true, { href: "/studio" }),
          m("face-captions", "Add captions and hooks", "The first 2 seconds decide everything else.", 25, 3, false),
        ],
      },
      {
        id: "publish",
        label: "Publish Daily",
        milestone: "The channel is live and posting.",
        moves: [
          m("face-schedule", "Schedule the week", "Scheduled content survives bad days.", 20, 3, true),
        ],
      },
      {
        id: "monetise",
        label: "Monetise",
        milestone: "The content earns.",
        moves: [
          m("face-monetise", "Attach affiliate or product links", "Views without a link are applause, not income.", 20, 4, true),
        ],
      },
    ],
  },
  {
    id: "podcast",
    emoji: "🎙",
    label: "Podcast",
    mission: "The long game — authority that makes everything else easier to sell.",
    stages: [
      {
        id: "concept",
        label: "Shape the Show",
        milestone: "The show has a clear premise.",
        moves: [
          m("pod-concept", "Write the show premise and format", "A clear premise is what makes a listener subscribe after one episode.", 30, 2, true),
          m("pod-art", "Make the cover art", "Needed to publish, but it earns nothing on its own — keep it to 30 minutes.", 30, 1, false, { lesson: "canva" }),
        ],
      },
      {
        id: "record",
        label: "Record Episode One",
        milestone: "Episode one exists.",
        moves: [
          m("pod-record", "Record the first episode", "The first episode is always the hardest and always the one that unlocks the rest.", 60, 3, true, { href: "/studio" }),
        ],
      },
      {
        id: "publish",
        label: "Publish",
        milestone: "The podcast is live.",
        moves: [
          m("pod-rss", "Set up the feed and submit the show", "One address carries you to every platform at once.", 25, 2, true, { lesson: "podcast-rss" }),
        ],
      },
      {
        id: "grow",
        label: "Grow & Partner",
        milestone: "First brand partnership.",
        moves: [
          m("pod-partner", "Pitch one brand partnership", "Authority converts to money the moment you ask.", 30, 4, true, { href: "/brand-partnerships" }),
        ],
      },
    ],
  },
];

export function businessById(id: string): LaunchBusiness | undefined {
  return LAUNCH_BUSINESSES.find((b) => b.id === id);
}

/** Fully-qualified move id: business:stage:move */
export function moveKey(businessId: string, stageId: string, moveId: string): string {
  return `${businessId}:${stageId}:${moveId}`;
}

export type ResolvedMove = Move & {
  key: string;
  businessId: string;
  businessLabel: string;
  businessEmoji: string;
  stageId: string;
  stageLabel: string;
  done: boolean;
};

// ── State ───────────────────────────────────────────────────────────────────

export type LaunchState = {
  /** Which journeys are active for this partner. */
  businesses: string[];
  /** Completed move keys. */
  done: string[];
  /** Completed micro-lessons. */
  lessons: string[];
  /** ISO dates (yyyy-mm-dd) on which any move was completed. */
  activeDays: string[];
  /** Income timeline marks: timeline id → ISO date. */
  incomeMarks: Record<string, string>;
  /** Money actually earned so far, entered by the partner. */
  earned: number;
};

export const EMPTY_STATE: LaunchState = {
  businesses: LAUNCH_BUSINESSES.map((b) => b.id),
  done: [],
  lessons: [],
  activeDays: [],
  incomeMarks: {},
  earned: 0,
};

export function normalizeState(raw: unknown): LaunchState {
  const s = (raw ?? {}) as Partial<LaunchState>;
  return {
    businesses: Array.isArray(s.businesses) && s.businesses.length ? s.businesses : EMPTY_STATE.businesses,
    done: Array.isArray(s.done) ? s.done : [],
    lessons: Array.isArray(s.lessons) ? s.lessons : [],
    activeDays: Array.isArray(s.activeDays) ? s.activeDays : [],
    incomeMarks: (s.incomeMarks as Record<string, string>) ?? {},
    earned: typeof s.earned === "number" ? s.earned : 0,
  };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Resolution & readiness ──────────────────────────────────────────────────

export function allMoves(state: LaunchState): ResolvedMove[] {
  const out: ResolvedMove[] = [];
  for (const b of LAUNCH_BUSINESSES) {
    if (!state.businesses.includes(b.id)) continue;
    for (const st of b.stages) {
      for (const mv of st.moves) {
        const key = moveKey(b.id, st.id, mv.id);
        out.push({
          ...mv,
          key,
          businessId: b.id,
          businessLabel: b.label,
          businessEmoji: b.emoji,
          stageId: st.id,
          stageLabel: st.label,
          done: state.done.includes(key),
        });
      }
    }
  }
  return out;
}

export function readiness(state: LaunchState): number {
  const moves = allMoves(state);
  if (!moves.length) return 0;
  return Math.round((moves.filter((x) => x.done).length / moves.length) * 100);
}

export function businessReadiness(state: LaunchState, businessId: string): number {
  const moves = allMoves(state).filter((x) => x.businessId === businessId);
  if (!moves.length) return 0;
  return Math.round((moves.filter((x) => x.done).length / moves.length) * 100);
}

/** Days to launch at the partner's real available pace — never a fantasy number. */
export function estimatedLaunchDays(state: LaunchState, hoursPerDay: number): number {
  const remaining = allMoves(state)
    .filter((x) => !x.done && x.major)
    .reduce((n, x) => n + x.minutes, 0);
  const perDay = Math.max(30, hoursPerDay * 60 * 0.75); // 75% of the window is real work
  return Math.max(0, Math.ceil(remaining / perDay));
}

/** Stage completion for the journey map. */
export function stageDone(state: LaunchState, businessId: string, stageId: string): boolean {
  const b = businessById(businessId);
  const st = b?.stages.find((s) => s.id === stageId);
  if (!st) return false;
  return st.moves.every((mv) => state.done.includes(moveKey(businessId, stageId, mv.id)));
}

// ── Momentum — never overload her ───────────────────────────────────────────

export const MAX_MAJOR = 3;
export const MAX_MINOR = 5;

/**
 * Today's Money Moves. Ordered by earliest unfinished stage first (a journey
 * only moves in sequence), then by income potential. Capped so the day is
 * always finishable.
 */
export function todaysMoves(state: LaunchState, hoursPerDay: number): ResolvedMove[] {
  const open = allMoves(state).filter((x) => !x.done);
  const stageIndex = (x: ResolvedMove) =>
    businessById(x.businessId)?.stages.findIndex((s) => s.id === x.stageId) ?? 99;

  const ranked = [...open].sort((a, b) => {
    const s = stageIndex(a) - stageIndex(b);
    if (s !== 0) return s;
    return b.potential - a.potential;
  });

  const budget = hoursPerDay * 60;
  const picked: ResolvedMove[] = [];
  let major = 0;
  let minor = 0;
  let minutes = 0;

  for (const mv of ranked) {
    if (mv.major && major >= MAX_MAJOR) continue;
    if (!mv.major && minor >= MAX_MINOR) continue;
    if (minutes + mv.minutes > budget && picked.length >= 3) continue;
    picked.push(mv);
    minutes += mv.minutes;
    if (mv.major) major += 1;
    else minor += 1;
    if (major >= MAX_MAJOR && minor >= MAX_MINOR) break;
  }
  return picked;
}

/** Learning only appears when it is needed for today's work. */
export function todaysLessons(state: LaunchState, moves: ResolvedMove[]): MicroLesson[] {
  const ids = new Set(moves.map((x) => x.lesson).filter(Boolean) as string[]);
  return [...ids]
    .filter((id) => !state.lessons.includes(id))
    .map((id) => MICRO_LESSONS[id])
    .filter(Boolean) as MicroLesson[];
}

// ── The coach ───────────────────────────────────────────────────────────────

/** Never "you have 12 tasks". Always the reason, and always what it unlocks. */
export function coachLine(state: LaunchState, moves: ResolvedMove[]): string {
  if (!moves.length) {
    return "Everything I had planned for you is done. That's not a small thing — take the rest of the day.";
  }
  const majors = moves.filter((x) => x.major);
  const lead = majors[0] ?? moves[0]!;
  const b = businessById(lead.businessId);
  const stages = b?.stages ?? [];
  const idx = stages.findIndex((s) => s.id === lead.stageId);
  const next = stages[idx + 1];
  const count = majors.length || moves.length;
  const unlock = next
    ? `you'll be ready to move ${b?.label} into ${next.label.toLowerCase()} tomorrow`
    : `${b?.label} reaches its last stage`;
  return `If we finish ${count === 1 ? "this one thing" : `these ${count} things`} today, ${unlock}. That's the whole reason they're on the list.`;
}

/** Celebration — meaningful progress, never confetti. */
export function celebrate(name: string, move: ResolvedMove, state: LaunchState): string {
  const b = businessById(move.businessId);
  const closed = stageDone(state, move.businessId, move.stageId);
  if (closed) {
    const st = b?.stages.find((s) => s.id === move.stageId);
    return `${name}, that closes ${move.stageLabel} on ${b?.label}. ${st?.milestone} Most people never get this far. Tomorrow we build on it.`;
  }
  if (move.potential >= 4) {
    return `${name}, that one moves money. ${b?.label} is measurably closer to earning than it was an hour ago.`;
  }
  return `Done. ${b?.label} moved forward — small steps in the right order are how this actually works.`;
}

// ── Adaptive planning ───────────────────────────────────────────────────────

export type AdaptiveNote = { tone: "welcome-back" | "ahead" | "steady"; line: string };

export function adaptivePlan(state: LaunchState, moves: ResolvedMove[]): AdaptiveNote {
  const last = [...state.activeDays].sort().pop();
  if (last) {
    const gap = Math.floor((Date.parse(today()) - Date.parse(last)) / 86400000);
    if (gap >= 2) {
      return {
        tone: "welcome-back",
        line: "Welcome back. I've reorganised everything so we can get back on track — nothing was lost, and nothing is behind.",
      };
    }
  }
  const doneToday = state.activeDays.includes(today());
  if (doneToday && moves.length === 0) {
    return {
      tone: "ahead",
      line: "We're ahead of schedule. Would you like to work on tomorrow's priorities today, or stop while you're winning?",
    };
  }
  return { tone: "steady", line: "Steady pace. This is exactly where you should be." };
}

// ── Weekly review ───────────────────────────────────────────────────────────

export type WeeklyReview = {
  daysWorked: number;
  movesCompleted: number;
  majorCompleted: number;
  minutesWorked: number;
  earned: number;
  readinessPct: number;
  nextWeek: string;
};

export function weeklyReview(state: LaunchState, hoursPerDay: number): WeeklyReview {
  const since = Date.now() - 7 * 86400000;
  const daysWorked = state.activeDays.filter((d) => Date.parse(d) >= since).length;
  const done = allMoves(state).filter((x) => x.done);
  const minutesWorked = done.reduce((n, x) => n + x.minutes, 0);
  const majorCompleted = done.filter((x) => x.major).length;
  const pct = readiness(state);
  const nextWeek =
    daysWorked >= 5
      ? "You held five days. Next week I'll push one extra major move per day — you've earned the load."
      : daysWorked >= 2
        ? "A solid week. Next week's plan is the same shape, with the highest-earning moves pulled forward."
        : "Short week, and that's fine. Next week starts smaller so the first day feels easy again.";
  return {
    daysWorked,
    movesCompleted: done.length,
    majorCompleted,
    minutesWorked,
    earned: state.earned,
    readinessPct: pct,
    nextWeek: `${nextWeek} At this pace launch lands in about ${estimatedLaunchDays(state, hoursPerDay)} days.`,
  };
}

// ── Income timeline ─────────────────────────────────────────────────────────

export type TimelineMark = {
  id: string;
  label: string;
  /** Auto-reached when this move key is complete. */
  requires?: string;
  /** Or reached when earnings pass this figure. */
  amount?: number;
};

export const INCOME_TIMELINE: TimelineMark[] = [
  { id: "aff-live", label: "First affiliate campaign live", requires: "affiliate:publish:aff-publish" },
  { id: "aff-sale", label: "First affiliate sale", requires: "affiliate:first-sale:aff-optimise" },
  { id: "coco-launch", label: "First Coco Vintage drop", requires: "coco-vintage:drop:coco-drop" },
  { id: "well-sale", label: "First wellness sale", requires: "wellness:grow:well-reviews" },
  { id: "pod-ep", label: "First podcast episode", requires: "podcast:publish:pod-rss" },
  { id: "partnership", label: "First brand partnership", requires: "podcast:grow:pod-partner" },
  { id: "m100", label: "First $100", amount: 100 },
  { id: "m500", label: "First $500", amount: 500 },
  { id: "m1000", label: "First $1,000", amount: 1000 },
];

export function timelineReached(state: LaunchState, mark: TimelineMark): boolean {
  if (mark.requires) return state.done.includes(mark.requires);
  if (typeof mark.amount === "number") return state.earned >= mark.amount;
  return false;
}

// ── Founder oversight ───────────────────────────────────────────────────────

export type OversightSummary = {
  readinessPct: number;
  launchDays: number;
  movesCompleted: number;
  movesTotal: number;
  daysWorkedThisWeek: number;
  lastActive: string | null;
  earned: number;
  /** Where the partner may quietly be stuck. */
  supportSignals: string[];
};

export function oversight(state: LaunchState, hoursPerDay: number): OversightSummary {
  const moves = allMoves(state);
  const last = [...state.activeDays].sort().pop() ?? null;
  const signals: string[] = [];
  const gap = last ? Math.floor((Date.parse(today()) - Date.parse(last)) / 86400000) : null;
  if (gap !== null && gap >= 3) signals.push(`Quiet for ${gap} days — a check-in would land well.`);
  for (const b of LAUNCH_BUSINESSES) {
    if (!state.businesses.includes(b.id)) continue;
    const bm = moves.filter((x) => x.businessId === b.id);
    const stuck = bm.find((x) => !x.done && x.major);
    if (stuck && bm.filter((x) => x.done).length === 0) {
      signals.push(`${b.emoji} ${b.label} hasn't started — the first step may be unclear.`);
    }
  }
  if (state.earned === 0 && moves.filter((x) => x.done).length > 8) {
    signals.push("Plenty of work completed but nothing earned yet — worth reprioritising toward income moves.");
  }
  return {
    readinessPct: readiness(state),
    launchDays: estimatedLaunchDays(state, hoursPerDay),
    movesCompleted: moves.filter((x) => x.done).length,
    movesTotal: moves.length,
    daysWorkedThisWeek: state.activeDays.filter((d) => Date.parse(d) >= Date.now() - 7 * 86400000).length,
    lastActive: last,
    earned: state.earned,
    supportSignals: signals,
  };
}
