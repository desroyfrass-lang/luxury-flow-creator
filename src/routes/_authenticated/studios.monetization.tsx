// FRASS-0600 — money, only where it is real.
import { createFileRoute } from "@tanstack/react-router";
import { useMonetization } from "@/lib/studios/use-studios";
import { EmptyState, StatTile, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/monetization")({
  head: () => ({
    meta: [
      { title: "Monetization | Frassy Studios" },
      { name: "description", content: "Real earnings recorded per production and channel — no projections." },
      { property: "og:title", content: "Monetization | Frassy Studios" },
      { property: "og:description", content: "Ad revenue, sponsorship, licensing and product tie-ins in one ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Monetization,
});

function Monetization() {
  const { data: rows = [] } = useMonetization();
  const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const total = rows.reduce((s, r) => s + Number(r.revenue ?? 0), 0);
  const byPlatform = new Map<string, number>();
  for (const r of rows) byPlatform.set(r.platform, (byPlatform.get(r.platform) ?? 0) + Number(r.revenue ?? 0));

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Monetization</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Only money that has actually been recorded shows here. Nothing is estimated or invented.
      </p>

      <StudioSection title="Recorded earnings">
        {rows.length === 0 ? (
          <EmptyState
            title="No earnings recorded yet"
            body="Once a production is published and revenue is reported, it appears here with its source."
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total recorded" value={money(total)} />
              {[...byPlatform.entries()].slice(0, 3).map(([platform, amt]) => (
                <StatTile key={platform} label={prettify(platform)} value={money(amt)} />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {rows.map((r) => (
                <StudioCard key={r.id} eyebrow={prettify(r.platform)} title={r.studio_productions?.title ?? "Untitled"}>
                  <div className="flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
                    <span>{Number(r.monetized_views ?? 0).toLocaleString()} monetized views</span>
                    <span>{r.period_start ? new Date(r.period_start).toLocaleDateString() : "—"}</span>
                    <span className="text-[color:var(--gold)]">
                      {money(Number(r.revenue ?? 0))} {r.currency ?? "USD"}
                    </span>
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
