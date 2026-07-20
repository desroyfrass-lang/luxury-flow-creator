// Frassy voice abstraction (Spec 031).
// Phase 1: browser SpeechSynthesis with profile-tuned inflection + tone shading.
// Phase 2 hook point: swap `speakLine` implementation to stream Lovable AI
// Gateway TTS (openai/gpt-4o-mini-tts) without touching UI callers.

import {
  pickVoice,
  type FrassyPrefs,
  type FrassyVoiceProfile,
} from "@/hooks/use-frassy-prefs";

export type FrassyTone =
  | "calm"
  | "welcome"
  | "encourage"
  | "professional"
  | "empathetic"
  | "celebrate";

type ProfileShape = {
  rate: number;
  pitch: number;
  volume: number;
};

const PROFILE: Record<FrassyVoiceProfile, ProfileShape> = {
  "calm-luxury": { rate: 0.92, pitch: 1.0, volume: 0.85 },
  "warm-friendly": { rate: 1.0, pitch: 1.08, volume: 0.9 },
  "happy-joyful": { rate: 1.06, pitch: 1.15, volume: 0.95 },
  "professional-concierge": { rate: 0.98, pitch: 0.98, volume: 0.9 },
  "confident-advisor": { rate: 1.0, pitch: 0.92, volume: 0.95 },
};

const TONE: Record<FrassyTone, Partial<ProfileShape>> = {
  calm: {},
  welcome: { pitch: 1.05, volume: 0.95 },
  encourage: { rate: 1.03, pitch: 1.08 },
  professional: { rate: 0.97 },
  empathetic: { rate: 0.9, pitch: 0.98, volume: 0.85 },
  celebrate: { rate: 1.08, pitch: 1.18, volume: 1 },
};

export type SpeakOptions = {
  prefs: FrassyPrefs;
  tone?: FrassyTone;
  /** Fires after playback finishes or fails. */
  onDone?: () => void;
};

/** True when audio playback is permitted right now. */
export function canSpeak(prefs: FrassyPrefs): boolean {
  if (prefs.muted) return false;
  return prefs.communicationMode === "voice_text" || prefs.communicationMode === "voice_only";
}

/** Cancel any in-flight speech. Safe to call anytime. */
export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

export function speakLine(text: string, opts: SpeakOptions) {
  const { prefs, tone = "calm", onDone } = opts;
  if (!canSpeak(prefs)) {
    onDone?.();
    return;
  }
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone?.();
    return;
  }

  const base = PROFILE[prefs.voiceProfile] ?? PROFILE["calm-luxury"];
  const shade = TONE[tone] ?? {};
  const rate = clamp((shade.rate ?? base.rate) * (prefs.language === "patois" ? 0.96 : 1), 0.7, 1.3);
  const pitch = clamp(
    (shade.pitch ?? base.pitch) *
      (prefs.voice === "masculine" ? 0.88 : prefs.voice === "feminine" ? 1.06 : 1),
    0.6,
    1.6,
  );
  const volume = clamp(shade.volume ?? base.volume, 0, 1);

  const speakNow = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice(prefs.voice, prefs.language);
      if (v) u.voice = v;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onend = () => onDone?.();
      u.onerror = () => onDone?.();
      window.speechSynthesis.speak(u);
    } catch {
      onDone?.();
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speakNow;
    // Fallback in case the event never fires.
    setTimeout(speakNow, 250);
  } else {
    speakNow();
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const VOICE_PROFILE_LABELS: Record<FrassyVoiceProfile, string> = {
  "calm-luxury": "Calm Luxury",
  "warm-friendly": "Warm & Friendly",
  "happy-joyful": "Happy & Joyful",
  "professional-concierge": "Professional Concierge",
  "confident-advisor": "Confident Advisor",
};
