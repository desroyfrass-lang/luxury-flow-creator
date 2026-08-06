// Browser autoplay gate for Frassy's voice.
//
// Chrome/Safari refuse audio playback until the page has received a real user
// gesture — and a *new* AudioContext created after that gesture can still start
// suspended inside sandboxed preview iframes. So we create ONE shared 24 kHz
// AudioContext here, resume it inside the gesture, and every playback path
// (streaming PCM, HTMLAudio, SpeechSynthesis) uses it. Nothing else may create
// its own context, or the unlock won't apply to it.

const SAMPLE_RATE = 24000;
import { updatePlaybackDiagnostics } from "@/lib/voice/playback-diagnostics";

let unlocked = false;
let ctx: AudioContext | null = null;
const listeners = new Set<(v: boolean) => void>();

export type AudioBlockReason =
  | "browser-blocked-audio"
  | "audio-device-unavailable"
  | "tts-error"
  | "permission-denied";

export const AUDIO_BLOCK_LABELS: Record<AudioBlockReason, string> = {
  "browser-blocked-audio": "Browser blocked audio playback",
  "audio-device-unavailable": "Audio device unavailable",
  "tts-error": "Voice service error",
  "permission-denied": "Permission denied",
};

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/** True only when the shared context is actually producing sound right now. */
export function isAudioRunning(): boolean {
  return ctx?.state === "running";
}

export function audioContextState(): AudioContextState | "none" {
  return ctx?.state ?? "none";
}

export function onAudioUnlockChange(fn: (v: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function markUnlocked() {
  if (unlocked) return;
  unlocked = true;
  listeners.forEach((fn) => fn(true));
}

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx && ctx.state !== "closed") return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor({ sampleRate: SAMPLE_RATE });
  } catch {
    try {
      ctx = new Ctor();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

/**
 * The single AudioContext every voice path must play through. Resumes it if the
 * browser suspended it (safe to call outside a gesture — it just may not take).
 */
export async function getSharedAudioContext(): Promise<AudioContext | null> {
  const c = createContext();
  if (!c) return null;
  if (c.state === "suspended") {
    await c.resume().catch(() => {});
  }
  if (c.state === "running") markUnlocked();
  updatePlaybackDiagnostics({
    audioContextState: c.state,
    autoplayState: c.state === "running" ? "unlocked" : "blocked",
    sampleRate: c.sampleRate,
    outputLatencyMs:
      "outputLatency" in c && typeof c.outputLatency === "number"
        ? Math.round(c.outputLatency * 1000)
        : null,
    playbackPosition: c.currentTime,
  });
  return c;
}

/** Call inside a click/keydown handler. Primes WebAudio + HTMLAudio + SpeechSynthesis. */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;

  // 1. Shared WebAudio context — resuming requires a gesture.
  try {
    const c = createContext();
    if (c) {
      void c.resume().catch(() => {});
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, SAMPLE_RATE);
      src.connect(c.destination);
      src.start(0);
    }
  } catch {
    /* noop */
  }

  // 2. HTMLAudioElement — a silent one-frame WAV satisfies the gesture rule.
  try {
    const silent = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    );
    silent.volume = 0;
    void silent.play().catch(() => {});
  } catch {
    /* noop */
  }

  // 3. SpeechSynthesis fallback path.
  try {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    }
  } catch {
    /* noop */
  }

  markUnlocked();
}

/**
 * Gesture-safe unlock that reports whether audio can really play. Use this for
 * the "Enable Voice" button so the UI never claims success on a blocked tab.
 */
export async function unlockAudioVerified(): Promise<boolean> {
  unlockAudio();
  const c = await getSharedAudioContext();
  return c?.state === "running";
}

/** Auto-unlock on the first gesture anywhere on the page. */
export function installAudioUnlockListener(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => unlockAudio();
  const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart"];
  events.forEach((e) => window.addEventListener(e, handler, { once: false, passive: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}
