// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — Push-to-talk voice for Frassy.
//
// Contract (deliberately narrow):
//   press mic → record → press again → transcribe → hand text to the caller.
//   speak(text) → play ONE mp3 → resolve → stop. Nothing reopens the mic.
//
// Explicitly NOT here: continuous listening, VAD, auto-reopen, barge-in,
// background listening, streaming loops. Those are Phase 3 and must stay out.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { startWavRecording, type WavRecorder } from "@/lib/voice/wav-recorder";

export type VoicePhase = "idle" | "recording" | "transcribing" | "speaking";

const MIN_BLOB_BYTES = 2048;

export function usePushToTalk() {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Voice Engine truth: the UI may only advertise speech when playback actually
  // worked. Any TTS failure or blocked playback flips this off immediately.
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const recorderRef = useRef<WavRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const releaseAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.src = "";
    }
    audioRef.current = null;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  // Never leave the mic open or audio playing behind an unmount.
  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      releaseAudio();
    },
    [releaseAudio],
  );

  const startRecording = useCallback(async () => {
    if (recorderRef.current) return;
    setVoiceError(null);
    releaseAudio();
    try {
      recorderRef.current = await startWavRecording();
      setPhase("recording");
    } catch {
      recorderRef.current = null;
      setPhase("idle");
      setVoiceError("I couldn't reach your microphone. Check the browser permission and try again.");
    }
  }, [releaseAudio]);

  /** Stops the mic and returns the transcript (empty string when unusable). */
  const stopRecording = useCallback(async (): Promise<string> => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (!rec) return "";

    setPhase("transcribing");
    try {
      const blob = await rec.stop();
      if (blob.size < MIN_BLOB_BYTES) {
        setVoiceError("That recording was too short — hold the mic a moment longer.");
        setPhase("idle");
        return "";
      }
      const form = new FormData();
      form.append("file", blob, "recording.wav");
      const res = await fetch("/api/stt", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setVoiceError(detail.slice(0, 140) || "I couldn't transcribe that. Try again?");
        setPhase("idle");
        return "";
      }
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      setPhase("idle");
      if (!text) setVoiceError("I didn't catch any words there.");
      return text;
    } catch {
      setPhase("idle");
      setVoiceError("Something went wrong while transcribing.");
      return "";
    }
  }, []);

  const cancelRecording = useCallback(() => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    setPhase("idle");
  }, []);

  /** Speaks one reply, once. Resolves when playback ends or fails. */
  const speak = useCallback(
    async (text: string) => {
      const input = text.trim().slice(0, 800);
      if (!input) return;
      releaseAudio();
      setPhase("speaking");
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input, voice: "shimmer" }),
        });
        if (!res.ok) {
          setVoiceAvailable(false);
          setVoiceError("Voice is temporarily unavailable — my reply is above.");
          setPhase("idle");
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        let played = false;
        await new Promise<void>((resolve) => {
          audio.onplaying = () => {
            played = true;
          };
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        if (!played) {
          setVoiceAvailable(false);
          setVoiceError("Your browser blocked audio playback — my reply is above.");
        } else {
          setVoiceAvailable(true);
        }
      } catch {
        setVoiceAvailable(false);
        setVoiceError("Voice is temporarily unavailable — my reply is above.");
      } finally {
        releaseAudio();
        setPhase("idle"); // always returns to waiting — never reopens the mic
      }
    },
    [releaseAudio],
  );

  const stopSpeaking = useCallback(() => {
    releaseAudio();
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
