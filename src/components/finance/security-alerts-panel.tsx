// FRASS-0475 — Security Center, sorted into tiers instead of one flat list.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { listSecurityAlerts } from "@/lib/finance/security-alerts.functions";
import {
  TIERS,
  groupByTier,
  triageHeadline,
  type SecurityTier,
  type TieredEvent,
} from "@/lib/security/triage";

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const TIER_STYLE: Record<SecurityTier, string> = {
  critical: "border-destructive/50 bg-destructive/10",
  suspicious: "border-orange-500/40 bg-orange-500/10",
  warning: "border-amber-400/40 bg-amber-400/10",
  information: "border-emerald-500/30 bg-emerald-500/10",
};

export function SecurityAlertsPanel() {
  const listFn = useServerFn(listSecurityAlerts);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "security-alerts"],
    queryFn: () => listFn(),
  });

  const alerts = (data ?? []) as TieredEvent[];
  const grouped = useMemo(() => groupByTier(alerts), [alerts]);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Security Center</h2>
        </div>
        <p className="text-xs text-muted-foreground">{alerts.length} events recorded</p>
      </header>

      <p className="mt-2 text-sm text-foreground">{triageHeadline(grouped)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Frass calculates every rate, discount and charge on its own server. Refused values are sorted
        by how worried you should be.
        <span className="mt-1 block">
          <strong className="text-foreground">In plain English:</strong> the till only ever uses the
          price list on the wall — and the manager's book now separates honest mistakes from someone
          trying the handle repeatedly.
        </span>
      </p>

      {/* Tier summary */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TIERS.slice()
          .reverse()
          .map((t) => (
            <div key={t.key} className={`rounded-xl border p-3 ${TIER_STYLE[t.key]}`}>
              <div className="text-[11px] uppercase tracking-widest text-foreground">
                {t.dot} {t.label}
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {grouped[t.key].length}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{t.meaning}</p>
            </div>
          ))}
      </div>

      {isLoading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Reading the log…
        </p>
      )}

      {error && <p className="mt-4 text-xs text-destructive">{(error as Error).message}</p>}

      {!isLoading && !error && alerts.length === 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          Nothing recorded. No out-of-bounds value has reached Frass.
        </p>
      )}

      {/* Events, most serious tier first */}
      {alerts.length > 0 && (
        <div className="mt-5 space-y-6">
          {TIERS.slice()
            .reverse()
            .filter((t) => grouped[t.key].length > 0)
            .map((t) => (
              <div key={t.key}>
                <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {t.dot} {t.label} · {grouped[t.key].length}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.plainEnglish}</p>
                <ul className="mt-2 space-y-3">
                  {grouped[t.key].map((a) => (
                    <li key={a.id} className={`rounded-xl border p-4 ${TIER_STYLE[t.key]}`}>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest">
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-foreground">
                          {a.halted ? "Halted" : "Corrected"}
                        </span>
                        <span className="text-muted-foreground">{a.rule}</span>
                        <span className="text-muted-foreground">· {a.surface}</span>
                        <span className="ml-auto text-muted-foreground">{when(a.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{a.detail}</p>
                      {a.plain_english && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <strong className="text-foreground">Plain English:</strong>{" "}
                          {a.plain_english}
                        </p>
                      )}
                      {a.attempted_value != null && (
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
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
