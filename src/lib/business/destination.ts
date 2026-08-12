// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0498 — Personalized Daily Intelligence
// "The destination is fixed. The journey is personal."
//
// This is NOT another Daily. It is the sequencing layer that the existing
// Daily (workspace/daily.ts), Money Moves (money-moves.ts), Business Builder
// (accelerator.ts), Business Vaults (future-vaults.ts) and the Discovery
// Interview (partner-profile.ts) all read from.
//
// Constitutional rule: Frassy never asks a member whether they want financial
// freedom, passive income, multiple businesses, retirement income, or to
// replace employment. Those are outcomes Frass already promises. She only
// discovers the fastest ethical path to them.
// ─────────────────────────────────────────────────────────────────────────────

import type { Opportunity } from "./money-moves";
import { OPPORTUNITY_TIERS } from "./money-moves";
import type { PartnerProfile } from "./partner-profile";

export const DESTINATION_RULE =
  "Frassy never asks members what kind of financial future they want. She asks who they are, what they've mastered, what resources they have, and how much time they can realistically invest. From there she builds the most effective path to the financial freedom Frass is designed to help every member pursue.";

export const DESTINATION_PLAIN_ENGLISH =
  "What this means in plain English: you don't have to tell Frassy you want to make money or stop working for someone else. That's already the job. She only needs to know your life — your skills, your time, what you've got to work with — so she can pick the shortest honest road.";

/** The outcomes every member is already working toward the moment they join. */
export const FIXED_DESTINATION: { label: string; plain: string }[] = [
  { label: "Replace employment income", plain: "Your business pays what your job pays." },
  { label: "Build one or more successful businesses", plain: "Something real, with customers." },
  { label: "Create multiple income streams", plain: "More than one thing paying you." },
  { label: "Develop passive income where appropriate", plain: "Money that keeps coming when you rest." },
  { label: "Build long-term financial security", plain: "Enough behind you that a bad month isn't a crisis." },
  { label: "Create generational opportunities for family", plain: "Something your people can inherit or step into." },
  { label: "Achieve financial freedom", plain: "Your time becomes yours again." },
];

/** Frassy's one morning question. It replaces every goal-preference question. */
export function morningQuestion(hoursPerDay: number): string {
  const h = hoursPerDay <= 0 ? 1 : hoursPerDay;
  return `If I only had ${h} hour${h === 1 ? "" : "s"} of your time today, what would move you furthest toward financial freedom?`;
}

// ── Opportunity Sequencing ───────────────────────────────────────────────────

export type SequenceBand = "now" | "next" | "later";

export const BAND_META: Record<
  SequenceBand,
  { label: string; caption: string; plain: string }
> = {
  now: {
    label: "Now",
    caption: "Improves today's financial position.",
    plain: "Quick wins. Work that can put money in your hand soonest.",
  },
  next: {
    label: "Next",
    caption: "Builds the businesses you're already growing.",
    plain: "Slower money, but it's what turns a hustle into a business.",
  },
  later: {
    label: "Later",
    caption: "Becomes relevant once the earlier work is standing.",
    plain: "Shelved on purpose. Nothing here is asking for your time today.",
  },
};

export type SequencedDay = {
  now: Opportunity[];
  next: Opportunity[];
  later: Opportunity[];
  /** Frassy's single sentence over the whole sequence. */
  coach: string;
  /** How the member's real circumstances shaped today. */
  circumstanceLine: string | null;
};

const NOW_MINUTES = 45;

/**
 * Sorts opportunities that ALREADY exist into Now / Next / Later.
 * Nothing is invented and nothing is discarded — only ordered, so the member
 * sees one short list today and the long game stays visible but quiet.
 */
export function sequenceDay(
  opportunities: Opportunity[],
  profile: Pick<PartnerProfile, "hoursPerDay" | "circumstance">,
): SequencedDay {
  const budget = Math.max(30, (profile.hoursPerDay || 1) * 60);

  const now: Opportunity[] = [];
  const next: Opportunity[] = [];
  const later: Opportunity[] = [];
  let spent = 0;

  for (const o of opportunities) {
    const tierRank = OPPORTUNITY_TIERS[o.tier].rank;
    const quick = o.minutes <= NOW_MINUTES && o.score >= 4;
    if (quick && spent + o.minutes <= budget && tierRank === 1) {
      now.push(o);
      spent += o.minutes;
      continue;
    }
    if (spent + o.minutes <= budget * 1.5 && next.length < 5) {
      next.push(o);
      continue;
    }
    later.push(o);
  }

  // Nothing qualified as a quick win — promote the best remaining move so the
  // member is never handed an empty "Now".
  if (now.length === 0 && next.length > 0) now.push(next.shift()!);

  const circumstanceLine = profile.circumstance?.trim()
    ? `Today is planned around what you told me: ${profile.circumstance.trim()}. When that changes, tell me and the Daily changes with it.`
    : null;

  const coach =
    now.length === 0
      ? "Nothing is ready to earn yet, so today is foundation work. That still counts."
      : `Start with ${now[0]!.title}. It's the shortest distance between today and income.`;

  return { now, next, later, coach, circumstanceLine };
}
