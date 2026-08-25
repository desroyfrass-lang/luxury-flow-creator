// FRASS-0600 — the Frassy Studios command center.
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useProductions,
  usePublishJobs,
  usePlatformConnections,
  useMonetization,
  useGenerationJobs,
} from "@/lib/studios/use-studios";
import { StatTile, StudioCard, StudioSection, StatusPill, EmptyState } from "@/components/studios/studio-ui";
import { PLATFORMS, prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/")({
  head: () => ({
    meta: [
      { title: "Studios Dashboard | Frassy Studios" },
      { name: "description", content: "Every production, publishing job, platform and generation cost in one view." },
      { property: "og:title", content: "Studios Dashboard | Frassy Studios" },
      { property: "og:description", content: "Create once. Publish everywhere. Own everything." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudiosDashboard,
});

function StudiosDashboard() {
  const { data: productions = [] } = useProductions();
  const { data: jobs = [] } = usePublishJobs();
  const { data: connections = [] } = usePlatformConnections();
  const { data: money = [] } = useMonetization();
  const { data: gen = [] } = useGenerationJobs();

  const count = (fn: (p: (typeof productions)[number]) => boolean) => productions.filter(fn).length;
  const today = new Date().toISOString().slice(0, 10);

  const genCount = (kind: string) => gen.filter((g) => g.job_type === kind).length;
  const reused = gen.filter((g) => g.reused_asset_id).length;
  const estCost = gen.reduce((s, g) => s + Number(g.cost_credits ?? 0), 0);
  const voiceJobs = gen.filter((g) => g.job_type === "voice").length;

  const revenue = money.reduce((s, m) => s + Number(m.revenue ?? 0), 0);
  const monetizedViews = money.reduce((s, m) => s + Number(m.monetized_views ?? 0), 0);

  return (
    <>
      <header className="rounded-lg border border-border/70 bg-gradient-to-br from-card/80 to-background p-8">
        <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">Frass Hill Production House</div>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">Frassy Studios</h1>
        <p className="mt-3 text-sm text-muted-foreground">Create once. Publish everywhere. Own everything.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/studios/create"
            className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)]/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]"
          >
            + Create Production
          </Link>
          <Link
            to="/studios/productions"
            search={{ status: "draft" } as never}
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Continue Draft
          </Link>
          <Link
            to="/studios/review"
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Review Content
          </Link>
          <Link
            to="/studios/publishing"
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Publishing Queue
          </Link>
        </div>
      </header>

      <StudioSection title="Productions" hint="Where every piece of work stands right now.">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="In development" value={count((p) => ["idea", "draft", "script", "storyboard"].includes(p.status))} />
          <StatTile label="Generating" value={count((p) => ["generating", "editing"].includes(p.status))} />
          <StatTile label="Ready for review" value={count((p) => p.status === "review")} />
          <StatTile label="Approved" value={count((p) => ["approved", "scheduled"].includes(p.status))} />
          <StatTile label="Published" value={count((p) => p.status === "published")} />
        </div>
      </StudioSection>

      <StudioSection title="Publishing" hint="Nothing leaves Frass Hill without your approval.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Scheduled" value={jobs.filter((j) => j.status === "scheduled").length} />
          <StatTile
            label="Published today"
            value={jobs.filter((j) => j.status === "published" && (j.updated_at ?? "").startsWith(today)).length}
          />
          <StatTile label="Failed" value={jobs.filter((j) => j.status === "failed").length} />
          <StatTile label="Awaiting approval" value={count((p) => p.status === "review")} />
        </div>
      </StudioSection>

      <StudioSection
        title="Platform status"
        hint="Real connections only — nothing here is pretended."
        action={
          <Link to="/studios/connections" className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
            Manage connections →
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => {
            const row = connections.find((c) => c.platform === p.value);
            const connected = row?.status === "connected";
            return (
              <StudioCard key={p.value} eyebrow={`${p.icon} ${p.label}`}>
                <StatusPill status={connected ? "approved" : "idea"} tint={connected ? "good" : "muted"} />
                <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <dt>Account</dt>
                    <dd className="text-foreground">{row?.account_label ?? "Not connected"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Publishing</dt>
                    <dd>{row?.publishing_enabled ? "Enabled" : "Off"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Monetization data</dt>
                    <dd>{row?.monetization_enabled ? "Available" : "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last sync</dt>
                    <dd>{row?.last_sync_at ? new Date(row.last_sync_at).toLocaleString() : "Never"}</dd>
                  </div>
                </dl>
              </StudioCard>
            );
          })}
        </div>
      </StudioSection>

      <StudioSection title="Monetization snapshot" hint="Only real numbers, and only once a connected platform reports them.">
        {money.length === 0 ? (
          <EmptyState
            title="No platform revenue reported yet"
            body="Connect a platform and give it permission to share monetization data. Until a platform reports real figures, Frass shows nothing — no estimates dressed up as earnings."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Reported revenue" value={`$${revenue.toFixed(2)}`} />
            <StatTile label="Monetized views" value={monetizedViews.toLocaleString()} />
            <StatTile label="Productions earning" value={new Set(money.map((m) => m.production_id)).size} />
            <StatTile label="Platforms reporting" value={new Set(money.map((m) => m.platform)).size} />
          </div>
        )}
      </StudioSection>

      <StudioSection title="Generation usage" hint="Reuse an approved asset and the studio spends nothing to make it again.">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatTile label="Videos generated" value={genCount("video")} />
          <StatTile label="Scenes generated" value={genCount("scene")} />
          <StatTile label="Images generated" value={genCount("image")} />
          <StatTile label="Voice tracks" value={voiceJobs} />
          <StatTile label="Music / audio" value={genCount("music")} />
          <StatTile label="Regenerations" value={gen.filter((g) => g.job_type.startsWith("re")).length} />
          <StatTile label="Reused assets" value={reused} hint="Cost avoided" />
          <StatTile label="Estimated cost" value={`${estCost.toLocaleString()} cr`} />
        </div>
      </StudioSection>

      <StudioSection title="Latest work" hint="The last things you touched.">
        {productions.length === 0 ? (
          <EmptyState
            title="The studio is empty"
            body="Start your first production and Frassy will help you take it from an idea to a finished, owned piece of media."
            action={
              <Link to="/studios/create" className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
                + Create Production
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {productions.slice(0, 6).map((p) => (
              <Link key={p.id} to="/studios/production/$id" params={{ id: p.id }}>
                <StudioCard eyebrow={p.studio_series?.name ?? "No series"} title={p.title}>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={p.status} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {prettify(p.production_type)} · {p.aspect_ratio}
                    </span>
                  </div>
                </StudioCard>
              </Link>
            ))}
          </div>
        )}
      </StudioSection>
    </>
  );
}
