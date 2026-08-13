// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0533-A — Three Levels of Financial Freedom
//
// Every Business Vault is really three businesses stacked on top of each other:
//
//        Earn  →  Scale  →  Legacy
//
// Frass must never stop at helping someone earn a living. Its purpose is to
// help them build assets, businesses and intellectual property that keep
// creating value for them, their family and the generations after them.
//
// Plain English: first get paid for what you do. Then package what you know so
// it sells while you sleep. Then own things — a channel, a library, a brand —
// that keep paying long after you stop working.
// ─────────────────────────────────────────────────────────────────────────────

export type FreedomLevelId = "earn" | "scale" | "legacy";

export type FreedomLevel = {
  id: FreedomLevelId;
  stage: string;
  emoji: string;
  label: string;
  /** One line a kindergartener could follow. */
  plain: string;
  /** What this level actually produces. */
  examples: string[];
  /** The honest limitation that pushes the member to the next level. */
  ceiling: string;
};

export const FREEDOM_LEVELS: FreedomLevel[] = [
  {
    id: "earn",
    stage: "Stage 1",
    emoji: "💪",
    label: "Earn — Active Income",
    plain: "Get paid properly for the work you already do today.",
    examples: [
      "Hair appointments",
      "Electrical and renovation work",
      "Sewing and alterations",
      "Photography sessions",
      "Cooking and catering",
    ],
    ceiling: "It stops the day you stop. Your income is capped by your hours.",
  },
  {
    id: "scale",
    stage: "Stage 2",
    emoji: "📚",
    label: "Scale — Digital Income",
    plain: "Turn what you know into something that can be sold more than once.",
    examples: [
      "Courses",
      "Templates and forms",
      "E-books and guides",
      "Teaching videos",
      "Checklists",
    ],
    ceiling: "It sells while you sleep, but it still needs you to keep it alive.",
  },
  {
    id: "legacy",
    stage: "Stage 3",
    emoji: "🏛",
    label: "Legacy — Legacy Income",
    plain: "Build things that keep earning long after you stop working.",
    examples: [
      "Memberships",
      "A YouTube channel and its back catalog",
      "Royalties and licensing",
      "Affiliate libraries",
      "Downloadable resources",
      "Characters, series and intellectual property",
      "Evergreen educational content",
    ],
    ceiling: "There isn't one. This is the part your family can inherit.",
  },
];

export const LEVEL_BY_ID = Object.fromEntries(
  FREEDOM_LEVELS.map((l) => [l.id, l]),
) as Record<FreedomLevelId, FreedomLevel>;

/**
 * Every Vault move belongs to one of the three levels. Doing the work is Earn;
 * packaging the knowledge is Scale; owning the asset is Legacy.
 */
export function levelForStage(stage: "discover" | "build" | "monetize"): FreedomLevelId {
  return stage === "monetize" ? "scale" : "earn";
}

export const THREE_LEVELS_PRINCIPLE = {
  id: "FRASS-0533-A",
  headline:
    "Frass should never stop at helping members earn a living.",
  founderPrinciple:
    "Its purpose is to help members build assets, businesses and legacies that continue creating value " +
    "for themselves, their families and future generations.",
  plain:
    "What this means in plain English: a plumber with forty years of experience should not retire with nothing " +
    "but worn-out tools. A hairstylist should not retire with decades of technique disappearing with her. " +
    "Frass is the bridge between a lifetime of experience and something that keeps earning.",
  question:
    "Which level is this member on today — Earn, Scale or Legacy — and what is the one move that lifts them to the next?",
} as const;
