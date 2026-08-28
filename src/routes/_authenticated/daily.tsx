// ─────────────────────────────────────────────────────────────────────────────
// FRASS DAILY — CANONICAL.  "What do I need to do today?"
//
// Daily organises real work. It never executes it: every Open/Continue lands in
// the Workshop or in the system that actually owns the record.
// No sample cards are ever shown to a signed-in member.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { WorkCard } from "@/components/daily/work-card";
import { getDailyBoard, type DailyCard } from "@/lib/daily/board.functions";
import { setWorkItemState } from "@/lib/daily/work.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({
    meta: [
      { title: "Frass Daily — What matters today" },
      {
        name: "description",
        content:
          "Your Frass Daily: today's few real priorities, unfinished work, schedule and opportunities, drawn from your own Frass Hill activity.",
      },
      { property: "og:title", content: "Frass Daily — What matters today" },
      {
        property: "og:description",
        content: "One calm daily command center built from your real work, never sample data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DailyPage,
});

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Section({
  title,
  note,
  cards,
  empty,
  onDone,
  onTomorrow,
  onDismiss,
  busy,
}: {
  title: string;
  note?: string;
  cards: DailyCard[];
  empty: string;
  onDone?: (c: DailyCard) => void;
  onTomorrow?: (c: DailyCard) => void;
  onDismiss?: (c: DailyCard) => void;
  busy?: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">{title}</h2>
        {note ? <span className="text-[11px] text-muted-foreground">{note}</span> : null}
      </div>
      {cards.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {cards.map((c) => (
            <WorkCard
              key={c.id}
              card={c}
              {...(onDone ? { onDone } : {})}
              {...(onTomorrow ? { onTomorrow } : {})}
              {...(onDismiss ? { onDismiss } : {})}
              {...(busy ? { busy } : {})}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DailyPage() {
  const boardFn = useServerFn(getDailyBoard);
  const stateFn = useServerFn(setWorkItemState);
  const qc = useQueryClient();
  const [name, setName] = useState<string | undefined>();

  useMemo(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const label = meta?.full_name ?? meta?.name ?? user?.email?.split("@")[0];
      if (label) setName(label.split(" ")[0]);
    });
    return null;
  }, []);

  const { data: board, isLoading, error } = useQuery({
    queryKey: ["daily-board"],
    queryFn: () => boardFn(),
  });

  const mutate = useMutation({
    mutationFn: (input: { id: string; action: "done" | "tomorrow" | "dismiss" }) =>
      stateFn({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["daily-board"] });
      void qc.invalidateQueries({ queryKey: ["work-items"] });
    },
  });

  const act = (action: "done" | "tomorrow" | "dismiss") => (c: DailyCard) => {
    if (!c.workItemId) return;
    mutate.mutate({ id: c.workItemId, action });
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Frass Daily</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          {greeting()}
          {name ? `, ${name}` : ""}.
        </h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Reading your real work…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-destructive">
            Your Daily could not be read just now. Nothing was lost — try again in a moment.
          </p>
        ) : !board ? null : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              {board.summary.hasAnything
                ? `${board.summary.activeWork} piece(s) of work open` +
                  (board.summary.overdue ? ` · ${board.summary.overdue} overdue` : "") +
                  (board.summary.completedToday ? ` · ${board.summary.completedToday} finished today` : "")
                : "Nothing is waiting for you today. That is the honest answer — not an empty screen."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/workshop"
                className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
              >
                Go to Workshop
              </Link>
              <Link
                to="/frassy"
                className="rounded-full border border-border/70 px-5 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Ask Frassy about today
              </Link>
            </div>

            <Section
              title="Today"
              note="The few things that genuinely matter"
              cards={board.today}
              empty="No priorities for today yet. Add work in the Workshop and it will appear here."
              onDone={act("done")}
              onTomorrow={act("tomorrow")}
              onDismiss={act("dismiss")}
              busy={mutate.isPending}
            />
            <Section
              title="Continue"
              cards={board.continueWork}
              empty="No unfinished work waiting."
              onDone={act("done")}
              onTomorrow={act("tomorrow")}
              busy={mutate.isPending}
            />
            <Section
              title="Schedule"
              cards={board.schedule}
              empty="Nothing dated in the next few days."
            />
            <Section
              title="Money moves"
              cards={board.moneyMoves}
              empty="No money records yet, so there is nothing to recommend. Frass will never invent a number."
            />
            <Section
              title="Opportunities"
              cards={board.opportunities}
              empty="No live opportunities of yours right now."
            />
            <Section title="Learn" cards={board.learn} empty="No learning in progress." />
            <Section title="Frass Hill" cards={board.frassHill} empty="Nothing new from the hill today." />
            <Section
              title="Done today"
              cards={board.doneToday}
              empty="Nothing finished yet today."
            />
          </>
        )}
      </div>
    </SiteShell>
  );
}
