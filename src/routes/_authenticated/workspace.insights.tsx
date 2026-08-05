// Builder Insights feed — A-05 Part 3.
// Pattern-based insights, each one showing the connected artifacts behind it.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { getBuilderInsights } from "@/lib/insights.functions";
import {
  INSIGHT_LABELS,
  artifactTypeLabel,
  type Insight,
} from "@/lib/insights-engine";

export const Route = createFileRoute("/_authenticated/workspace/insights")({
  head: () => ({
    meta: [
      { title: "Builder Insights — Frass Hill" },
      {
        name: "description",
        content:
          "Pattern-based insights drawn from your own work in the Builder Vault, with the connected artifacts behind every observation.",
      },
      { property: "og:title", content: "Builder Insights — Frass Hill" },
      {
        property: "og:description",
        content:
          "See the patterns in your slogans, treatments, proposals and reach — always with the artifacts that prove them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InsightsPage,
});

function StrengthBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-24 overflow-hidden rounded-full bg-border">
      <div
        className="h-full bg-[color:var(--gold)]"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const shown = open ? insight.artifacts : insight.artifacts.slice(0, 3);
  const hidden = insight.artifacts.length - shown.length;

  return (
    <article className="rounded-2xl border border-border/70 bg-background/70 p-6 backdrop-blur transition hover:border-[color:var(--gold)]/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          {INSIGHT_LABELS[insight.kind]}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {insight.evidence}
          </span>
          <StrengthBar value={insight.strength} />
        </div>
      </div>

      <h2 className="mt-4 font-display text-2xl leading-snug">{insight.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {insight.narrative}
      </p>

      <div className="mt-6 border-t border-border/60 pt-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Connected artifacts · {insight.artifacts.length}
        </div>
        <ul className="mt-3 space-y-2">
          {shown.map((a) => (
            <li
              key={`${a.type}-${a.id}`}
              className="flex items-start justify-between gap-4 rounded-lg border border-border/50 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm">{a.label}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {artifactTypeLabel(a.type)}
                  {a.sublabel ? ` · ${a.sublabel}` : ""}
                </div>
              </div>
              <time className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </li>
          ))}
        </ul>
        {insight.artifacts.length > 3 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]"
          >
            {open ? "Show less" : `Show ${hidden} more`}
          </button>
        )}
      </div>
    </article>
  );
}

function InsightsPage() {
  const insightsFn = useServerFn(getBuilderInsights);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["builder-insights"],
    queryFn: () => insightsFn(),
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
          Builder Vault
        </div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Builder Insights</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Patterns Frassy noticed across your own work. Every observation names the
          artifacts it came from — nothing here is a guess.
        </p>

        {isLoading ? (
          <div className="mt-16 text-sm text-muted-foreground">Reading your vault…</div>
        ) : isError ? (
          <div className="mt-16 text-sm text-muted-foreground">
            Insights are unavailable right now. Try again shortly.
          </div>
        ) : (data?.insights.length ?? 0) === 0 ? (
          <div className="mt-16 rounded-2xl border border-border/70 bg-background/60 p-8">
            <div className="font-display text-2xl">Not enough work to read yet</div>
            <p className="mt-3 text-sm text-muted-foreground">
              {data?.totalArtifacts
                ? `You have ${data.totalArtifacts} artifacts in the vault. Patterns start surfacing once a few pieces rhyme with each other.`
                : "Create a few slogans, treatments or proposals and your patterns will start surfacing here."}
            </p>
            <Link
              to="/workspace/merch"
              className="mt-6 inline-block text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]"
            >
              Open the Merch Studio →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {data!.insights.length} insights · {data!.totalArtifacts} artifacts read
            </div>
            <div className="mt-6 space-y-5">
              {data!.insights.map((i) => (
                <InsightCard key={i.id} insight={i} />
              ))}
            </div>
          </>
        )}

        <Link
          to="/workspace"
          className="mt-12 inline-block text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[color:var(--gold)]"
        >
          ← Back to workspace
        </Link>
      </div>
      <PageFeedback pageTitle="Builder Insights" />
    </SiteShell>
  );
}
