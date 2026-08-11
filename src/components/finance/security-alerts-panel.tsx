// FRASS-0474 — Security Center panel inside the Founder Launch Feedback Center.
// Every time a money value arrived outside its written limit, it lands here.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { listSecurityAlerts } from "@/lib/finance/security-alerts.functions";

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SecurityAlertsPanel() {
  const listFn = useServerFn(listSecurityAlerts);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "security-alerts"],
    queryFn: () => listFn(),
  });

  const alerts = data ?? [];
  const halted = alerts.filter((a) => a.halted).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Security Center</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {halted} transaction{halted === 1 ? "" : "s"} halted · {alerts.length} recorded
        </p>
      </header>

      <p className="mt-2 text-xs text-muted-foreground">
        Frass calculates every rate, discount and charge on its own server. When a browser sends a
        figure outside the written limit, the value is refused and the attempt is written here.
        <span className="mt-1 block">
          <strong className="text-foreground">In plain English:</strong> the till only ever uses the
          price list on the wall — and it keeps a note of anyone who tried to hand it a different one.
        </span>
      </p>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Reading the log…
        </p>
      )}

      {error && (
        <p className="mt-4 text-xs text-destructive">{(error as Error).message}</p>
      )}

      {!isLoading && !error && alerts.length === 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          Nothing recorded. No out-of-bounds financial value has reached Frass.
        </p>
      )}

      {alerts.length > 0 && (
        <ul className="mt-4 space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest">
                <span
                  className={
                    a.halted
                      ? "rounded-full bg-destructive/15 px-2 py-0.5 text-destructive"
                      : "rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-600"
                  }
                >
                  {a.halted ? "Halted" : "Corrected"}
                </span>
                <span className="text-muted-foreground">{a.rule}</span>
                <span className="text-muted-foreground">· {a.surface}</span>
                <span className="ml-auto text-muted-foreground">{when(a.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-foreground">{a.detail}</p>
              {a.plain_english && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong className="text-foreground">Plain English:</strong> {a.plain_english}
                </p>
              )}
              <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted-foreground">
                <div>
                  <dt className="inline">Submitted: </dt>
                  <dd className="inline text-foreground">{a.attempted_value}</dd>
                </div>
                <div>
                  <dt className="inline">Allowed: </dt>
                  <dd className="inline text-foreground">
                    {a.allowed_min} – {a.allowed_max}
                  </dd>
                </div>
                <div>
                  <dt className="inline">Used instead: </dt>
                  <dd className="inline text-foreground">{a.enforced_value}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
