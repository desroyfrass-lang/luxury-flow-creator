// ─────────────────────────────────────────────────────────────────────────────
// Frassy voice — push-to-talk, driven by the single authoritative conversation
// state machine (src/lib/voice/conversation-machine.ts).
//
// Contract:
//   press mic → record → press again → transcribe → hand text to the caller.
//   speak(text) → chunk the FULL reply → play every chunk in order → resolve
//   only when real playback completion has been reported. Nothing reopens
//   the mic on its own.
//
// STOP-SHIP RULE: speech is never truncated and a turn never closes on token
// generation or text rendering — playback completion is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { startWavRecording, type WavRecorder } from "@/lib/voice/wav-recorder";
import { chunkForTTS, speakableText } from "@/lib/voice/chunk-text";
import { conversation } from "@/lib/voice/conversation-machine";

export type VoicePhase = "idle" | "recording" | "transcribing" | "speaking";

const MIN_BLOB_BYTES = 2048;

export function useConversationState() {
  return useSyncExternalStore(
    conversation.subscribe,
    conversation.getSnapshot,
    conversation.getSnapshot,
  );
}

export function usePushToTalk() {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Voice Engine truth: the UI may only advertise speech when playback actually
  // worked. Any TTS failure or blocked playback flips this off immediately.
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const recorderRef = useRef<WavRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlsRef = useRef<string[]>([]);
  const cancelRef = useRef(false);

  const releaseAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.src = "";
    }
    audioRef.current = null;
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  // Never leave the mic open or audio playing behind an unmount.
  useEffect(
    () => () => {
      cancelRef.current = true;
      recorderRef.current?.cancel();
      recorderRef.current = null;
      releaseAudio();
      conversation.reset();
    },
    [releaseAudio],
  );

  const startRecording = useCallback(async () => {
    if (recorderRef.current) return;
    setVoiceError(null);
    releaseAudio();
    try {
      recorderRef.current = await startWavRecording();
      conversation.startListening();
      setPhase("recording");
    } catch {
      recorderRef.current = null;
      conversation.reset();
      setPhase("idle");
      setVoiceError("I couldn't reach your microphone. Check the browser permission and try again.");
    }
  }, [releaseAudio]);

  /** Stops the mic and returns the transcript (empty string when unusable). */
  const stopRecording = useCallback(async (): Promise<string> => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (!rec) return "";

    conversation.startTranscribing();
    setPhase("transcribing");
    try {
      const blob = await rec.stop();
      if (blob.size < MIN_BLOB_BYTES) {
        setVoiceError("That recording was too short — hold the mic a moment longer.");
        conversation.reset();
        setPhase("idle");
        return "";
      }
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      const res = await fetch("/api/stt", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setVoiceError(detail.slice(0, 140) || "I couldn't transcribe that. Try again?");
        conversation.reset();
        setPhase("idle");
        return "";
      }
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      conversation.reset();
      setPhase("idle");
      if (!text) setVoiceError("I didn't catch any words there.");
      return text;
    } catch {
      conversation.reset();
      setPhase("idle");
      setVoiceError("Something went wrong while transcribing.");
      return "";
    }
  }, []);

  const cancelRecording = useCallback(() => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    conversation.reset();
    setPhase("idle");
  }, []);

  /** Fetches one chunk's audio as an object URL. */
  const fetchChunk = useCallback(async (text: string): Promise<string> => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "shimmer" }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    urlsRef.current.push(url);
    return url;
  }, []);

  /** Plays one clip and resolves only when the element reports completion. */
  const playClip = useCallback(
    (url: string, turnId: string) =>
      new Promise<boolean>((resolve) => {
        const audio = new Audio(url);
        audioRef.current = audio;
        let played = false;
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          audio.onended = null;
          audio.onerror = null;
          audio.ontimeupdate = null;
          resolve(ok);
        };
        audio.onplaying = () => {
          played = true;
        };
        audio.ontimeupdate = () => {
          if (Number.isFinite(audio.duration)) {
            conversation.bufferSeconds(turnId, Math.max(0, audio.duration - audio.currentTime));
          }
        };
        audio.onended = () => finish(played);
        audio.onerror = () => finish(false);
        audio.play().catch(() => finish(false));
      }),
    [],
  );

  /**
   * Speaks a complete reply. The text is chunked, never truncated, and the
   * promise resolves only after the last chunk has finished playing.
   */
  const speak = useCallback(
    async (text: string) => {
      const clean = speakableText(text);
      if (!clean) return;
      cancelRef.current = false;
      releaseAudio();

      const chunks = chunkForTTS(clean);
      const turnId = conversation.startTurn({ spoken: true });
      conversation.llmComplete(turnId);
      conversation.renderComplete(turnId);
      conversation.speechQueued(turnId, chunks.length);
      setPhase("speaking");

      try {
        // Pipeline: fetch chunk n+1 while chunk n is playing.
        let nextUrl: Promise<string> | null = chunks[0] ? fetchChunk(chunks[0]) : null;
        let anyPlayed = false;

        for (let i = 0; i < chunks.length; i++) {
          if (cancelRef.current) break;
          const url = await nextUrl!;
          const upcoming = chunks[i + 1];
          nextUrl = upcoming ? fetchChunk(upcoming) : null;
          if (cancelRef.current) break;

          const ok = await playClip(url, turnId);
          if (ok) anyPlayed = true;
          conversation.chunkSpoken(turnId, i);
          if (!ok && !anyPlayed) {
            // Nothing ever played — browser blocked audio. Stop cleanly.
            setVoiceAvailable(false);
            setVoiceError("Your browser blocked audio playback — my reply is above.");
            conversation.playbackFailed(turnId, "browser blocked audio");
            return;
          }
        }

        if (cancelRef.current) {
          conversation.interrupt("speech stopped by Builder");
          return;
        }
        setVoiceAvailable(true);
        conversation.playbackComplete(turnId);
      } catch (err) {
        setVoiceAvailable(false);
        setVoiceError("Voice is temporarily unavailable — my reply is above.");
        conversation.playbackFailed(turnId, err instanceof Error ? err.message : "tts failed");
      } finally {
        releaseAudio();
        setPhase("idle"); // always returns to waiting — never reopens the mic
      }
    },
    [fetchChunk, playClip, releaseAudio],
  );

  const stopSpeaking = useCallback(() => {
    cancelRef.current = true;
    releaseAudio();
    conversation.interrupt("speech stopped by Builder");
    setPhase("idle");
  }, [releaseAudio]);

  return {
    phase,
    voiceAvailable,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    startRecording,
    stopRecording,
    cancelRecording,
    speak,
    stopSpeaking,
  };
}
