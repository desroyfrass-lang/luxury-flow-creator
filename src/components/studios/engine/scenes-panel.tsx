// FRASS-0601 — Scene Breakdown and scene-level work.
// Regenerating Scene 7 never touches Scenes 1–6 or 8 onward. That rule is what
// keeps generation spend under control.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { breakdownScenes, reviseScene } from "@/lib/studios/production-engine.functions";
import { useScenes, logStudioActivity } from "@/lib/studios/use-studios";
import { useSceneVersions } from "@/lib/studios/use-engine";
import { findReusableAsset, reuseSummary, routeGeneration } from "@/lib/studios/generation-layer";

type ReuseNote = { action: string; note: string };

export function ScenesPanel({
  production,
  scriptApproved,
  assets,
  animations,
  providers,
}: {
  production: any;
  scriptApproved: boolean;
  assets: any[];
  animations: any[];
  providers: any[];
}) {
  const qc = useQueryClient();
  const { data: scenes = [] } = useScenes(production.id);
  const breakdown = useServerFn(breakdownScenes);
  const revise = useServerFn(reviseScene);
  const [busy, setBusy] = useState<string | null>(null);
  const [openScene, setOpenScene] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const { data: history = [] } = useSceneVersions(historyFor);

  const library = [...assets, ...animations];

  const run = async () => {
    setBusy("breakdown");
    try {
      const res = await breakdown({ data: { productionId: production.id } });
      qc.invalidateQueries({ queryKey: ["studio"] });
      toast.success(`${res.scenes.length} scenes ready. ${res.reuse.plain}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't break that down.");
    } finally {
      setBusy(null);
    }
  };

  const rewriteScene = async (sceneId: string) => {
    setBusy(sceneId);
    try {
      const res = await revise({ data: { productionId: production.id, sceneId, instruction: note } });
      setNote("");
      qc.invalidateQueries({ queryKey: ["studio", "scenes", production.id] });
      toast.success(String(res.note ?? "Scene rewritten. Every other scene untouched."));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't rewrite that scene.");
    } finally {
      setBusy(null);
    }
  };

  /** Queue media work for ONE scene. Nothing is generated until a service is connected. */
  const queueScene = async (scene: any, capability: "imageGeneration" | "videoGeneration" | "voiceGeneration" | "animationGeneration") => {
    const decision = routeGeneration(capability, providers as never, "consistency");
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("studio_generation_jobs").insert({
      production_id: production.id,
      scene_id: scene.id,
      job_type: capability,
      target_kind: "scene",
      provider: decision.ok ? decision.provider.slug : null,
      status: decision.ok ? "queued" : "awaiting_provider",
      prompt: scene.visual_prompt ?? scene.title ?? "",
      created_by: auth.user?.id ?? null,
      output: decision.ok ? {} : { note: decision.reason },
      error: decision.ok ? null : decision.reason,
    });
    if (error) return toast.error(error.message);
    await supabase.from("studio_scenes").update({ generation_status: "queued" }).eq("id", scene.id);
    await logStudioActivity("scene_generation_queued", "scene", scene.id, { capability });
    qc.invalidateQueries({ queryKey: ["studio"] });
    toast.success(decision.ok ? `Queued for ${decision.provider.label}.` : decision.reason);
  };

  const setApproval = async (scene: any, status: string) => {
    await supabase.from("studio_scenes").update({ approval_status: status }).eq("id", scene.id);
    await logStudioActivity("scene_" + status, "scene", scene.id);
    qc.invalidateQueries({ queryKey: ["studio", "scenes", production.id] });
  };

  const duplicateScene = async (scene: any) => {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = scene as Record<string, any>;
    await supabase.from("studio_scenes").insert({
      ...rest,
      scene_number: Number(scene.scene_number) + 0.5,
      title: `${scene.title ?? "Scene"} (copy)`,
      approval_status: "draft",
      generation_status: "not_started",
    });
    qc.invalidateQueries({ queryKey: ["studio", "scenes", production.id] });
    toast.success("Scene duplicated.");
  };

  const move = async (scene: any, direction: -1 | 1) => {
    const ordered = [...scenes].sort((a: any, b: any) => a.scene_number - b.scene_number);
    const index = ordered.findIndex((s: any) => s.id === scene.id);
    const swap = ordered[index + direction];
    if (!swap) return;
    await Promise.all([
      supabase.from("studio_scenes").update({ scene_number: swap.scene_number }).eq("id", scene.id),
      supabase.from("studio_scenes").update({ scene_number: scene.scene_number }).eq("id", swap.id),
    ]);
    qc.invalidateQueries({ queryKey: ["studio", "scenes", production.id] });
  };

  const restoreVersion = async (version: any) => {
    const snap = version.snapshot ?? {};
    const { id: _i, created_at: _c, updated_at: _u, ...rest } = snap;
    await supabase.from("studio_scenes").update(rest).eq("id", version.scene_id);
    qc.invalidateQueries({ queryKey: ["studio", "scenes", production.id] });
    toast.success("Earlier version restored.");
  };

  const reuseFor = (scene: any): ReuseNote[] => {
    const notes: ReuseNote[] = [];
    if (scene.location) notes.push(findReusableAsset(scene.location, library as never));
    for (const c of scene.characters ?? []) notes.push(findReusableAsset(c, library as never));
    return notes;
  };

  const allDecisions = scenes.flatMap((s: any) => reuseFor(s));
  const summary = reuseSummary(allDecisions as never);

  return (
    <div className="space-y-5">
      <StudioCard eyebrow="Step 5 — make it makeable" title="Scene breakdown">
        {!scriptApproved ? (
          <p className="text-sm text-muted-foreground">Approve the script first. Scenes come from an approved script, never a draft.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Frassy turns the approved script into scenes that can each be made on their own. Redoing one scene never
              redoes the others — that is how you keep control of what generation costs.
            </p>
            <div className="mt-3">
              <GoldButton onClick={run} disabled={busy !== null}>
                {busy === "breakdown" ? "Frassy is breaking it down…" : scenes.length ? "Rebuild the scene list" : "Break the script into scenes"}
              </GoldButton>
            </div>
            {scenes.length ? <p className="mt-3 text-xs text-muted-foreground">{summary.plain}</p> : null}
          </>
        )}
      </StudioCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {[...scenes]
          .sort((a: any, b: any) => a.scene_number - b.scene_number)
          .map((scene: any) => {
            const open = openScene === scene.id;
            const notes = reuseFor(scene);
            const reused = notes.filter((n) => n.action === "reuse");
            return (
              <div key={scene.id} className="rounded-lg border border-border/70 bg-card/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                      Scene {scene.scene_number} · {scene.duration_seconds ? `${scene.duration_seconds}s` : "length not set"}
                    </div>
                    <h3 className="font-display text-lg uppercase tracking-tight">{scene.title ?? "Untitled scene"}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      📍 {scene.location ?? "no location"} · 🧑🏾‍🎤 {(scene.characters ?? []).join(", ") || "no characters"}
                    </p>
                  </div>
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                      scene.approval_status === "approved"
                        ? "border-emerald-500/60 text-emerald-400"
                        : scene.approval_status === "changes_required"
                          ? "border-red-500/60 text-red-400"
                          : "border-border/70 text-muted-foreground"
                    }`}
                  >
                    {scene.approval_status}
                  </span>
                </div>

                {scene.script ? <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{scene.script}</p> : null}
                {scene.dialogue ? (
                  <div className="mt-3 border-l-2 border-[color:var(--gold)]/40 pl-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">Dialogue</div>
                    <p className="whitespace-pre-wrap text-sm">{scene.dialogue}</p>
                  </div>
                ) : null}
                {scene.narration ? (
                  <div className="mt-2 border-l-2 border-border pl-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Narration</div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{scene.narration}</p>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {scene.camera_direction ? <span>🎥 {scene.camera_direction}</span> : null}
                  {scene.music ? <span>🎵 {scene.music}</span> : null}
                  {scene.sfx ? <span>🔊 {scene.sfx}</span> : null}
                  {scene.animation_notes ? <span>🌀 {scene.animation_notes}</span> : null}
                </div>

                {reused.length ? (
                  <div className="mt-3 rounded-sm border border-emerald-600/40 bg-emerald-500/5 p-2 text-xs text-emerald-300">
                    ♻️ Approved asset reused — {reused.map((r) => r.note).join(" ")}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[
                    ["Generate", () => queueScene(scene, "videoGeneration")],
                    ["Still image", () => queueScene(scene, "imageGeneration")],
                    ["Voice", () => queueScene(scene, "voiceGeneration")],
                    ["Animation", () => queueScene(scene, "animationGeneration")],
                    ["Edit with Frassy", () => setOpenScene(open ? null : scene.id)],
                    ["Duplicate", () => duplicateScene(scene)],
                    ["Move up", () => move(scene, -1)],
                    ["Move down", () => move(scene, 1)],
                    ["History", () => setHistoryFor(historyFor === scene.id ? null : scene.id)],
                    ["Approve", () => setApproval(scene, "approved")],
                    ["Needs changes", () => setApproval(scene, "changes_required")],
                  ].map(([label, fn]) => (
                    <button
                      key={label as string}
                      onClick={fn as () => void}
                      disabled={busy === scene.id}
                      className="rounded-sm border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] disabled:opacity-40"
                    >
                      {label as string}
                    </button>
                  ))}
                </div>

                {open ? (
                  <div className="mt-3 rounded-sm border border-border/60 bg-background/40 p-3">
                    <input
                      className={inputClass}
                      placeholder="Make it funnier. Shorten it. Change the character. Change the mood."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="mt-2">
                      <QuietButton onClick={() => rewriteScene(scene.id)} disabled={busy !== null}>
                        {busy === scene.id ? "Frassy is rewriting…" : "Rewrite this scene only"}
                      </QuietButton>
                    </div>
                  </div>
                ) : null}

                {historyFor === scene.id ? (
                  <div className="mt-3 rounded-sm border border-border/60 bg-background/40 p-3 text-xs">
                    {history.length === 0 ? (
                      <p className="text-muted-foreground">No earlier versions yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {history.map((v: any) => (
                          <li key={v.id} className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">
                              {v.change_note ?? "Saved"} — {new Date(v.created_at).toLocaleString()}
                            </span>
                            <button onClick={() => restoreVersion(v)} className="text-[color:var(--gold)] underline">
                              Restore
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}
