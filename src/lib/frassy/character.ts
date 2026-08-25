// ─────────────────────────────────────────────────────────────────────────────
// FRASSY — Step 2. One character definition, used everywhere.
//
// Frassy is one woman with several interfaces. Until now the corner host and
// the workspace avatar each described her separately, which meant her portrait
// and her moods could quietly drift apart. This module is the single source of
// truth for the *existing* Frassy: the approved portrait and the mood classes
// that are already defined in src/styles.css.
//
// This is a consolidation only. Nothing about her appearance changes here — no
// new artwork, no new animation, no restyling. Her realistic illustrated
// identity stays exactly as approved.
// ─────────────────────────────────────────────────────────────────────────────

import frassyPortrait from "@/assets/frassy-gold.png.asset.json";

/** The approved portrait every Frassy surface renders. */
export const FRASSY_PORTRAIT_URL = frassyPortrait.url;

/** Alt text for the host presentation (the large, speaking Frassy). */
export const FRASSY_HOST_ALT = "Frassy, host of the Frass ecosystem";

/** The states she already has in the stack. No new states are invented here. */
export type FrassyMood = "idle" | "listening" | "thinking" | "speaking";

/**
 * Existing mood → existing CSS class. The keyframes themselves
 * (frassy-float / frassy-lean / frassy-sway / frassy-dance / frassy-buzz)
 * already live in src/styles.css and are reused untouched.
 */
export const FRASSY_MOOD_CLASS: Record<FrassyMood, string> = {
  idle: "frassy-avatar-idle",
  listening: "frassy-avatar-listening",
  thinking: "frassy-avatar-thinking",
  speaking: "frassy-avatar-speaking",
};

/** The plain-English caption shown beside her when a surface asks for one. */
export const FRASSY_MOOD_CAPTION: Record<FrassyMood, string> = {
  idle: "Ready when you are",
  listening: "Listening…",
  thinking: "Working on it…",
  speaking: "Frassy is speaking",
};

/** The breathing loop used by her full-size host presentation. */
export const FRASSY_HOST_BREATHE = "frassy-host-breathe 6s ease-in-out infinite";
