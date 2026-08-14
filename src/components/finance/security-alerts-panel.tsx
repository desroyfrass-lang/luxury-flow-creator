// FRASS-0474 v2 — Founder Security Center: score, timeline, geography,
// one obvious action per alert, and a quiet-mode rule so the Founder is only
// interrupted when it genuinely matters.

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Download,
  BellOff,
  BellRing,
  LifeBuoy,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  listSecurityAlerts,
  setSecurityAlertStatus,
} from "@/lib/finance/security-alerts.functions";
import { getPlatformHealth } from "@/lib/platform-health.functions";
import {
  TIERS,
  groupByTier,
  triageHeadline,
  securityScore,
  threatTimeline,
  trendLine,
  geography,
  quietModeVerdict,
  countryOf,
  toCsv,
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

const STATUS_LABEL: Record<string, string> = {
  open: "Needs a decision",
  reviewing: "Investigating",
  resolved: "Resolved",
  ignored: "Ignored",
};

function download(name: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function SecurityAlertsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSecurityAlerts);
  const healthFn = useServerFn(getPlatformHealth);
  const statusFn = useServerFn(setSecurityAlertStatus);

  const [showQuiet, setShowQuiet] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "security-alerts"],
    queryFn: () => listFn(),
  });
  const { data: health } = useQuery({
    queryKey: ["admin", "platform-health"],
    queryFn: () => healthFn(),
    refetchInterval: 60_000,
  });

  const alerts = (data ?? []) as unknown as TieredEvent[];
  const grouped = useMemo(() => groupByTier(alerts), [alerts]);
  const score = useMemo(
    () => securityScore(alerts, health?.checks ?? []),
    [alerts, health?.checks],
  );
  const timeline = useMemo(() => threatTimeline(alerts), [alerts]);
  const geo = useMemo(() => geography(alerts), [alerts]);
  const quiet = useMemo(() => quietModeVerdict(alerts), [alerts]);

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => statusFn({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(`Marked ${STATUS_LABEL[v.status]?.toLowerCase() ?? v.status}.`);
      qc.invalidateQueries({ queryKey: ["admin", "security-alerts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Quiet mode: hide the noise unless the Founder asks to see everything. */
  const visibleTiers = TIERS.slice()
    .reverse()
    .filter((t) => grouped[t.key].length > 0)
    .filter((t) => showQuiet || t.key === "critical" || t.key === "suspicious" || alerts.length < 25);

  const scoreTone =
    score.tone === "good"
      ? "border-emerald-500/40 bg-emerald-500/[0.08]"
      : score.tone === "warn"
        ? "border-amber-400/50 bg-amber-400/[0.10]"
        : "border-destructive/50 bg-destructive/10";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-widest">Security Center</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => download(`frass-security-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(alerts))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3 w-3" aria-hidden="true" /> Export
          </button>
          <p className="text-xs text-muted-foreground">{alerts.length} events</p>
        </div>
      </header>

      {/* 1 ── Security score ───────────────────────────────────────────── */}
      <div className={`mt-4 flex flex-wrap items-center gap-6 rounded-2xl border p-5 ${scoreTone}`}>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            🛡 Platform Security
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl text-foreground">{score.score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">{score.grade}</div>
        </div>
        <div className="min-w-[220px] flex-1">
          <p className="text-sm text-foreground">{score.summary}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <strong className="text-foreground">Here's the takeaway:</strong> {score.plainEnglish}
          </p>
          {score.deductions.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {score.deductions.map((d) => (
                <li key={d.label}>
                  {d.label} <span className="text-foreground">−{d.points}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-foreground">{triageHeadline(grouped)}</p>

      {/* 7 ── Quiet mode ───────────────────────────────────────────────── */}
      <div
        className={`mt-3 flex flex-wrap items-center gap-3 rounded-xl border p-3 text-xs ${
          quiet.notify ? "border-destructive/50 bg-destructive/10" : "border-border bg-background"
        }`}
      >
        {quiet.notify ? (
          <BellRing className="h-4 w-4 text-destructive" aria-hidden="true" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        <div className="flex-1">
          <div className="text-foreground">
            {quiet.notify ? "You are being notified: " : "Quiet mode: "}
            {quiet.reason}
          </div>
          <div className="mt-0.5 text-muted-foreground">{quiet.plainEnglish}</div>
        </div>
        <button
          onClick={() => setShowQuiet((v) => !v)}
          className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          {showQuiet ? "Hide the quiet ones" : "Show everything"}
        </button>
      </div>

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

      {/* 2 ── Threat timeline ──────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Threat timeline
          </h3>
          <p className="text-[11px] text-muted-foreground">{trendLine(alerts)}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((b) => (
            <div key={b.key} className="rounded-xl border border-border p-3">
              <div className="text-sm font-medium text-foreground">{b.label}</div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                <li>{b.counts.critical} Critical</li>
                <li>{b.counts.suspicious} Suspicious</li>
                <li>{b.counts.warning} Warnings</li>
                <li>{b.counts.information} Information</li>
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          <strong className="text-foreground">Here's what this means:</strong> one event is noise; the same
          thing three days running is a pattern. This is the shape, not the list.
        </p>
      </div>

      {/* 3 ── Geographic awareness ─────────────────────────────────────── */}
      {geo.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Where it is coming from
          </h3>
          <ul className="mt-3 space-y-1.5">
            {geo.map((g) => (
              <li key={g.country} className="flex items-center gap-3 text-xs">
                <span className="w-32 shrink-0 truncate text-foreground">{g.country}</span>
                <span
                  className="h-2 rounded-full bg-[color:var(--gold)]"
                  style={{ width: `${Math.max(4, Math.round(g.share * 100))}%` }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{g.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Country level only — never addresses. Enough to spot an unusual pattern, not enough to
            track a person.
          </p>
        </div>
      )}

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

      {/* Events, most serious tier first — each with one obvious next step */}
      {alerts.length > 0 && (
        <div className="mt-6 space-y-6">
          {visibleTiers.map((t) => (
            <div key={t.key}>
              <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {t.dot} {t.label} · {grouped[t.key].length}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">{t.plainEnglish}</p>
              <ul className="mt-2 space-y-3">
                {grouped[t.key].map((a) => {
                  const status = a.review_status ?? "open";
                  return (
                    <li key={a.id} className={`rounded-xl border p-4 ${TIER_STYLE[t.key]}`}>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest">
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-foreground">
                          {a.halted ? "Halted" : "Corrected"}
                        </span>
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-muted-foreground">
                          {STATUS_LABEL[status] ?? status}
                        </span>
                        <span className="text-muted-foreground">{a.rule}</span>
                        <span className="text-muted-foreground">· {a.surface}</span>
                        <span className="text-muted-foreground">· {countryOf(a)}</span>
                        <span className="ml-auto text-muted-foreground">{when(a.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{a.detail}</p>
                      {a.plain_english && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <strong className="text-foreground">Here's the idea:</strong>{" "}
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

                      {/* 4 ── Founder actions ─────────────────────────── */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { key: "reviewing", label: "Investigate" },
                          { key: "resolved", label: "Mark resolved" },
                          { key: "ignored", label: "Ignore" },
                          { key: "open", label: "Reopen" },
                        ]
                          .filter((b) => b.key !== status)
                          .map((b) => (
                            <button
                              key={b.key}
                              disabled={setStatus.isPending}
                              onClick={() => setStatus.mutate({ id: a.id, status: b.key })}
                              className="rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              {b.label}
                            </button>
                          ))}
                        <button
                          onClick={() =>
                            download(`frass-alert-${a.id.slice(0, 8)}.csv`, toCsv([a]))
                          }
                          className="rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        >
                          Export
                        </button>
                      </div>
                      {a.founder_note && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Your note: {a.founder_note}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 6 ── Recovery Center ──────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" /> Recovery Center · Founder only
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          If something does go wrong, everything you need is on this shelf — no hunting.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/admin/financial-audit"
            className="rounded-full border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Check audit history
          </a>
          <button
            onClick={() => download(`frass-security-log.csv`, toCsv(alerts))}
            className="rounded-full border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Export logs
          </button>
          <a
            href="/admin/roles"
            className="rounded-full border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            View affected accounts
          </a>
          <button
            onClick={() => {
              setShowQuiet(true);
              toast.message("Full timeline shown below.");
            }}
            className="rounded-full border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            View full timeline
          </button>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Founder principle:</strong> your time belongs to building
        Frass, not watching dashboards. Everything is monitored quietly; only what truly needs you
        will interrupt.
      </p>
    </section>
  );
}
