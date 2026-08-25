// FRASS-0602 — Frass Distribution Network: the front door.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProductions } from "@/lib/studios/use-studios";
import { useConnectionAccounts, useDistributionJobs, usePublications } from "@/lib/studios/use-distribution";
import { EmptyState, StatTile, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { platformMeta } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/distribution/")({
  head: () => ({
    meta: [
      { title: "Frass Distribution Network | Frassy Studios" },
      { name: "description", content: "One road out of the studio: approved work, packaged, routed and recorded." },
      { property: "og:title", content: "Frass Distribution Network | Frassy Studios" },
      { property: "og:description", content: "Approved master to platform package to connected account, with a full record kept." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DistributionHome,
});

function DistributionHome() {
  const { data: productions = [] } = useProductions();
  const { data: accounts = [] } = useConnectionAccounts();
  const { data: jobs = [] } = useDistributionJobs();
  const { data: pubs = [] } = usePublications();

  const ready = productions.filter((p) => ["approved", "scheduled", "published"].includes(p.status));
  const connected = accounts.filter((a) => a.status === "connected");
  const attention = jobs.filter((j) => j.status === "needs_attention" || j.status === "failed");

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Frass Distribution Network</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This is the one road out of the studio. Approved work becomes a platform package, the package goes to a connected
        account, and every publication keeps its link back to the Frass master. Nothing slips out another way.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Ready to distribute" value={String(ready.length)} />
        <StatTile label="Connected channels" value={String(connected.length)} />
        <StatTile label="Queued or scheduled" value={String(jobs.filter((j) => ["scheduled", "preparing", "uploading", "processing"].includes(j.status)).length)} />
        <StatTile label="Needs your attention" value={String(attention.length)} />
      </div>

      <StudioSection title="Choose where work goes" hint="Open a production to set its destination matrix.">
        {ready.length === 0 ? (
          <EmptyState title="Nothing approved yet" body="Approve a production in the Review Queue and it appears here ready to route." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ready.map((p) => (
              <StudioCard key={p.id} eyebrow={p.studio_series?.name ?? "Standalone"} title={p.title}>
                <p className="text-xs text-muted-foreground">
                  {p.content_id ?? "No Frass content ID yet"} · {p.status}
                </p>
                <Link to="/studios/distribution/$id" params={{ id: p.id }} className="mt-3 inline-block text-xs uppercase tracking-[0.18em] text-[color:var(--gold)]">
                  Where should this go? →
                </Link>
              </StudioCard>
            ))}
          </div>
        )}
      </StudioSection>

      <StudioSection title="Already out there" hint="Every publication keeps its Frass content ID, not just the platform's.">
        {pubs.length === 0 ? (
          <EmptyState title="Nothing published yet" body="Publications appear here the moment the network completes one." />
        ) : (
          <div className="space-y-2">
            {pubs.slice(0, 12).map((pub) => (
              <StudioCard key={pub.id} eyebrow={platformMeta(pub.platform).label} title={pub.studio_productions?.title ?? "Untitled"}>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{pub.content_id ?? "—"}</span>
                  <span>{pub.account_label ?? "—"}</span>
                  <span>{pub.published_at ? new Date(pub.published_at).toLocaleDateString() : "Not live yet"}</span>
                  <span>{pub.distribution_stopped ? "Distribution stopped" : pub.status}</span>
                </div>
              </StudioCard>
            ))}
          </div>
        )}
      </StudioSection>
    </>
  );
}
