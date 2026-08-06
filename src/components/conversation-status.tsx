import { Ear, Loader2, Brain, Volume2, PenLine } from "lucide-react";

export type ConversationPhase =
  | "idle"
  | "listening"
  | "hearing"
  | "understanding"
  | "thinking"
  | "speaking";

const PHASE: Record<
  Exclude<ConversationPhase, "idle">,
  { label: string; Icon: typeof Ear }
> = {
  listening: { label: "Listening", Icon: Ear },
  hearing: { label: "Listening", Icon: Ear },
  understanding: { label: "Understanding", Icon: PenLine },
  thinking: { label: "Thinking", Icon: Brain },
  speaking: { label: "Speaking", Icon: Volume2 },
};

/**
 * Conversation Status Bar — Builders should never wonder what Frassy is doing.
 * `level` (0–1) drives the live input meter while listening.
 */
export function ConversationStatus({
  phase,
  level = 0,
  transcript,
}: {
  phase: ConversationPhase;
  level?: number;
  transcript?: string;
}) {
  if (phase === "idle") return null;
  const { label, Icon } = PHASE[phase];
  const active = phase === "hearing" || phase === "listening";

  return (
    <div
      aria-live="polite"
      className="mb-2 flex items-center gap-2 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/[0.06] px-3 py-1.5"
    >
      {phase === "understanding" || phase === "thinking" ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[color:var(--gold)]" />
      ) : (
        <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]" />
      )}
      <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
        {label}
      </span>

      {active && (
        <span className="flex h-3 items-end gap-[2px]" aria-hidden>
          {[0.35, 0.7, 1, 0.6, 0.3].map((weight, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[color:var(--gold)] transition-[height] duration-100"
              style={{ height: `${Math.max(2, Math.min(12, level * 14 * weight))}px` }}
            />
          ))}
        </span>
      )}

      {transcript ? (
        <span className="ml-1 truncate text-xs text-muted-foreground">{transcript}</span>
      ) : null}
    </div>
  );
}
