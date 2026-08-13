// FRASS-0531 — Security Regression Protection panel.
// The pre-deployment sweep: every vulnerability Frass has ever fixed, and the
// one check that proves it hasn't come back.

import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import {
  REGRESSION_PRINCIPLE,
  SECURITY_CLASS_LABEL,
  SECURITY_REGRESSIONS,
  loadSweep,
  regressionsByClass,
  saveSweep,
  sweepComplete,
} from "@/lib/security/regressions";

export function RegressionPanel({ compact = false }: { compact?: boolean }) {
  const [sweep, setSweep] = useState(() => loadSweep());
  const [open, setOpen] = useState<string | null>(null);
  const groups = useMemo(() => regressionsByClass(), []);
  const verified = sweep?.verified ?? [];
  const complete = sweepComplete(sweep);

  function toggle(id: string) {
    const next = verified.includes(id) ? verified.filter((v) => v !== id) : [...verified, id];
    setSweep(saveSweep(next));
  }

  function verifyAll() {
    setSweep(saveSweep(SECURITY_REGRESSIONS.map((t) => t.id)));
  }

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0531</p>
        <h2 className={compact ? "text-lg font-black uppercase tracking-tight" : "text-2xl font-black uppercase tracking-tight"}>
          Security Regression Protection
        </h2>
        <p className="text-sm text-muted-foreground">
          A problem we already solved should never quietly come back. Before a release, confirm each
          previously fixed issue is still closed.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 p-4">
        <ShieldCheck
          className={`h-5 w-5 ${complete ? "text-emerald-400" : "text-amber-400"}`}
          aria-hidden
        />
        <p className="text-sm">
          {verified.length} of {SECURITY_REGRESSIONS.length} regression checks verified
          {sweep ? ` · last sweep ${new Date(sweep.at).toLocaleString()}` : " · never swept"}
        </p>
        <button
          type="button"
          onClick={verifyAll}
          className="ml-auto rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.2em]"
        >
          Verify all
        </button>
      </div>

      {!complete && (
        <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Not ready for production. Finish the sweep before approving a release.
        </p>
      )}

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.classification} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {SECURITY_CLASS_LABEL[group.classification]}
            </h3>
            {group.tests.map((t) => {
              const done = verified.includes(t.id);
              return (
                <div key={t.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggle(t.id)}
                      aria-pressed={done}
                      aria-label={`Mark ${t.title} verified`}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        done ? "border-emerald-400 bg-emerald-400/20" : "border-border"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Check: {t.testCase} → {t.expected}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOpen(open === t.id ? null : t.id)}
                        className="mt-2 text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]"
                      >
                        {open === t.id ? "Hide history" : "Why this exists"}
                      </button>
                      {open === t.id && (
                        <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <div>
                            <dt className="inline font-semibold">Root cause: </dt>
                            <dd className="inline">{t.rootCause}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold">Resolution: </dt>
                            <dd className="inline">{t.resolution}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold">Affects: </dt>
                            <dd className="inline">{t.affects.join(", ")}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold">Enforced in: </dt>
                            <dd className="inline">{t.enforcedIn.join(", ")}</dd>
                          </div>
                          <div>
                            <dt className="inline font-semibold">Fixed: </dt>
                            <dd className="inline">{t.fixedOn}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs italic text-muted-foreground">{REGRESSION_PRINCIPLE}</p>
    </section>
  );
}
