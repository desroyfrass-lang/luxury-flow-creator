// Hidden developer overlay for the Frassy voice state machine.
//
// Enable with ?voicedebug=1 (persists for the session) or Ctrl+Alt+V.
// Shows the authoritative state, turn ID, every subsystem status, remaining
// audio buffer, microphone state, turn owner, interruption flag, and a
// timestamped transition log.

import { useEffect, useState } from "react";
import { useConversationState } from "@/hooks/use-push-to-talk";
import { STATE_LABELS, type SubsystemStatus } from "@/lib/voice/conversation-machine";

const KEY = "frassy:voice-debug";

function dot(status: SubsystemStatus) {
  const color =
    status === "complete"
      ? "bg-emerald-400"
      : status === "active"
        ? "bg-amber-400"
        : status === "failed"
          ? "bg-red-400"
          : status === "skipped"
            ? "bg-white/25"
            : "bg-white/40";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}

export function VoiceStateOverlay() {
  const [enabled, setEnabled] = useState(false);
  const snap = useConversationState();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("voicedebug") === "1") sessionStorage.setItem(KEY, "1");
    setEnabled(sessionStorage.getItem(KEY) === "1");
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "v") {
        setEnabled((prev) => {
          const next = !prev;
          sessionStorage.setItem(KEY, next ? "1" : "0");
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!enabled) return null;

  const rows: Array<[string, React.ReactNode]> = [
    ["State", STATE_LABELS[snap.state]],
    ["Turn ID", snap.turnId ?? "—"],
    ["Owner", snap.owner],
    [
      "LLM",
      <span className="flex items-center gap-1.5">
        {dot(snap.llm)} {snap.llm}
      </span>,
    ],
    [
      "TTS",
      <span className="flex items-center gap-1.5">
        {dot(snap.tts)} {snap.tts}
      </span>,
    ],
    [
      "Playback",
      <span className="flex items-center gap-1.5">
        {dot(snap.playback)} {snap.playback}
      </span>,
    ],
    [
      "Render",
      <span className="flex items-center gap-1.5">
        {dot(snap.render)} {snap.render}
      </span>,
    ],
    ["Speech", `${snap.chunksSpoken}/${snap.chunksTotal} chunks`],
    ["Buffer", `${snap.bufferSeconds.toFixed(2)}s`],
    ["Microphone", snap.micOpen ? "open" : "closed"],
    ["Interrupted", snap.interrupted ? "yes" : "no"],
    ["Error", snap.error ?? "—"],
  ];

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[9999] w-72 rounded-lg border border-white/15 bg-black/85 p-3 font-mono text-[10px] leading-relaxed text-white/70 shadow-2xl backdrop-blur">
      <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-[color:var(--gold)]/80">
        Frassy voice state
      </p>
      <dl className="space-y-0.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="text-white/40">{label}</dt>
            <dd className="truncate text-right text-white/80">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">Transitions</p>
      <ul className="max-h-40 space-y-0.5 overflow-hidden">
        {snap.transitions.slice(0, 12).map((t, i) => (
          <li key={`${t.at}-${i}`} className="truncate text-white/45">
            {new Date(t.at).toISOString().slice(11, 23)} {t.from}→{t.to}
            {t.note ? ` · ${t.note}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
