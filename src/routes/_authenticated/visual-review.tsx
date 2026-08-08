import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import {
  buildVisualQueue,
  loadVisualReview,
  saveVisualReview,
  REVIEW_CHECKLIST,
  REVIEW_DECISIONS,
  CREATIVE_DIRECTOR_WATCHES,
  VISUAL_EXCELLENCE_BRIEF,
  VISUAL_EXCELLENCE_PRINCIPLE,
  type ReviewDecision,
  type VisualReviewState,
} from "@/lib/visual-review";

const FILES = import.meta.glob("/src/assets/**/*.{jpg,jpeg,png,webp,gif,svg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const Route = createFileRoute("/_authenticated/visual-review")({
  head: () => ({
    meta: [
      { title: "Visual Excellence Review — Founder Daily" },
      {
        name: "description",
        content:
          "FRASS-0226: review every visual asset across Frass, one at a time. Approve, enhance, redesign or replace — progress saves after every decision.",
      },
      { property: "og:title", content: "Visual Excellence Review — Founder Daily" },
      {
        property: "og:description",
        content: "A permanent Founder discipline: luxury brands never stop refining their presentation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisualReviewPage,
});

function VisualReviewPage() {
  const queue = useMemo(() => buildVisualQueue(FILES), []);
  const [state, setState] = useState<VisualReviewState>(() => loadVisualReview());
  const [note, setNote] = useState("");

  const commit = (next: VisualReviewState) => {
    setState(next);
    saveVisualReview(next);
  };

  const index = Math.min(state.index, Math.max(queue.length - 1, 0));
  const asset = queue[index];
  const reviewed = Object.keys(state.records).length;
  const pct = queue.length ? Math.round((reviewed / queue.length) * 100) : 0;

  const decide = (decision: ReviewDecision) => {
    if (!asset) return;
    commit({
      index: Math.min(index + 1, queue.length - 1),
      records: {
        ...state.records,
        [asset.id]: { decision, note: note.trim() || undefined, at: new Date().toISOString() },
      },
    });
    setNote("");
  };

  const existing = asset ? state.records[asset.id] : undefined;

  return (
    <WorkspaceShell title="Visual Excellence Review">
      <div className="mx-auto max-w-[1100px] space-y-6 p-6">
        <header>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
            FRASS-0226 · Founder Daily · Brand Excellence
          </span>
          <h1 className="mt-2 font-display text-2xl uppercase md:text-3xl">
            Visual Excellence Review
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{VISUAL_EXCELLENCE_BRIEF}</p>
        </header>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">
              {asset ? asset.group : "Queue"} — image {index + 1} of {queue.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {reviewed} reviewed · {pct}% complete · saved automatically
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-[color:var(--hill-gold)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {asset ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
              <img
                src={asset.url}
                alt={asset.name}
                loading="lazy"
                className="max-h-[520px] w-full bg-black/40 object-contain"
              />
              <dl className="grid grid-cols-2 gap-3 p-5 text-xs">
                <Fact label="Asset" value={asset.name} />
                <Fact label="Group" value={asset.group} />
                <Fact label="Source" value={asset.source} />
                <Fact label="Path" value={asset.id.replace("/src/", "src/")} />
                <Fact
                  label="Status"
                  value={existing ? `Decided — ${existing.decision}` : "Awaiting your decision"}
                />
                <Fact label="Position" value={`${index + 1} / ${queue.length}`} />
              </dl>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                  Review checklist
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {REVIEW_CHECKLIST.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Notes for Frassy — exactly what to change, if anything."
                className="w-full rounded-2xl border border-border/60 bg-card/40 p-4 text-sm outline-none focus:border-[color:var(--hill-gold)]/60"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                {REVIEW_DECISIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => decide(d.id)}
                    className="rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-left text-sm transition hover:border-[color:var(--hill-gold)]/50 hover:bg-foreground/5"
                  >
                    <span className="mr-2">{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => commit({ ...state, index: Math.max(index - 1, 0) })}
                  className="rounded-full border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commit({ ...state, index: Math.min(index + 1, queue.length - 1) })
                  }
                  className="rounded-full border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => commit({ index: 0, records: {} })}
                  className="rounded-full border border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Restart the review
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
            No visual assets found in the queue.
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
              Frassy watches for
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CREATIVE_DIRECTOR_WATCHES.map((w) => (
                <span key={w} className="rounded-full border border-border/60 px-2.5 py-1 text-[11px]">
                  {w}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              She recommends improvements. She never replaces or publishes an asset without your
              approval.
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--hill-gold)]/25 bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
              Constitutional principle
            </div>
            <p className="mt-2 text-sm italic text-muted-foreground">
              {VISUAL_EXCELLENCE_PRINCIPLE}
            </p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all">{value}</dd>
    </div>
  );
}
