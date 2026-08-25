// FRASS-0600 — Series and their permanent Series Bible.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeries } from "@/lib/studios/use-studios";
import { Field, GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { AGE_GROUPS, AUDIENCES } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/series")({
  head: () => ({
    meta: [
      { title: "Series | Frassy Studios" },
      { name: "description", content: "Every Frass Hill show and the permanent story rules that keep it consistent." },
      { property: "og:title", content: "Series | Frassy Studios" },
      { property: "og:description", content: "Series Bibles: world rules, canon, timeline and continuity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SeriesPage,
});

const BIBLE_FIELDS = [
  ["world_rules", "World rules"],
  ["visual_style", "Visual style"],
  ["story_rules", "Story rules"],
  ["character_relationships", "Character relationships"],
  ["locations", "Locations"],
  ["recurring_objects", "Recurring objects"],
  ["canon_events", "Canon events"],
  ["timeline", "Timeline"],
  ["previous_episodes", "Previous episodes"],
  ["unresolved_storylines", "Unresolved storylines"],
  ["forbidden_changes", "Forbidden continuity changes"],
  ["language_style", "Language style"],
  ["educational_standards", "Educational standards"],
] as const;

function SeriesPage() {
  const qc = useQueryClient();
  const { data: series = [] } = useSeries();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const createSeries = async () => {
    const name = newName.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("studio_series").insert({ name, slug }).select("id").single();
    if (error) return toast.error(error.message);
    await supabase.from("studio_series_bibles").insert({ series_id: data.id });
    setNewName("");
    toast.success("Series created, with an empty Bible ready for you.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Series</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A Series Bible is permanent memory. Frassy reads it before she develops anything new, so a show never
        contradicts itself.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="New series name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <GoldButton onClick={createSeries}>+ Add series</GoldButton>
      </div>

      <div className="mt-6 space-y-3">
        {series.map((s) => {
          const bible = (s.studio_series_bibles as Array<Record<string, string | null>> | null)?.[0];
          return (
            <StudioCard key={s.id} eyebrow={s.slug} title={s.name}>
              <p className="text-sm text-muted-foreground">{s.description ?? "No description yet."}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {s.audience ?? "—"} · Age {s.age_group ?? "—"} · {s.tone ?? "—"}
              </div>
              <div className="mt-3">
                <QuietButton onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                  {openId === s.id ? "Close Bible" : "Open Series Bible"}
                </QuietButton>
              </div>
              {openId === s.id ? <BibleEditor seriesId={s.id} bible={bible ?? {}} series={s} /> : null}
            </StudioCard>
          );
        })}
      </div>
    </>
  );
}

function BibleEditor({
  seriesId,
  bible,
  series,
}: {
  seriesId: string;
  bible: Record<string, string | null>;
  series: { description: string | null; audience: string | null; age_group: string | null; tone: string | null };
}) {
  const qc = useQueryClient();
  const [meta, setMeta] = useState({
    description: series.description ?? "",
    audience: series.audience ?? "General Audience",
    age_group: series.age_group ?? "General Audience",
    tone: series.tone ?? "",
  });
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(BIBLE_FIELDS.map(([k]) => [k, bible[k] ?? ""])),
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const a = await supabase.from("studio_series").update(meta).eq("id", seriesId);
    const b = await supabase.from("studio_series_bibles").update(draft as never).eq("series_id", seriesId);
    setSaving(false);
    if (a.error || b.error) return toast.error(a.error?.message ?? b.error?.message ?? "Could not save.");
    toast.success("Series Bible saved.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <Field label="Description">
        <textarea rows={2} className={inputClass} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Audience">
          <select className={inputClass} value={meta.audience} onChange={(e) => setMeta({ ...meta, audience: e.target.value })}>
            {AUDIENCES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Age">
          <select className={inputClass} value={meta.age_group} onChange={(e) => setMeta({ ...meta, age_group: e.target.value })}>
            {AGE_GROUPS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Tone">
          <input className={inputClass} value={meta.tone} onChange={(e) => setMeta({ ...meta, tone: e.target.value })} />
        </Field>
      </div>
      {BIBLE_FIELDS.map(([key, label]) => (
        <Field key={key} label={label}>
          <textarea
            rows={3}
            className={inputClass}
            value={draft[key] ?? ""}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
          />
        </Field>
      ))}
      <div className="md:col-span-2">
        <GoldButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Series Bible"}
        </GoldButton>
      </div>
    </div>
  );
}
