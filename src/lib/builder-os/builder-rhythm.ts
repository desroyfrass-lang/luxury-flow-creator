// ─────────────────────────────────────────────────────────────────────────────
// SPEC-BLUEPRINT-001-FINAL §5 — Extended Builder Rhythm.
//
// The Daily feed follows an emotional order, always:
//
//   🔴 Urgent Matters → 🟡 Decisions Needed → 🔵 Growth Opportunities
//   → 🟢 Celebration & Milestones → 🌸 Beautiful Ending → 🚪 Ready to Build
//
// This extends the four-colour lane language in daily-os.ts rather than
// replacing it. Existing lanes map straight onto the rhythm bands.
// ─────────────────────────────────────────────────────────────────────────────

import type { Lane, DailyStep } from "@/lib/workspace/daily-os";

export type RhythmBand = "urgent" | "decisions" | "growth" | "celebration" | "ending" | "ready";

export const RHYTHM: { id: RhythmBand; emoji: string; label: string; everyday: string }[] = [
  {
    id: "urgent",
    emoji: "🔴",
    label: "Urgent Matters",
    everyday: "The few things that genuinely can't wait until tomorrow.",
  },
  {
    id: "decisions",
    emoji: "🟡",
    label: "Decisions Needed",
    everyday: "Nothing moves until you choose. These are quick.",
  },
  {
    id: "growth",
    emoji: "🔵",
    label: "Growth Opportunities",
    everyday: "Work that makes the business bigger, not just busier.",
  },
  {
    id: "celebration",
    emoji: "🟢",
    label: "Celebration & Milestones",
    everyday: "What you already finished. It stays visible on purpose.",
  },
  {
    id: "ending",
    emoji: "🌸",
    label: "Beautiful Ending",
    everyday: "One honest, encouraging word to close the thinking.",
  },
  {
    id: "ready",
    emoji: "🚪",
    label: "Ready to Build",
    everyday: "The door into the Workshop, where the making happens.",
  },
];

export const RHYTHM_ORDER: RhythmBand[] = RHYTHM.map((r) => r.id);

export const BAND_BY_ID = Object.fromEntries(RHYTHM.map((r) => [r.id, r])) as Record<
  RhythmBand,
  (typeof RHYTHM)[number]
>;

/** Existing lane colours map onto the extended rhythm without losing meaning. */
export function bandForLane(lane: Lane, section?: string): RhythmBand {
  if (lane === "green") return "celebration";
  if (lane === "red") return "urgent";
  if (lane === "orange") return section === "approvals" ? "decisions" : "decisions";
  return "growth";
}

export type RhythmGroup = { band: RhythmBand; steps: DailyStep[] };

/** Groups the numbered workday into the six-band Builder Rhythm, in order. */
export function rhythmGroups(steps: DailyStep[]): RhythmGroup[] {
  const groups: RhythmGroup[] = RHYTHM_ORDER.filter((b) => b !== "ending" && b !== "ready").map(
    (band) => ({ band, steps: [] }),
  );
  for (const s of steps) {
    const band = bandForLane(s.lane, s.section);
    groups.find((g) => g.band === band)?.steps.push(s);
  }
  return groups.filter((g) => g.steps.length > 0);
}

/** 🌸 The Beautiful Ending — never hollow praise, always true to the day. */
export function beautifulEnding(steps: DailyStep[], name?: string): string {
  const who = name ? `${name}, ` : "";
  const done = steps.filter((s) => s.lane === "green").length;
  const open = steps.length - done;
  if (steps.length === 0)
    return `${who}today is clear. A quiet day is still a day the business stays alive.`;
  if (open === 0) return `${who}everything on today's Daily is finished. Close the day proud.`;
  if (done === 0)
    return `${who}nothing has started yet — and that's fine. One step is a real day's progress.`;
  return `${who}you've finished ${done} of ${steps.length}. That's real movement, not busywork.`;
}
