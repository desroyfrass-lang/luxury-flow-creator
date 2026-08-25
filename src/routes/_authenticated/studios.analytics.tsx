// FRASS-0600 — performance, from stored platform data only.
import { createFileRoute } from "@tanstack/react-router";
import { useAnalytics } from "@/lib/studios/use-studios";
import { EmptyState, StatTile, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Frassy Studios" },
      { name: "description", content: "Views, watch time and engagement recorded per production and channel." },
      { property: "og:title", content: "Analytics | Frassy Studios" },
      { property: "og:description", content: "What performed, where, and what it earned." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data: rows = [] } = useAnalytics();
  const n = (v: unknown) => Number(v ?? 0);
  const sum = (k: string) => rows.reduce((s, r) => s + n((r as Record<string, unknown>)[k]), 0);

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These numbers come from channels that reported them. Nothing is filled in on their behalf.
      </p>

      <StudioSection title="Across every channel">
        {rows.length === 0 ? (
          <EmptyState title="No performance data yet" body="Once something is published and a channel reports back, its numbers land here." />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Views" value={sum("views").toLocaleString()} />
              <StatTile label="Watch time (min)" value={Math.round(sum("watch_time_minutes")).toLocaleString()} />
              <StatTile label="Engagements" value={sum("engagements").toLocaleString()} />
              <StatTile label="Shares" value={sum("shares").toLocaleString()} />
            </div>
            <div className="mt-4 space-y-2">
              {rows.map((r) => (
                <StudioCard key={r.id} eyebrow={prettify(r.platform)} title={r.studio_productions?.title ?? "Untitled"}>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>{n(r.views).toLocaleString()} views</span>
                    <span>{Math.round(n(r.watch_time_minutes)).toLocaleString()} min watched</span>
                    <span>{n(r.engagements).toLocaleString()} engagements</span>
                    <span>{n(r.comments).toLocaleString()} comments</span>
                    <span>{r.period_end ? new Date(r.period_end).toLocaleDateString() : "—"}</span>
                  </div>
                </StudioCard>
              ))}
            </div>
          </>
        )}
      </StudioSection>
    </>
  );
}
