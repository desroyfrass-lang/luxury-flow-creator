// ─────────────────────────────────────────────────────────────────────────────
// Frassy — the animated presence inside the Daily composer.
//
// She is never stagnant: she floats and drifts while idle, leans in and pulses
// while she is listening, and vibrates / dances while she is speaking. This is
// the working Frassy — brighter and more upbeat than the corner host icon on
// landing pages, which stays exactly as it is.
// ─────────────────────────────────────────────────────────────────────────────

import frassyMark from "@/assets/frassy-gold.png.asset.json";

export type FrassyMood = "idle" | "listening" | "thinking" | "speaking";

const CAPTION: Record<FrassyMood, string> = {
  idle: "Ready when you are",
  listening: "Listening…",
  thinking: "Working on it…",
  speaking: "Frassy is speaking",
};

export function FrassyAvatar({
  mood = "idle",
  size = 52,
  caption = false,
}: {
  mood?: FrassyMood;
  size?: number;
  caption?: boolean;
}) {
  return (
    <div className="frassy-avatar-wrap" aria-hidden={!caption}>
      <span
        className={`frassy-avatar frassy-avatar-${mood}`}
        style={{ width: size, height: size }}
      >
        <span className="frassy-avatar-halo" />
        <img src={frassyMark.url} alt="" className="frassy-avatar-img" />
      </span>
      {caption && <span className="frassy-avatar-caption">{CAPTION[mood]}</span>}
    </div>
  );
}
