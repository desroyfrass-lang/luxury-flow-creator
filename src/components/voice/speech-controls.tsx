// Global speech playback controls — pause / resume / stop for Frassy's voice.
//
// Both surfaces read the same singleton in src/lib/voice/speech-manager.ts, so
// pressing pause anywhere pauses the one and only audio stream.

import { Pause, Play, Square } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  getSpeechSnapshot,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
  subscribeSpeech,
} from "@/lib/voice/speech-manager";

export function useSpeechPlayback() {
  return useSyncExternalStore(subscribeSpeech, getSpeechSnapshot, getSpeechSnapshot);
}

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-[color:var(--gold)] ${
            active ? "animate-[speech-bar_0.9s_ease-in-out_infinite]" : "opacity-40"
          }`}
          style={{
            height: active ? "100%" : "35%",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </span>
  );
}

/** Inline控 controls for a chat composer / toolbar. Renders nothing when silent. */
export function SpeechControls({ className = "" }: { className?: string }) {
  const speech = useSpeechPlayback();
  if (speech.status === "idle") return null;

  const paused = speech.status === "paused";

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-[color:var(--gold)]/35 bg-black/50 px-3 py-1.5 ${className}`}
      role="group"
      aria-label="Frassy voice playback"
    >
      <Waveform active={!paused} />
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
        {paused ? "Paused" : speech.status === "loading" ? "Loading voice" : "Speaking"}
        {speech.chunksTotal > 1 && (
          <span className="ml-1 text-white/35">
            {Math.min(speech.chunksSpoken + (paused ? 0 : 1), speech.chunksTotal)}/{speech.chunksTotal}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={() => (paused ? resumeSpeech() : pauseSpeech())}
        aria-label={paused ? "Resume Frassy's voice" : "Pause Frassy's voice"}
        title={paused ? "Resume" : "Pause"}
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => stopSpeech()}
        aria-label="Stop Frassy's voice"
        title="Stop"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <Square className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Floating overlay so playback can always be paused, whatever page you are on. */
export function GlobalSpeechBar() {
  const speech = useSpeechPlayback();
  if (speech.status === "idle") return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto shadow-2xl">
        <SpeechControls />
      </div>
    </div>
  );
}
