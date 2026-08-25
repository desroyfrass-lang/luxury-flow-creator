// FRASS-0602 — Frass Media Revenue. Unavailable is never shown as zero.
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMonetization, useGenerationJobs } from "@/lib/studios/use-studios";
import { usePublications } from "@/lib/studios/use-distribution";
import { EmptyState, Field, StatTile, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { PLATFORM_MONETIZATION_STATUSES, labelOf, moneyOrUnavailable, platformMeta } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/monetization")({
  head: () => ({
    meta: [
      { title: "Frass Media Revenue | Frassy Studios" },
      { name: "description", content: "Real reported and estimated earnings per platform, series, episode and derivative." },
      { property: "og:title", content: "Frass Media Revenue | Frassy Studios" },
      { property: "og:description", content: "Reported, estimated or unavailable — never invented." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Monetization,
});

const VIEWS = [
  { value: "platform", label: "By Platform" },
  { value: "series", label: "By Series" },
  { value: "production", label: "By Production" },
  { value: "date", label: "By Date" },
] as const;

function Monetization() {
  const { data: rows = [] } = useMonetization();
  const { data: pubs = [] } = usePublications();
  const { data: genJobs = [] } = useGenerationJobs();
  const [view, setView] = useState("platform");

  const reported = rows.filter((r) => r.availability === "reported");
  const estimated = rows.filter((r) => r.availability === "estimated");
  const unavailable = rows.filter((r) => r.availability === "unavailable");

  const total = (list: typeof rows) => list.reduce((s, r) => s + Number(r.revenue ?? 0), 0);

  const grouped = useMemo(() => {
    const map = new Map<string, { revenue: number; availability: string }>();
    for (const r of rows) {
      const k =
        view === "platform"
          ? platformMeta(r.platform).label
          : view === "series"
            ? (r.studio_productions as { title?: string } | null)?.title ?? "Unassigned"
            : view === "production"
              ? (r.studio_productions as { title?: string } | null)?.title ?? "Untitled"
              : r.period_end
                ? new Date(r.period_end).toLocaleDateString()
                : "No period";
      const prev = map.get(k) ?? { revenue: 0, availability: r.availability ?? "unavailable" };
      map.set(k, {
        revenue: prev.revenue + Number(r.revenue ?? 0),
        availability: r.availability === "reported" ? "reported" : prev.availability,
      });
    }
    return [...map.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
  }, [rows, view]);

  // Content ROI — only where Build 2 actually recorded a generation cost.
  const roi = useMemo(() => {
    const cost = new Map<string, number>();
    for (const j of genJobs) {
      if (!j.production_id) continue;
      const c = Number(j.actual_cost_credits ?? j.cost_credits ?? 0);
      if (!c) continue;
      cost.set(j.production_id, (cost.get(j.production_id) ?? 0) + c);
    }
    const revenue = new Map<string, { amount: number; availability: string; title: string }>();
    for (const r of rows) {
      if (!r.production_id) continue;
      const prev = revenue.get(r.production_id);
      revenue.set(r.production_id, {
        amount: (prev?.amount ?? 0) + Number(r.revenue ?? 0),
        availability: r.availability === "reported" ? "reported" : r.availability ?? prev?.availability ?? "unavailable",
        title: (r.studio_productions as { title?: string } | null)?.title ?? "Untitled",
      });
    }
    return [...cost.entries()].map(([productionId, credits]) => ({
      productionId,
      credits,
      rev: revenue.get(productionId) ?? null,
    }));
  }, [genJobs, rows]);

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Frass Media Revenue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Money the platforms actually reported to us. Where a platform gives no figure, you will see “Data Unavailable” —
        never a zero that pretends to be a measurement.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Reported" value={reported.length ? moneyOrUnavailable(total(reported), "reported") : "Data Unavailable"} />
        <StatTile label="Estimated" value={estimated.length ? moneyOrUnavailable(total(estimated), "estimated") : "Data Unavailable"} />
        <StatTile label="Records with no figure" value={String(unavailable.length)} />
        <StatTile label="Live publications" value={String(pubs.filter((p) => p.status === "live").length)} />
      </div>

      <StudioSection title="Monetization status by channel" hint="Frassy tracks what the platform says. She never claims to switch it on.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pubs.slice(0, 12).map((p) => (
            <StudioCard key={p.id} eyebrow={platformMeta(p.platform).label} title={p.studio_productions?.title ?? "Untitled"}>
              <p className="text-xs text-muted-foreground">
                {p.account_label ?? "—"} · {labelOf(PLATFORM_MONETIZATION_STATUSES, p.monetization_status)}
              </p>
            </StudioCard>
          ))}
          {pubs.length === 0 ? <EmptyState title="No publications yet" body="Monetization status appears once work is published." /> : null}
        </div>
      </StudioSection>

      <StudioSection title="Revenue breakdown">
        <div className="max-w-[220px]">
          <Field label="View">
            <select className={inputClass} value={view} onChange={(e) => setView(e.target.value)}>
              {VIEWS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {grouped.length === 0 ? (
          <EmptyState title="No revenue recorded" body="Nothing has been reported to us yet. That is not the same as zero earnings." />
        ) : (
          <div className="mt-3 space-y-2">
            {grouped.map(([k, v]) => (
              <StudioCard key={k} eyebrow={k} title={moneyOrUnavailable(v.revenue, v.availability)}>
                <p className="text-xs text-muted-foreground">{labelOf([{ value: v.availability, label: v.availability }], v.availability)}</p>
              </StudioCard>
            ))}
          </div>
        )}
      </StudioSection>

      <StudioSection title="Content ROI" hint="Only where a real generation cost was recorded in the studio.">
        {roi.length === 0 ? (
          <EmptyState title="Insufficient Data" body="No production has both a recorded generation cost and a reported figure yet." />
        ) : (
          <div className="space-y-2">
            {roi.map((r) => (
              <StudioCard key={r.productionId} eyebrow={`${r.credits} credits spent`} title={r.rev?.title ?? "Untitled production"}>
                <p className="text-xs text-muted-foreground">
                  Revenue: {r.rev ? moneyOrUnavailable(r.rev.amount, r.rev.availability) : "Insufficient Data"} · Distribution cost: not recorded
                </p>
              </StudioCard>
            ))}
          </div>
        )}
      </StudioSection>
    </>
  );
}
