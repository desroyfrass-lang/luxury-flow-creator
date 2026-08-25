// FRASS-0600 — one production: overview, Scene Studio, derivatives, provenance.
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProduction, useScenes, useDerivatives, logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, Field, GoldButton, QuietButton, StatusPill, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import {
  DERIVATIVE_TYPES,
  PRODUCTION_STATUSES,
  RIGHTS_STATUSES,
  canPublishRights,
  prettify,
} from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/production/$id")({
  head: () => ({
    meta: [
      { title: "Production | Frassy Studios" },
      { name: "description", content: "Scene by scene control of a single Frass Hill production." },
      { property: "og:title", content: "Production | Frassy Studios" },
      { property: "og:description", content: "Scenes, derivatives, rights and approval for one production." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProductionDetail,
});

function ProductionDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: production, isLoading } = useProduction(id);
  const { data: scenes = [] } = useScenes(id);
  const { data: derivatives = [] } = useDerivatives(id);
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["studio"] });

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening the production…</p>;
  if (!production)
    return <EmptyState title="Production not found" body="It may have been archived or removed." />;

  const setStatus = async (status: string) => {
    setBusy(true);
    const { error } = await supabase.from("studio_productions").update({ status }).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await logStudioActivity("production.status", "production", id, { status });
    toast.success(`Moved to ${prettify(status)}.`);
    refresh();
  };

  const setRights = async (rights_status: string) => {
    const { error } = await supabase.from("studio_productions").update({ rights_status }).eq("id", id);
    if (error) return toast.error(error.message);
    await logStudioActivity("production.rights", "production", id, { rights_status });
    refresh();
  };

  const addScene = async () => {
    const next = (scenes[scenes.length - 1]?.scene_number ?? 0) + 1;
    const { error } = await supabase.from("studio_scenes").insert({ production_id: id, scene_number: next, title: `Scene ${next}` });
    if (error) return toast.error(error.message);
    refresh();
  };

  const sceneAction = async (sceneId: string, patch: Record<string, unknown>, jobType?: string) => {
    const { error } = await supabase.from("studio_scenes").update(patch as never).eq("id", sceneId);
    if (error) return toast.error(error.message);
    if (jobType) {
      await supabase.from("studio_generation_jobs").insert({
        production_id: id,
        scene_id: sceneId,
        job_type: jobType,
        status: "queued",
        provider: null,
        prompt: null,
      });
      toast.success("Queued. This scene only — the rest of the production is untouched.");
    }
    refresh();
  };

  const duplicateScene = async (scene: (typeof scenes)[number]) => {
    const { id: _drop, created_at: _c, updated_at: _u, ...rest } = scene as unknown as Record<string, unknown>;
    const next = (scenes[scenes.length - 1]?.scene_number ?? 0) + 1;
    const { error } = await supabase.from("studio_scenes").insert({ ...(rest as object), scene_number: next } as never);
    if (error) return toast.error(error.message);
    refresh();
  };

  const createDerivative = async (kind: (typeof DERIVATIVE_TYPES)[number]) => {
    setBusy(true);
    const { data, error } = await supabase
      .from("studio_productions")
      .insert({
        series_id: production.series_id,
        title: `${production.title} — ${kind.label}`,
        production_type: kind.type,
        aspect_ratio: kind.ratio,
        target_duration_seconds: kind.seconds,
        audience: production.audience,
        age_group: production.age_group,
        status: "draft",
        is_master: false,
        master_production_id: production.id,
        rights_status: production.rights_status,
      })
      .select("id")
      .single();
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    await supabase.from("studio_production_derivatives").insert({
      master_production_id: production.id,
      derivative_production_id: data.id,
      derivative_type: kind.value,
    });
    setBusy(false);
    toast.success(`${kind.label} created and linked to this master.`);
    refresh();
  };

  const queuePublishing = async () => {
    if (production.status !== "approved") return toast.error("Only approved work can enter the publishing queue.");
    if (!canPublishRights(production.rights_status))
      return toast.error("Rights say this must never be published. The queue is closed to it.");
    const targets = production.destinations?.length ? production.destinations : ["frass_hill"];
    const { error } = await supabase.from("studio_publish_jobs").insert(
      targets.map((platform) => ({
        production_id: production.id,
        platform,
        format: production.aspect_ratio,
        status: "approved",
      })),
    );
    if (error) return toast.error(error.message);
    toast.success("Added to the publishing queue. Nothing goes out until a platform is connected and you schedule it.");
    refresh();
  };

  return (
    <>
      <Link to="/studios/productions" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        ← All productions
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            {production.studio_series?.name ?? "No series"} · {prettify(production.production_type)}
          </div>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-tight">{production.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill status={production.status} />
            <span className="text-xs text-muted-foreground">
              {production.aspect_ratio} · {production.target_duration_seconds ?? "—"}s ·{" "}
              {production.is_master ? "Master" : "Derivative"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={inputClass} value={production.status} onChange={(e) => setStatus(e.target.value)} disabled={busy}>
            {PRODUCTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select className={inputClass} value={production.rights_status} onChange={(e) => setRights(e.target.value)}>
            {RIGHTS_STATUSES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Link
            to="/studios/engine/$id"
            params={{ id }}
            className="rounded-sm border border-[color:var(--gold)] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/10"
          >
            ✨ Build it with Frassy
          </Link>
          <GoldButton onClick={queuePublishing}>Send to publishing</GoldButton>
        </div>
      </div>

      <StudioSection title="Creative direction">
        <div className="grid gap-3 md:grid-cols-2">
          <StudioCard title="Concept">
            <p className="text-sm text-muted-foreground">{production.concept || "Nothing written yet."}</p>
          </StudioCard>
          <StudioCard title="Direction">
            <dl className="space-y-1 text-sm text-muted-foreground">
              <Row label="Story goal" value={production.story_goal} />
              <Row label="Educational objective" value={production.educational_objective} />
              <Row label="Characters" value={production.characters} />
              <Row label="Location" value={production.location} />
              <Row label="Mood" value={production.mood} />
              <Row label="Visual style" value={production.visual_style} />
              <Row label="Music" value={production.music_direction} />
              <Row label="Narrator" value={production.narrator} />
              <Row label="Destinations" value={(production.destinations ?? []).map(prettify).join(", ")} />
            </dl>
          </StudioCard>
        </div>
      </StudioSection>

      <StudioSection
        title="Scene Studio"
        hint="Change one scene without touching the rest of the production."
        action={<QuietButton onClick={addScene}>+ Add scene</QuietButton>}
      >
        {scenes.length === 0 ? (
          <EmptyState title="No scenes yet" body="Add a scene, or ask Frassy to break the concept into a scene breakdown." />
        ) : (
          <div className="space-y-3">
            {scenes.map((s) => (
              <SceneRow key={s.id} scene={s} onAction={sceneAction} onDuplicate={() => duplicateScene(s)} />
            ))}
          </div>
        )}
      </StudioSection>

      {production.is_master ? (
        <StudioSection title="Master → derivatives" hint="Every cut stays linked to this master. Nothing becomes orphan content.">
          <div className="flex flex-wrap gap-2">
            {DERIVATIVE_TYPES.map((d) => (
              <QuietButton key={d.value} onClick={() => createDerivative(d)} disabled={busy}>
                + {d.label}
              </QuietButton>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {derivatives.map((d) => (
              <Link key={d.id} to="/studios/production/$id" params={{ id: d.derivative_production_id }}>
                <StudioCard eyebrow={prettify(d.derivative_type)} title={d.derivative?.title ?? "Derivative"}>
                  <StatusPill status={d.derivative?.status ?? "draft"} />
                </StudioCard>
              </Link>
            ))}
          </div>
        </StudioSection>
      ) : (
        <StudioSection title="Master production" hint="This is a cut of a larger piece of work.">
          {production.master_production_id ? (
            <Link
              to="/studios/production/$id"
              params={{ id: production.master_production_id }}
              className="text-sm text-[color:var(--gold)]"
            >
              Open the master production →
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No master recorded.</p>
          )}
        </StudioSection>
      )}

      <StudioSection title="Ownership & provenance">
        <StudioCard>
          <dl className="space-y-1 text-sm text-muted-foreground">
            <Row label="Internal production ID" value={production.id} />
            <Row label="Rights status" value={prettify(production.rights_status)} />
            <Row label="Publishable" value={canPublishRights(production.rights_status) ? "Yes" : "No — blocked from the queue"} />
            <Row label="Created" value={new Date(production.created_at).toLocaleString()} />
          </dl>
        </StudioCard>
      </StudioSection>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/40 py-1 last:border-0">
      <dt className="text-[10px] uppercase tracking-[0.2em]">{label}</dt>
      <dd className="text-right text-foreground">{value || "—"}</dd>
    </div>
  );
}

function SceneRow({
  scene,
  onAction,
  onDuplicate,
}: {
  scene: Record<string, never> | any;
  onAction: (id: string, patch: Record<string, unknown>, jobType?: string) => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: scene.title ?? "",
    script: scene.script ?? "",
    dialogue: scene.dialogue ?? "",
    narration: scene.narration ?? "",
    location: scene.location ?? "",
    camera_direction: scene.camera_direction ?? "",
    visual_prompt: scene.visual_prompt ?? "",
    music: scene.music ?? "",
    sfx: scene.sfx ?? "",
    animation_notes: scene.animation_notes ?? "",
    duration_seconds: String(scene.duration_seconds ?? ""),
  });

  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">Scene {scene.scene_number}</div>
          <div className="font-display text-lg uppercase tracking-tight">{scene.title || "Untitled scene"}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={scene.generation_status} tint={scene.generation_status === "generated" ? "good" : "warn"} />
          <StatusPill status={scene.approval_status} tint={scene.approval_status === "approved" ? "good" : "muted"} />
          <QuietButton onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Edit scene"}</QuietButton>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <QuietButton onClick={() => onAction(scene.id, { generation_status: "queued" }, "scene")}>Generate scene</QuietButton>
        <QuietButton onClick={() => onAction(scene.id, { generation_status: "queued" }, "rescene")}>Regenerate scene</QuietButton>
        <QuietButton onClick={onDuplicate}>Duplicate</QuietButton>
        <QuietButton onClick={() => onAction(scene.id, { asset_url: null }, undefined)}>Replace asset</QuietButton>
        <QuietButton onClick={() => onAction(scene.id, { duration_seconds: (scene.duration_seconds ?? 10) + 5 })}>Extend</QuietButton>
        <QuietButton onClick={() => onAction(scene.id, { duration_seconds: Math.max(1, (scene.duration_seconds ?? 10) - 5) })}>
          Shorten
        </QuietButton>
        <QuietButton onClick={() => onAction(scene.id, { approval_status: "approved" })}>Approve scene</QuietButton>
      </div>

      {open ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(
            [
              ["title", "Scene title"],
              ["duration_seconds", "Duration (seconds)"],
              ["location", "Location"],
              ["camera_direction", "Camera direction"],
              ["music", "Music"],
              ["sfx", "Sound effects"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={inputClass}
                value={(draft as Record<string, string>)[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </Field>
          ))}
          {(
            [
              ["script", "Script"],
              ["dialogue", "Dialogue"],
              ["narration", "Narration"],
              ["visual_prompt", "Visual prompt"],
              ["animation_notes", "Animation instructions"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea
                rows={3}
                className={inputClass}
                value={(draft as Record<string, string>)[key]}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </Field>
          ))}
          <div className="md:col-span-2">
            <GoldButton
              onClick={() =>
                onAction(scene.id, {
                  ...draft,
                  duration_seconds: draft.duration_seconds ? Number(draft.duration_seconds) : null,
                })
              }
            >
              Save scene
            </GoldButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
