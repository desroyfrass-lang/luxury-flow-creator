// FRASS-0568 — Founder Control Room Consolidation.
// Everything the legacy Control Room did that the Command Center did not:
// commissioning phases, launch readiness, districts, credits, platform status
// and the Founder's shortcut controls. Migrated, not rebuilt.
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LaunchReadiness } from "@/components/launch-readiness";
import { DevelopmentCredits } from "@/components/construction/development-credits";
import { PlatformStatusCenter } from "@/components/founder/platform-status-center";
import { ArchitecturalHealth } from "@/components/construction/architectural-health";
import { openConstructionMode } from "@/components/construction/blueprint-mode";
import { openTheDaily } from "@/components/workspace/daily-gate";
import { getBuilderJourney, setJourneyStage, startJourneyTrack } from "@/lib/journey.functions";
import { COMMISSIONING_PHASES } from "@/lib/commissioning";
import { DISTRICTS } from "@/lib/districts";
import { trackOf } from "@/lib/journey";

const CONTROLS = [
  {
    title: "My Workspace",
    blurb: "Modes, projects, conversation sections, task panel, timeline and composer.",
    to: "/room",
  },
  { title: "Commissioning", blurb: "Continue the Founder Commissioning Journey with Frassy.", to: "/onboarding" },
  { title: "Analytics", blurb: "What is happening across the platform and the storefront.", to: "/workspace/insights" },
  { title: "AI configuration", blurb: "Frassy's voice, guidance boundaries and memory rules.", to: "/frassy" },
  { title: "Platform settings", blurb: "Site text, imagery, catalog and storefront controls.", to: "/admin" },
  { title: "Builder insights", blurb: "Feedback and signals from the people using Frass.", to: "/admin/feedback" },
  {
    title: "Affiliate governance",
    blurb: "Commission floors, ceilings, protected margins and promo windows.",
    to: "/admin/affiliate-policy",
  },
  {
    title: "Affiliate Intelligence",
    blurb: "Profitability analysis and the Commission Simulator on a product.",
    to: "/workspace/affiliate",
  },
  { title: "Admin roles", blurb: "Who may operate Frass alongside you, and what they may do.", to: "/admin/roles" },
] as const;

export function CommissioningPanel() {
  const navigate = useNavigate();
  const loadJourney = useServerFn(getBuilderJourney);
  const beginCommissioning = useServerFn(startJourneyTrack);
  const jumpStage = useServerFn(setJourneyStage);

  const { data } = useQuery({ queryKey: ["builder-journey"], queryFn: () => loadJourney() });

  const completed = Object.keys(data?.stageProgress ?? {}).filter((id) => trackOf(id) === "owner");
  const totalOwnerStages = COMMISSIONING_PHASES.reduce((n, p) => n + p.stages.length, 0);

  return (
    <div className="space-y-12">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--gold)]/40 p-5">
        <div className="min-w-0 flex-1">
          <div className="font-display text-2xl">My Workspace</div>
          <p className="mt-1 text-xs text-muted-foreground">
            One workspace, many modes. It reopens exactly where you left off.
          </p>
        </div>
        <Link
          to="/room"
          className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
        >
          Launch Workspace
        </Link>
        <button
          type="button"
          onClick={openTheDaily}
          className="rounded-sm border border-border px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[color:var(--gold)]"
        >
          Open The Daily
        </button>
        <button
          type="button"
          onClick={openConstructionMode}
          className="rounded-sm border border-[color:var(--gold)]/60 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/10"
          title="Founder only — ⌘/Ctrl + Shift + B anywhere in Frass"
        >
          Construction Mode
        </button>
      </section>

      <section className="max-w-2xl">
        <DevelopmentCredits />
        <p className="mt-3 text-xs text-muted-foreground">
          Every architectural change is forecast in credits before you approve it, with a lighter
          alternative whenever one exists.
        </p>
      </section>

      <PlatformStatusCenter />
      <ArchitecturalHealth />

      <section>
        <h2 className="font-display text-2xl">The five commissioning phases</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMMISSIONING_PHASES.map((phase) => {
            const done = phase.stages.filter((s) => completed.includes(s.id)).length;
            return (
              <div key={phase.chapter} className="rounded-sm border border-border bg-background/40 p-5">
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

      <section>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Every line below is a live conversation. Click one and Frassy picks the chat back up
          exactly where the two of you left off.
        </p>
        <LaunchReadiness
          eyebrow="Commissioning Dashboard"
          heading="Platform Readiness"
          completedStageIds={completed}
          onSelectStage={async (stageId) => {
            await jumpStage({ data: { stageId } });
            void navigate({ to: "/onboarding" });
          }}
        />
      </section>

      <section>
        <h2 className="font-display text-2xl">District management</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DISTRICTS.map((d) => (
            <div key={d.id} className="rounded-sm border border-border bg-background/40 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg">{d.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {d.status === "open" ? "Open" : d.status === "building" ? "Building" : "Planned"}
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

      <section>
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
  );
}
