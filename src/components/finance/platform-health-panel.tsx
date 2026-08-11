// FRASS-0475 — Platform Health: mission control, kept separate from security.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Loader2 } from "lucide-react";
import { getPlatformHealth, type HealthState } from "@/lib/platform-health.functions";

const DOT: Record<HealthState, string> = {
  healthy: "🟢",
  attention: "🟡",
  down: "🔴",
  standby: "🟢",
};

const TONE: Record<HealthState, string> = {
  healthy: "border-emerald-500/30 bg-emerald-500/[0.06]",
  attention: "border-amber-400/40 bg-amber-400/[0.08]",
  down: "border-destructive/50 bg-destructive/10",
  standby: "border-border bg-background",
};

export function PlatformHealthPanel() {
  const healthFn = useServerFn(getPlatformHealth);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "platform-health"],
    queryFn: () => healthFn(),
    refetchInterval: 60_000,
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[color:var(--gold)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Platform Health</h2>
        </div>
        {data && (
          <p className="text-xs text-muted-foreground">
            Read at {new Date(data.takenAt).toLocaleTimeString()}
          </p>
        )}
      </header>

      <p className="mt-2 text-xs text-muted-foreground">
        Operational health, not security. This answers "is the building running?" — the Security
        Center answers "is anyone testing the locks?".
      </p>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Taking readings…
        </p>
      )}
      {error && <p className="mt-4 text-xs text-destructive">{(error as Error).message}</p>}

      {data && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.checks.map((c) => (
            <li key={c.key} className={`rounded-xl border p-4 ${TONE[c.state]}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {DOT[c.state]} {c.label}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {c.state === "standby" ? "Standby" : c.state}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground">{c.reading}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{c.plainEnglish}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
