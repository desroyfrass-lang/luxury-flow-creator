// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — "Why am I here?"
//
// A specialist tool shows this strip when a Builder arrives from Daily or the
// Workshop carrying a work identity. It states the job in plain English and
// keeps the way back open. It never claims the work is finished, paid,
// verified or earned — opening a tool means nothing has happened yet.
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWorkItem } from "@/lib/daily/work.functions";
import { moveById } from "@/lib/business/money-move-catalogue";
import { hasWorkHandoff, type WorkHandoff } from "@/lib/daily/work-handoff";

export function WorkContextBanner({ handoff, className }: { handoff: WorkHandoff; className?: string }) {
  const getFn = useServerFn(getWorkItem);
  const id = handoff.workItemId ?? null;

  const { data: item } = useQuery({
    queryKey: ["work-item", id],
    queryFn: () => getFn({ data: { id: id as string } }),
    enabled: Boolean(id),
    retry: false,
  });

  if (!hasWorkHandoff(handoff)) return null;

  const move = handoff.moveId ? moveById(handoff.moveId) : null;
  const title = item?.title ?? move?.title ?? "Work you started elsewhere";
  const detail = item?.detail ?? move?.purpose ?? null;

  return (
    <div
      className={`rounded-2xl border border-[color:var(--gold)]/50 bg-[color:var(--gold)]/5 p-4 ${className ?? ""}`}
    >
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        You came here to do this
      </div>
      <div className="mt-1 font-display text-base break-words">{title}</div>
      {detail ? <p className="mt-1 text-sm text-muted-foreground break-words">{detail}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">
        Nothing is counted as done or paid just because this page opened. Finish the work here, then go back.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {id ? (
          <Link
            to="/workshop"
            search={{ item: id }}
            className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Back to this work
          </Link>
        ) : (
          <Link
            to="/workshop"
            className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Back to Workshop
          </Link>
        )}
        <Link
          to="/daily"
          className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
        >
          Back to Daily
        </Link>
      </div>
    </div>
  );
}
