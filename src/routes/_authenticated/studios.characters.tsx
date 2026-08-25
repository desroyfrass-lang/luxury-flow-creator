// FRASS-0600 — the Character Bible. Approved characters are reused, never re-invented.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCharacters, useSeries } from "@/lib/studios/use-studios";
import { EmptyState, Field, GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";

export const Route = createFileRoute("/_authenticated/studios/characters")({
  head: () => ({
    meta: [
      { title: "Characters | Frassy Studios" },
      { name: "description", content: "Permanent, reusable characters with an approved look, voice and continuity notes." },
      { property: "og:title", content: "Characters | Frassy Studios" },
      { property: "og:description", content: "One approved version of every recurring character." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CharactersPage,
});

const FIELDS = [
  ["role", "Role"],
  ["age", "Age"],
  ["voice", "Voice"],
  ["accent", "Accent"],
  ["speech_style", "Speech style"],
  ["primary_image_url", "Approved visual reference (URL)"],
] as const;

const LONG_FIELDS = [
  ["description", "Description"],
  ["personality", "Personality"],
  ["appearance", "Appearance"],
  ["wardrobe", "Wardrobe"],
  ["expressions", "Expressions"],
  ["relationships", "Relationships"],
  ["animation_references", "Animation references"],
  ["approved_poses", "Approved poses"],
  ["continuity_notes", "Continuity notes"],
] as const;

function CharactersPage() {
  const qc = useQueryClient();
  const { data: characters = [] } = useCharacters();
  const { data: series = [] } = useSeries();
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [seriesId, setSeriesId] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("studio_characters").insert({ name: name.trim(), series_id: seriesId || null });
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Character added. Approve their look and Frassy will reuse it every time.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Characters</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        When an approved character asset exists, the studio reuses it. A recurring character is never generated from
        scratch again.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input className={`${inputClass} max-w-xs`} placeholder="Character name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={`${inputClass} max-w-xs`} value={seriesId} onChange={(e) => setSeriesId(e.target.value)}>
          <option value="">No series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <GoldButton onClick={create}>+ Add character</GoldButton>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {characters.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState title="No characters yet" body="Add the people who appear again and again, and lock their look once." />
          </div>
        ) : null}
        {characters.map((c) => (
          <StudioCard key={c.id} eyebrow={c.studio_series?.name ?? "No series"} title={c.name}>
            <div className="flex items-start gap-3">
              {c.primary_image_url ? (
                <img src={c.primary_image_url} alt={c.name} className="h-20 w-20 rounded-sm object-cover" loading="lazy" />
              ) : null}
              <p className="text-sm text-muted-foreground">{c.description ?? "No description yet."}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuietButton onClick={() => setOpenId(openId === c.id ? null : c.id)}>
                {openId === c.id ? "Close" : "Edit character"}
              </QuietButton>
              <QuietButton
                onClick={async () => {
                  await supabase.from("studio_characters").update({ approved: !c.approved }).eq("id", c.id);
                  qc.invalidateQueries({ queryKey: ["studio"] });
                }}
              >
                {c.approved ? "Approved ✓" : "Approve look"}
              </QuietButton>
            </div>
            {openId === c.id ? <CharacterEditor character={c} /> : null}
          </StudioCard>
        ))}
      </div>
    </>
  );
}

function CharacterEditor({ character }: { character: Record<string, unknown> & { id: string } }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(
      [...FIELDS, ...LONG_FIELDS].map(([k]) => [k, String((character as Record<string, unknown>)[k] ?? "")]),
    ),
  );

  const save = async () => {
    const { error } = await supabase.from("studio_characters").update(draft as never).eq("id", character.id);
    if (error) return toast.error(error.message);
    toast.success("Character saved.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <div className="mt-4 grid gap-3">
      {FIELDS.map(([k, label]) => (
        <Field key={k} label={label}>
          <input className={inputClass} value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
        </Field>
      ))}
      {LONG_FIELDS.map(([k, label]) => (
        <Field key={k} label={label}>
          <textarea rows={2} className={inputClass} value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
        </Field>
      ))}
      <GoldButton onClick={save}>Save character</GoldButton>
    </div>
  );
}
