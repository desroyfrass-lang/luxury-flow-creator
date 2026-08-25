// FRASS-0600 — what the studio spent, and what it saved by reusing.
import { createFileRoute } from "@tanstack/react-router";
import { useGenerationJobs } from "@/lib/studios/use-studios";
import { EmptyState, StatTile, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/usage")({
  head: () => ({
    meta: [
      { title: "Usage & Cost | Frassy Studios" },
      { name: "description", content: "Generation counts, credits spent and how often the studio reused instead of regenerating." },
      { property: "og:title", content: "Usage & Cost | Frassy Studios" },
      { property: "og:description", content: "Reuse is free. Regeneration costs. This page shows the difference." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Usage,
});

function Usage() {
  const { data: jobs = [] } = useGenerationJobs();
  const spent = jobs.reduce((s, j) => s + Number(j.cost_credits ?? 0), 0);
  const reused = jobs.filter((j) => j.reused_asset_id).length;
  const failed = jobs.filter((j) => j.status === "failed").length;

  const byType = new Map<string, number>();
  for (const j of jobs) byType.set(j.job_type, (byType.get(j.job_type) ?? 0) + 1);

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Usage & Cost</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every piece of work the studio ran, what it cost in credits, and how often an existing asset was reused instead.
      </p>

      <StudioSection title="Totals">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Jobs run" value={jobs.length.toLocaleString()} />
          <StatTile label="Credits spent" value={spent.toLocaleString()} />
          <StatTile label="Reused instead" value={reused.toLocaleString()} hint="Cost nothing." />
          <StatTile label="Failed" value={failed.toLocaleString()} />
        </div>
      </StudioSection>

      <StudioSection title="By kind of work">
        {byType.size === 0 ? (
          <EmptyState title="Nothing generated yet" body="When the studio starts producing, its work log appears here." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...byType.entries()].map(([type, count]) => (
              <StatTile key={type} label={prettify(type)} value={count.toLocaleString()} />
            ))}
          </div>
        )}
      </StudioSection>

      <StudioSection title="Recent work">
        <div className="space-y-2">
          {jobs.slice(0, 40).map((j) => (
            <StudioCard key={j.id} eyebrow={prettify(j.job_type)} title={j.studio_productions?.title ?? "Studio work"}>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{prettify(j.status)}</span>
                <span>{Number(j.cost_credits ?? 0).toLocaleString()} credits</span>
                <span>{j.reused_asset_id ? "Reused an existing asset" : "Newly generated"}</span>
                <span>{j.created_at ? new Date(j.created_at).toLocaleString() : ""}</span>
              </div>
              {j.error ? <p className="mt-2 text-xs text-red-400">{j.error}</p> : null}
            </StudioCard>
          ))}
        </div>
      </StudioSection>
    </>
  );
}
