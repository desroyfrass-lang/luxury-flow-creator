// FRASS-0601 — the Episode Development workspace.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { developEpisode } from "@/lib/studios/production-engine.functions";
import { useDevelopment } from "@/lib/studios/use-engine";
import { logStudioActivity } from "@/lib/studios/use-studios";

function List({ title, items, render }: { title: string; items: any[]; render: (i: any) => React.ReactNode }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-sm border border-border/60 bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">{title}</div>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{render(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export function DevelopmentPanel({ production, briefApproved }: { production: any; briefApproved: boolean }) {
  const qc = useQueryClient();
  const { data: versions = [] } = useDevelopment(production.id);
  const develop = useServerFn(developEpisode);
  const [busy, setBusy] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [proposals, setProposals] = useState<string[]>([]);
  const [viewing, setViewing] = useState<string | null>(null);

  const current = versions.find((v: any) => v.is_current) ?? versions[0] ?? null;
  const shown = viewing ? versions.find((v: any) => v.id === viewing) ?? current : current;

  const run = async () => {
    setBusy(true);
    try {
      const res = await develop({ data: { productionId: production.id, instruction } });
      setProposals((res.canonProposals as string[]) ?? []);
      setInstruction("");
      setViewing(null);
      qc.invalidateQueries({ queryKey: ["studio"] });
      toast.success("Frassy developed the episode.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't develop that.");
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!current) return;
    await supabase
      .from("studio_episode_development")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", current.id);
    await logStudioActivity("development_approved", "production", production.id);
    qc.invalidateQueries({ queryKey: ["studio", "development", production.id] });
    toast.success("Story approved. Frassy can write the script.");
  };

  return (
    <div className="space-y-5">
      <StudioCard eyebrow="Step 3 — build the story" title="Episode Development">
        {!briefApproved ? (
          <p className="text-sm text-muted-foreground">
            Approve the Production Brief first. Frassy develops from an agreed plan, never from a guess.
          </p>
        ) : (
          <>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Anything extra Frassy should know before she develops it?"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <GoldButton onClick={run} disabled={busy}>
                {busy ? "Frassy is developing…" : current ? "Regenerate the story" : "Develop this episode"}
              </GoldButton>
              {current ? (
                <QuietButton onClick={approve} disabled={current.status === "approved"}>
                  {current.status === "approved" ? "Story approved ✓" : "Approve the story"}
                </QuietButton>
              ) : null}
            </div>
          </>
        )}
      </StudioCard>

      {proposals.length ? (
        <StudioCard eyebrow="Needs your word" title="Frassy is proposing canon changes">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {proposals.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            She hasn't changed anything. Add these to the Series Bible yourself if you agree.
          </p>
        </StudioCard>
      ) : null}

      {shown ? (
        <StudioCard
          eyebrow={`Version ${shown.version}${shown.is_current ? " — current" : ""}`}
          title={shown.concept ? "The story" : "Development"}
          footer={
            versions.length > 1 ? (
              <div className="flex flex-wrap gap-1.5">
                {versions.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setViewing(v.id)}
                    className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                      shown.id === v.id ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border/70 text-muted-foreground"
                    }`}
                  >
                    v{v.version}
                  </button>
                ))}
              </div>
            ) : null
          }
        >
          <div className="space-y-3">
            {shown.concept ? (
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Concept</div>
                <p className="mt-1 text-sm">{shown.concept}</p>
              </div>
            ) : null}
            {shown.synopsis ? (
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Synopsis</div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{shown.synopsis}</p>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <List title="Story beats" items={(shown.story_beats as any[]) ?? []} render={(b) => `${b.label}: ${b.beat}`} />
              <List
                title="Character roles"
                items={(shown.character_roles as any[]) ?? []}
                render={(c) => `${c.name}${c.existing ? " (existing)" : " (new)"} — ${c.purpose}`}
              />
              <List title="Locations" items={(shown.locations as any[]) ?? []} render={(l) => `${l.name}${l.existing ? " (existing)" : " (new)"} — ${l.note}`} />
              <List title="Continuity connections" items={(shown.continuity_connections as any[]) ?? []} render={(c) => `${c.episode}: ${c.connection}`} />
              <List
                title="Content opportunities"
                items={(shown.content_opportunities as any[]) ?? []}
                render={(o) => `${o.moment} → ${o.format} (${o.why})`}
              />
            </div>
            {shown.educational_objective ? (
              <div className="rounded-sm border border-border/60 bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Educational objective</div>
                <p className="mt-1 text-sm text-muted-foreground">{shown.educational_objective}</p>
              </div>
            ) : null}
          </div>
        </StudioCard>
      ) : null}
    </div>
  );
}
