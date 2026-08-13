import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkingStyleCard } from "@/components/frassy/working-style-card";
import { LearningPreferencesCard } from "@/components/frassy/learning-preferences-card";
import { MomentumCard } from "@/components/frassy/momentum-card";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteShell } from "@/components/site-shell";
import { FrassyChat } from "@/components/frassy-chat";
import { PageFeedback } from "@/components/page-feedback";
import { getWelcomeHall, type HallMemory } from "@/lib/welcome-hall.functions";
import { DISTRICTS, HALL_SECTIONS } from "@/lib/districts";
import { JOURNEY_STAGES, stageById, stageIndex } from "@/lib/journey";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

export const Route = createFileRoute("/_authenticated/builder-hall")({
  head: () => ({
    meta: [
      { title: "Welcome Hall — Frass Operating System" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WelcomeHallPage,
});

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function titleize(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function WelcomeHallPage() {
  const loadHall = useServerFn(getWelcomeHall);
  const { data, isLoading } = useQuery({
    queryKey: ["welcome-hall"],
    queryFn: () => loadHall(),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, HallMemory[]>();
    for (const m of data?.memory ?? []) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return map;
  }, [data?.memory]);

  const finished = data?.journeyStatus === "complete";
  const started = (data?.completedStages ?? 0) > 0 || data?.journeyStatus === "in_progress";
  const stage = stageById(data?.currentStage ?? "mission");
  const idx = stageIndex(stage.id);
  const pct = Math.round(((data?.completedStages ?? 0) / JOURNEY_STAGES.length) * 100);
  const name = data?.displayName?.split(" ")[0] ?? null;

  const sections = HALL_SECTIONS.filter((s) => (grouped.get(s.category)?.length ?? 0) > 0);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Arrival */}
        <header className="text-center">
          <img src={symbolLogo.url} alt="" className="mx-auto h-12 w-auto opacity-90" />
          <div className="mt-6 text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Welcome Hall
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            {greeting()}
            {name ? `, ${name}` : ""}.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {isLoading
              ? "Frassy is gathering what she remembers…"
              : finished
                ? "Everything you've built with Frassy lives here. This is your front door into Frass OS."
                : started
                  ? "Your journey is underway. Here's what Frassy holds for you so far."
                  : "Your journey hasn't begun yet. Frassy is waiting whenever you're ready."}
          </p>
        </header>

        {/* FRASS-0551 — Conversation first. Frassy is the front gate, not a
            settings screen: you arrive and she is already talking with you. */}
        <section className="mt-10">
          <FrassyChat embedded />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Talk or type — Frassy takes you wherever you need to go.
          </p>
        </section>


        <section className="mt-12 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Your next step
          </div>
          {finished ? (
            <>
              <h2 className="mt-3 font-display text-2xl">
                Your foundation is complete. Now start your Vault.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Frassy knows your mission, your identity, and how you work. The Builder Vault is
                open — keep the work, ideas, and decisions worth carrying forward.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/vault"
                  className="lux-press inline-block rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
                >
                  Enter your Vault
                </Link>
                <Link
                  to="/creation"
                  className="lux-press inline-block rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]"
                >
                  Start creating
                </Link>
                <Link
                  to="/opportunity"
                  className="lux-press inline-block rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]"
                >
                  Track opportunities
                </Link>
                <Link
                  to="/frassy"
                  className="lux-press inline-block rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]"
                >
                  Work with Frassy
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-display text-2xl">
                Chapter {idx + 1} — {stage.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{stage.purpose}</p>
              <div className="mt-5">
                <div className="h-px w-full bg-border">
                  <div
                    className="h-px bg-[color:var(--gold)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {data?.completedStages ?? 0} of {JOURNEY_STAGES.length} chapters ·{" "}
                  {data?.totalRemembered ?? 0} things remembered
                </div>
              </div>
              <Link
                to="/onboarding"
                className="lux-press mt-6 inline-block rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
              >
                {started ? "Continue with Frassy" : "Begin your Builder Journey"}
              </Link>
            </>
          )}
        </section>

        {/* FRASS-0478 — how you like to work. FRASS-0551: this is a setting,
            not the front gate, so it sits folded away beneath the conversation. */}
        <details className="mt-16 rounded-2xl border border-border/70 p-6">
          <summary className="cursor-pointer font-display text-xl">
            How Frassy works with you
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">
            Not what you said — how you like to be helped. Learned by observation, never
            configured.
          </p>
          <div className="mt-8 max-w-xl">
            <WorkingStyleCard />
            <LearningPreferencesCard />
            <MomentumCard />
          </div>
        </details>


        {/* What Frassy remembers */}
        {sections.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl">What Frassy remembers about you</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Yours alone, and yours to correct. Tell Frassy any time something has changed.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {sections.map((s) => (
                <div
                  key={s.category}
                  className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur"
                >
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                    {s.label}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.blurb}</div>
                  <ul className="mt-4 space-y-3">
                    {(grouped.get(s.category) ?? []).map((m) => (
                      <li key={m.key}>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {titleize(m.key)}
                        </div>
                        <div className="mt-1 text-sm leading-relaxed">{m.value}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* The districts */}
        <section className="mt-16">
          <h2 className="font-display text-2xl">The districts</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Frass OS is built district by district. Each one opens here the moment it's ready.
          </p>
          <div className="mt-8 grid gap-3">
            {DISTRICTS.map((d) => {
              const inner = (
                <div
                  className={`flex items-center justify-between gap-6 rounded-xl border px-5 py-4 backdrop-blur transition ${
                    d.status === "open"
                      ? "border-[color:var(--gold)]/50 bg-background/70 hover:border-[color:var(--gold)]"
                      : "border-border/60 bg-background/40"
                  }`}
                >
                  <div>
                    <div className="font-display text-lg">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.purpose}</div>
                  </div>
                  <div className="shrink-0 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                    {d.status === "open"
                      ? "Open"
                      : d.status === "building"
                        ? "In build"
                        : "Planned"}
                  </div>
                </div>
              );
              return d.status === "open" && d.to && d.to !== "/welcome-hall" ? (
                <Link key={d.id} to={d.to}>
                  {inner}
                </Link>
              ) : (
                <div key={d.id} className={d.status === "open" ? "" : "opacity-60"}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* Doors that already exist */}
        <section className="mt-16 grid gap-3 sm:grid-cols-3">
          <Link
            to="/workspace/profile"
            className="rounded-xl border border-border/70 bg-background/60 px-5 py-4 text-center backdrop-blur transition hover:border-[color:var(--gold)]"
          >
            <div className="font-display text-base">Builder Identity</div>
            <div className="mt-1 text-xs text-muted-foreground">Profile, handle, stage</div>
          </Link>
          <Link
            to="/workspace/insights"
            className="rounded-xl border border-border/70 bg-background/60 px-5 py-4 text-center backdrop-blur transition hover:border-[color:var(--gold)]"
          >
            <div className="font-display text-base">Builder Insights</div>
            <div className="mt-1 text-xs text-muted-foreground">Patterns across your work</div>
          </Link>
          <Link
            to="/onboarding"
            className="rounded-xl border border-border/70 bg-background/60 px-5 py-4 text-center backdrop-blur transition hover:border-[color:var(--gold)]"
          >
            <div className="font-display text-base">Your Journey</div>
            <div className="mt-1 text-xs text-muted-foreground">Revisit any chapter</div>
          </Link>
        </section>
      </div>
      <PageFeedback pageTitle="Welcome Hall" />
    </SiteShell>
  );
}
