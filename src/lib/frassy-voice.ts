// Frassy voice abstraction (Spec 031 + 032).
// Primary: Lovable AI Gateway TTS (openai/gpt-4o-mini-tts) via /api/tts —
//   premium, human-quality neural voices with warmth and inflection.
// Fallback: browser SpeechSynthesis (only if the network call fails).

import {
  pickVoice,
  type FrassyPrefs,
  type FrassyVoice,
  type FrassyVoiceProfile,
} from "@/hooks/use-frassy-prefs";
import type { AudioBlockReason } from "@/lib/audio-unlock";
import { StreamingGatewayVoice } from "@/lib/voice/streaming-voice";

export type FrassyTone =
  | "calm"
  | "welcome"
  | "encourage"
  | "professional"
  | "empathetic"
  | "celebrate";

// Map (voice × profile) → OpenAI neural voice id.
// Voices reference: alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse.
function pickNeuralVoice(voice: FrassyVoice, profile: FrassyVoiceProfile): string {
  if (voice === "masculine") {
    switch (profile) {
      case "calm-luxury":
        return "onyx";
      case "professional-concierge":
        return "ash";
      case "confident-advisor":
        return "verse";
      case "happy-joyful":
        return "fable";
      default:
        return "echo";
    }
  }
  if (voice === "neutral") {
    return profile === "calm-luxury" ? "sage" : "alloy";
  }
  // feminine (default)
  switch (profile) {
    case "calm-luxury":
      return "shimmer";
    case "warm-friendly":
      return "coral";
    case "happy-joyful":
      return "nova";
    case "professional-concierge":
      return "ballad";
    case "confident-advisor":
      return "sage";
    default:
      return "shimmer";
  }
}

// Natural-language steering per profile × tone. gpt-4o-mini-tts supports free-text
// `instructions` for prosody, emotion, and pacing — this is what makes it sound
// like a concierge instead of a text-to-speech engine.
function buildInstructions(prefs: FrassyPrefs, tone: FrassyTone): string {
  const profile: Record<FrassyVoiceProfile, string> = {
    "calm-luxury":
      "Speak like a poised luxury concierge: unhurried, warm, softly resonant, with elegant pacing.",
    "warm-friendly":
      "Speak like a warm, friendly personal shopper: relaxed, sincere, gently upbeat.",
    "happy-joyful":
      "Speak with genuine delight and light energy — warm and expressive without being loud.",
    "professional-concierge":
      "Speak like a five-star hotel concierge: crisp, respectful, confident, unhurried.",
    "confident-advisor":
      "Speak like a trusted stylist: assured, clear, warm authority.",
  };
  const toneShade: Record<FrassyTone, string> = {
    calm: "",
    welcome: "Extra warmth on the greeting; a subtle smile in the voice.",
    encourage: "Slightly brighter, gently uplifting energy.",
    professional: "Measured and precise; polished delivery.",
    empathetic: "Softer, slower, empathetic — as if reassuring a friend.",
    celebrate: "Bright, genuinely pleased, celebratory without being theatrical.",
  };
  const accent =
    prefs.language === "patois"
      ? "Use a subtle Jamaican Patois lilt with natural rhythm; keep every word understandable."
      : prefs.language === "caribbean"
        ? "Use a soft Caribbean English cadence — melodic and warm."
        : prefs.language === "caribbean-lite"
          ? "Use a very subtle Caribbean warmth in the cadence."
          : "Use clear neutral English with warm intonation.";
  return [profile[prefs.voiceProfile], toneShade[tone], accent, "Never sound robotic."]
    .filter(Boolean)
    .join(" ");
}

export type SpeakOptions = {
  prefs: FrassyPrefs;
  tone?: FrassyTone;
  onDone?: () => void;
  /** Fired when the browser refused to play audio (autoplay gate) or TTS failed. */
  onBlocked?: (reason: AudioBlockReason) => void;
};

export function canSpeak(prefs: FrassyPrefs): boolean {
  if (prefs.muted) return false;
  return prefs.communicationMode === "voice_text" || prefs.communicationMode === "voice_only";
}

// ── Output provider (swappable — see src/lib/voice/types.ts) ────────────────
let output: StreamingGatewayVoice | null = null;
let generation = 0;

function provider(): StreamingGatewayVoice {
  if (!output) output = new StreamingGatewayVoice();
  return output;
}

export function stopSpeaking() {
  generation += 1;
  output?.stop();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

export type SpeechSession = {
  /** Queue one sentence — spoken as soon as the previous one finishes. */
  push: (sentence: string) => void;
  /** No more sentences will arrive. */
  end: () => void;
  stop: () => void;
};

/**
 * Opens a streaming speech session. Sentences can be pushed while the model is
 * still generating, so speech starts long before the reply is complete.
 */
export function createSpeechSession(opts: SpeakOptions): SpeechSession {
  const { prefs, tone = "calm", onDone, onBlocked } = opts;
  const mine = ++generation;
  const voice = pickNeuralVoice(prefs.voice, prefs.voiceProfile);
  const instructions = buildInstructions(prefs, tone);
  const speed = prefs.language === "patois" ? 0.95 : 1.0;

  let chain: Promise<void> = Promise.resolve();
  let ended = false;
  let pendingCount = 0;
  let failed = false;

  const settleIfDone = () => {
    if (ended && pendingCount === 0 && generation === mine) onDone?.();
  };

  const speakOne = async (sentence: string) => {
    if (generation !== mine) return;
    try {
      await provider().speak({ text: sentence, voice, instructions, speed });
    } catch (err) {
      if (generation !== mine) return;
      if (!failed) {
        failed = true;
        // eslint-disable-next-line no-console
        console.warn("[frassy] streaming TTS fallback:", err);
        const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
        onBlocked?.(
          /NotAllowedError|audio-context-unavailable/.test(msg)
            ? "browser-blocked-audio"
            : /Permission|denied/i.test(msg)
              ? "permission-denied"
              : "tts-error",
        );

      }
      await new Promise<void>((resolve) => fallbackSpeak(sentence, prefs, resolve, () => {}));
    }
  };

  return {
    push(sentence: string) {
      const clean = sentence.trim();
      if (!clean || generation !== mine) return;
      pendingCount += 1;
      chain = chain
        .then(() => speakOne(clean))
        .finally(() => {
          pendingCount -= 1;
          settleIfDone();
        });
    },
    end() {
      ended = true;
      settleIfDone();
    },
    stop() {
      if (generation === mine) stopSpeaking();
    },
  };
}

export function speakLine(text: string, opts: SpeakOptions) {
  if (!canSpeak(opts.prefs) || !text.trim() || typeof window === "undefined") {
    opts.onDone?.();
    return;
  }
  stopSpeaking();
  const session = createSpeechSession(opts);
  session.push(text);
  session.end();
}


function fallbackSpeak(
  text: string,
  prefs: FrassyPrefs,
  onDone?: () => void,
  onBlocked?: () => void,
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onBlocked?.();
    onDone?.();
    return;
  }
  try {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(prefs.voice, prefs.language);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = prefs.voice === "masculine" ? 0.9 : 1.05;
    u.volume = 0.9;
    let started = false;
    u.onstart = () => {
      started = true;
    };
    u.onend = () => onDone?.();
    u.onerror = () => {
      onBlocked?.();
      onDone?.();
    };
    synth.speak(u);
    // If nothing started shortly after speak(), the gesture gate ate it.
    window.setTimeout(() => {
      if (!started && !synth.speaking) {
        onBlocked?.();
        onDone?.();
      }
    }, 900);
  } catch {
    onBlocked?.();
    onDone?.();
  }
}


export const VOICE_PROFILE_LABELS: Record<FrassyVoiceProfile, string> = {
  "calm-luxury": "Calm Luxury",
  "warm-friendly": "Warm & Friendly",
  "happy-joyful": "Happy & Joyful",
  "professional-concierge": "Professional Concierge",
  "confident-advisor": "Confident Advisor",
};
