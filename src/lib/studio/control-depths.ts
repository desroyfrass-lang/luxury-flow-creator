// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0407 / A1 — Creator Control depths for Frass Vision Studios (FV Studios).
//
// FOUR DEPTHS OF ONE PROJECT. Not four studios, not four skill labels.
// A production moves between them without restarting, losing assets, changing
// identity, or flattening prior work. Manual editing is never hidden at any
// depth.
// ─────────────────────────────────────────────────────────────────────────────

export const CONTROL_DEPTHS = [
  {
    id: "directed",
    label: "Directed",
    icon: "🎬",
    everyday: "Say what you want. Frassy does the technical work and asks before anything important.",
    surfaces: ["AI Director", "Preview monitor", "Approve-before-run forecast", "Timeline (open, never hidden)"],
  },
  {
    id: "creator",
    label: "Creator",
    icon: "✂️",
    everyday: "Hands on the work with Frassy beside you — change one piece, keep the rest exactly as it is.",
    surfaces: ["Clip-level edit, rewrite, rearrange, replace", "AI Director", "Inspector", "Timeline"],
  },
  {
    id: "producer",
    label: "Producer",
    icon: "🎛",
    everyday: "The production controls: tracks and stems, scenes, effects, arrangement, automation, and regenerating only the part you pick.",
    surfaces: ["Tracks & stems", "Scenes", "Effects & processing", "Arrangement", "Automation", "Selective regeneration"],
  },
  {
    id: "pro",
    label: "Pro",
    icon: "🎚",
    everyday: "The full professional room. Every manual control available, nothing simplified away.",
    surfaces: ["Full timeline toolset", "Full mixer & signal chain", "Per-parameter automation", "Manual master controls"],
  },
] as const;

export type ControlDepthId = (typeof CONTROL_DEPTHS)[number]["id"];
export type ControlDepth = (typeof CONTROL_DEPTHS)[number];

export const DEFAULT_CONTROL_DEPTH: ControlDepthId = "directed";

export function isControlDepth(value: unknown): value is ControlDepthId {
  return CONTROL_DEPTHS.some((d) => d.id === value);
}

export function controlDepth(value: unknown): ControlDepth {
  const id = isControlDepth(value) ? value : DEFAULT_CONTROL_DEPTH;
  return CONTROL_DEPTHS.find((d) => d.id === id)!;
}

/** Depth order, shallow → deep. Used for wording only; no depth is "better". */
export function depthIndex(id: ControlDepthId): number {
  return CONTROL_DEPTHS.findIndex((d) => d.id === id);
}

/**
 * What is guaranteed when a production changes depth. These are promises the
 * interface must keep — nothing here is a migration or a conversion.
 */
export const DEPTH_SWITCH_GUARANTEES = [
  "Same production, same identity — no restart.",
  "Every asset, take and version stays exactly where it is.",
  "Nothing already done is flattened, merged or thrown away.",
  "Manual editing stays available at every depth.",
  "Your A1 Master Standard target does not change.",
] as const;

/**
 * Cross-cutting helpers. These are NOT depths and must never be presented as a
 * fifth mode or as a creator skill label.
 */
export const CROSS_CUTTING_HELPERS = [
  {
    id: "learning-mode",
    label: "Learning Mode",
    everyday: "Frassy explains why she made each call while the work happens.",
  },
  {
    id: "phone-content-mode",
    label: "Phone Content Mode / Enhance Phone Recording",
    everyday: "Recording and input clean-up, so the gear you own is never the limit.",
  },
  {
    id: "ai-director",
    label: "AI Director / Frassy",
    everyday: "Available at every depth, including Pro. She never disappears.",
  },
  {
    id: "a1-master-standard",
    label: "A1 Master Standard",
    everyday: "The same final quality target whichever depth you worked in.",
  },
] as const;

/** A depth change is always allowed. This documents and proves that rule. */
export function describeDepthChange(
  from: ControlDepthId,
  to: ControlDepthId,
): { allowed: true; from: ControlDepth; to: ControlDepth; guarantees: readonly string[]; message: string } {
  const a = controlDepth(from);
  const b = controlDepth(to);
  return {
    allowed: true,
    from: a,
    to: b,
    guarantees: DEPTH_SWITCH_GUARANTEES,
    message:
      from === to
        ? `Already in ${b.label} depth.`
        : `Same production, now shown at ${b.label} depth. Nothing was restarted or lost.`,
  };
}
