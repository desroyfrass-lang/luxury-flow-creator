// FRASS-0602 — Master Content Calendar: all Frass media publishing in one place.
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDistributionJobs, useConnectionAccounts } from "@/lib/studios/use-distribution";
import { EmptyState, Field, StatusPill, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { DISTRIBUTION_PLATFORMS, JOB_STATUSES, labelOf, platformMeta } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar | Frassy Studios" },
      { name: "description", content: "Every scheduled Frass release, by day, week or month." },
      { property: "og:title", content: "Content Calendar | Frassy Studios" },
      { property: "og:description", content: "One calendar for every series, platform and channel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Calendar,
});

const RANGES = [
  { value: "day", label: "Day", days: 1 },
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 31 },
] as const;

function Calendar() {
  const { data: jobs = [] } = useDistributionJobs();
  const { data: accounts = [] } = useConnectionAccounts();
  const [range, setRange] = useState<string>("week");
  const [platform, setPlatform] = useState("");
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");

  const days = RANGES.find((r) => r.value === range)?.days ?? 7;

  const filtered = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + days * 86_400_000);
    return jobs.filter((j) => {
      if (platform && j.platform !== platform) return false;
      if (account && j.connection_id !== account) return false;
      if (status && j.status !== status) return false;
      if (!j.scheduled_for) return status === "" ? true : true;
      const at = new Date(j.scheduled_for);
      return at >= start && at <= end;
    });
  }, [jobs, days, platform, account, status]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const j of filtered) {
      const day = j.scheduled_for ? new Date(j.scheduled_for).toLocaleDateString() : "No date set";
      map.set(day, [...(map.get(day) ?? []), j]);
    }
    return [...map.entries()].sort((a, b) => (a[0] === "No date set" ? 1 : b[0] === "No date set" ? -1 : +new Date(a[0]) - +new Date(b[0])));
  }, [filtered]);

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Content Calendar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything Frass has lined up to release, wherever it is going.</p>

      <StudioSection title="Filters">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="View">
            <select className={inputClass} value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Platform">
            <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="">All</option>
              {DISTRIBUTION_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Channel">
            <select className={inputClass} value={account} onChange={(e) => setAccount(e.target.value)}>
              <option value="">All</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_label ?? a.platform}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {JOB_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </StudioSection>

      <StudioSection title="Schedule">
        {grouped.length === 0 ? (
          <EmptyState title="Nothing in this window" body="Queue a destination from the Distribution Network and it lands here." />
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, rows]) => (
              <div key={day}>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{day}</div>
                <div className="mt-2 space-y-2">
                  {rows.map((j) => (
                    <StudioCard
                      key={j.id}
                      eyebrow={`${platformMeta(j.platform).icon} ${platformMeta(j.platform).label}`}
                      title={j.studio_productions?.title ?? "Untitled"}
                    >
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <StatusPill status={labelOf(JOB_STATUSES, j.status)} />
                        <span>{j.account_label ?? "No channel"}</span>
                        <span>{j.scheduled_for ? new Date(j.scheduled_for).toLocaleTimeString() : "No time set"}</span>
                        {j.timezone ? <span>{j.timezone}</span> : null}
                        {j.studio_productions?.studio_series?.name ? <span>{j.studio_productions.studio_series.name}</span> : null}
                      </div>
                    </StudioCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </StudioSection>
    </>
  );
}
