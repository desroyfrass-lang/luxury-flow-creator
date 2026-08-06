// Browser autoplay gate for Frassy's voice.
//
// Chrome/Safari refuse `audio.play()` and `speechSynthesis.speak()` until the
// page has received a real user gesture. Frassy's opening greeting happens on
// load, so without this the very first spoken line is silently dropped — which
// looks exactly like "TTS isn't wired up".
//
// We prime BOTH audio paths inside the first gesture we can find, then remember
// that the page is unlocked so the conversation loop can run hands-free.

let unlocked = false;
let ctx: AudioContext | null = null;
const listeners = new Set<(v: boolean) => void>();

export function isAudioUnlocked(): boolean {
  return unlocked;
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

/** Call inside a click/keydown handler. Primes HTMLAudio + WebAudio + SpeechSynthesis. */
export function unlockAudio(): void {
  if (typeof window === "undefined" || unlocked) return;

  // 1. WebAudio context (resuming requires a gesture).
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) {
      ctx = ctx ?? new Ctor();
      void ctx.resume().catch(() => {});
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch {
    /* noop */
  }

  // 2. HTMLAudioElement — a silent one-frame WAV satisfies the gesture rule for
  //    later `new Audio(blobUrl).play()` calls in the same document.
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

/** Auto-unlock on the first gesture anywhere on the page. */
export function installAudioUnlockListener(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => unlockAudio();
  const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart"];
  events.forEach((e) => window.addEventListener(e, handler, { once: false, passive: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}
