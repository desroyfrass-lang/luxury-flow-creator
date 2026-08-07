import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { LaunchReadiness } from "@/components/launch-readiness";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { getBuilderJourney, startJourneyTrack } from "@/lib/journey.functions";
import { COMMISSIONING_PHASES } from "@/lib/commissioning";
import { DISTRICTS } from "@/lib/districts";
import { trackOf } from "@/lib/journey";

export const Route = createFileRoute("/_authenticated/founder")({
  head: () => ({
    meta: [
      { title: "Founder Mode — Frass Operating System" },
      {
        name: "description",
        content:
          "Commission Frass OS: platform identity, commerce, Builder experience, operations, and launch readiness.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FounderPage,
});

const CONTROLS = [
  {
    title: "Commissioning",
    blurb: "Continue the Founder Commissioning Journey with Frassy.",
    to: "/onboarding",
  },
  {
    title: "Analytics",
    blurb: "What is happening across the platform and the storefront.",
    to: "/workspace/insights",
  },
  {
    title: "AI configuration",
    blurb: "Frassy's voice, guidance boundaries, and memory rules.",
    to: "/frassy",
  },
  {
    title: "Platform settings",
    blurb: "Site text, imagery, catalog, and storefront controls.",
    to: "/admin",
  },
  {
    title: "Builder insights",
    blurb: "Feedback and signals from the people using Frass.",
    to: "/admin/feedback",
  },
  {
    title: "Admin roles",
    blurb: "Who may operate Frass alongside you, and what they may do.",
    to: "/admin/roles",
  },
] as const;

function FounderPage() {
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const loadJourney = useServerFn(getBuilderJourney);
  const beginCommissioning = useServerFn(startJourneyTrack);

  const { data } = useQuery({
    queryKey: ["builder-journey"],
    queryFn: () => loadJourney(),
    enabled: isAdmin,
  });

  useEffect(() => {
    if (isAdmin === false) void navigate({ to: "/welcome-hall", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">
          Founder Mode is reserved for platform administrators.
        </div>
      </SiteShell>
    );
  }

  const completed = Object.keys(data?.stageProgress ?? {}).filter(
    (id) => trackOf(id) === "owner",
  );
  const totalOwnerStages = COMMISSIONING_PHASES.reduce(
    (n, p) => n + p.stages.length,
    0,
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Founder Mode
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          Commission Frass Operating System
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          You are not configuring software. You are preparing a place that Builders will enter.
          Everything on this page belongs to you alone — Builders never see it.
        </p>

        {/* Phases */}
        <section className="mt-12">
          <h2 className="font-display text-2xl">The five commissioning phases</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COMMISSIONING_PHASES.map((phase) => {
              const done = phase.stages.filter((s) => completed.includes(s.id)).length;
              return (
                <div
                  key={phase.chapter}
                  className="rounded-sm border border-border bg-background/40 p-5"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                    Phase {phase.number}
                  </div>
                  <h3 className="mt-2 font-display text-xl">{phase.name}</h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {phase.stages.map((s) => (
                      <li key={s.id} className="flex gap-2">
                        <span className="text-[color:var(--gold)]">
                          {completed.includes(s.id) ? "✓" : "·"}
                        </span>
                        <span>{s.title}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {done} of {phase.stages.length} settled
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={async () => {
              await beginCommissioning({ data: { track: "owner" } });
              void navigate({ to: "/onboarding" });
            }}
            className="lux-press mt-6 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
          >
            {completed.length ? "Continue commissioning" : "Begin commissioning"}
          </button>
          <span className="ml-4 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {completed.length} of {totalOwnerStages} steps
          </span>
        </section>

        {/* Frassy — the founder's direct line */}
        <section className="mt-14">
          <h2 className="font-display text-2xl">Talk to Frassy</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            She knows the districts, the catalog, and where commissioning stands. Type or press
            the mic — she speaks back unless you mute her.
          </p>
          <div className="mt-5 max-w-3xl">
            <FrassyChat embedded />
          </div>
        </section>

        {/* Readiness */}
        <section className="mt-14">
          <LaunchReadiness completedStageIds={completed} />
        </section>


        {/* District management */}
        <section className="mt-14">
          <h2 className="font-display text-2xl">District management</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {DISTRICTS.map((d) => (
              <div
                key={d.id}
                className="rounded-sm border border-border bg-background/40 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg">{d.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {d.status === "open"
                      ? "Open"
                      : d.status === "building"
                        ? "Building"
                        : "Planned"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{d.purpose}</p>
                {d.to && (
                  <Link
                    to={d.to}
                    className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]"
                  >
                    Enter
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Controls */}
        <section className="mt-14">
          <h2 className="font-display text-2xl">Founder controls</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CONTROLS.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="rounded-sm border border-border bg-background/40 p-5 transition hover:border-[color:var(--gold)]"
              >
                <div className="font-display text-lg">{c.title}</div>
                <p className="mt-2 text-xs text-muted-foreground">{c.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <PageFeedback pageTitle="Founder Mode" />
    </SiteShell>
  );
}
