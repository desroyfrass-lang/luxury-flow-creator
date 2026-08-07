/**
 * Per-category showroom theming for the Frass Drip department floors.
 * Each department reads like its own room: business, nightlife, lounge,
 * street, resort, athletic, signature.
 *
 * Every theme carries its own neon colour AND a physical store scene
 * (back wall, panelling, floor) so the rack never hangs in a black void.
 */
export interface ShowroomTheme {
  /** Neon accent used for rails, glow and labels. */
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
  /** Back wall of the physical store set. */
  wall: string;
  /** Repeating panel / texture overlay for the wall. */
  panel: string;
  /** Floor plane under the rack. */
  floor: string;
}

const DEFAULT_THEME: ShowroomTheme = {
  accent: "oklch(0.86 0.13 88)",
  accentSoft: "oklch(0.92 0.08 88)",
  backdrop:
    "linear-gradient(180deg, oklch(0.24 0.02 80) 0%, oklch(0.18 0.015 80) 55%, oklch(0.14 0.01 80) 100%)",
  ambient:
    "radial-gradient(120% 60% at 50% 0%, oklch(0.92 0.12 85 / 0.22) 0%, transparent 70%)",
  mood: "Every rail is curated. Pull what fits your day.",
  room: "The Showroom",
  wall: "linear-gradient(180deg, oklch(0.32 0.02 80) 0%, oklch(0.22 0.015 80) 100%)",
  panel:
    "repeating-linear-gradient(90deg, oklch(1 0 0 / 0.05) 0 2px, transparent 2px 140px)",
  floor:
    "linear-gradient(180deg, oklch(0.26 0.015 80) 0%, oklch(0.15 0.01 80) 100%)",
};

export const SHOWROOM_THEMES: Record<string, ShowroomTheme> = {
  work: {
    // chrome neon for the boardroom
    accent: "oklch(0.92 0.02 240)",
    accentSoft: "oklch(0.97 0.01 240)",
    backdrop:
      "linear-gradient(180deg, oklch(0.30 0.015 250) 0%, oklch(0.22 0.012 250) 55%, oklch(0.17 0.01 250) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.95 0.02 240 / 0.26) 0%, transparent 72%)",
    mood: "Tailored lines, quiet power. Boardroom-ready from rail to door.",
    room: "The Boardroom Floor",
    wall: "linear-gradient(180deg, oklch(0.36 0.02 60) 0%, oklch(0.24 0.02 55) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.18 0.02 50 / 0.55) 0 3px, transparent 3px 118px), repeating-linear-gradient(0deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 220px)",
    floor:
      "linear-gradient(180deg, oklch(0.42 0.008 250) 0%, oklch(0.24 0.008 250) 100%)",
  },
  party: {
    accent: "oklch(0.72 0.20 330)",
    accentSoft: "oklch(0.82 0.14 330)",
    backdrop:
      "linear-gradient(180deg, oklch(0.26 0.09 320) 0%, oklch(0.18 0.08 305) 50%, oklch(0.13 0.05 295) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.72 0.22 330 / 0.38) 0%, transparent 70%)",
    mood: "Low light, high shine. Pull the fit that owns the room after dark.",
    room: "The Night Floor",
    wall: "linear-gradient(180deg, oklch(0.30 0.12 318) 0%, oklch(0.16 0.09 300) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.72 0.22 330 / 0.30) 0 2px, transparent 2px 86px), radial-gradient(60% 50% at 20% 30%, oklch(0.65 0.24 260 / 0.35), transparent 70%), radial-gradient(60% 50% at 80% 20%, oklch(0.75 0.22 350 / 0.35), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.34 0.12 320) 0%, oklch(0.15 0.07 300) 100%)",
  },
  casual: {
    // blue neon in a warm lounge
    accent: "oklch(0.78 0.16 240)",
    accentSoft: "oklch(0.88 0.10 240)",
    backdrop:
      "linear-gradient(180deg, oklch(0.30 0.025 70) 0%, oklch(0.22 0.02 65) 55%, oklch(0.17 0.015 60) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.80 0.14 240 / 0.26) 0%, transparent 72%)",
    mood: "Warm lounge lighting, easy rails. Everyday, elevated.",
    room: "The Lounge Floor",
    wall: "linear-gradient(180deg, oklch(0.38 0.035 65) 0%, oklch(0.24 0.03 60) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.20 0.03 55 / 0.45) 0 4px, transparent 4px 96px), radial-gradient(70% 60% at 50% 10%, oklch(0.85 0.06 75 / 0.20), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.40 0.04 60) 0%, oklch(0.22 0.025 55) 100%)",
  },
  street: {
    accent: "oklch(0.80 0.18 145)",
    accentSoft: "oklch(0.88 0.12 145)",
    backdrop:
      "linear-gradient(180deg, oklch(0.26 0.015 240) 0%, oklch(0.19 0.015 210) 55%, oklch(0.15 0.012 190) 100%)",
    ambient:
      "radial-gradient(120% 55% at 50% 0%, oklch(0.80 0.18 150 / 0.28) 0%, transparent 70%)",
    mood: "Concrete floor, neon rails. Statement pieces, loud on purpose.",
    room: "The Street Floor",
    wall: "linear-gradient(180deg, oklch(0.32 0.012 240) 0%, oklch(0.20 0.012 230) 100%)",
    panel:
      "repeating-linear-gradient(0deg, oklch(1 0 0 / 0.05) 0 2px, transparent 2px 46px), repeating-linear-gradient(90deg, oklch(0 0 0 / 0.35) 0 2px, transparent 2px 92px), radial-gradient(50% 40% at 78% 22%, oklch(0.80 0.18 150 / 0.28), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.36 0.008 240) 0%, oklch(0.20 0.008 240) 100%)",
  },
  vacay: {
    accent: "oklch(0.85 0.16 195)",
    accentSoft: "oklch(0.92 0.10 195)",
    backdrop:
      "linear-gradient(180deg, oklch(0.34 0.05 200) 0%, oklch(0.24 0.04 205) 55%, oklch(0.18 0.03 210) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.92 0.12 195 / 0.30) 0%, transparent 72%)",
    mood: "Sea breeze through open louvers. Resort rails, sun-ready.",
    room: "The Resort Floor",
    wall: "linear-gradient(180deg, oklch(0.50 0.04 200) 0%, oklch(0.28 0.035 205) 100%)",
    panel:
      "repeating-linear-gradient(0deg, oklch(1 0 0 / 0.10) 0 3px, transparent 3px 24px), radial-gradient(60% 50% at 20% 20%, oklch(0.92 0.10 190 / 0.25), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.60 0.03 90) 0%, oklch(0.30 0.02 95) 100%)",
  },
  sport: {
    accent: "oklch(0.87 0.20 130)",
    accentSoft: "oklch(0.93 0.14 130)",
    backdrop:
      "linear-gradient(180deg, oklch(0.26 0.015 260) 0%, oklch(0.19 0.012 260) 55%, oklch(0.15 0.01 260) 100%)",
    ambient:
      "radial-gradient(115% 55% at 50% 0%, oklch(0.90 0.19 130 / 0.28) 0%, transparent 70%)",
    mood: "Court lighting, performance rails. Train, run, compete.",
    room: "The Performance Floor",
    wall: "linear-gradient(180deg, oklch(0.30 0.02 260) 0%, oklch(0.18 0.015 260) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.87 0.20 130 / 0.16) 0 3px, transparent 3px 64px), radial-gradient(70% 50% at 50% 8%, oklch(0.95 0.02 240 / 0.20), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.52 0.09 70) 0%, oklch(0.26 0.05 65) 100%)",
  },
  crown: {
    accent: "oklch(0.88 0.15 88)",
    accentSoft: "oklch(0.95 0.09 88)",
    backdrop:
      "linear-gradient(180deg, oklch(0.28 0.03 60) 0%, oklch(0.20 0.025 55) 55%, oklch(0.15 0.02 50) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.94 0.16 88 / 0.32) 0%, transparent 70%)",
    mood: "Signature drops under gold light. The house's own rails.",
    room: "The Crown Floor",
    wall: "linear-gradient(180deg, oklch(0.34 0.05 62) 0%, oklch(0.20 0.035 55) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.88 0.15 88 / 0.16) 0 2px, transparent 2px 110px), radial-gradient(70% 55% at 50% 5%, oklch(0.94 0.14 88 / 0.24), transparent 70%)",
    floor:
      "linear-gradient(180deg, oklch(0.44 0.04 65) 0%, oklch(0.22 0.025 58) 100%)",
  },
  extra: {
    accent: "oklch(0.82 0.18 45)",
    accentSoft: "oklch(0.90 0.12 45)",
    backdrop:
      "linear-gradient(180deg, oklch(0.28 0.03 40) 0%, oklch(0.20 0.025 40) 55%, oklch(0.16 0.02 40) 100%)",
    ambient:
      "radial-gradient(110% 55% at 50% 0%, oklch(0.90 0.16 45 / 0.26) 0%, transparent 72%)",
    mood: "Overflow rails and seasonal extras. Move quick.",
    room: "The Overflow Floor",
    wall: "linear-gradient(180deg, oklch(0.34 0.03 42) 0%, oklch(0.20 0.025 40) 100%)",
    panel:
      "repeating-linear-gradient(45deg, oklch(0.82 0.18 45 / 0.10) 0 12px, transparent 12px 34px)",
    floor:
      "linear-gradient(180deg, oklch(0.40 0.02 45) 0%, oklch(0.22 0.015 42) 100%)",
  },
  "90s": {
    accent: "oklch(0.75 0.22 15)",
    accentSoft: "oklch(0.86 0.15 15)",
    backdrop:
      "linear-gradient(180deg, oklch(0.28 0.06 20) 0%, oklch(0.20 0.05 25) 55%, oklch(0.15 0.035 30) 100%)",
    ambient:
      "radial-gradient(120% 60% at 50% 0%, oklch(0.85 0.18 30 / 0.30) 0%, transparent 70%)",
    mood: "Throwback rails, tube-light glow. Straight out the archive.",
    room: "The Archive Floor",
    wall: "linear-gradient(180deg, oklch(0.34 0.07 18) 0%, oklch(0.18 0.05 25) 100%)",
    panel:
      "repeating-linear-gradient(90deg, oklch(0.75 0.22 15 / 0.18) 0 6px, transparent 6px 40px), repeating-linear-gradient(0deg, oklch(0.70 0.18 250 / 0.14) 0 6px, transparent 6px 40px)",
    floor:
      "linear-gradient(180deg, oklch(0.42 0.05 25) 0%, oklch(0.20 0.03 25) 100%)",
  },
};

export function getShowroomTheme(category: string): ShowroomTheme {
  return SHOWROOM_THEMES[category] ?? DEFAULT_THEME;
}
