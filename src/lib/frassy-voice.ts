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
};

export function canSpeak(prefs: FrassyPrefs): boolean {
  if (prefs.muted) return false;
  return prefs.communicationMode === "voice_text" || prefs.communicationMode === "voice_only";
}

// Track current playback so stopSpeaking() cancels both paths cleanly.
let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let currentAbort: AbortController | null = null;

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* noop */
    }
    currentAudio = null;
  }
  if (currentUrl) {
    try {
      URL.revokeObjectURL(currentUrl);
    } catch {
      /* noop */
    }
    currentUrl = null;
  }
  if (currentAbort) {
    try {
      currentAbort.abort();
    } catch {
      /* noop */
    }
    currentAbort = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

export function speakLine(text: string, opts: SpeakOptions) {
  const { prefs, tone = "calm", onDone } = opts;
  if (!canSpeak(prefs) || !text.trim()) {
    onDone?.();
    return;
  }
  if (typeof window === "undefined") {
    onDone?.();
    return;
  }

  stopSpeaking();
  const controller = new AbortController();
  currentAbort = controller;

  const voice = pickNeuralVoice(prefs.voice, prefs.voiceProfile);
  const instructions = buildInstructions(prefs, tone);
  const speed = prefs.language === "patois" ? 0.95 : 1.0;

  fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, instructions, speed }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      currentUrl = url;
      const audio = new Audio(url);
      currentAudio = audio;
      const cleanup = () => {
        if (currentAudio === audio) currentAudio = null;
        if (currentUrl === url) {
          URL.revokeObjectURL(url);
          currentUrl = null;
        }
        onDone?.();
      };
      audio.onended = cleanup;
      audio.onerror = cleanup;
      audio.play().catch(() => {
        // Autoplay blocked — fall back to browser voice silently.
        fallbackSpeak(text, prefs, onDone);
      });
    })
    .catch((err) => {
      if (controller.signal.aborted) return;
      // Network / auth / gateway failure — fall back so the user still hears something.
      // eslint-disable-next-line no-console
      console.warn("[frassy] TTS fallback:", err);
      fallbackSpeak(text, prefs, onDone);
    });
}

function fallbackSpeak(text: string, prefs: FrassyPrefs, onDone?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone?.();
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(prefs.voice, prefs.language);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = prefs.voice === "masculine" ? 0.9 : 1.05;
    u.volume = 0.9;
    u.onend = () => onDone?.();
    u.onerror = () => onDone?.();
    window.speechSynthesis.speak(u);
  } catch {
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
