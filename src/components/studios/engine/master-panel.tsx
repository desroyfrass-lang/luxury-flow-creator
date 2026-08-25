// FRASS-0601 — Master Production, derivatives and platform packages.
// The Master is canonical. A social cut never overwrites it.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { buildPlatformPackage, suggestClips } from "@/lib/studios/production-engine.functions";
import { useMaster, usePackages } from "@/lib/studios/use-engine";
import { logStudioActivity, useScenes } from "@/lib/studios/use-studios";
import { canPublishRights, DERIVATIVE_TYPES, PLATFORMS, RIGHTS_STATUSES } from "@/lib/studios/studios";

export function MasterPanel({ production, assets }: { production: any; assets: any[] }) {
  const qc = useQueryClient();
  const { data: master } = useMaster(production.id);
  const { data: packages = [] } = usePackages(production.id);
  const { data: scenes = [] } = useScenes(production.id);
  const suggest = useServerFn(suggestClips);
  const buildPackage = useServerFn(buildPlatformPackage);
  const [busy, setBusy] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const approvedScenes = scenes.filter((s: any) => s.approval_status === "approved");
  const allApproved = scenes.length > 0 && approvedScenes.length === scenes.length;
  const runtime = scenes.reduce((sum: number, s: any) => sum + (s.duration_seconds ?? 0), 0);

  // Rights check — one blocked asset blocks publishing approval, and says why.
  const usedAssetNames = new Set<string>(scenes.flatMap((s: any) => [...(s.characters ?? []), s.location].filter(Boolean)));
  const blockers = assets
    .filter((a) => usedAssetNames.has(a.name) && !canPublishRights(a.rights_status))
    .map((a) => `${a.name} — ${RIGHTS_STATUSES.find((r) => r.value === a.rights_status)?.label ?? a.rights_status}`);
  if (!canPublishRights(production.rights_status))
    blockers.push(`This production is marked ${RIGHTS_STATUSES.find((r) => r.value === production.rights_status)?.label ?? production.rights_status}`);

  const createMaster = async () => {
    setBusy("master");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("studio_masters").insert({
        production_id: production.id,
        series_id: production.series_id,
        episode_number: production.episode_number,
        version: (master?.version ?? 0) + 1,
        runtime_seconds: runtime || null,
        scene_count: scenes.length,
        rights_status: production.rights_status,
        rights_blockers: blockers,
        approval_status: blockers.length ? "blocked" : "not_approved",
        created_by: auth.user?.id ?? null,
      });
      if (error) throw new Error(error.message);
      await supabase.from("studio_productions").update({ is_master: true, status: "review" }).eq("id", production.id);
      await logStudioActivity("master_created", "production", production.id);
      qc.invalidateQueries({ queryKey: ["studio"] });
      toast.success("Master production recorded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't record the master.");
    } finally {
      setBusy(null);
    }
  };

  const approveMaster = async () => {
    if (!master) return;
    if (blockers.length) return toast.error("Rights are not clear yet — see the blockers below.");
    const { data: auth } = await supabase.auth.getUser();
    await supabase
      .from("studio_masters")
      .update({ approval_status: "approved", approved_at: new Date().toISOString(), approved_by: auth.user?.id ?? null })
      .eq("id", master.id);
    await supabase.from("studio_productions").update({ status: "approved" }).eq("id", production.id);
    await logStudioActivity("master_approved", "production", production.id);
    qc.invalidateQueries({ queryKey: ["studio"] });
    toast.success("Master approved.");
  };

  const findClips = async () => {
    setBusy("clips");
    try {
      setSuggestions((await suggest({ data: { productionId: production.id } })) as any[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't suggest clips.");
    } finally {
      setBusy(null);
    }
  };

  /** Create the derivative production, linked to — never replacing — the master. */
  const createDerivative = async (s: any) => {
    const spec = DERIVATIVE_TYPES.find((d) => d.value === s.derivative_type) ?? DERIVATIVE_TYPES[2];
    const { data: auth } = await supabase.auth.getUser();
    const { data: created, error } = await supabase
      .from("studio_productions")
      .insert({
        title: `${production.title} — ${spec.label}`,
        series_id: production.series_id,
        production_type: spec.type,
        aspect_ratio: spec.ratio,
        target_duration_seconds: s.seconds ?? spec.seconds,
        audience: production.audience,
        age_group: production.age_group,
        destinations: [s.platform],
        concept: s.hook,
        story_goal: s.why,
        master_production_id: production.id,
        rights_status: production.rights_status,
        status: "draft",
        created_by: auth.user?.id ?? null,
      })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    await supabase.from("studio_production_derivatives").insert({
      master_production_id: production.id,
      derivative_production_id: created.id,
      derivative_type: s.derivative_type,
    });
    await logStudioActivity("derivative_created", "production", created.id, { from: production.id });
    qc.invalidateQueries({ queryKey: ["studio"] });
    toast.success(`${spec.label} created. The master is untouched.`);
  };

  const writePackage = async (platform: string, derivativeType?: string) => {
    setBusy(`pkg:${platform}`);
    try {
      await buildPackage({ data: { productionId: production.id, platform, derivativeType, masterId: master?.id } });
      qc.invalidateQueries({ queryKey: ["studio", "packages", production.id] });
      toast.success("Package written. Read it before you approve it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't write the package.");
    } finally {
      setBusy(null);
    }
  };

  /** The line Build 2 stops at: approved package → publishing queue. Nothing leaves Frass. */
  const queueForPublishing = async (pkg: any) => {
    if (!canPublishRights(pkg.rights_status)) return toast.error("Rights must be clear before anything joins the queue.");
    if (master?.approval_status !== "approved") return toast.error("Approve the master production first.");
    await supabase
      .from("studio_platform_packages")
      .update({ status: "queued", approved_at: new Date().toISOString(), queued_at: new Date().toISOString() })
      .eq("id", pkg.id);
    const { error } = await supabase.from("studio_publish_jobs").insert({
      production_id: production.id,
      platform: pkg.platform,
      format: pkg.derivative_type,
      status: "not_ready",
    });
    if (error) return toast.error(error.message);
    await logStudioActivity("package_queued", "production", production.id, { platform: pkg.platform });
    qc.invalidateQueries({ queryKey: ["studio"] });
    toast.success("In the publishing queue. Nothing goes out until a channel is connected and you say so.");
  };

  return (
    <div className="space-y-5">
      <StudioCard
        eyebrow={master ? `Master v${master.version} · ${master.approval_status.replace("_", " ")}` : "Step 7 — lock the finished work"}
        title="Master Production"
        footer={`${approvedScenes.length} of ${scenes.length} scenes approved · runtime ${Math.round(runtime / 60)} min`}
      >
        <p className="text-sm text-muted-foreground">
          The master is the real thing. Every social cut points back to it, and none of them can overwrite it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <GoldButton onClick={createMaster} disabled={busy !== null || !allApproved}>
            {master ? "Record a new master version" : "Create the master"}
          </GoldButton>
          {master ? (
            <QuietButton onClick={approveMaster} disabled={master.approval_status === "approved" || blockers.length > 0}>
              {master.approval_status === "approved" ? "APPROVED ✓" : "Approve the master"}
            </QuietButton>
          ) : null}
        </div>
        {!allApproved ? (
          <p className="mt-3 text-xs text-muted-foreground">Every scene has to be approved before a master can be created.</p>
        ) : null}
        {blockers.length ? (
          <div className="mt-4 rounded-sm border border-red-500/50 bg-red-500/5 p-3 text-sm text-red-300">
            <div className="text-[10px] uppercase tracking-[0.24em]">Rights check — publishing blocked</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {blockers.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 rounded-sm border border-emerald-600/40 bg-emerald-500/5 p-3 text-sm text-emerald-300">
            Rights check passed — everything in this production is clear to publish.
          </div>
        )}
      </StudioCard>

      <StudioCard eyebrow="Step 8 — one master, many versions" title="Create platform versions">
        <p className="text-sm text-muted-foreground">
          Frassy reads the production and points at the moments worth cutting. You choose. Nothing is published.
        </p>
        <div className="mt-3">
          <GoldButton onClick={findClips} disabled={busy !== null}>
            {busy === "clips" ? "Frassy is watching it back…" : "Suggest platform versions"}
          </GoldButton>
        </div>
        {suggestions.length ? (
          <ul className="mt-4 space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-sm border border-border/60 bg-background/40 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                      {DERIVATIVE_TYPES.find((d) => d.value === s.derivative_type)?.label ?? s.derivative_type} · {s.platform} · {s.strength}
                    </div>
                    <p className="mt-1 text-sm">{s.hook}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.why} — scenes {(s.scene_numbers ?? []).join(", ")}
                    </p>
                  </div>
                  <QuietButton onClick={() => createDerivative(s)}>Create this version</QuietButton>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </StudioCard>

      <StudioCard eyebrow="Step 9 — ready for the channel" title="Platform packages">
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => writePackage(p.value)}
              disabled={busy !== null}
              className="rounded-sm border border-border/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] disabled:opacity-40"
            >
              {busy === `pkg:${p.value}` ? "Writing…" : `${p.icon} ${p.label}`}
            </button>
          ))}
        </div>

        {packages.length ? (
          <ul className="mt-4 space-y-3">
            {packages.map((pkg: any) => (
              <li key={pkg.id} className="rounded-sm border border-border/60 bg-background/40 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                      {pkg.platform} · {pkg.status}
                    </div>
                    <h4 className="mt-1 font-display text-base uppercase tracking-tight">{pkg.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                    {pkg.caption ? <p className="mt-1 text-sm">{pkg.caption}</p> : null}
                    {(pkg.hashtags ?? []).length ? (
                      <p className="mt-1 text-xs text-[color:var(--gold)]">{(pkg.hashtags ?? []).join(" ")}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Suitable for: {pkg.content_classification ?? "—"} · Rights: {pkg.rights_status}
                    </p>
                  </div>
                  <QuietButton onClick={() => queueForPublishing(pkg)} disabled={pkg.status === "queued"}>
                    {pkg.status === "queued" ? "In the queue" : "Send to publishing queue"}
                  </QuietButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No packages written yet.</p>
        )}

        <p className="mt-4 rounded-sm border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
          This is where Build 2 stops on purpose. An approved package waits in the publishing queue. Nothing is sent to
          YouTube, TikTok, Instagram or Facebook until a channel is connected in a later build.
        </p>
      </StudioCard>
    </div>
  );
}
