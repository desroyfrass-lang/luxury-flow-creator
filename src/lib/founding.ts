/**
 * FRASS-0490 — First Partner Program. The First Builders of Frass.
 *
 * Constitutional amendment, P0. This file holds the *meaning* of the
 * recognition; the database holds the record and the server functions hold the
 * authority. It deliberately adds no new partner system, no second Builder
 * Identity and no permission of any kind — First Partner is an honour, and
 * an honour is not an access level.
 */

export const FOUNDING_PRINCIPLE =
  "First Partners are remembered not because they arrived first, but because they chose to help build something before its success was certain. Their contribution becomes part of the history of Frass and is honoured with lifelong recognition.";

export const FOUNDING_PLAIN_ENGLISH =
  "Here's the takeaway: this is the platform's wall of names. It is a thank-you carved in stone, not a key to a locked door. It never changes what you earn, what you can approve, or what you can see — think of a founder's plaque in the lobby of a building: everyone reads it, nobody uses it to get into the vault.";

/** The rules that can never be softened by a later feature. */
export const FOUNDING_RULES = [
  {
    id: "founder-only",
    title: "Granted only by the Founder",
    detail:
      "First Partner recognition cannot be earned, purchased or requested. The Founder grants it personally, or it does not exist.",
    plainEnglish:
      "There is no scoreboard to climb and no button to apply. It is a personal thank-you, the way a family names a godparent.",
  },
  {
    id: "permanent",
    title: "Permanent for life",
    detail:
      "Once granted, the designation belongs to the member for life and stays in the historical record.",
    plainEnglish:
      "Even if you step away for ten years, the record still says you were here at the start.",
  },
  {
    id: "not-authority",
    title: "Recognition is not authority",
    detail:
      "First Partner status grants no Founder permissions, no financial permissions, no administrative access and no security privileges.",
    plainEnglish:
      "The badge opens no doors. Permissions live in roles; honour lives here, and the two never touch.",
  },
  {
    id: "no-financial-advantage",
    title: "No financial advantage",
    detail:
      "Earnings, commissions, business rules and financial policies are identical for every member, First Partner or not.",
    plainEnglish:
      "Nobody gets a better cut for being early. The money rules are the same for everyone, forever.",
  },
  {
    id: "member-controls-visibility",
    title: "The member controls visibility",
    detail:
      "First Partners choose whether the designation is public, partners-only or private. Recognition always exists internally, even when hidden.",
    plainEnglish:
      "You decide who sees it. Hiding it doesn't erase it — the record keeps your place either way.",
  },
] as const;

export type FoundingVisibility = "public" | "partners" | "private";

export const FOUNDING_VISIBILITY: {
  id: FoundingVisibility;
  label: string;
  detail: string;
}[] = [
  {
    id: "public",
    label: "Public",
    detail: "Anyone visiting your Frass Card or FOR ME page sees the designation.",
  },
  {
    id: "partners",
    label: "Partners only",
    detail: "Only signed-in members of Frass see it. Visitors from outside do not.",
  },
  {
    id: "private",
    label: "Private",
    detail: "Nobody sees it but you. The record still stands internally, permanently.",
  },
];

export function visibilityMeta(id: string | null | undefined) {
  return FOUNDING_VISIBILITY.find((v) => v.id === id) ?? FOUNDING_VISIBILITY[1];
}

/** The badge as it appears everywhere. One mark, one wording, no variants. */
export const FOUNDING_BADGE = {
  glyph: "◈",
  label: "First Partner",
  short: "First Partner",
} as const;

export function foundingTitle(sequence: number | null | undefined): string {
  if (sequence === 1) return "The First Partner";
  if (!sequence) return FOUNDING_BADGE.label;
  return `First Partner No. ${sequence}`;
}

/**
 * The Kanko Principle — the very first First Partner (No. 1) is welcomed once, and
 * only once. After that they are simply a builder like everyone else.
 */
export function kankoWelcome(name: string): string[] {
  return [
    `${name}. You are the First Partner of Frass.`,
    "There was no proof this would work when you said yes. That's the part being remembered — not the timing, the trust.",
    "Nothing about your tools or your earnings changes today. What changes is the record: your name sits at the front of it for as long as Frass exists.",
  ];
}

/**
 * Milestone acknowledgements Frassy may use. Deliberately few and deliberately
 * quiet — recognition repeated daily stops being recognition.
 */
export const FOUNDING_ACKNOWLEDGEMENTS = [
  "Thank you for helping shape Frass from the beginning.",
  "You've reached another milestone as one of our First Partners.",
  "Another one built. The people who were here at the start are still building — that's the whole point.",
] as const;

/** How often Frassy may mention it at all: once a month, at a real milestone. */
export const FOUNDING_ACKNOWLEDGEMENT_COOLDOWN_DAYS = 30;

/** Founding Stories — the living history of the platform. */
export const FOUNDING_STORY_PROMPTS = [
  {
    key: "story_why" as const,
    title: "Why you joined Frass",
    prompt: "What made you say yes before there was anything to point at?",
  },
  {
    key: "story_hoped" as const,
    title: "What you hoped to build",
    prompt: "When you pictured it working, what were you doing in that picture?",
  },
  {
    key: "story_journey" as const,
    title: "Your early journey",
    prompt: "What did the first weeks actually feel like — the good and the awkward?",
  },
  {
    key: "story_lessons" as const,
    title: "Lessons learned",
    prompt: "What would you tell someone arriving on the Hill today?",
  },
];

export const FOUNDING_STORY_PROMISE =
  "Years from now, a new member can read this and see how Frass began in the voices of the people who were here. You choose whether it stays private or becomes part of the public history.";
