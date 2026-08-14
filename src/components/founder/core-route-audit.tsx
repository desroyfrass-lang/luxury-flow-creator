// FRASS-0514 — Core Route Audit panel.
//
// Runs before every production publish: does every core destination a member
// can be sent to actually resolve? Broken links are cosmetic; a broken core
// route blocks onboarding and is a launch blocker.
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, AlertTriangle, Loader2, CornerDownRight } from "lucide-react";
import { auditCoreRoutes, type CoreRouteAudit } from "@/lib/navigation/core-routes.functions";

export function CoreRouteAuditPanel() {
  const auditFn = useServerFn(auditCoreRoutes);
  const run = useMutation<CoreRouteAudit>({ mutationFn: () => auditFn() });

  useEffect(() => {
    run.mutate();
    // Audit once on mount; the Founder can re-run at any time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = run.data;

  return (
    <section className="rounded-sm border border-border/60 bg-card/40 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            FRASS-0514 · Pre-publish gate
          </div>
          <h3 className="mt-2 font-display text-2xl">Core route audit</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every place a member can be sent to — Welcome Hall, Onboarding, Workspace, The Daily,
            Money Moves, Marketplace, Financial Center, Builder Vault, FOR ME, Frass Card and Founder
            Mode — checked against the live route table. Here's how it works: nobody's first journey
            should end at a dead link.
          </p>
        </div>
        <button
          onClick={() => run.mutate()}
          disabled={run.isPending}
          className="lux-press rounded-sm border border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-50"
        >
          {run.isPending ? "Auditing…" : "Re-run audit"}
        </button>
      </div>

      {run.isPending && (
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying core destinations…
        </div>
      )}

      {run.isError && (
        <p className="mt-6 text-sm text-red-300">
          {run.error instanceof Error ? run.error.message : "Audit failed"}
        </p>
      )}

      {report && (
        <>
          <p
            className={`mt-6 text-sm font-bold ${
              report.failing ? "text-red-300" : "text-emerald-300"
            }`}
          >
            {report.failing
              ? `🔴 ${report.failing} core route${report.failing > 1 ? "s" : ""} do not resolve — this blocks publishing.`
              : `🟢 All ${report.passing} core routes resolve. Cleared for publish.`}
          </p>

          <ul className="mt-4 divide-y divide-border/50 rounded-sm border border-border/50">
            {report.results.map((r) => (
              <li key={r.key} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                {r.resolves ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span className="font-medium">{r.label}</span>
                <code className="text-xs text-muted-foreground">{r.path}</code>
                {r.redirectsTo && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CornerDownRight className="h-3 w-3" /> redirects to {r.redirectsTo}
                  </span>
                )}
                {r.requiresAuth && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    sign-in required
                  </span>
                )}
                {r.founderOnly && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                    founder only
                  </span>
                )}
                {!r.resolves && r.closest.length > 0 && (
                  <span className="text-xs text-red-300">closest: {r.closest.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
