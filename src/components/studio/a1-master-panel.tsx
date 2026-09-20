// FRASS-0407 / A1 — the A1 Master Standard chain and quality gate.
// It reports only what is known. It never claims media quality that has not
// actually been produced.
import { A1_CHAIN, a1StatusLine, evaluateA1, type A1Evidence } from "@/lib/studio/a1-standard";

export function A1MasterPanel({ evidence }: { evidence?: A1Evidence }) {
  const verdict = evaluateA1(evidence);

  return (
    <details className="group rounded-lg border border-border bg-card/70 p-4">
      <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase text-muted-foreground">A1 Master Standard</h2>
          <p className="mt-1 text-sm text-foreground/75">{a1StatusLine(verdict)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            verdict.approved ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
          }`}
        >
          {verdict.headline}
        </span>
      </summary>

      <ol className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {A1_CHAIN.map((stage) => {
          const reachedIdx = A1_CHAIN.findIndex((s) => s.id === verdict.reachedStage);
          const idx = A1_CHAIN.findIndex((s) => s.id === stage.id);
          const done = verdict.passed.length > 0 && idx <= reachedIdx;
          return (
            <li
              key={stage.id}
              title={stage.everyday}
              className={`rounded-full border px-2.5 py-1 text-xs uppercase ${
                done ? "border-accent/40 text-accent" : "border-border text-muted-foreground"
              }`}
            >
              {stage.label}
            </li>
          );
        })}
      </ol>

      {verdict.blocking.length > 0 && (
        <div className="mt-4 rounded-md border border-border bg-background/60 p-4">
          <p className="text-xs uppercase text-muted-foreground">
            What blocks “A1 Master — Approved”
          </p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {verdict.blocking.map((b) => (
              <li key={b.id}>
                <span className="text-foreground/80">{b.label}</span> — {b.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        The target is the same whichever control depth you worked in. No quality claim is made here
        until a connected provider has actually produced and confirmed the work.
      </p>
    </details>
  );
}
