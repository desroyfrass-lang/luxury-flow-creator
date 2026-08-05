import { Link } from "@tanstack/react-router";
import {
  READINESS_LABEL,
  isCommissioned,
  readinessBoard,
  type ReadinessState,
} from "@/lib/commissioning";

const DOT: Record<ReadinessState, string> = {
  complete: "bg-[color:var(--gold)]",
  in_progress: "bg-foreground/40",
  not_started: "bg-border",
};

export function LaunchReadiness({
  completedStageIds,
  compact = false,
  heading,
  eyebrow = "Launch Readiness",
  onSelectStage,
}: {
  completedStageIds: string[];
  compact?: boolean;
  heading?: string;
  eyebrow?: string;
  /** When provided, each row jumps the Founder to the step that settles it. */
  onSelectStage?: (stageId: string) => void;
}) {
  const rows = readinessBoard(completedStageIds);
  const done = rows.filter((r) => r.state === "complete").length;
  const ready = isCommissioned(rows);

  return (
    <div className="rounded-sm border border-border bg-background/40">
      <header className="border-b border-border px-6 py-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          {eyebrow}
        </div>
        <h3 className="mt-2 font-display text-2xl">
          {ready
            ? "Frass OS is commissioned and ready to welcome its first Builder."
            : (heading ?? `${done} of ${rows.length} systems ready`)}
        </h3>
        {!ready && (
          <p className="mt-1 text-sm text-muted-foreground">
            {done} of {rows.length} systems ready — readiness across the whole operating system,
            not just the storefront.
          </p>
        )}
      </header>


      <ul className="divide-y divide-border">
        {rows.map((r) => {
          const target =
            r.stageIds?.find((id) => !completedStageIds.includes(id)) ?? r.stageIds?.[0] ?? null;
          const clickable = Boolean(onSelectStage && target);
          const body = (
            <>
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[r.state]}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm">{r.label}</div>
                {!compact && (
                  <div className="text-xs text-muted-foreground">{r.note}</div>
                )}
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] ${
                  r.state === "complete"
                    ? "text-[color:var(--gold)]"
                    : r.state === "in_progress"
                      ? "text-foreground/60"
                      : "text-muted-foreground/50"
                }`}
              >
                {READINESS_LABEL[r.state]}
              </span>
            </>
          );
          return (
            <li key={r.id}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSelectStage?.(target as string)}
                  className="flex w-full items-start gap-4 px-6 py-3 text-left transition hover:bg-[color:var(--gold)]/5"
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-4 px-6 py-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>


      {ready && (
        <div className="border-t border-border px-6 py-5">
          <Link
            to="/welcome-hall"
            className="inline-block rounded-sm border border-[color:var(--gold)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
          >
            Open the doors
          </Link>
        </div>
      )}
    </div>
  );
}
