// ─────────────────────────────────────────────────────────────────────────────
// Frassy's Money Moves Desk — how much a partner lets Frassy do for them.
//
// One toggle, four positions. This is not a feature switch: it is the whole
// relationship. Beginners let her run; advanced partners run themselves and
// call her when they want a second opinion.
//
// Plain English: this file just names the four ways Frassy can work with you.
// ─────────────────────────────────────────────────────────────────────────────

export const AUTONOMY_MODES = [
  "handle_everything",
  "teach_me",
  "work_with_me",
  "advise_only",
] as const;

export type AutonomyMode = (typeof AUTONOMY_MODES)[number];

export const DEFAULT_AUTONOMY: AutonomyMode = "handle_everything";

export type AutonomyMeta = {
  id: AutonomyMode;
  label: string;
  short: string;
  plain: string;
  /** Does Frassy start new builds on her own in this mode? */
  buildsAlone: boolean;
};

export const AUTONOMY_META: Record<AutonomyMode, AutonomyMeta> = {
  handle_everything: {
    id: "handle_everything",
    label: "Frassy, handle everything for me",
    short: "Handle everything",
    plain: "I build your Money Moves end to end and bring you finished work to approve.",
    buildsAlone: true,
  },
  teach_me: {
    id: "teach_me",
    label: "Teach me while you build",
    short: "Teach me",
    plain: "I still build it, and I explain each step as I go so you learn the trade.",
    buildsAlone: true,
  },
  work_with_me: {
    id: "work_with_me",
    label: "Let me work with you",
    short: "Work with me",
    plain: "I pause at the choices that matter and we decide them together.",
    buildsAlone: true,
  },
  advise_only: {
    id: "advise_only",
    label: "I'll run it, you advise",
    short: "You advise",
    plain: "You run your business. I watch quietly and speak up when something needs you.",
    buildsAlone: false,
  },
};

/** Frassy's status line under the pulse dot. */
export function autonomyStatus(mode: AutonomyMode, paused: boolean) {
  if (paused || !AUTONOMY_META[mode].buildsAlone) {
    return { working: false, text: "Frassy is waiting" };
  }
  return { working: true, text: "Frassy is working" };
}

export function isAutonomyMode(v: unknown): v is AutonomyMode {
  return typeof v === "string" && (AUTONOMY_MODES as readonly string[]).includes(v);
}
