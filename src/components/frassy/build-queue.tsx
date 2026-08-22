// ─────────────────────────────────────────────────────────────────────────────
// Frassy's Money Moves Desk — the Build Queue.
//
// Finished work waits here for one word from the partner. Below it sit the
// partner's own Money Moves, rendered by the existing MoneyMoveStack — the same
// component the Daily uses, so there is only ever one Money Move card in Frass.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronRight, Pencil, Sparkles, Archive } from "lucide-react";
import { MoneyMoveStack } from "@/components/builder-os/money-move-stack";
import { LAYER_BY_ID, type LayerId } from "@/lib/business/financial-layers";
import {
  listBuildQueue,
  decideBuildQueueItem,
  type QueueItem,
} from "@/lib/frassy/oracles.functions";

const WAITING = new Set(["queued", "executing", "complete", "changes_requested"]);

export function BuildQueue({ paused }: { paused: boolean }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const listFn = useServerFn(listBuildQueue);
  const decideFn = useServerFn(decideBuildQueueItem);
  const [openId, setOpenId] = useState<string | null>(null);

  const queue = useQuery<QueueItem[]>({
    queryKey: ["frassy", "build-queue"],
    queryFn: () => listFn(),
    staleTime: 20_000,
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; decision: "approved" | "changes_requested" | "shelved" }) =>
      decideFn({ data: input }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["frassy", "build-queue"] });
      toast.success(
        v.decision === "approved"
          ? "Approved — I'll take it from here."
          : v.decision === "shelved"
            ? "Shelved. It stays yours; nothing is deleted."
            : "Noted. I'll rework it and bring it back.",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const waiting = (queue.data ?? []).filter((i) => WAITING.has(i.status));

  return (
    <section className="mt-10">
      <div className="border-b border-white/10 pb-4">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
          Build queue
        </div>
        <h2 className="mt-2 font-display text-2xl text-white">Waiting on you</h2>
        <p className="mt-2 text-sm text-white/50">
          {paused
            ? "I've paused new builds. Anything already finished still waits here for your word."
            : "Finished work I've built for you. Nothing goes live until you say so."}
        </p>
      </div>

      {queue.isLoading ? (
        <div className="mt-4 rounded-sm border border-white/10 px-6 py-8 text-sm text-white/40">
          Opening your queue…
        </div>
      ) : waiting.length === 0 ? (
        <div className="mt-4 flex items-start gap-4 rounded-sm border border-dashed border-white/15 px-6 py-10">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
          <p className="text-sm text-white/60">
            Nothing waiting for you right now. I'm building in the background — check back shortly.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {waiting.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              open={openId === item.id}
              busy={decide.isPending}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              onDecide={(decision) => decide.mutate({ id: item.id, decision })}
            />
          ))}
        </div>
      )}

      {/* Your own Money Moves — the same card the Daily uses. */}
      <div className="mt-10 border-t border-white/10 pt-6">
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Your Money Moves
        </div>
        <p className="mt-2 mb-4 text-sm text-white/50">
          The moves you're running yourself. Same cards as your Daily — one place, one truth.
        </p>
        <MoneyMoveStack onNavigate={(to) => navigate({ to })} />
      </div>
    </section>
  );
}

function QueueCard({
  item,
  open,
  busy,
  onToggle,
  onDecide,
}: {
  item: QueueItem;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onDecide: (d: "approved" | "changes_requested" | "shelved") => void;
}) {
  const layer = LAYER_BY_ID[item.moneyLayer as LayerId] ?? LAYER_BY_ID["immediate-income"];
  const ready = item.status === "complete" || item.progress >= 100;

  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        {open ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-white/50" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/50" />
        )}
        <span className="flex-1">
          <span className="block text-base text-white">{item.moveName}</span>
          <span className="mt-1 block text-xs text-white/50">
            {layer.dot} {layer.label} · {item.oracle} ·{" "}
            {ready ? "Finished — waiting on you" : `${item.progress}% built`}
          </span>
        </span>
      </button>

      <div className="mt-3 h-1 w-full overflow-hidden rounded bg-white/10">
        <div
          className="h-full bg-[color:var(--gold)]"
          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
        />
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {item.frassyNote && <p className="text-sm text-white/70">“{item.frassyNote}”</p>}
          {item.reasoning && (
            <p className="text-xs text-white/45">Why I built it this way: {item.reasoning}</p>
          )}
          <p className="text-xs text-white/45">{layer.because}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              disabled={busy}
              onClick={() => onDecide("approved")}
              className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)]/60 bg-[color:var(--gold)]/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" /> Launch it
            </button>
            <button
              disabled={busy}
              onClick={() => onDecide("changes_requested")}
              className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white disabled:opacity-60"
            >
              <Pencil className="h-3.5 w-3.5" /> Change something
            </button>
            <button
              disabled={busy}
              onClick={() => onDecide("shelved")}
              className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-white disabled:opacity-60"
            >
              <Archive className="h-3.5 w-3.5" /> Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
