// FRASS-0600 — the Create Production wizard.
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { interpretProductionRequest } from "@/lib/studios/production-engine.functions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeries, logStudioActivity } from "@/lib/studios/use-studios";
import { Field, GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import {
  AGE_GROUPS,
  AUDIENCES,
  ASPECT_RATIOS,
  DESTINATIONS,
  FRASSY_DEVELOPMENT_OUTPUTS,
  PRODUCTION_TYPES,
} from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/create")({
  head: () => ({
    meta: [
      { title: "Create Production | Frassy Studios" },
      { name: "description", content: "Take an idea from concept to a fully planned Frass Hill production." },
      { property: "og:title", content: "Create Production | Frassy Studios" },
      { property: "og:description", content: "Series, destination, format and creative direction in four steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreateProduction,
});

const STEPS = ["Production", "Destination", "Format", "Creative direction"];

function CreateProduction() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: series = [] } = useSeries();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [askFrassy, setAskFrassy] = useState(true);
  const [request, setRequest] = useState("");
  const [interpreting, setInterpreting] = useState(false);
  const [understanding, setUnderstanding] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const interpretRequest = useServerFn(interpretProductionRequest);

  const [form, setForm] = useState({
    series_id: "",
    production_type: "full_episode",
    title: "",
    episode_number: "",
    season: "1",
    audience: "General Audience",
    age_group: "General Audience",
    destinations: [] as string[],
    aspect_ratio: "16:9",
    target_duration_seconds: "600",
    concept: "",
    story_goal: "",
    educational_objective: "",
    characters: "",
    location: "",
    mood: "",
    visual_style: "",
    music_direction: "",
    narrator: "",
    special_instructions: "",
  });

  /** Frassy reads the sentence and fills the wizard. She never saves it herself. */
  const interpret = async () => {
    setInterpreting(true);
    try {
      const r = (await interpretRequest({ data: { request } })) as any;
      patch({
        series_id: r.series_id ?? "",
        production_type: r.production_type ?? "full_episode",
        title: r.working_title ?? "",
        episode_number: r.episode_number ? String(r.episode_number) : "",
        season: r.season ? String(r.season) : "1",
        audience: r.audience ?? "General Audience",
        age_group: r.age_group ?? "General Audience",
        destinations: r.target_platforms ?? [],
        target_duration_seconds: r.target_duration_seconds ? String(r.target_duration_seconds) : "600",
        concept: r.story_concept ?? "",
        story_goal: r.objective ?? "",
        educational_objective: r.educational_objective ?? "",
        characters: r.characters ?? "",
        location: r.locations ?? "",
        visual_style: r.visual_direction ?? "",
        music_direction: r.music_direction ?? "",
        narrator: r.voice_direction ?? "",
        special_instructions: r.special_instructions ?? "",
      });
      setUnderstanding(r.understanding ?? "");
      setQuestions(r.questions ?? []);
      toast.success("Frassy filled it in. Read it through before you save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't read that request.");
    } finally {
      setInterpreting(false);
    }
  };

  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const toggleDestination = (value: string) =>
    patch({
      destinations: form.destinations.includes(value)
        ? form.destinations.filter((d) => d !== value)
        : [...form.destinations, value],
    });

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Give the production a working title first.");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("studio_productions")
        .insert({
          series_id: form.series_id || null,
          title: form.title.trim(),
          production_type: form.production_type,
          episode_number: form.episode_number ? Number(form.episode_number) : null,
          season: form.season ? Number(form.season) : null,
          audience: form.audience,
          age_group: form.age_group,
          destinations: form.destinations,
          aspect_ratio: form.aspect_ratio,
          target_duration_seconds: form.target_duration_seconds ? Number(form.target_duration_seconds) : null,
          concept: form.concept || null,
          story_goal: form.story_goal || null,
          educational_objective: form.educational_objective || null,
          characters: form.characters || null,
          location: form.location || null,
          mood: form.mood || null,
          visual_style: form.visual_style || null,
          music_direction: form.music_direction || null,
          narrator: form.narrator || null,
          special_instructions: form.special_instructions || null,
          status: form.concept ? "draft" : "idea",
          is_master: true,
          rights_status: "frass_owned",
          created_by: user.user?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;

      await supabase.from("studio_rights").insert({
        subject_type: "production",
        subject_id: data.id,
        rights_status: "frass_owned",
        ownership: "Frass Kicks",
        notes: "Created inside Frassy Studios.",
      });
      await logStudioActivity("production.created", "production", data.id, { title: form.title });
      await qc.invalidateQueries({ queryKey: ["studio"] });

      toast.success(
        askFrassy
          ? "Production created. Ask Frassy to develop it — she reads the Series Bible first."
          : "Production created.",
      );
      navigate(
        askFrassy
          ? { to: "/studios/engine/$id", params: { id: data.id } }
          : { to: "/studios/production/$id", params: { id: data.id } },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the production.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Create Production</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Four steps. Nothing generates and nothing publishes — this only plans the work.
      </p>

      <div className="mt-6 rounded-lg border border-[color:var(--gold)]/40 bg-card/60 p-5">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">Create with Frassy</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Say it the way you would say it out loud. Frassy fills in the plan; you check every word before anything is saved.
        </p>
        <textarea
          rows={3}
          className={`${inputClass} mt-3`}
          placeholder="Make a 10-minute Frass Chronicles episode for ages 6-12 about the day the Hill lost power."
          value={request}
          onChange={(e) => setRequest(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <GoldButton onClick={interpret} disabled={interpreting}>
            {interpreting ? "Frassy is reading it…" : "Let Frassy plan it"}
          </GoldButton>
          {understanding ? <span className="text-sm text-muted-foreground">{understanding}</span> : null}
        </div>
        {questions.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[color:var(--gold)]">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <ol className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => setStep(i)}
              className={`rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
                i === step ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <StudioCard title="Step 1 — Production">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Series">
                <select className={inputClass} value={form.series_id} onChange={(e) => patch({ series_id: e.target.value })}>
                  <option value="">No series (one-off)</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Production type">
                <select
                  className={inputClass}
                  value={form.production_type}
                  onChange={(e) => patch({ production_type: e.target.value })}
                >
                  {PRODUCTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Working title">
                <input className={inputClass} value={form.title} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Season">
                  <input className={inputClass} value={form.season} onChange={(e) => patch({ season: e.target.value })} />
                </Field>
                <Field label="Episode number">
                  <input
                    className={inputClass}
                    value={form.episode_number}
                    onChange={(e) => patch({ episode_number: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Target audience">
                <select className={inputClass} value={form.audience} onChange={(e) => patch({ audience: e.target.value })}>
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Age group" hint="Kids programming must always carry an age group.">
                <select className={inputClass} value={form.age_group} onChange={(e) => patch({ age_group: e.target.value })}>
                  {AGE_GROUPS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </StudioCard>
        ) : null}

        {step === 1 ? (
          <StudioCard title="Step 2 — Destination">
            <p className="text-sm text-muted-foreground">
              Choosing a destination does not publish anything. It only tells the studio what to prepare.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {DESTINATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggleDestination(d.value)}
                  className={`rounded-sm border px-4 py-3 text-left text-sm transition ${
                    form.destinations.includes(d.value)
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </StudioCard>
        ) : null}

        {step === 2 ? (
          <StudioCard title="Step 3 — Format">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Shape">
                <select
                  className={inputClass}
                  value={form.aspect_ratio}
                  onChange={(e) => patch({ aspect_ratio: e.target.value })}
                >
                  {ASPECT_RATIOS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Desired duration (seconds)">
                <input
                  className={inputClass}
                  value={form.target_duration_seconds}
                  onChange={(e) => patch({ target_duration_seconds: e.target.value })}
                />
              </Field>
            </div>
          </StudioCard>
        ) : null}

        {step === 3 ? (
          <StudioCard title="Step 4 — Creative direction">
            <div className="grid gap-4">
              <Field label="Episode / concept description">
                <textarea rows={4} className={inputClass} value={form.concept} onChange={(e) => patch({ concept: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Story goal">
                  <input className={inputClass} value={form.story_goal} onChange={(e) => patch({ story_goal: e.target.value })} />
                </Field>
                <Field label="Educational objective">
                  <input
                    className={inputClass}
                    value={form.educational_objective}
                    onChange={(e) => patch({ educational_objective: e.target.value })}
                  />
                </Field>
                <Field label="Characters">
                  <input className={inputClass} value={form.characters} onChange={(e) => patch({ characters: e.target.value })} />
                </Field>
                <Field label="Location">
                  <input className={inputClass} value={form.location} onChange={(e) => patch({ location: e.target.value })} />
                </Field>
                <Field label="Mood">
                  <input className={inputClass} value={form.mood} onChange={(e) => patch({ mood: e.target.value })} />
                </Field>
                <Field label="Visual style">
                  <input className={inputClass} value={form.visual_style} onChange={(e) => patch({ visual_style: e.target.value })} />
                </Field>
                <Field label="Music direction">
                  <input
                    className={inputClass}
                    value={form.music_direction}
                    onChange={(e) => patch({ music_direction: e.target.value })}
                  />
                </Field>
                <Field label="Voice / narrator">
                  <input className={inputClass} value={form.narrator} onChange={(e) => patch({ narrator: e.target.value })} />
                </Field>
              </div>
              <Field label="Special instructions">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.special_instructions}
                  onChange={(e) => patch({ special_instructions: e.target.value })}
                />
              </Field>

              <label className="flex items-start gap-3 rounded-sm border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-4">
                <input type="checkbox" checked={askFrassy} onChange={(e) => setAskFrassy(e.target.checked)} className="mt-1" />
                <span className="text-sm">
                  <span className="font-bold uppercase tracking-[0.2em] text-[color:var(--gold)]">Ask Frassy to develop this</span>
                  <span className="mt-1 block text-muted-foreground">
                    She reads the Series Bible first, then turns your concept into: {FRASSY_DEVELOPMENT_OUTPUTS.join(", ")}.
                  </span>
                </span>
              </label>
            </div>
          </StudioCard>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuietButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </QuietButton>
        {step < STEPS.length - 1 ? (
          <GoldButton onClick={() => setStep((s) => s + 1)}>Next</GoldButton>
        ) : (
          <GoldButton onClick={save} disabled={saving}>
            {saving ? "Creating…" : "Create production"}
          </GoldButton>
        )}
      </div>
    </>
  );
}
