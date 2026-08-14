// SPEC-BLUEPRINT-001-FINAL §2 — the one nested Money Move component.
// A Money Move card opens in place and shows its Fast Tracks inside it.
// There is no separate step list anywhere else in the Daily.

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import {
  LIFECYCLE,
  moneyMoves,
  nextFastTrack,
  toggleFastTrack,
  type MoneyMove,
} from "@/lib/builder-os/money-move-lifecycle";
import { PRIORITY_META, loadPriorities } from "@/lib/builder-os/vault-priority";

export function MoneyMoveStack({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const [priorities] = useState(() => loadPriorities());
  const [done, setDone] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  // `done` is only here to re-read localStorage after a tick.
  const moves = useMemo(() => moneyMoves(priorities), [priorities, done]);

  if (moves.length === 0) {
    return (
      <div className="ws-meta">
        No Vault is Active or Growing yet, so there are no Money Moves today. Open your Vaults and mark
        one Active — that's the switch that fills your Daily.
        <button type="button" className="daily-link mt-3" onClick={() => onNavigate?.("/business-vaults")}>
          Open your Vaults <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ol className="daily-lifecycle ws-meta flex flex-wrap gap-x-2 gap-y-1">
        {LIFECYCLE.map((s, i) => (
          <li key={s.id}>
            {s.emoji} {s.label}
            {i < LIFECYCLE.length - 1 ? " →" : ""}
          </li>
        ))}
      </ol>

      {moves.map((m) => (
        <MoneyMoveCard
          key={m.id}
          move={m}
          open={open === m.id}
          onToggle={() => setOpen(open === m.id ? null : m.id)}
          onTick={(id) => setDone(toggleFastTrack(id))}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function MoneyMoveCard({
  move,
  open,
  onToggle,
  onTick,
  onNavigate,
}: {
  move: MoneyMove;
  open: boolean;
  onToggle: () => void;
  onTick: (id: string) => void;
  onNavigate?: (to: string) => void;
}) {
  const next = nextFastTrack(move);
  const meta = PRIORITY_META[move.priority];
  const stage = LIFECYCLE.find((s) => s.id === move.stage)!;

  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-4">
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={onToggle}>
        {open ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0" />
        )}
        <span className="flex-1">
          <span className="block font-display text-base">
            {move.emoji} {move.title}
          </span>
          <span className="ws-meta block">{move.everyday}</span>
          <span className="ws-meta mt-1 block">
            {meta.emoji} {meta.label} · {stage.emoji} {stage.label} · {move.completed} of{" "}
            {move.fastTracks.length} Fast Tracks done
          </span>
        </span>
        <span className="ws-meta shrink-0">{move.pct}%</span>
      </button>

      <div className="mt-3 h-1 w-full overflow-hidden rounded bg-border/60">
        <div className="h-full bg-[color:var(--gold)]" style={{ width: `${move.pct}%` }} />
      </div>

      {!open && next && <p className="ws-meta mt-3">Next Fast Track: {next.title}</p>}

      {open && (
        <div className="mt-4 space-y-2">
          <div className="ws-meta">⚡ Fast Tracks — the guided steps inside this Money Move.</div>
          <ul className="space-y-1">
            {move.fastTracks.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`ws-chip ${f.done ? "daily-chip-on" : ""}`}
                  aria-pressed={f.done}
                  onClick={() => onTick(f.id)}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className={`flex-1 text-sm ${f.done ? "line-through opacity-60" : ""}`}>
                  {f.title}
                </span>
                <span className="ws-meta">{f.minutes} min</span>
                {f.to && (
                  <button type="button" className="daily-link" onClick={() => onNavigate?.(f.to!)}>
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 rounded-lg border border-border/60 p-3">
            <div className="text-sm">🚪 Ready to Build</div>
            <p className="ws-meta">
              Thinking is done here. The making happens in the Workshop.
            </p>
            <button
              type="button"
              className="daily-link mt-2"
              onClick={() => onNavigate?.(move.workshopTo)}
            >
              Enter the Workshop <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="ws-meta">💰 Monetization: {move.monetizationOutcome}</p>
        </div>
      )}
    </div>
  );
}
