// FRASS-0602 — Media Performance. Only real, synchronised numbers appear here.
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { usePlatformAnalytics } from "@/lib/studios/use-studios";
import { usePublications } from "@/lib/studios/use-distribution";
import { EmptyState, Field, StatTile, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { platformMeta } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/performance")({
  head: () => ({
    meta: [
      { title: "Media Performance | Frassy Studios" },
      { name: "description", content: "How Frass media actually performs, from synchronised platform data only." },
      { property: "og:title", content: "Media Performance | Frassy Studios" },
      { property: "og:description", content: "Views, watch time, engagement and top performers across every Frass channel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Performance,
});

const WINDOWS = [
  { value: "1", label: "Today" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
  { value: "365", label: "Year" },
  { value: "all", label: "All time" },
] as const;

function Performance() {
  const { data: rows = [] } = usePlatformAnalytics();
  const { data: pubs = [] } = usePublications();
  const [win, setWin] = useState("30");

  const scoped = useMemo(() => {
    if (win === "all") return rows;
    const cutoff = Date.now() - Number(win) * 86_400_000;
    return rows.filter((r) => (r.period_end ? +new Date(r.period_end) >= cutoff : false));
  }, [rows, win]);

  const sum = (k: string) => scoped.reduce((s, r) => s + Number((r as Record<string, unknown>)[k] ?? 0), 0);
  const n = (v: number) => v.toLocaleString();

  const leaderboard = (keyFn: (r: (typeof scoped)[number]) => string) => {
    const map = new Map<string, number>();
    for (const r of scoped) {
      const k = keyFn(r);
      if (!k) continue;
      map.set(k, (map.get(k) ?? 0) + Number(r.views ?? 0));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const hasData = scoped.length > 0;

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Media Performance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every number here came from a platform we are actually connected to. Where a platform gives us nothing, we say so
        instead of guessing.
      </p>

      <div className="mt-4 max-w-[220px]">
        <Field label="Window">
          <select className={inputClass} value={win} onChange={(e) => setWin(e.target.value)}>
            {WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {!hasData ? (
        <StudioSection title="Nothing measured yet">
          <EmptyState
            title="No synchronised analytics"
            body="Connect a channel, publish through the Frass Distribution Network, then sync. Until then there is honestly nothing to show."
          />
        </StudioSection>
      ) : (
        <>
          <StudioSection title="Top line">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total views" value={n(sum("views"))} />
              <StatTile label="Watch time (min)" value={n(sum("watch_time_minutes"))} />
              <StatTile label="Engagements" value={n(sum("engagements"))} />
              <StatTile label="Subscribers gained" value={n(sum("subscribers_gained"))} />
              <StatTile label="Published pieces" value={n(pubs.filter((p) => p.status === "live").length)} />
              <StatTile label="Likes" value={n(sum("likes"))} />
              <StatTile label="Shares" value={n(sum("shares"))} />
              <StatTile label="Comments" value={n(sum("comments"))} />
            </div>
          </StudioSection>

          <StudioSection title="Top performers" hint="Ranked only on data we actually hold.">
            <div className="grid gap-3 lg:grid-cols-3">
              <StudioCard eyebrow="By series" title="Top series">
                <ol className="space-y-1 text-xs text-muted-foreground">
                  {leaderboard((r) => r.studio_productions?.studio_series?.name ?? "").map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-2">
                      <span>{k}</span>
                      <span className="text-[color:var(--gold)]">{n(v)}</span>
                    </li>
                  ))}
                </ol>
              </StudioCard>
              <StudioCard eyebrow="By production" title="Top production">
                <ol className="space-y-1 text-xs text-muted-foreground">
                  {leaderboard((r) => r.studio_productions?.title ?? "").map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-2">
                      <span>{k}</span>
                      <span className="text-[color:var(--gold)]">{n(v)}</span>
                    </li>
                  ))}
                </ol>
              </StudioCard>
              <StudioCard eyebrow="By platform" title="Top platform">
                <ol className="space-y-1 text-xs text-muted-foreground">
                  {leaderboard((r) => platformMeta(r.platform).label).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-2">
                      <span>{k}</span>
                      <span className="text-[color:var(--gold)]">{n(v)}</span>
                    </li>
                  ))}
                </ol>
              </StudioCard>
            </div>
          </StudioSection>
        </>
      )}
    </>
  );
}
