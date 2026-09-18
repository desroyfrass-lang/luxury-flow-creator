// SPEC-BLUEPRINT-001-FINAL §2 — the one nested Money Move component.
// A Money Move card opens in place and shows its Fast Tracks inside it.
// There is no separate step list anywhere else in the Daily.

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import {
  LIFECYCLE,
  clearLegacyDoneTracks,
  loadLegacyDoneTracks,
  moneyMoves,
  nextFastTrack,
  type FastTrack,
  type MoneyMove,
} from "@/lib/builder-os/money-move-lifecycle";
import {
  importLegacyFastTracks,
  listFastTrackProgress,
  setFastTrackState,
} from "@/lib/builder-os/fast-track.functions";
import { BUSINESS_VAULTS } from "@/lib/business/vault-family";
import { fastTrackKey, legacyFastTrackId, parentMoveIdForVault } from "@/lib/builder-os/fast-track-identity";
import { PRIORITY_META, loadPriorities } from "@/lib/builder-os/vault-priority";

/** Old browser ticks, translated to the account-backed identity, once. */
function legacyRowsToImport() {
  const legacy = new Set(loadLegacyDoneTracks());
  if (legacy.size === 0) return [];
  const rows: { trackKey: string; vaultKey: string; title: string; parentMoveId: string | null }[] = [];
  for (const vault of BUSINESS_VAULTS) {
    vault.moves.forEach((m, i) => {
      if (!legacy.has(legacyFastTrackId(vault.key, i))) return;
      rows.push({
        trackKey: fastTrackKey(vault.key, m.title),
        vaultKey: vault.key,
        title: m.title,
        parentMoveId: parentMoveIdForVault(vault.key),
      });
    });
  }
  return rows;
}

export function MoneyMoveStack({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const [priorities] = useState(() => loadPriorities());
  const [open, setOpen] = useState<string | null>(null);
  const qc = useQueryClient();
  const listFn = useServerFn(listFastTrackProgress);
  const saveFn = useServerFn(setFastTrackState);
  const importFn = useServerFn(importLegacyFastTracks);
  const migrated = useRef(false);

  const { data: progress } = useQuery({
    queryKey: ["fast-track-progress"],
    queryFn: () => listFn(),
  });

  // One-time migration: the browser is no longer the source of truth.
  useEffect(() => {
    if (migrated.current || !progress) return;
    migrated.current = true;
    const rows = legacyRowsToImport();
    if (rows.length === 0) {
      clearLegacyDoneTracks();
      return;
    }
    void importFn({ data: { tracks: rows } }).then(() => {
      clearLegacyDoneTracks();
      void qc.invalidateQueries({ queryKey: ["fast-track-progress"] });
    });
  }, [progress, importFn, qc]);

  const save = useMutation({
    mutationFn: (input: {
      trackKey: string;
      vaultKey: string;
      title: string;
      status: "active" | "done";
      parentMoveId: string | null;
    }) => saveFn({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fast-track-progress"] });
      void qc.invalidateQueries({ queryKey: ["daily-board"] });
    },
  });

  const doneKeys = useMemo(
    () => new Set((progress ?? []).filter((p) => p.status === "done").map((p) => p.track_key)),
    [progress],
  );

  const moves = useMemo(() => moneyMoves(priorities, doneKeys), [priorities, doneKeys]);

  const onTick = (track: FastTrack) => {
    save.mutate({
      trackKey: track.key,
      vaultKey: track.vaultKey,
      title: track.title,
      status: track.done ? "active" : "done",
      parentMoveId: track.parentMoveId,
    });
  };

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
          onTick={onTick}
          busy={save.isPending}
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
  busy,
}: {
  move: MoneyMove;
  open: boolean;
  onToggle: () => void;
  onTick: (track: FastTrack) => void;
  onNavigate?: (to: string) => void;
  busy?: boolean;
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
              <li key={f.key} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`ws-chip ${f.done ? "daily-chip-on" : ""}`}
                  aria-pressed={f.done}
                  aria-label={f.title}
                  disabled={busy}
                  onClick={() => onTick(f)}
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
