// FRASS-0601 — the Animation Library. Movement saved once, reused forever.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAnimations } from "@/lib/studios/use-engine";
import { useCharacters, logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, Field, GoldButton, QuietButton, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { ANIMATION_CATEGORIES } from "@/lib/studios/generation-layer";

export const Route = createFileRoute("/_authenticated/studios/animations")({
  head: () => ({
    meta: [
      { title: "Animation Library | Frassy Studios" },
      { name: "description", content: "Reusable walks, gestures, expressions and camera moves for Frass Hill productions." },
      { property: "og:title", content: "Animation Library | Frassy Studios" },
      { property: "og:description", content: "Save a movement once and reuse it in every episode instead of paying to make it again." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AnimationsPage,
});

const EMPTY = {
  name: "",
  category: "walk_cycle",
  description: "",
  character_id: "",
  duration_seconds: 3,
  loopable: true,
  rights_status: "owned",
};

function AnimationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("");
  const { data: animations = [], isLoading } = useAnimations(filter || undefined);
  const { data: characters = [] } = useCharacters();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Give the movement a name first.");
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("studio_animations").insert({
      ...form,
      character_id: form.character_id || null,
      created_by: auth.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    await logStudioActivity("animation_created", "animation", form.name);
    setForm(EMPTY);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["studio", "animations"] });
    toast.success("Movement saved. Reuse it instead of making it again.");
  };

  const reuse = async (a: any) => {
    await supabase
      .from("studio_animations")
      .update({ times_used: (a.times_used ?? 0) + 1 })
      .eq("id", a.id);
    qc.invalidateQueries({ queryKey: ["studio", "animations"] });
    toast.success("Marked as reused. That is one generation you did not pay for.");
  };

  return (
    <StudioSection
      title="Animation Library"
      hint="Walks, gestures, expressions, camera moves and transitions — made once, reused everywhere."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <GoldButton onClick={() => setOpen(!open)}>{open ? "Close" : "Save a movement"}</GoldButton>
        <select className={`${inputClass} max-w-[240px]`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Every category</option>
          {ANIMATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {open ? (
        <div className="mb-6 grid gap-3 rounded-lg border border-border/70 bg-card/60 p-5 md:grid-cols-2">
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {ANIMATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Character" hint="Optional.">
            <select className={inputClass} value={form.character_id} onChange={(e) => setForm({ ...form, character_id: e.target.value })}>
              <option value="">Not attached</option>
              {characters.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Length in seconds">
            <input
              type="number"
              className={inputClass}
              value={form.duration_seconds}
              onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.loopable} onChange={(e) => setForm({ ...form, loopable: e.target.checked })} />
            It can loop
          </label>
          <div className="md:col-span-2">
            <GoldButton onClick={save}>Save the movement</GoldButton>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading movements…</p>
      ) : animations.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Every movement you save here is one you never have to generate twice." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {animations.map((a: any) => (
            <div key={a.id} className="rounded-lg border border-border/70 bg-card/60 p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                {String(a.category).replace(/_/g, " ")}
              </div>
              <h3 className="font-display text-lg uppercase tracking-tight">{a.name}</h3>
              {a.description ? <p className="mt-1 text-sm text-muted-foreground">{a.description}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {a.duration_seconds ?? "—"}s · {a.loopable ? "loops" : "one-off"} · reused {a.times_used ?? 0}×
              </p>
              <div className="mt-3">
                <QuietButton onClick={() => reuse(a)}>Reuse this</QuietButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudioSection>
  );
}
