// Voice gate + diagnostics.
//
// Voice must never fail silently: if the browser blocks playback, the Builder
// sees one clear card and one tap fixes it for the whole session.

import { useEffect, useState } from "react";
import {
  AUDIO_BLOCK_LABELS,
  audioContextState,
  isAudioRunning,
  isAudioUnlocked,
  unlockAudioVerified,
  type AudioBlockReason,
} from "@/lib/audio-unlock";
import { VoicePlaybackDebugger } from "@/components/voice-playback-debugger";

export type VoiceGateProps = {
  open: boolean;
  reason?: AudioBlockReason | null;
  /** Called after the tap; `ok` says whether audio really started. */
  onEnable: (ok: boolean) => void;
  onDismiss?: () => void;
  /** Extra live signals for the diagnostics panel. */
  speaking?: boolean;
  listening?: boolean;
};

export function VoiceGate({
  open,
  reason,
  onEnable,
  onDismiss,
  speaking,
  listening,
}: VoiceGateProps) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const label = reason ? AUDIO_BLOCK_LABELS[reason] : AUDIO_BLOCK_LABELS["browser-blocked-audio"];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-[color:var(--gold)]/50 bg-card p-6 text-center shadow-2xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">
          {label}
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">
          One final step before we begin.
        </h2>
        <p className="text-sm text-muted-foreground">
          Tap once to enable Frassy&rsquo;s voice for this session.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await unlockAudioVerified();
            setBusy(false);
            onEnable(ok);
          }}
          className="w-full rounded-sm bg-[color:var(--gold)] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Enabling…" : "Enable Voice"}
        </button>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Continue in text for now
          </button>
        )}
        <VoiceDiagnostics speaking={speaking} listening={listening} />
        <VoicePlaybackDebugger microphone={listening} sttConnected={listening} />
      </div>
    </div>
  );
}

/** Temporary developer panel — pinpoints exactly where the voice chain fails. */
export function VoiceDiagnostics({
  speaking,
  listening,
}: {
  speaking?: boolean;
  listening?: boolean;
}) {
  const [tick, setTick] = useState(0);
  const [tts, setTts] = useState<boolean | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tts", { method: "OPTIONS" })
      .then((r) => !cancelled && setTts(r.status < 500))
      .catch(() => !cancelled && setTts(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const mic = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
  const rows: [string, boolean | null | string][] = [
    ["Microphone / STT", mic],
    ["Frassy intelligence", true],
    ["Voice service (TTS)", tts],
    ["Audio context", audioContextState()],
    ["Autoplay unlocked", isAudioUnlocked() && isAudioRunning()],
    ["Speaking", Boolean(speaking)],
    ["Listening", Boolean(listening)],
  ];

  return (
    <details className="rounded-xl border border-border bg-secondary/40 p-3 text-left text-[10px]">
      <summary className="cursor-pointer font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Voice diagnostics
      </summary>
      <div className="mt-2 space-y-1 font-mono" data-tick={tick}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{k}</span>
            <span>{typeof v === "string" ? v : v === null ? "…" : v ? "✅" : "❌"}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
