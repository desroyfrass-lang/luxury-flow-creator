// FRASS-0601 — the Production Brief. Nothing expensive starts before this is agreed.
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Field, GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { AGE_GROUPS, AUDIENCES, DESTINATIONS, PRODUCTION_TYPES } from "@/lib/studios/studios";
import { ageRuleFor } from "@/lib/studios/age-rules";
import { reviseBrief, saveBrief } from "@/lib/studios/production-engine.functions";
import { useBrief } from "@/lib/studios/use-engine";
import { logStudioActivity } from "@/lib/studios/use-studios";

const FIELDS: Array<[key: string, label: string, long?: boolean]> = [
  ["objective", "Objective — what this production is for", true],
  ["story_concept", "Story concept", true],
  ["characters", "Characters"],
  ["locations", "Locations"],
  ["visual_direction", "Visual direction"],
  ["voice_direction", "Voice direction"],
  ["music_direction", "Music direction"],
  ["educational_objective", "Educational objective (when it teaches something)"],
  ["special_instructions", "Special instructions", true],
];

export function BriefPanel({ production }: { production: any }) {
  const qc = useQueryClient();
  const { data: brief, isLoading } = useBrief(production.id);
  const save = useServerFn(saveBrief);
  const revise = useServerFn(reviseBrief);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    if (brief) setForm(brief);
    else
      setForm({
        working_title: production.title,
        production_type: production.production_type,
        episode_number: production.episode_number ?? "",
        season: production.season ?? "",
        audience: production.audience ?? "General Audience",
        age_group: production.age_group ?? "General Audience",
        target_duration_seconds: production.target_duration_seconds ?? 600,
        target_platforms: production.destinations ?? [],
        story_concept: production.concept ?? "",
        objective: production.story_goal ?? "",
        characters: production.characters ?? "",
        locations: production.location ?? "",
        visual_direction: production.visual_style ?? "",
        music_direction: production.music_direction ?? "",
        educational_objective: production.educational_objective ?? "",
        special_instructions: production.special_instructions ?? "",
        status: "draft",
      });
  }, [brief, production]);

  const patch = (p: Record<string, any>) => setForm((f) => ({ ...f, ...p }));
  const rule = ageRuleFor(form.age_group);
  const approved = brief?.status === "approved";

  const persist = async (status?: string) => {
    setBusy("save");
    try {
      const payload = {
        working_title: form.working_title || production.title,
        production_type: form.production_type,
        episode_number: form.episode_number === "" ? null : Number(form.episode_number),
        season: form.season === "" ? null : Number(form.season),
        series_id: production.series_id,
        audience: form.audience,
        age_group: form.age_group,
        target_duration_seconds: form.target_duration_seconds ? Number(form.target_duration_seconds) : null,
        target_platforms: form.target_platforms ?? [],
        objective: form.objective ?? "",
        story_concept: form.story_concept ?? "",
        characters: form.characters ?? "",
        locations: form.locations ?? "",
        visual_direction: form.visual_direction ?? "",
        voice_direction: form.voice_direction ?? "",
        music_direction: form.music_direction ?? "",
        educational_objective: form.educational_objective ?? "",
        special_instructions: form.special_instructions ?? "",
        status: status ?? form.status ?? "draft",
        approved_at: status === "approved" ? new Date().toISOString() : brief?.approved_at ?? null,
      };
      await save({ data: { productionId: production.id, brief: payload } });
      // Keep the production card and the brief telling the same story.
      await supabase
        .from("studio_productions")
        .update({
          age_group: payload.age_group,
          audience: payload.audience,
          target_duration_seconds: payload.target_duration_seconds,
          concept: payload.story_concept,
          story_goal: payload.objective,
          educational_objective: payload.educational_objective,
        })
        .eq("id", production.id);
      await logStudioActivity(status === "approved" ? "brief_approved" : "brief_saved", "production", production.id);
      qc.invalidateQueries({ queryKey: ["studio"] });
      toast.success(status === "approved" ? "Brief approved. Frassy can start developing." : "Brief saved.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the brief.");
    } finally {
      setBusy(null);
    }
  };

  const askRevision = async () => {
    if (!brief) return toast.error("Save the brief first, then Frassy can revise it.");
    if (!instruction.trim()) return toast.error("Tell Frassy what to change.");
    setBusy("revise");
    try {
      const res = await revise({ data: { productionId: production.id, instruction } });
      setInstruction("");
      qc.invalidateQueries({ queryKey: ["studio", "brief", production.id] });
      toast.success(String(res.note ?? "Frassy revised the brief."));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't revise that.");
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening the brief…</p>;

  return (
    <div className="space-y-5">
      <StudioCard
        eyebrow={approved ? "Approved ✓" : "Step 1 — agree the plan"}
        title="Production Brief"
        footer={`Age rules in force: ${rule.label} — ${rule.plain}`}
      >
        <p className="text-sm text-muted-foreground">
          This is the agreement. Frassy does not write a word of the episode until you approve it, so nothing expensive
          happens on a guess.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Working title">
            <input className={inputClass} value={form.working_title ?? ""} onChange={(e) => patch({ working_title: e.target.value })} />
          </Field>
          <Field label="Production type">
            <select className={inputClass} value={form.production_type ?? ""} onChange={(e) => patch({ production_type: e.target.value })}>
              {PRODUCTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Season">
            <input className={inputClass} value={form.season ?? ""} onChange={(e) => patch({ season: e.target.value })} />
          </Field>
          <Field label="Episode number">
            <input className={inputClass} value={form.episode_number ?? ""} onChange={(e) => patch({ episode_number: e.target.value })} />
          </Field>
          <Field label="Audience">
            <select className={inputClass} value={form.audience ?? ""} onChange={(e) => patch({ audience: e.target.value })}>
              {AUDIENCES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Age group" hint={rule.plain}>
            <select className={inputClass} value={form.age_group ?? ""} onChange={(e) => patch({ age_group: e.target.value })}>
              {AGE_GROUPS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Target length (seconds)" hint={`Suggested for this age: ${rule.durationSeconds.min}–${rule.durationSeconds.max}s`}>
            <input
              className={inputClass}
              value={form.target_duration_seconds ?? ""}
              onChange={(e) => patch({ target_duration_seconds: e.target.value })}
            />
          </Field>
          <Field label="Target platforms">
            <div className="flex flex-wrap gap-1.5">
              {DESTINATIONS.map((d) => {
                const on = (form.target_platforms ?? []).includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() =>
                      patch({
                        target_platforms: on
                          ? (form.target_platforms ?? []).filter((p: string) => p !== d.value)
                          : [...(form.target_platforms ?? []), d.value],
                      })
                    }
                    className={`rounded-sm border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition ${
                      on ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border/70 text-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          {FIELDS.map(([key, label, long]) => (
            <Field key={key} label={label}>
              {long ? (
                <textarea rows={3} className={inputClass} value={form[key] ?? ""} onChange={(e) => patch({ [key]: e.target.value })} />
              ) : (
                <input className={inputClass} value={form[key] ?? ""} onChange={(e) => patch({ [key]: e.target.value })} />
              )}
            </Field>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <QuietButton onClick={() => persist()} disabled={busy !== null}>
            {busy === "save" ? "Saving…" : "Save brief"}
          </QuietButton>
          <GoldButton onClick={() => persist("approved")} disabled={busy !== null}>
            {approved ? "Re-approve brief" : "Approve brief"}
          </GoldButton>
        </div>
      </StudioCard>

      <StudioCard eyebrow="Ask Frassy" title="Revise the brief">
        <textarea
          rows={2}
          className={inputClass}
          placeholder="Make it shorter and aim it at 3–6 year olds. Move it to Frassy Street."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <div className="mt-3">
          <QuietButton onClick={askRevision} disabled={busy !== null}>
            {busy === "revise" ? "Frassy is thinking…" : "Ask Frassy to revise"}
          </QuietButton>
        </div>
      </StudioCard>
    </div>
  );
}
