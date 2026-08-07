/**
 * Per-category showroom theming for the Frass Drip department floors.
 * Each department reads like its own room: business, nightlife, lounge,
 * street, resort, athletic, signature.
 */
export interface ShowroomTheme {
  /** Accent colour used for rails, glow and labels. */
  accent: string;
  /** Soft version of the accent for washes. */
  accentSoft: string;
  /** Full-room backdrop gradient. */
  backdrop: string;
  /** Ambient light pooling from above. */
  ambient: string;
  /** Short mood line shown under the room title. */
  mood: string;
  /** Room name, e.g. "The Boardroom". */
  room: string;
}

const DEFAULT_THEME: ShowroomTheme = {
  accent: "oklch(0.86 0.13 88)",
  accentSoft: "oklch(0.92 0.08 88)",
  backdrop:
    "linear-gradient(180deg, oklch(0.14 0.01 80) 0%, oklch(0.10 0.008 80) 55%, oklch(0.08 0.006 80) 100%)",
  ambient:
    "radial-gradient(120% 60% at 50% 0%, oklch(0.92 0.12 85 / 0.16) 0%, transparent 70%)",
  mood: "Every rail is curated. Pull what fits your day.",
  room: "The Showroom",
};

export const SHOWROOM_THEMES: Record<string, ShowroomTheme> = {
  work: {
    accent: "oklch(0.84 0.09 92)",
    accentSoft: "oklch(0.90 0.05 92)",
    backdrop:
      "linear-gradient(180deg, oklch(0.17 0.015 250) 0%, oklch(0.11 0.012 250) 55%, oklch(0.08 0.008 250) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.90 0.06 90 / 0.18) 0%, transparent 72%)",
    mood: "Tailored lines, quiet power. Boardroom-ready from rail to door.",
    room: "The Boardroom Floor",
  },
  party: {
    accent: "oklch(0.72 0.20 330)",
    accentSoft: "oklch(0.82 0.14 330)",
    backdrop:
      "linear-gradient(180deg, oklch(0.16 0.06 320) 0%, oklch(0.10 0.05 300) 50%, oklch(0.08 0.03 290) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.72 0.22 330 / 0.30) 0%, transparent 70%)",
    mood: "Low light, high shine. Pull the fit that owns the room after dark.",
    room: "The Night Floor",
  },
  casual: {
    accent: "oklch(0.82 0.07 70)",
    accentSoft: "oklch(0.90 0.04 70)",
    backdrop:
      "linear-gradient(180deg, oklch(0.19 0.02 70) 0%, oklch(0.13 0.015 65) 55%, oklch(0.10 0.01 60) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.90 0.05 75 / 0.20) 0%, transparent 72%)",
    mood: "Warm lounge lighting, easy rails. Everyday, elevated.",
    room: "The Lounge Floor",
  },
  street: {
    accent: "oklch(0.80 0.16 145)",
    accentSoft: "oklch(0.88 0.11 145)",
    backdrop:
      "linear-gradient(180deg, oklch(0.14 0.01 240) 0%, oklch(0.10 0.012 200) 55%, oklch(0.08 0.008 180) 100%)",
    ambient:
      "radial-gradient(120% 55% at 50% 0%, oklch(0.80 0.16 150 / 0.22) 0%, transparent 70%)",
    mood: "Concrete floor, neon rails. Statement pieces, loud on purpose.",
    room: "The Street Floor",
  },
  vacay: {
    accent: "oklch(0.83 0.14 200)",
    accentSoft: "oklch(0.90 0.09 200)",
    backdrop:
      "linear-gradient(180deg, oklch(0.22 0.04 200) 0%, oklch(0.14 0.03 205) 55%, oklch(0.10 0.02 210) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.92 0.10 200 / 0.24) 0%, transparent 72%)",
    mood: "Sea breeze through open louvers. Resort rails, sun-ready.",
    room: "The Resort Floor",
  },
  sport: {
    accent: "oklch(0.85 0.17 95)",
    accentSoft: "oklch(0.92 0.12 95)",
    backdrop:
      "linear-gradient(180deg, oklch(0.16 0.01 260) 0%, oklch(0.11 0.01 260) 55%, oklch(0.08 0.008 260) 100%)",
    ambient:
      "radial-gradient(115% 55% at 50% 0%, oklch(0.90 0.17 95 / 0.22) 0%, transparent 70%)",
    mood: "Court lighting, performance rails. Train, run, compete.",
    room: "The Performance Floor",
  },
  crown: {
    accent: "oklch(0.88 0.13 88)",
    accentSoft: "oklch(0.94 0.08 88)",
    backdrop:
      "linear-gradient(180deg, oklch(0.15 0.02 60) 0%, oklch(0.10 0.015 55) 55%, oklch(0.07 0.01 50) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.94 0.14 88 / 0.26) 0%, transparent 70%)",
    mood: "Signature drops under gold light. The house's own rails.",
    room: "The Crown Floor",
  },
  extra: {
    accent: "oklch(0.84 0.10 45)",
    accentSoft: "oklch(0.90 0.06 45)",
    backdrop:
      "linear-gradient(180deg, oklch(0.16 0.02 40) 0%, oklch(0.11 0.015 40) 55%, oklch(0.08 0.01 40) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.90 0.10 45 / 0.20) 0%, transparent 72%)",
    mood: "Overflow rails and seasonal extras. Move quick.",
    room: "The Overflow Floor",
  },
  "90s": {
    accent: "oklch(0.80 0.16 25)",
    accentSoft: "oklch(0.88 0.11 25)",
    backdrop:
      "linear-gradient(180deg, oklch(0.17 0.04 20) 0%, oklch(0.11 0.03 25) 55%, oklch(0.08 0.02 30) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.85 0.16 30 / 0.24) 0%, transparent 70%)",
    mood: "Throwback rails, tube-light glow. Straight out the archive.",
    room: "The Archive Floor",
  },
};

export function getShowroomTheme(category: string): ShowroomTheme {
  return SHOWROOM_THEMES[category] ?? DEFAULT_THEME;
}
