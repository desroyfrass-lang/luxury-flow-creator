// ─────────────────────────────────────────────────────────────────────────────
// Frassy — the animated presence inside the Daily composer.
//
// She is never stagnant: she floats and drifts while idle, leans in and pulses
// while she is listening, and vibrates / dances while she is speaking.
//
// Step 2: her portrait and her mood classes now come from the one shared
// character definition, so the corner host and this avatar can never drift
// apart. Nothing about her appearance or motion changed.
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import {
  FRASSY_MOOD_CAPTION,
  FRASSY_MOOD_CLASS,
  FRASSY_PORTRAIT_URL,
  type FrassyMood,
} from "@/lib/frassy/character";
import {
  isEntranceActive,
  isEntranceActiveServer,
  subscribeEntrance,
} from "@/lib/frassy/host-presence";

export type { FrassyMood } from "@/lib/frassy/character";

export function FrassyAvatar({
  mood = "idle",
  size = 52,
  caption = false,
}: {
  mood?: FrassyMood;
  size?: number;
  caption?: boolean;
}) {
  // One Frassy at a time: while the cinematic host holds the stage, this avatar
  // stands down rather than showing a second copy of her.
  const entrance = useSyncExternalStore(
    subscribeEntrance,
    isEntranceActive,
    isEntranceActiveServer,
  );
  if (entrance) return null;

  return (
    <div className="frassy-avatar-wrap" aria-hidden={!caption}>
      <span
        className={`frassy-avatar ${FRASSY_MOOD_CLASS[mood]}`}
        style={{ width: size, height: size }}
      >
        <span className="frassy-avatar-halo" />
        <img src={FRASSY_PORTRAIT_URL} alt="" className="frassy-avatar-img" />
      </span>
      {caption && <span className="frassy-avatar-caption">{FRASSY_MOOD_CAPTION[mood]}</span>}
    </div>
  );
}
