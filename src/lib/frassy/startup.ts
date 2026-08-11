// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0475 — Frassy Startup Guarantee (Platform Initialization Constitution).
//
// One startup system for every Frassy-enabled page. This module is the pure,
// testable brain of it: what "ready" means, what a broken layout looks like,
// how a broken layout is repaired, and what counts as a startup failure.
//
// Constitutional rules encoded here:
//   1. Frassy never speaks before the page, chat, voice engine and context are
//      verified ready.
//   2. A broken interface is never shown — it is repaired in place, without a
//      page refresh.
//   3. Silence is never acceptable. Within SILENCE_LIMIT_MS Frassy has either
//      spoken, or explained in words why she cannot.
// ─────────────────────────────────────────────────────────────────────────────

/** Frassy has this long to greet before the platform calls it a failure. */
export const SILENCE_LIMIT_MS = 3000;

/** The one sentence a member sees when Frassy's voice cannot start. */
export const VOICE_FALLBACK_MESSAGE =
  "I'm having trouble speaking right now, but I'm here and ready to help.";

/** Voice gets exactly one automatic second chance before we explain ourselves. */
export const VOICE_RETRY_LIMIT = 1;

// ── Step 2: readiness ────────────────────────────────────────────────────────

export type ReadinessChecks = {
  /** The page layout has painted and been measured. */
  layout: boolean;
  /** The single shared chat component is mounted and sized. */
  chat: boolean;
  /** The voice engine module is loaded and can be asked to speak. */
  voice: boolean;
  /** Authentication resolved — only required on member-only surfaces. */
  auth: boolean;
  /** Page context (who/where/what) has loaded. */
  context: boolean;
};

export const READINESS_LABELS: Record<keyof ReadinessChecks, string> = {
  layout: "Layout loaded",
  chat: "Shared chat initialized",
  voice: "Voice engine ready",
  auth: "Member verified",
  context: "Page context loaded",
};

export type ReadinessResult = {
  ready: boolean;
  missing: (keyof ReadinessChecks)[];
};

/** Step 2 of the startup sequence. Frassy may only speak once this is ready. */
export function evaluateReadiness(
  checks: ReadinessChecks,
  opts: { requiresAuth?: boolean } = {},
): ReadinessResult {
  const keys: (keyof ReadinessChecks)[] = ["layout", "chat", "voice", "context"];
  if (opts.requiresAuth) keys.push("auth");
  const missing = keys.filter((k) => !checks[k]);
  return { ready: missing.length === 0, missing };
}

// ── Layout watchdog ──────────────────────────────────────────────────────────

export type PanelMetrics = {
  width: number;
  height: number;
  /** Height of the composer (the box a member types into). */
  composerHeight: number;
  hasToolbar: boolean;
  hasVoiceControls: boolean;
  /** Transcript scroller height — 0 means the conversation has collapsed. */
  transcriptHeight: number;
  viewportWidth: number;
  viewportHeight: number;
};

export type LayoutFault =
  | "collapsed-width"
  | "collapsed-height"
  | "overflow-width"
  | "overflow-height"
  | "collapsed-transcript"
  | "collapsed-composer"
  | "missing-toolbar"
  | "missing-voice-controls";

/** Below these, the interface is distorted rather than merely small. */
export const MIN_PANEL_WIDTH = 280;
export const MIN_PANEL_HEIGHT = 320;
export const MIN_COMPOSER_HEIGHT = 36;
export const MIN_TRANSCRIPT_HEIGHT = 80;

export function inspectLayout(m: PanelMetrics): LayoutFault[] {
  const faults: LayoutFault[] = [];
  const roomW = Math.min(MIN_PANEL_WIDTH, m.viewportWidth);
  const roomH = Math.min(MIN_PANEL_HEIGHT, m.viewportHeight);
  if (m.width < roomW) faults.push("collapsed-width");
  if (m.height < roomH) faults.push("collapsed-height");
  if (m.width > m.viewportWidth + 1) faults.push("overflow-width");
  if (m.height > m.viewportHeight + 1) faults.push("overflow-height");
  if (m.transcriptHeight < Math.min(MIN_TRANSCRIPT_HEIGHT, m.viewportHeight / 4))
    faults.push("collapsed-transcript");
  if (m.composerHeight < MIN_COMPOSER_HEIGHT) faults.push("collapsed-composer");
  if (!m.hasToolbar) faults.push("missing-toolbar");
  if (!m.hasVoiceControls) faults.push("missing-voice-controls");
  return faults;
}

export const FAULT_LABELS: Record<LayoutFault, string> = {
  "collapsed-width": "Chat collapsed horizontally",
  "collapsed-height": "Chat collapsed vertically",
  "overflow-width": "Chat wider than the screen",
  "overflow-height": "Chat taller than the screen",
  "collapsed-transcript": "Conversation area collapsed",
  "collapsed-composer": "Composer collapsed",
  "missing-toolbar": "Toolbar missing",
  "missing-voice-controls": "Voice controls missing",
};

export type RepairedSize = { width: number; height: number };

/**
 * The corrected size for the shared chat panel. Never a tiny default: it is
 * always the largest comfortable panel this screen can actually hold.
 */
export function repairSize(
  viewport: { width: number; height: number },
  mode: "floating" | "embedded",
  safeArea = 0,
): RepairedSize {
  const usableH = Math.max(0, viewport.height - safeArea);
  if (mode === "embedded") {
    return {
      width: viewport.width,
      height: Math.max(Math.min(MIN_PANEL_HEIGHT, usableH), Math.min(640, usableH * 0.86)),
    };
  }
  const width = Math.min(400, Math.max(viewport.width - 40, Math.min(viewport.width, 280)));
  const height = Math.max(
    Math.min(MIN_PANEL_HEIGHT, usableH),
    Math.min(620, usableH * 0.8 - safeArea * 0),
  );
  return { width: Math.round(width), height: Math.round(height) };
}

/** Faults that a resize can fix. The rest are told to the Founder, not hidden. */
export function isRepairable(fault: LayoutFault): boolean {
  return (
    fault === "collapsed-width" ||
    fault === "collapsed-height" ||
    fault === "overflow-width" ||
    fault === "overflow-height" ||
    fault === "collapsed-transcript" ||
    fault === "collapsed-composer"
  );
}

// ── The silence rule ─────────────────────────────────────────────────────────

export type GreetingOutcome = "spoken" | "explained" | "silent-failure";

export function judgeStartup(input: {
  /** Did real audio playback complete or is it playing? */
  spoke: boolean;
  /** Did we at least show the greeting or the fallback in words? */
  explained: boolean;
  elapsedMs: number;
}): GreetingOutcome {
  if (input.spoke) return "spoken";
  if (input.explained) return "explained";
  return input.elapsedMs >= SILENCE_LIMIT_MS ? "silent-failure" : "explained";
}

// ── Welcome Hall guarantee ───────────────────────────────────────────────────

export type WelcomeHallChecks = {
  environment: boolean;
  welcomeMessage: boolean;
  frassyGreeting: boolean;
  registrationGuidance: boolean;
  nextAction: boolean;
  chat: boolean;
  voice: boolean;
};

export const WELCOME_HALL_LABELS: Record<keyof WelcomeHallChecks, string> = {
  environment: "Cinematic environment",
  welcomeMessage: "Welcome message",
  frassyGreeting: "Frassy greeting",
  registrationGuidance: "Registration guidance",
  nextAction: "Clear next action",
  chat: "Working chat",
  voice: "Working voice",
};

/** The Welcome Hall may not continue while anything here is missing. */
export function inspectWelcomeHall(c: WelcomeHallChecks): {
  complete: boolean;
  missing: (keyof WelcomeHallChecks)[];
} {
  const missing = (Object.keys(WELCOME_HALL_LABELS) as (keyof WelcomeHallChecks)[]).filter(
    (k) => !c[k],
  );
  return { complete: missing.length === 0, missing };
}
