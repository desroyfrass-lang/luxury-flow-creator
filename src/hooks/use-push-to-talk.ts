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
import { conversation } from "@/lib/voice/conversation-machine";
import {
  getSpeechSnapshot,
  pauseSpeech,
  resumeSpeech,
  speakText,
  stopSpeech,
  subscribeSpeech,
  toggleSpeechPause,
  type SpeechSnapshot,
} from "@/lib/voice/speech-manager";
import type { VoiceTone } from "@/lib/voice/frassy-voice";

export type VoicePhase = "idle" | "recording" | "transcribing" | "speaking";

const MIN_BLOB_BYTES = 2048;

export function useConversationState() {
  return useSyncExternalStore(
    conversation.subscribe,
    conversation.getSnapshot,
    conversation.getSnapshot,
  );
}

/** Global speech playback state — shared by every surface. */
export function useSpeechState(): SpeechSnapshot {
  return useSyncExternalStore(subscribeSpeech, getSpeechSnapshot, getSpeechSnapshot);
}

export function usePushToTalk(owner = "frassy") {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Voice Engine truth: the UI may only advertise speech when playback actually
  // worked. Any TTS failure or blocked playback flips this off immediately.
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const recorderRef = useRef<WavRecorder | null>(null);
  const speakingRef = useRef(false);
  const speech = useSpeechState();

  const releaseAudio = useCallback(() => {
    // Only this surface's own speech may be torn down here — playback is global.
    if (speakingRef.current) {
      speakingRef.current = false;
      stopSpeech();
    }
  }, []);

  // Never leave the mic open or our own audio playing behind an unmount.
  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      if (speakingRef.current) {
        speakingRef.current = false;
        stopSpeech("surface closed");
      }
    },
    [],
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

  /**
   * Speaks a complete reply through the shared singleton player. Any speech
   * already playing anywhere in the app is stopped first, so exactly one voice
   * stream is ever audible.
   */
  const speak = useCallback(
    async (text: string, tone?: VoiceTone) => {
      speakingRef.current = true;
      setPhase("speaking");
      const result = await speakText(text, { owner, tone });
      speakingRef.current = false;
      if (result === "blocked") {
        setVoiceAvailable(false);
        setVoiceError(
          "Voice is temporarily unavailable while it's being updated. Let's continue in text for now.",
        );
      } else if (result === "failed") {
        setVoiceAvailable(false);
        setVoiceError(
          "Voice is temporarily unavailable while it's being updated. Let's continue in text for now.",
        );
      } else if (result === "complete") {
        setVoiceAvailable(true);
      }
      setPhase("idle"); // always returns to waiting — never reopens the mic
    },
    [owner],
  );

  const stopSpeaking = useCallback(() => {
    speakingRef.current = false;
    stopSpeech();
    setPhase("idle");
  }, []);

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
    /** Global playback controls — safe to call from any surface. */
    speechStatus: speech.status,
    speechProgress: { spoken: speech.chunksSpoken, total: speech.chunksTotal },
    // The written record of the exact words sent to voice. Conversation
    // surfaces use this to guarantee that speech can never exist without text.
    spokenText: speech.fullText,
    speechRunId: speech.runId,
    speechOwner: speech.owner,
    isSpeaking: speech.status === "playing" || speech.status === "loading",
    isPaused: speech.status === "paused",
    pauseSpeech,
    resumeSpeech,
    togglePause: toggleSpeechPause,
    releaseAudio,
  };
}
