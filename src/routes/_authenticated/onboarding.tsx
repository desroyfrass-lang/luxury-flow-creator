import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import {
  getBuilderJourney,
  journeyTurn,
  setJourneyStage,
  type JourneyMessage,
} from "@/lib/journey.functions";
import {
  JOURNEY_STAGES,
  TOTAL_JOURNEY_MINUTES,
  stageById,
  stageIndex,
} from "@/lib/journey";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Your Builder Journey — Frass OS" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OnboardingPage,
});

type LocalMessage = { role: "user" | "assistant"; content: string; pending?: boolean };

function OnboardingPage() {
  const loadJourney = useServerFn(getBuilderJourney);
  const turn = useServerFn(journeyTurn);
  const jumpStage = useServerFn(setJourneyStage);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["builder-journey"],
    queryFn: () => loadJourney(),
  });

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<LocalMessage[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);

  const messages: LocalMessage[] = useMemo(() => {
    const saved = (data?.messages ?? []).map((m: JourneyMessage) => ({
      role: m.role,
      content: m.content,
    }));
    return [...saved, ...local];
  }, [data?.messages, local]);

  const stage = stageById(data?.currentStage ?? "mission");
  const idx = stageIndex(stage.id);
  const completedCount = Object.keys(data?.stageProgress ?? {}).length;
  const pct = Math.round((completedCount / JOURNEY_STAGES.length) * 100);
  const finished = data?.status === "complete";

  useEffect(() => {
    inputRef.current?.focus();
  }, [busy, stage.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  const send = async (text: string, opening = false) => {
    if (busy) return;
    setBusy(true);
    if (text) setLocal((p) => [...p, { role: "user", content: text }]);
    try {
      const res = await turn({ data: { message: text, opening } });
      setLocal([]);
      await refetch();
      if (res.movedTo) {
        toast.success(`Chapter complete — next: ${stageById(res.movedTo).title}`);
      }
      if (res.completed) toast.success("Your Builder Journey is complete.");
    } catch (err) {
      setLocal((p) => p.filter((m) => m.content !== text));
      toast.error(err instanceof Error ? err.message : "Frassy couldn't respond just now.");
    } finally {
      setBusy(false);
    }
  };

  // First-ever session: let Frassy open the journey.
  useEffect(() => {
    if (isLoading || !data || openedRef.current) return;
    if (data.messages.length === 0) {
      openedRef.current = true;
      void send("", true);
    }
  }, [isLoading, data]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    void send(text);
  };

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[300px_1fr]">
        {/* Journey map */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Frass Operating System
          </div>
          <h1 className="mt-3 font-display text-3xl leading-tight">Your Builder Journey</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            About {Math.round(TOTAL_JOURNEY_MINUTES / 60)} hours, taken at your pace across as many
            sessions as you like. Everything is saved as you go — leave whenever you want and
            Frassy will pick up exactly where you left off.
          </p>

          <div className="mt-6">
            <div className="h-px w-full bg-border">
              <div
                className="h-px bg-[color:var(--gold)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {completedCount} of {JOURNEY_STAGES.length} chapters
            </div>
          </div>

          <ol className="mt-8 space-y-1">
            {JOURNEY_STAGES.map((s, i) => {
              const done = Boolean(data?.stageProgress?.[s.id]);
              const active = s.id === stage.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={busy || (!done && i > idx)}
                    onClick={async () => {
                      await jumpStage({ data: { stageId: s.id } });
                      await refetch();
                    }}
                    className={`flex w-full items-baseline gap-3 rounded-sm px-3 py-2 text-left text-sm transition ${
                      active
                        ? "bg-[color:var(--gold)]/10 text-foreground"
                        : done
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground/50"
                    } disabled:cursor-default`}
                  >
                    <span className="w-5 shrink-0 text-[11px] tabular-nums text-[color:var(--gold)]">
                      {done ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {finished && (
            <Link
              to="/workspace"
              className="mt-8 block rounded-sm border border-[color:var(--gold)] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
            >
              Enter Frass OS
            </Link>
          )}
        </aside>

        {/* Conversation */}
        <section className="min-h-[70vh] rounded-sm border border-border bg-background/40">
          <header className="border-b border-border px-6 py-5">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Chapter {idx + 1} · {stage.chapter}
            </div>
            <h2 className="mt-2 font-display text-2xl">{stage.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{stage.purpose}</p>
          </header>

          <div className="space-y-6 px-6 py-8">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Bringing your journey back…</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[78%] rounded-sm bg-foreground/5 px-4 py-3 text-sm"
                      : "max-w-[78%] text-[15px] leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.role === "assistant" && (
                    <div className="mb-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      Frassy
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="text-sm text-muted-foreground">Frassy is thinking…</div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-border px-6 py-5">
            <textarea
              ref={inputRef}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              placeholder="Take your time — answer in your own words."
              className="w-full resize-none rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Saved automatically
              </span>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </SiteShell>
  );
}
