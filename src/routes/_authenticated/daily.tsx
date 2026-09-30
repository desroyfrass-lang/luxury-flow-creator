// ─────────────────────────────────────────────────────────────────────────────
// FRASS DAILY — CANONICAL.  "What do I need to do today?"
//
// Phase 2 (Founder-approved): the Daily is the light planning room — white and
// ivory, calm, mobile-first — built on the SAME real board/work machinery as
// before. No sample people, no persona content, no invented numbers: a section
// with no real data says so plainly.
//
// Daily organises real work. It never executes it: every Open/Continue lands in
// the Workshop or in the system that actually owns the record, through the
// existing work-handoff contract.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { WorkCard } from "@/components/daily/work-card";
import { getDailyBoard, type DailyCard } from "@/lib/daily/board.functions";
import { setWorkItemState } from "@/lib/daily/work.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  DailyCustomizationProvider,
  useDailyCustomization,
} from "@/components/workspace/daily-customization";
import type { SectionId } from "@/lib/daily/customization";
import { useIsAdmin } from "@/hooks/use-is-admin";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({
    meta: [
      { title: "Frass Daily — What matters today" },
      {
        name: "description",
        content:
          "Your Frass Daily: a calm planning room with today's few real priorities, unfinished work, schedule and opportunities, drawn from your own Frass Hill activity.",
      },
      { property: "og:title", content: "Frass Daily — What matters today" },
      {
        property: "og:description",
        content: "One calm daily planning room built from your real work, never sample data.",
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
  id,
  title,
  note,
  cards,
  empty,
  onDone,
  onTomorrow,
  onDismiss,
  busy,
}: {
  id: SectionId;
  title: string;
  note?: string;
  cards: DailyCard[];
  empty: string;
  onDone?: (c: DailyCard) => void;
  onTomorrow?: (c: DailyCard) => void;
  onDismiss?: (c: DailyCard) => void;
  busy?: boolean;
}) {
  const { arrangement, toggleCollapsed } = useDailyCustomization();
  const collapsed = arrangement.collapsed.has(id);
  return (
    <section className="mt-6" style={{ order: arrangement.orderOf(id) }}>
      <div className="flex items-baseline justify-between gap-3">
        <button
          type="button"
          onClick={() => toggleCollapsed(id)}
          className="text-left text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--gold)]"
          aria-expanded={!collapsed}
        >
          {title}
        </button>
        {note ? <span className="text-[11px] text-muted-foreground">{note}</span> : null}
      </div>
      {collapsed ? null : cards.length === 0 ? (
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

/** Optional end-of-day note. Device-only, never required, never a list of debts. */
function EveningReflection() {
  const KEY = "frass.daily.reflection";
  const [note, setNote] = useState("");
  useEffect(() => {
    try {
      setNote(window.localStorage.getItem(KEY) ?? "");
    } catch {
      /* private browsing — the note simply isn't kept */
    }
  }, []);
  if (new Date().getHours() < 17) return null;
  return (
    <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--gold)]">
        Evening reflection
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Optional. One line about today, kept on this device only.
      </p>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          try {
            window.localStorage.setItem(KEY, e.target.value);
          } catch {
            /* not kept */
          }
        }}
        rows={2}
        className="mt-3 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
        placeholder="What moved today?"
      />
    </section>
  );
}

/** Founder-only executive shortcuts. The server re-checks on every destination. */
function FounderPanel() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  const link =
    "rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-[color:var(--gold)]";
  return (
    <section className="mt-6 rounded-2xl border border-[color:var(--gold)]/50 bg-card p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--gold)]">
        Founder Control Room
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">The executive view. Only you see this.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/control-room" className={link}>
          Control Room
        </Link>
        <Link to="/admin/roles" className={link}>
          Roles &amp; Access
        </Link>
        <Link to="/admin/feedback" className={link}>
          Tester Feedback
        </Link>
        <Link to="/onboarding" search={{ review: "founder" }} className={link}>
          Review Frassy interview
        </Link>
      </div>
    </section>
  );
}

function DailyBody() {
  const boardFn = useServerFn(getDailyBoard);
  const stateFn = useServerFn(setWorkItemState);
  const qc = useQueryClient();
  const { arrangement } = useDailyCustomization();
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
      const label = meta?.full_name ?? meta?.name ?? user?.email?.split("@")[0];
      if (label) setName(label.split(" ")[0]);
    });
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
    <div className="daily-light mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-10 sm:px-6">
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
          <p className="mt-3 text-sm text-muted-foreground" style={{ order: arrangement.orderOf("daily-briefing") }}>
            {board.summary.hasAnything
              ? `${board.summary.activeWork} piece(s) of work open` +
                (board.summary.completedToday ? ` · ${board.summary.completedToday} finished today` : "")
              : "Nothing is waiting for you today. That is the honest answer — not an empty screen."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2" style={{ order: arrangement.orderOf("daily-briefing") }}>
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
            <Link
              to="/workspace/daily-design"
              className="rounded-full border border-border/70 px-5 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Arrange your Daily
            </Link>
          </div>

          <Section
            id="celebrate-first"
            title="Celebrate first"
            note="Progress before problems"
            cards={board.doneToday}
            empty="Nothing finished yet today. The first win goes here."
          />
          <Section
            id="todays-priorities"
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
            id="continue-working"
            title="Continue"
            cards={board.continueWork}
            empty="No unfinished work waiting."
            onDone={act("done")}
            onTomorrow={act("tomorrow")}
            busy={mutate.isPending}
          />
          <Section
            id="time-plan"
            title="Schedule"
            cards={board.schedule}
            empty="Nothing dated in the next few days."
          />
          <Section
            id="money-move-stack"
            title="Fast Tracks"
            note="The next step of the Money Moves you have already started"
            cards={board.fastTracks}
            empty="No Fast Track in progress. Open a Money Move and tick the first step."
          />
          <Section
            id="money-moves-today"
            title="Money moves"
            cards={board.moneyMoves}
            empty="No money records yet, so there is nothing to recommend. Frass will never invent a number."
          />
          <Section
            id="opportunities"
            title="Opportunities"
            cards={board.opportunities}
            empty="No live opportunities of yours right now."
          />
          <Section id="learning-unlock" title="Learn" cards={board.learn} empty="No learning in progress." />
          <Section
            id="recent-activity"
            title="Frass Hill"
            cards={board.frassHill}
            empty="Nothing new from the hill today."
          />
          <EveningReflection />
          <FounderPanel />

          <p className="mt-10 text-xs text-muted-foreground">
            Your Daily, your arrangement — sections follow the layout you saved.{" "}
            <Link to="/workspace/daily-design" className="underline">
              Change it in the Design Library
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}

function DailyPage() {
  return (
    <SiteShell>
      <DailyCustomizationProvider>
        <DailyBody />
      </DailyCustomizationProvider>
    </SiteShell>
  );
}
