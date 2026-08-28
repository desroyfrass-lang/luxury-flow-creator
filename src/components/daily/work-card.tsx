// One card shape shared by Daily and Workshop, so a piece of work looks and
// behaves the same wherever the member meets it.

import { Link } from "@tanstack/react-router";
import type { DailyCard } from "@/lib/daily/board.functions";

function dueLabel(card: DailyCard): string | null {
  const when = card.dueAt ?? (card.scheduledFor ? `${card.scheduledFor}T00:00:00` : null);
  if (!when) return null;
  const d = new Date(when);
  const now = new Date();
  const days = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (d < now) return "Overdue";
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function WorkCard({
  card,
  onDone,
  onTomorrow,
  onDismiss,
  busy,
}: {
  card: DailyCard;
  onDone?: (card: DailyCard) => void;
  onTomorrow?: (card: DailyCard) => void;
  onDismiss?: (card: DailyCard) => void;
  busy?: boolean;
}) {
  const due = dueLabel(card);
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-base leading-snug break-words">{card.title}</div>
          {card.detail ? (
            <p className="mt-1 text-sm text-muted-foreground break-words">{card.detail}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-border/70 px-2 py-0.5">{card.sourceLabel}</span>
            {due ? (
              <span
                className={`rounded-full px-2 py-0.5 ${
                  due === "Overdue"
                    ? "bg-destructive/15 text-destructive"
                    : "border border-border/70"
                }`}
              >
                {due}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.href ? (
          <Link
            // Daily cards carry a resolved destination string from the server.
            to={card.href as never}
            className="rounded-full bg-[color:var(--gold)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
          >
            Open
          </Link>
        ) : card.workItemId ? (
          <Link
            to="/workshop"
            search={{ item: card.workItemId }}
            className="rounded-full bg-[color:var(--gold)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
          >
            Continue in Workshop
          </Link>
        ) : null}

        {card.workItemId && onDone ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDone(card)}
            className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
          >
            Done
          </button>
        ) : null}
        {card.workItemId && onTomorrow ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onTomorrow(card)}
            className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
          >
            Tomorrow
          </button>
        ) : null}
        {card.workItemId && onDismiss ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDismiss(card)}
            className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground disabled:opacity-50"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
