/**
 * FRASS-0496 — One World Navigation.
 *
 * "Every door leads somewhere familiar."
 *
 * This does not redesign navigation and creates no second menu. It states the
 * rules the existing navigation architecture is held to, and gives every
 * future feature one question to pass.
 */

export const ONE_WORLD_PRINCIPLE =
  "Frass is not a collection of pages. It is one living world. Every room should feel connected to the next, so members can focus on building their future instead of figuring out the software.";

export const ONE_WORLD_PLAIN_ENGLISH =
  "What this means in plain English: walking from your kitchen to your living room shouldn't feel like moving house. Different room, same home, same light switches in the same places.";

/** The design question every future feature must pass. */
export const CLOSED_EYES_TEST =
  "If a member closed their eyes for one second and reopened them in this room, would they immediately know they're still inside Frass?";

/** Members should always know these four things, in every room. */
export const NAVIGATION_CERTAINTIES = [
  "Where they are.",
  "Where they came from.",
  "Where they can go next.",
  "How to return.",
] as const;

export const DAILY_WORKSPACE_LAW = [
  "Opening the Daily always places it above the Workspace.",
  "Closing the Daily always reveals the Workspace underneath.",
  "Opening the Workspace restores the member's working environment.",
  "Neither is ever independent of the other — they are companion experiences.",
] as const;

export const FRASSY_CONTINUITY = [
  "Frassy is the same everywhere.",
  "She never restarts.",
  "She never forgets the conversation.",
  "Her responsibilities change with context; her presence does not.",
] as const;

export const VISUAL_CONTINUITY = [
  "Shared design language",
  "Shared typography",
  "Shared motion",
  "Shared navigation behaviour",
  "Shared accessibility standards",
] as const;

export const CONTEXT_PRESERVATION = [
  "Unsaved work is protected where appropriate.",
  "Conversations continue naturally across rooms.",
  "Progress stays visible.",
  "Navigation history feels intuitive.",
  "Members are never punished for exploring.",
] as const;

/** Rooms audited under this amendment. Extend this list, never fork it. */
export const AUDITED_ROOMS = [
  "Welcome Hall",
  "The Daily",
  "Workspace",
  "FOR ME",
  "Money Moves",
  "Builder Vault",
  "Marketplace",
  "Frass Gallery",
  "FV Studios",
  "Financial Center",
  "Frass Card",
  "Mobile navigation",
  "Desktop navigation",
] as const;

/**
 * A single review helper: does a proposed room satisfy One World Navigation?
 * Used in Founder review, not at runtime.
 */
export function oneWorldReview(room: {
  showsWhereYouAre: boolean;
  hasWayBack: boolean;
  sharesDesignLanguage: boolean;
  keepsFrassy: boolean;
  preservesWork: boolean;
}): { passes: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!room.showsWhereYouAre) failures.push("The member can't tell where they are.");
  if (!room.hasWayBack) failures.push("There is no obvious way back.");
  if (!room.sharesDesignLanguage) failures.push("It doesn't look like Frass — it fails the closed-eyes test.");
  if (!room.keepsFrassy) failures.push("Frassy isn't present, so the conversation breaks.");
  if (!room.preservesWork) failures.push("Work or progress is lost on the way in or out.");
  return { passes: failures.length === 0, failures };
}
