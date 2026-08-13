// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0553 — Frassy Conversation Dock. One Place. Every Conversation.
//
// Constitutional rule: every conversational page shows the same dock, in the
// same place, with the same controls. It sits directly beneath the Frass Trail
// navigation chip (top-right), attached to the page chrome — never floating
// over headings, logos or content, never clipping, never scrolling sideways.
//
// The microphone is always the primary action: talking to Frassy is one tap
// away from anywhere in Frass.
// ─────────────────────────────────────────────────────────────────────────────

import { Mic, Pause, Play, Square } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useConversationState, useSpeechState } from "@/hooks/use-push-to-talk";
import { pauseSpeech, resumeSpeech, stopSpeech } from "@/lib/voice/speech-manager";
import { requestTalk } from "@/lib/voice/dock-bus";
import { useChromeOffset } from "@/hooks/use-chrome-offset";

/** Surfaces that own their own exits and have no conversation. */
const HIDDEN_PREFIXES = ["/auth", "/reset-password", "/pay/", "/api", "/checkout"];

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
  // The dock is page chrome: it parks directly beneath the site header and the
  // Frass Trail chip, vertically aligned with them on every page.
  const top = useChromeOffset(["header", 'nav[aria-label="Breadcrumb"] > div'], 128);

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) return null;

  const listening = convo.state === "listening" || convo.micOpen;
  const thinking =
    convo.state === "transcribing" ||
    convo.state === "thinking" ||
    convo.state === "streaming_response" ||
    speech.status === "loading";
  const paused = speech.status === "paused";
  const speaking = speech.status === "playing" || convo.state === "speaking";
  const audioLive = speech.status !== "idle";

  const status: DockStatus = listening
    ? "listening"
    : speaking && !paused
      ? "speaking"
      : thinking
        ? "thinking"
        : "idle";
  const copy = STATUS_COPY[status];

  return (
    <div
      aria-label="Frassy conversation dock"
      style={{ top }}
      className="pointer-events-none fixed left-0 right-0 z-40 px-3 sm:px-6 lg:px-12"
    >
      <div className="mx-auto flex max-w-[1600px] justify-end">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-end gap-1.5 rounded-full border border-border/60 bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-xl">
          {/* Primary action — always first, always reachable. */}
          <button
            type="button"
            onClick={() => requestTalk()}
            aria-label="Talk to Frassy"
            title="Talk to Frassy"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:text-[11px] ${
              listening
                ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 text-[color:var(--gold)]"
                : "border-border/60 bg-background/60 text-foreground hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>{listening ? "Listening — tap to send" : "Talk to Frassy"}</span>
          </button>

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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${copy.dot}`} aria-hidden />
            {paused && audioLive ? "Paused" : copy.label}
          </span>
        </div>
      </div>
    </div>
  );
}
