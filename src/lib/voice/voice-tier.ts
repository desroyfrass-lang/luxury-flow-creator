// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0477 — Voice Hierarchy.
//
// One voice engine, three tiers, in order:
//   1. cloud  — Frassy's own high-quality voice.
//   2. device — the browser's built-in voice, used automatically, no interruption.
//   3. text   — the greeting is shown in words. Silence is never acceptable.
//
// Here's the practical version: if her real voice can't come through, she borrows your
// device's voice, and if that fails too she writes it out — and she always
// tells you which one you're hearing, so the change never feels like a fault.
// ─────────────────────────────────────────────────────────────────────────────

export type VoiceTier = "cloud" | "device" | "text" | "unknown";

export const VOICE_TIER_LABELS: Record<VoiceTier, string> = {
  cloud: "Frassy Voice Active",
  device: "Using Device Voice",
  text: "Voice unavailable — reading in text",
  unknown: "Voice standing by",
};

export const VOICE_TIER_NOTICES: Record<VoiceTier, string | null> = {
  cloud: null,
  device: "High-quality voice is temporarily unavailable. Using your device's voice.",
  text: "I'm having trouble speaking right now, but I'm here and ready to help.",
  unknown: null,
};

let tier: VoiceTier = "unknown";
const listeners = new Set<() => void>();

export function getVoiceTier(): VoiceTier {
  return tier;
}

export function setVoiceTier(next: VoiceTier) {
  if (next === tier) return;
  tier = next;
  for (const fn of listeners) fn();
}

export function subscribeVoiceTier(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
