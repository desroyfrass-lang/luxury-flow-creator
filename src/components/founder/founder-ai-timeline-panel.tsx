// FRASS-0571A — Founder AI Timeline.
//
// A running log of what Frassy actually did, newest first. If something ever
// regresses, the timeline shows exactly where the chain broke.
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { founderAiTimeline, type FounderAiEvent } from "@/lib/journey.functions";

const ICONS: Record<FounderAiEvent["kind"], string> = {
  message_received: "🗣️",
  response_delivered: "💬",
  journey_advanced: "➡️",
  memory_saved: "🧠",
  safety_override: "⚠️",
};

const FILTERS: { id: "all" | FounderAiEvent["kind"]; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "memory_saved", label: "🧠 Memory" },
  { id: "journey_advanced", label: "➡️ Steps" },
  { id: "response_delivered", label: "💬 Replies" },
  { id: "safety_override", label: "⚠️ Overrides" },
];

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function day(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function FounderAiTimelinePanel() {
  const load = useServerFn(founderAiTimeline);
  const [filter, setFilter] = useState<"all" | FounderAiEvent["kind"]>("all");
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["founder-ai-timeline"],
    queryFn: () => load(),
    refetchInterval: 30_000,
  });

  const events = useMemo(() => {
    const all = (data?.events ?? []) as FounderAiEvent[];
    return filter === "all" ? all : all.filter((e) => e.kind === filter);
  }, [data, filter]);

  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0571A</p>
          <h2 className="mt-1 font-display text-2xl">🕒 Founder AI Timeline</h2>
        </div>
        <button
          onClick={() => void refetch()}
          className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-wide transition hover:border-[color:var(--gold)]"
        >
          {isFetching ? "Reading…" : "Refresh"}
        </button>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        In plain English: this is the flight recorder. Every message heard, every reply given, every
        step advanced and every note saved, in the order it happened — so a break is visible at a
        glance instead of guessed at.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === f.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:border-[color:var(--gold)]/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Rewinding the tape…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">
          Could not read the timeline: {(error as Error).message}
        </p>
      ) : events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing recorded yet under this filter.
        </p>
      ) : (
        <ol className="mt-5 max-h-[28rem] overflow-y-auto pr-1">
          {events.map((event, index) => {
            const previous = events[index - 1];
            const newDay = !previous || day(previous.at) !== day(event.at);
            return (
              <li key={`${event.at}-${index}`}>
                {newDay ? (
                  <p className="mb-2 mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground first:mt-0">
                    {day(event.at)}
                  </p>
                ) : null}
                <div className="flex gap-3 border-l border-border/60 pb-3 pl-4">
                  <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                    {clock(event.at)}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        event.kind === "safety_override" ? "text-destructive" : ""
                      }`}
                    >
                      {ICONS[event.kind]} {event.title}
                    </p>
                    {event.detail ? (
                      <p className="mt-0.5 break-words text-xs text-muted-foreground">
                        {event.detail}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {data ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {(data.events as FounderAiEvent[]).length} recent events · refreshes every 30 seconds.
        </p>
      ) : null}
    </section>
  );
}
