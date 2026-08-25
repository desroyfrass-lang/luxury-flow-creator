// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0553 (rev. FRASS-0554) — Frassy Conversation Dock.
// One place. Every conversation. And now: one control, not two.
//
// The dock no longer sits across the top of the page. It is fused with the
// glowing Frassy beacon in the bottom-right corner: the mic and the transport
// controls stack directly above her, so members reach for one thing only.
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import { Pause, Play, Square } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useConversationState, useSpeechState } from "@/hooks/use-push-to-talk";
import { pauseSpeech, resumeSpeech, stopSpeech } from "@/lib/voice/speech-manager";
import { frassySurface } from "@/lib/frassy/surfaces";
import {
  isEntranceActive,
  isEntranceActiveServer,
  subscribeEntrance,
} from "@/lib/frassy/host-presence";

type DockStatus = "listening" | "thinking" | "speaking" | "idle";

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-[color:var(--gold)] ${
            active ? "animate-[speech-bar_0.9s_ease-in-out_infinite]" : "opacity-40"
          }`}
          style={{ height: active ? "100%" : "35%", animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}

const STATUS_COPY: Record<DockStatus, { label: string; dot: string }> = {
  listening: { label: "Listening", dot: "bg-emerald-400" },
  thinking: { label: "Thinking", dot: "bg-amber-400" },
  speaking: { label: "Speaking", dot: "bg-[color:var(--gold)]" },
  idle: { label: "Idle", dot: "bg-muted-foreground/50" },
};

export function FrassyConversationDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const convo = useConversationState();
  const speech = useSpeechState();
  const entrance = useSyncExternalStore(
    subscribeEntrance,
    isEntranceActive,
    isEntranceActiveServer,
  );

  // FRASS-0558 — no transport controls where Frassy is deliberately absent.
  if (frassySurface(pathname) === "none") return null;
  // Step 2 — one Frassy at a time: the cinematic host owns the screen alone.
  if (entrance) return null;

  const listening = convo.state === "listening" || convo.micOpen;
  const thinking =
    convo.state === "transcribing" ||
    convo.state === "thinking" ||
    convo.state === "streaming_response" ||
    speech.status === "loading";
  const paused = speech.status === "paused";
  const speaking = speech.status === "playing" || convo.state === "speaking";
  const audioLive = speech.status !== "idle";
  const active = listening || thinking || audioLive;

  const status: DockStatus = listening
    ? "listening"
    : speaking && !paused
      ? "speaking"
      : thinking
        ? "thinking"
        : "idle";
  const copy = STATUS_COPY[status];

  // FRASS-0579 — the floating teleprompter box is gone for good. Frassy's words
  // live in one place only: the conversation thread itself, where they can be
  // read back, copied and kept. Nothing she says appears in a box that vanishes.

  return (
    <div
      aria-label="Frassy conversation dock"
      // FRASS-0557 — fused with the beacon: the transport strip floats directly
      // above her with clear breathing room, never touching a screen edge.
      className="pointer-events-none fixed bottom-[6.25rem] right-6 z-50 flex max-w-[calc(100vw-3rem)] flex-col items-end gap-2"
    >


      {active && (

        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-2 py-1 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            onClick={() => (paused ? resumeSpeech() : pauseSpeech())}
            disabled={!audioLive}
            aria-label={paused ? "Resume Frassy's voice" : "Pause Frassy's voice"}
            title={paused ? "Resume" : "Pause"}
            className="inline-flex shrink-0 items-center rounded-full p-1.5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground disabled:opacity-35"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => stopSpeech("stopped from the conversation dock")}
            disabled={!audioLive}
            aria-label="Stop Frassy's voice"
            title="Stop"
            className="inline-flex shrink-0 items-center rounded-full p-1.5 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground disabled:opacity-35"
          >
            <Square className="h-3.5 w-3.5" />
          </button>

          <Waveform active={speaking && !paused} />

          <span
            role="status"
            aria-live="polite"
            className="inline-flex shrink-0 items-center gap-1.5 pr-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${copy.dot}`} aria-hidden />
            {paused && audioLive ? "Paused" : copy.label}
          </span>
        </div>
      )}
    </div>
  );
}
