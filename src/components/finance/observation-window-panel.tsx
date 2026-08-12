// FRASS-0506 — Post-Launch Observation Window, shown inside the Founder Security Center.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Radar, Loader2 } from "lucide-react";
import { getPlatformHealth } from "@/lib/platform-health.functions";
import { listSecurityAlerts } from "@/lib/finance/security-alerts.functions";
import { observeDeployment } from "@/lib/deploy/observation";
import { CURRENT_DEPLOYMENT } from "@/lib/deploy/current";
import type { HealthSignal, TieredEvent } from "@/lib/security/triage";

export function ObservationWindowPanel() {
  const healthFn = useServerFn(getPlatformHealth);
  const alertsFn = useServerFn(listSecurityAlerts);

  const health = useQuery({
    queryKey: ["admin", "platform-health"],
    queryFn: () => healthFn(),
    refetchInterval: 60_000,
  });
  const alerts = useQuery({
    queryKey: ["admin", "security-alerts"],
    queryFn: () => alertsFn(),
    refetchInterval: 60_000,
  });

  const loading = health.isLoading || alerts.isLoading;
  const signals: HealthSignal[] = ((health.data as any)?.checks ?? []).map((c: any) => ({
    key: c.key,
    state: c.state,
  }));
  const events = ((alerts.data as any)?.events ?? alerts.data ?? []) as TieredEvent[];
  const verdict = observeDeployment(CURRENT_DEPLOYMENT, signals, Array.isArray(events) ? events : []);

  const tone =
    verdict?.status === "action_required"
      ? "border-destructive/50 bg-destructive/10"
      : verdict?.status === "monitoring"
        ? "border-amber-400/40 bg-amber-400/[0.08]"
        : "border-emerald-500/30 bg-emerald-500/[0.06]";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-[color:var(--gold)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Observation Window</h2>
        </div>
        {verdict && (
          <p className="text-xs text-muted-foreground">
            {verdict.inWindow
              ? `${verdict.remainingHours}h left of ${verdict.windowHours}h`
              : "Window closed"}
          </p>
        )}
      </header>

      <p className="mt-2 text-xs text-muted-foreground">
        A deployment is not judged by whether it launched, but by whether it stayed stable
        afterwards. Every release is watched for a set period before it is accepted.
      </p>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Reading the window…
        </p>
      )}

      {!loading && !verdict && (
        <p className="mt-4 text-xs text-muted-foreground">No deployment is under observation.</p>
      )}

      {!loading && verdict && (
        <>
          <div className={`mt-4 rounded-xl border p-4 ${tone}`}>
            <p className="text-sm font-semibold">
              {verdict.dot} {verdict.headline}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{verdict.sentence}</p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              {CURRENT_DEPLOYMENT?.id} · {CURRENT_DEPLOYMENT?.releaseClass} release · deployed{" "}
              {CURRENT_DEPLOYMENT ? new Date(CURRENT_DEPLOYMENT.deployedAt).toLocaleString() : ""}
            </p>
            {verdict.rollbackRecommended && (
              <p className="mt-2 rounded-sm border border-destructive/50 bg-destructive/10 p-2 text-xs">
                Rollback recommended — see section 6 of the Deployment Checklist before doing anything else.
              </p>
            )}
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {verdict.signals.map((s) => (
              <li
                key={s.label}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3 text-xs"
              >
                <span className="font-medium">
                  {s.ok ? "🟢" : s.critical ? "🔴" : "🟡"} {s.label}
                </span>
                <span className="text-muted-foreground">{s.reading}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
