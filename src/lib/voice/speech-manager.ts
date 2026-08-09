// ─────────────────────────────────────────────────────────────────────────────
// Frassy Speech Manager — the ONE place in the app allowed to play voice audio.
//
// Why this exists: `usePushToTalk` is mounted by several surfaces at once (the
// global Frassy chat host, the workspace room, the composer, onboarding). When
// each mount owned its own <audio> element, one reply could play two or three
// overlapping streams. Playback now lives in this module-level singleton:
//
//   • exactly one HTMLAudioElement is audible at any moment
//   • starting new speech hard-stops (pause + reset + detach) whatever is live
//   • every element and object URL ever created is tracked and swept on stop
//   • pause / resume / stop are global and work from any surface
//
// Nothing else may construct an Audio() for speech.
// ─────────────────────────────────────────────────────────────────────────────

import { chunkForTTS, speakableText } from "@/lib/voice/chunk-text";
import { conversation } from "@/lib/voice/conversation-machine";
import {
  getSharedAudioContext,
  installAudioUnlockListener,
  isAudioUnlocked,
  unlockAudio,
} from "@/lib/audio-unlock";

// Autoplay gate. Browsers refuse programmatic audio until the page has seen a
// real user gesture, and TTS always plays *after* an async fetch — outside the
// gesture. So the very first pointer/key/touch anywhere on the page primes the
// shared context and a silent HTMLAudio element. Without this, every clip is
// silently blocked and Frassy appears mute.
if (typeof window !== "undefined") installAudioUnlockListener();

export type SpeechStatus = "idle" | "loading" | "playing" | "paused";

export type SpeechSnapshot = {
  status: SpeechStatus;
  /** Incremented for every speech run; stale runs abort against it. */
  runId: number;
  chunksTotal: number;
  chunksSpoken: number;
  turnId: string | null;
  /** Identifies which surface asked for this speech. */
  owner: string | null;
};

const IDLE: SpeechSnapshot = {
  status: "idle",
  runId: 0,
  chunksTotal: 0,
  chunksSpoken: 0,
  turnId: null,
  owner: null,
};

let snapshot: SpeechSnapshot = IDLE;
const listeners = new Set<() => void>();

/** Every element we have ever created, so nothing can orphan itself. */
const liveElements = new Set<HTMLAudioElement>();
const liveUrls = new Set<string>();

let current: HTMLAudioElement | null = null;
let runCounter = 0;

function emit() {
  for (const fn of listeners) fn();
}

function patch(next: Partial<SpeechSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

export function subscribeSpeech(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSpeechSnapshot(): SpeechSnapshot {
  return snapshot;
}

/** Hard-kill every audio element this module has ever created. */
function sweepAudio() {
  for (const el of liveElements) {
    try {
      el.onended = null;
      el.onerror = null;
      el.ontimeupdate = null;
      el.onplaying = null;
      el.pause();
      el.currentTime = 0;
      el.removeAttribute("src");
      el.load();
    } catch {
      /* element already dead */
    }
  }
  liveElements.clear();
  current = null;
  for (const url of liveUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  }
  liveUrls.clear();
}

/**
 * Stops all speech immediately and clears the queue.
 * Safe to call from anywhere, at any time, including unmount.
 */
export function stopSpeech(reason = "speech stopped by Builder"): void {
  const wasActive = snapshot.status !== "idle";
  runCounter += 1; // invalidates any in-flight run
  sweepAudio();
  if (wasActive && snapshot.turnId) conversation.interrupt(reason);
  snapshot = { ...IDLE, runId: runCounter };
  emit();
}

/** Pauses the audible stream without discarding the remaining queue. */
export function pauseSpeech(): void {
  if (snapshot.status !== "playing" && snapshot.status !== "loading") return;
  try {
    current?.pause();
  } catch {
    /* noop */
  }
  patch({ status: "paused" });
}

/** Resumes a paused stream. */
export function resumeSpeech(): void {
  if (snapshot.status !== "paused") return;
  patch({ status: current ? "playing" : "loading" });
  void current?.play().catch(() => {});
}

export function toggleSpeechPause(): void {
  if (snapshot.status === "paused") resumeSpeech();
  else pauseSpeech();
}

export function isSpeechActive(): boolean {
  return snapshot.status !== "idle";
}

async function fetchChunk(text: string, voice: string): Promise<string> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) throw new Error(`tts ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  liveUrls.add(url);
  return url;
}

/** Plays one clip on the single shared slot; resolves on real completion. */
function playClip(url: string, runId: number, turnId: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (runId !== runCounter) return resolve(false);

    // Singleton enforcement: nothing else may be audible while this plays.
    sweepAudioExcept(null);

    const audio = new Audio(url);
    audio.preload = "auto";
    liveElements.add(audio);
    current = audio;

    let played = false;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
      audio.onplaying = null;
      liveElements.delete(audio);
      if (current === audio) current = null;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* noop */
      }
      resolve(ok);
    };

    audio.onplaying = () => {
      played = true;
      if (runId === runCounter && snapshot.status !== "paused") patch({ status: "playing" });
    };
    audio.ontimeupdate = () => {
      if (Number.isFinite(audio.duration)) {
        conversation.bufferSeconds(turnId, Math.max(0, audio.duration - audio.currentTime));
      }
    };
    audio.onended = () => finish(played);
    audio.onerror = () => finish(false);

    if (snapshot.status === "paused") return; // stay parked until resume
    audio.play().catch(() => finish(false));
  });
}

function sweepAudioExcept(keep: HTMLAudioElement | null) {
  for (const el of liveElements) {
    if (el === keep) continue;
    try {
      el.pause();
      el.currentTime = 0;
      el.removeAttribute("src");
    } catch {
      /* noop */
    }
    liveElements.delete(el);
  }
  if (current && current !== keep) current = null;
}

export type SpeakResult = "complete" | "interrupted" | "blocked" | "failed";

/**
 * Speaks a full reply through the single shared player. Any speech already in
 * flight — from this surface or any other — is stopped first.
 */
export async function speakText(
  text: string,
  opts: { voice?: string; owner?: string } = {},
): Promise<SpeakResult> {
  const clean = speakableText(text);
  if (!clean) return "complete";

  // Prime the autoplay gate synchronously — speak() is usually reached from a
  // click/keypress, and this must run before the first await to count as one.
  if (!isAudioUnlocked()) unlockAudio();
  void getSharedAudioContext();

  // One stream at a time, always.
  runCounter += 1;
  const runId = runCounter;
  sweepAudio();

  const chunks = chunkForTTS(clean);
  const turnId = conversation.startTurn({ spoken: true });
  conversation.llmComplete(turnId);
  conversation.renderComplete(turnId);
  conversation.speechQueued(turnId, chunks.length);

  snapshot = {
    status: "loading",
    runId,
    chunksTotal: chunks.length,
    chunksSpoken: 0,
    turnId,
    owner: opts.owner ?? null,
  };
  emit();

  const voice = opts.voice ?? "shimmer";

  try {
    // Pipeline: fetch chunk n+1 while chunk n plays.
    let nextUrl: Promise<string> | null = chunks[0] ? fetchChunk(chunks[0], voice) : null;
    let anyPlayed = false;

    for (let i = 0; i < chunks.length; i++) {
      if (runId !== runCounter) return "interrupted";
      const url = await nextUrl!;
      const upcoming = chunks[i + 1];
      nextUrl = upcoming ? fetchChunk(upcoming, voice) : null;
      if (runId !== runCounter) return "interrupted";

      const ok = await playClip(url, runId, turnId);
      if (runId !== runCounter) return "interrupted";
      if (ok) anyPlayed = true;
      conversation.chunkSpoken(turnId, i);
      patch({ chunksSpoken: i + 1 });

      if (!ok && !anyPlayed) {
        conversation.playbackFailed(turnId, "browser blocked audio");
        snapshot = { ...IDLE, runId };
        emit();
        return "blocked";
      }
    }

    conversation.playbackComplete(turnId);
    snapshot = { ...IDLE, runId };
    emit();
    return "complete";
  } catch (err) {
    conversation.playbackFailed(turnId, err instanceof Error ? err.message : "tts failed");
    snapshot = { ...IDLE, runId };
    emit();
    return "failed";
  } finally {
    if (runId === runCounter) sweepAudio();
  }
}
