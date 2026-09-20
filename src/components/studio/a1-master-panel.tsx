// FRASS-0407 / A1 — the A1 Master Standard chain and quality gate.
// It reports only what is known. It never claims media quality that has not
// actually been produced.
import { A1_CHAIN, a1StatusLine, evaluateA1, type A1Evidence } from "@/lib/studio/a1-standard";

export function A1MasterPanel({ evidence }: { evidence?: A1Evidence }) {
  const verdict = evaluateA1(evidence);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-white/45">A1 Master Standard</h2>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
            verdict.approved ? "bg-emerald-300/15 text-emerald-200" : "bg-white/5 text-white/50"
          }`}
        >
          {verdict.headline}
        </span>
      </div>

      <p className="mt-2 text-xs text-white/55">{a1StatusLine(verdict)}</p>

      <ol className="mt-3 flex flex-wrap gap-1.5">
        {A1_CHAIN.map((stage) => {
          const reachedIdx = A1_CHAIN.findIndex((s) => s.id === verdict.reachedStage);
          const idx = A1_CHAIN.findIndex((s) => s.id === stage.id);
          const done = verdict.passed.length > 0 && idx <= reachedIdx;
          return (
            <li
              key={stage.id}
              title={stage.everyday}
              className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                done ? "border-amber-300/40 text-amber-200" : "border-white/10 text-white/40"
              }`}
            >
              {stage.label}
            </li>
          );
        })}
      </ol>

      {verdict.blocking.length > 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            What blocks “A1 Master — Approved”
          </p>
          <ul className="mt-1.5 space-y-1.5 text-[11px] text-white/55">
            {verdict.blocking.map((b) => (
              <li key={b.id}>
                <span className="text-white/75">{b.label}</span> — {b.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-white/35">
        The target is the same whichever control depth you worked in. No quality claim is made here
        until a connected provider has actually produced and confirmed the work.
      </p>
    </section>
  );
}
