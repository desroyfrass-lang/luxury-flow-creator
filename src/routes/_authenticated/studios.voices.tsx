// FRASS-0601 — the Voice Library. Save a voice once, use it forever.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVoices } from "@/lib/studios/use-engine";
import { useCharacters, logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, Field, GoldButton, QuietButton, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { AGE_GROUPS } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/voices")({
  head: () => ({
    meta: [
      { title: "Voice Library | Frassy Studios" },
      { name: "description", content: "Saved narration and character voices reused across every Frass Hill production." },
      { property: "og:title", content: "Voice Library | Frassy Studios" },
      { property: "og:description", content: "Save a voice once and it stays the same in every episode." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VoicesPage,
});

const EMPTY = {
  name: "",
  voice_type: "character",
  accent: "Caribbean",
  tone: "",
  pace: "natural",
  age_range: "General Audience",
  description: "",
  character_id: "",
  rights_status: "owned",
};

function VoicesPage() {
  const qc = useQueryClient();
  const { data: voices = [], isLoading } = useVoices();
  const { data: characters = [] } = useCharacters();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Give the voice a name first.");
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("studio_voices").insert({
      ...form,
      character_id: form.character_id || null,
      created_by: auth.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    await logStudioActivity("voice_created", "voice", form.name);
    setForm(EMPTY);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["studio", "voices"] });
    toast.success("Voice saved. It will sound the same next time.");
  };

  const toggleApproval = async (v: any) => {
    await supabase.from("studio_voices").update({ is_approved: !v.is_approved }).eq("id", v.id);
    qc.invalidateQueries({ queryKey: ["studio", "voices"] });
  };

  return (
    <StudioSection
      title="Voice Library"
      hint="A saved voice keeps a character sounding like themselves across every episode."
    >
      <div className="mb-5">
        <GoldButton onClick={() => setOpen(!open)}>{open ? "Close" : "Save a new voice"}</GoldButton>
      </div>

      {open ? (
        <div className="mb-6 grid gap-3 rounded-lg border border-border/70 bg-card/60 p-5 md:grid-cols-2">
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Used for">
            <select className={inputClass} value={form.voice_type} onChange={(e) => setForm({ ...form, voice_type: e.target.value })}>
              {["character", "narrator", "host", "announcer"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Accent">
            <input className={inputClass} value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} />
          </Field>
          <Field label="Tone" hint="Warm, playful, steady, serious.">
            <input className={inputClass} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
          </Field>
          <Field label="Pace">
            <select className={inputClass} value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })}>
              {["slow", "natural", "lively", "fast"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Right for which age">
            <select className={inputClass} value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })}>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Attached character" hint="Optional.">
            <select className={inputClass} value={form.character_id} onChange={(e) => setForm({ ...form, character_id: e.target.value })}>
              <option value="">Not attached</option>
              {characters.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rights">
            <select className={inputClass} value={form.rights_status} onChange={(e) => setForm({ ...form, rights_status: e.target.value })}>
              {["owned", "licensed", "restricted", "unknown"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <GoldButton onClick={save}>Save the voice</GoldButton>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading voices…</p>
      ) : voices.length === 0 ? (
        <EmptyState title="No voices saved yet" body="Save the voices you use often so every episode sounds consistent." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {voices.map((v: any) => (
            <div key={v.id} className="rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                {v.voice_type} · {v.accent}
              </div>
              <h3 className="font-display text-lg uppercase tracking-tight">{v.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {v.tone || "tone not set"} · {v.pace} · {v.age_range}
              </p>
              {v.description ? <p className="mt-2 text-sm text-muted-foreground">{v.description}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">Rights: {v.rights_status}</p>
              <div className="mt-3">
                <QuietButton onClick={() => toggleApproval(v)}>{v.is_approved ? "Approved ✓" : "Approve"}</QuietButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        No voice service is connected yet, so nothing is spoken here. These saved voices are the instructions the studio
        will follow the moment a service is connected.
      </p>
    </StudioSection>
  );
}
