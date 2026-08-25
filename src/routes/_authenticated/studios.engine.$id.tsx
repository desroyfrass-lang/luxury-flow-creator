// FRASS-0601 — the Frassy Production Engine for one production.
// Brief → Bible → Development → Script → Scenes → Continuity → Master & Packages.
// Nothing publishes from here.
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProduction, useAssets } from "@/lib/studios/use-studios";
import { useBrief, useScript, useAnimations, useProviders, useContinuityFindings } from "@/lib/studios/use-engine";
import { EmptyState, StudioSection } from "@/components/studios/studio-ui";
import { BriefPanel } from "@/components/studios/engine/brief-panel";
import { BiblePanel } from "@/components/studios/engine/bible-panel";
import { DevelopmentPanel } from "@/components/studios/engine/development-panel";
import { ScriptPanel } from "@/components/studios/engine/script-panel";
import { ScenesPanel } from "@/components/studios/engine/scenes-panel";
import { ContinuityPanel } from "@/components/studios/engine/continuity-panel";
import { MasterPanel } from "@/components/studios/engine/master-panel";
import { FrassyChat } from "@/components/frassy-chat";

export const Route = createFileRoute("/_authenticated/studios/engine/$id")({
  head: () => ({
    meta: [
      { title: "Production Engine | Frassy Studios" },
      { name: "description", content: "Brief, bible, development, script, scenes, continuity and platform packages for one Frass Hill production." },
      { property: "og:title", content: "Production Engine | Frassy Studios" },
      { property: "og:description", content: "Frassy develops the episode with you, scene by scene, and nothing leaves without your word." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EnginePage,
});

const TABS = [
  { id: "brief", label: "Brief", icon: "📝" },
  { id: "bible", label: "Series Bible", icon: "📚" },
  { id: "development", label: "Development", icon: "💡" },
  { id: "script", label: "Script", icon: "🎬" },
  { id: "scenes", label: "Scenes", icon: "🎥" },
  { id: "continuity", label: "Continuity", icon: "🧭" },
  { id: "master", label: "Master & Versions", icon: "🏆" },
] as const;

function EnginePage() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("brief");
  const { data: production, isLoading } = useProduction(id);
  const { data: brief } = useBrief(id);
  const { data: script } = useScript(id);
  const { data: assets = [] } = useAssets();
  const { data: animations = [] } = useAnimations();
  const { data: providers = [] } = useProviders();
  const { data: findings = [] } = useContinuityFindings(id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening the engine…</p>;
  if (!production) return <EmptyState title="Production not found" body="It may have been archived or removed." />;

  const openFlags = findings.filter((f: any) => f.resolution === "open").length;

  return (
    <StudioSection
      title={production.title}
      hint="Frassy develops it with you, step by step. Nothing is published from this room."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
        <Link to="/studios/production/$id" params={{ id }} className="text-muted-foreground underline hover:text-foreground">
          ← Production overview
        </Link>
        <span className="text-muted-foreground">
          {brief?.approval_status === "approved" ? "Brief approved ✓" : "Brief not approved"} ·{" "}
          {script?.approval_status === "approved" ? "Script approved ✓" : "Script not approved"}
          {openFlags ? ` · ${openFlags} continuity flag(s) open` : ""}
        </span>
      </div>

      <nav className="mb-6 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-sm border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
              tab === t.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {tab === "brief" ? <BriefPanel production={production} /> : null}
          {tab === "bible" ? <BiblePanel production={production} /> : null}
          {tab === "development" ? <DevelopmentPanel production={production} briefApproved={brief?.approval_status === "approved"} /> : null}
          {tab === "script" ? <ScriptPanel production={production} /> : null}
          {tab === "scenes" ? (
            <ScenesPanel
              production={production}
              scriptApproved={script?.approval_status === "approved"}
              assets={assets}
              animations={animations}
              providers={providers}
            />
          ) : null}
          {tab === "continuity" ? <ContinuityPanel production={production} /> : null}
          {tab === "master" ? <MasterPanel production={production} assets={assets} /> : null}
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-lg border border-border/70 bg-card/60 p-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Frassy — in the room</div>
            <p className="mt-1 mb-3 text-xs text-muted-foreground">
              She knows this production, its series and its rules. Ask her anything about it.
            </p>
            <FrassyChat embedded tone="dark" />
          </div>
        </aside>
      </div>
    </StudioSection>
  );
}
