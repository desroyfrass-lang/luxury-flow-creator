// FRASS-0569 — The Welcome Hall Constitutional Experience.
//
// The Welcome Hall is not a page. It is the front entrance to Frass Hill.
// Every Builder passes through it before the Daily. The member may skip it
// after arriving; the platform may never bypass it.
//
// Three Welcome Hall experiences:
//   1. 🌅 Daily Welcome            — once per calendar day, before the Daily
//   2. 🏗️ First-Time Orientation   — exactly once, a conversation not a form
//   3. 🛍️ Shopper Welcome          — retail hospitality, no Daily, no interview
//
// Four Daily Welcome tiers, chosen by the member in their Daily settings.

export type WelcomeTier = "quick" | "motivational" | "conversation" | "celebration";

export type WelcomeTierMeta = {
  id: WelcomeTier;
  glyph: string;
  name: string;
  length: string;
  summary: string;
};

export const WELCOME_TIERS: WelcomeTierMeta[] = [
  {
    id: "quick",
    glyph: "🌱",
    name: "Quick Welcome",
    length: "10–15 seconds",
    summary: "A simple good morning and a warm send-off into your day.",
  },
  {
    id: "motivational",
    glyph: "💬",
    name: "Motivational Welcome",
    length: "20–30 seconds",
    summary: "A greeting, one thought worth carrying, and today's encouragement.",
  },
  {
    id: "conversation",
    glyph: "❤️",
    name: "Conversation Welcome",
    length: "A short back-and-forth",
    summary: "Frassy asks how you are, listens, then walks you to the starting line.",
  },
  {
    id: "celebration",
    glyph: "🎥",
    name: "Celebration Welcome",
    length: "About a minute",
    summary: "Your progress, milestones and wins, celebrated before the work begins.",
  },
];

export const TIER_BY_ID: Record<WelcomeTier, WelcomeTierMeta> = WELCOME_TIERS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<WelcomeTier, WelcomeTierMeta>,
);

/** The three purposes of the Welcome Hall, stated plainly for members. */
export const WELCOME_HALL_PURPOSES = [
  {
    glyph: "🌅",
    id: "daily",
    title: "Daily Welcome",
    when: "Once each day, before you begin",
    line: "Frassy welcomes you, resets the mind and hands you the day. Then the Daily begins.",
  },
  {
    glyph: "🏗️",
    id: "orientation",
    title: "First-Time Builder Orientation",
    when: "Exactly once",
    line: "A real conversation, not a form. It continues until Frassy understands what you're building — only then does your Daily exist.",
  },
  {
    glyph: "🛍️",
    id: "shopper",
    title: "Shopper Welcome",
    when: "Anytime you come to shop",
    line: "Pure hospitality — Frass Kicks, collections, marketplace and what's new. No onboarding, no Daily, no interview.",
  },
] as const;

// ── The member's preference ──────────────────────────────────────────────────

const TIER_KEY = "frass:welcome-hall:tier";
const DAY_KEY = "frass:welcome-hall:last-day";

export function getWelcomeTier(): WelcomeTier {
  if (typeof window === "undefined") return "motivational";
  try {
    const raw = window.localStorage.getItem(TIER_KEY) as WelcomeTier | null;
    return raw && raw in TIER_BY_ID ? raw : "motivational";
  } catch {
    return "motivational";
  }
}

export function setWelcomeTier(tier: WelcomeTier) {
  try {
    window.localStorage.setItem(TIER_KEY, tier);
    window.dispatchEvent(new Event("frass-welcome-tier"));
  } catch {
    /* ignore */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True once the member has been welcomed (or has skipped) today. */
export function welcomedToday(): boolean {
  if (typeof window === "undefined") return true; // never gate during SSR
  try {
    return window.localStorage.getItem(DAY_KEY) === today();
  } catch {
    return true;
  }
}

export function markWelcomedToday() {
  try {
    window.localStorage.setItem(DAY_KEY, today());
    window.dispatchEvent(new Event("frass-welcome-complete"));
  } catch {
    /* ignore */
  }
}

/** Founder testing aid — clears today's welcome so it plays again. */
export function resetDailyWelcome() {
  try {
    window.localStorage.removeItem(DAY_KEY);
  } catch {
    /* ignore */
  }
}

// ── What Frassy actually says ────────────────────────────────────────────────

function partOfDay(d = new Date()): "morning" | "afternoon" | "evening" {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

const THOUGHTS = [
  "Small, finished things beat big, unfinished ones. Pick one and finish it.",
  "You are not behind. You are exactly where today starts.",
  "Momentum is built from one honest hour, not a perfect week.",
  "The work you do quietly today is the reputation you'll have loudly later.",
  "Build the thing only you could build. That's the part nobody can copy.",
];

export type WelcomeScript = {
  /** Everything Frassy says, in order. */
  lines: string[];
  /** Prompts for the conversation tier; empty otherwise. */
  prompts: { question: string; replies: string[]; response: string }[];
  /** Celebration cards; empty otherwise. */
  celebration: { glyph: string; title: string; line: string }[];
};

export type WelcomeContext = {
  name: string | null;
  /** How many things Frassy remembers about this Builder. */
  remembered?: number;
  /** Named wins to celebrate, newest first. */
  wins?: string[];
  journeyComplete?: boolean;
};

export function buildWelcomeScript(tier: WelcomeTier, ctx: WelcomeContext): WelcomeScript {
  const who = ctx.name ? `, ${ctx.name}` : "";
  const time = partOfDay();
  const hello = `Good ${time}${who}. Welcome back to Frass Hill.`;
  const thought = THOUGHTS[new Date().getDate() % THOUGHTS.length];

  if (tier === "quick") {
    return {
      lines: [hello, "I hope you have a wonderful day. Your Daily is ready when you are."],
      prompts: [],
      celebration: [],
    };
  }

  if (tier === "motivational") {
    return {
      lines: [
        hello,
        `Here's the thought I'd carry into today: ${thought}`,
        "Take a breath. When you walk in, we start with one winnable move — nothing else.",
      ],
      prompts: [],
      celebration: [],
    };
  }

  if (tier === "conversation") {
    return {
      lines: [hello, "Before we start — how are you feeling today?"],
      prompts: [
        {
          question: "How are you feeling today?",
          replies: ["Strong", "Steady", "Tired", "Honestly, low"],
          response:
            "Thank you for telling me. However you arrived, we plan the day around that — not against it.",
        },
        {
          question: "Ready to build?",
          replies: ["Ready", "Give me a moment", "Just a small one today"],
          response: `${thought} That's your day. Let's take it one move at a time.`,
        },
      ],
      celebration: [],
    };
  }

  const wins = (ctx.wins ?? []).slice(0, 4);
  return {
    lines: [
      `${hello} Before anything else — look at what you've already done.`,
      wins.length
        ? "These are real, and they happened because you kept showing up."
        : "You've kept showing up, and that is the part most people never manage.",
      `${thought} Now let's add today to the list.`,
    ],
    prompts: [],
    celebration: [
      ...wins.map((w) => ({ glyph: "🏆", title: "A win worth naming", line: w })),
      ...(ctx.remembered
        ? [
            {
              glyph: "🧠",
              title: "What I remember about you",
              line: `${ctx.remembered} things you've told me are safely held and shaping today's Daily.`,
            },
          ]
        : []),
      {
        glyph: "🌅",
        title: "Today",
        line: "A fresh page on the Hill. Nothing carried over as a debt — only as a foundation.",
      },
    ],
  };
}
