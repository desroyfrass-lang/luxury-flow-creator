// ─────────────────────────────────────────────────────────────────────────────
// SPEC-BLUEPRINT-001-FINAL — Builder Language Glossary.
//
// One vocabulary across the whole Builder Operating System. These are the only
// approved words for these ideas. Everything else is a Retired System.
//
// This module extends the existing Daily / Workspace architecture. It never
// replaces it.
// ─────────────────────────────────────────────────────────────────────────────

/** The rule that separates the two halves of the Builder Operating System. */
export const DAILY_WORKSHOP_RULE =
  "The Daily is where Builders think. The Workshop is where Builders build.";

export const DAILY_WORKSHOP_PLAIN = {
  daily:
    "The Daily is your morning table. You read what happened, decide what matters, and choose today's work. Nothing gets made here.",
  workshop:
    "The Workshop is the room where the work actually happens. Recording, sewing, designing, cooking, writing — hands on the craft.",
};

export type GlossaryTerm = {
  term: string;
  meaning: string;
  /** The everyday sentence — no jargon, no assumptions. */
  everyday: string;
  /** Words we no longer use for this idea. */
  retired?: string[];
};

export const BUILDER_GLOSSARY: GlossaryTerm[] = [
  {
    term: "Daily",
    meaning: "The daily decision, planning and morning briefing hub.",
    everyday: "Where you sit down with coffee and decide what today looks like.",
    retired: ["dashboard", "task list page"],
  },
  {
    term: "Workshop",
    meaning: "The hands-on creation and production environment.",
    everyday: "The room where you actually make the thing.",
    retired: ["workspace tab", "studio tab"],
  },
  {
    term: "Vault",
    meaning: "One complete business pathway for one craft, trade or profession.",
    everyday: "One business you're building, with everything about it in one place.",
  },
  {
    term: "Money Move",
    meaning: "A business objective that ends at real income.",
    everyday: "A goal worth money — not a chore.",
  },
  {
    term: "Fast Track",
    meaning: "A guided step nested inside a Money Move.",
    everyday: "One small, doable step on the way to that goal.",
    retired: ["standalone step list"],
  },
  {
    term: "Ready to Build",
    meaning: "The moment thinking ends and making begins.",
    everyday: "The door out of the Daily and into the Workshop.",
  },
  {
    term: "Builder Rhythm",
    meaning: "The emotional order of the Daily feed, from urgent through to encouragement.",
    everyday: "The shape of your day, so it never starts or ends badly.",
  },
  {
    term: "Universal Upload Manager",
    meaning: "The one place any file enters Frass, in every Workshop environment.",
    everyday: "Drop a file anywhere in Frass — it always lands in the same trusted place.",
  },
];

/**
 * The approved replacement for the word "deprecated" in all system copy.
 * FRASS founders read plain words: things are retired, not deprecated.
 */
export const RETIRED_SYSTEMS_LABEL = "Retired Systems";
export const LEGACY_SYSTEMS_LABEL = "Legacy Systems";

/** Rewrites any leftover "deprecated" wording in generated or stored copy. */
export function retireWord(text: string): string {
  return text
    .replace(/Deprecated/g, RETIRED_SYSTEMS_LABEL)
    .replace(/deprecated/g, "retired");
}
