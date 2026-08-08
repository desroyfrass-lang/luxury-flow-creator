import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useAllActivities, useActivityVersions } from "@/hooks/use-activities";
import {
  ACTIVITY_LIFECYCLE,
  ACTIVITY_STATUSES,
  ACTIVITY_CATEGORIES,
  CONTENT_DISTRICTS,
  DIFFICULTIES,
  nextStatus,
  type ActivityStatus,
  type LearningActivity,
} from "@/lib/content-engine";
import { KIDS_WORLDS } from "@/lib/kids-world";

const TITLE = "Activity Publishing — FRASS Admin";

export const Route = createFileRoute("/_authenticated/admin/activities")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: "Create, review and publish Frass learning activities." },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "Create, review and publish Frass learning activities." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminActivities,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  district: string;
  age_group: string;
  place_slug: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  learning_objective: string;
  description: string;
  hero_image: string;
  thumbnail: string;
  video_url: string;
  audio_url: string;
  story: string;
  instructions: string;
  materials: string;
  parent_guide: string;
  teacher_guide: string;
  discussion_questions: string;
  reflection_questions: string;
  skills: string;
  badge_name: string;
  badge_emoji: string;
  badge_description: string;
  downloads: string;
  featured: boolean;
  position: number;
};

const EMPTY: Draft = {
  slug: "",
  title: "",
  district: "kids_world",
  age_group: "3-6",
  place_slug: "",
  category: "story",
  difficulty: "gentle",
  duration_minutes: 10,
  learning_objective: "",
  description: "",
  hero_image: "",
  thumbnail: "",
  video_url: "",
  audio_url: "",
  story: "",
  instructions: "",
  materials: "",
  parent_guide: "",
  teacher_guide: "",
  discussion_questions: "",
  reflection_questions: "",
  skills: "",
  badge_name: "",
  badge_emoji: "",
  badge_description: "",
  downloads: "",
  featured: false,
  position: 0,
};

const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/** "Label | https://url" per line */
const files = (v: string) =>
  lines(v).map((l) => {
    const [label, url] = l.split("|").map((s) => s.trim());
    return { label: label ?? "", url: url ?? label ?? "" };
  });

function toDraft(a: LearningActivity): Draft {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    district: a.district,
    age_group: a.age_group,
    place_slug: a.place_slug ?? "",
    category: a.category ?? "",
    difficulty: a.difficulty,
    duration_minutes: a.duration_minutes,
    learning_objective: a.learning_objective ?? "",
    description: a.description ?? "",
    hero_image: a.hero_image ?? "",
    thumbnail: a.thumbnail ?? "",
    video_url: a.video_url ?? "",
    audio_url: a.audio_url ?? "",
    story: a.story ?? "",
    instructions: a.instructions.join("\n"),
    materials: a.materials.join("\n"),
    parent_guide: a.parent_guide ?? "",
    teacher_guide: a.teacher_guide ?? "",
    discussion_questions: a.discussion_questions.join("\n"),
    reflection_questions: a.reflection_questions.join("\n"),
    skills: a.skills.join("\n"),
    badge_name: a.badge?.name ?? "",
    badge_emoji: a.badge?.emoji ?? "",
    badge_description: a.badge?.description ?? "",
    downloads: a.downloads.map((d) => `${d.label} | ${d.url}`).join("\n"),
    featured: a.featured,
    position: a.position,
  };
}

function AdminActivities() {
  const { data: activities = [], isLoading } = useAllActivities();
  const qc = useQueryClient();
  const [form, setForm] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<ActivityStatus | "">("");
  const { data: versions = [] } = useActivityVersions(form?.id ?? null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function save() {
    if (!form) return;
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error("Slug and title are required.");
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      district: form.district,
      age_group: form.age_group,
      place_slug: form.place_slug.trim() || null,
      category: form.category || null,
      difficulty: form.difficulty,
      duration_minutes: Number(form.duration_minutes) || 10,
      learning_objective: form.learning_objective.trim() || null,
      description: form.description.trim() || null,
      hero_image: form.hero_image.trim() || null,
      thumbnail: form.thumbnail.trim() || null,
      video_url: form.video_url.trim() || null,
      audio_url: form.audio_url.trim() || null,
      story: form.story.trim() || null,
      instructions: lines(form.instructions),
      materials: lines(form.materials),
      parent_guide: form.parent_guide.trim() || null,
      teacher_guide: form.teacher_guide.trim() || null,
      discussion_questions: lines(form.discussion_questions),
      reflection_questions: lines(form.reflection_questions),
      downloads: files(form.downloads),
      skills: lines(form.skills),
      badge: {
        name: form.badge_name.trim(),
        emoji: form.badge_emoji.trim(),
        description: form.badge_description.trim(),
      },
      featured: form.featured,
      position: Number(form.position) || 0,
    };

    const { error } = form.id
      ? await supabase.from("learning_activities").update(payload).eq("id", form.id)
      : await supabase.from("learning_activities").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Activity saved" : "Draft created");
    qc.invalidateQueries({ queryKey: ["activities"] });
    setForm(null);
  }

  async function move(a: LearningActivity, status: ActivityStatus) {
    const patch: { status: ActivityStatus; published_at?: string } = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("learning_activities").update(patch).eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${a.title} → ${status.replace("_", " ")}`);
    qc.invalidateQueries({ queryKey: ["activities"] });
  }

  const list = filter ? activities.filter((a) => a.status === filter) : activities;

  return (
    <>
      <PageHeader
        eyebrow="Frass Content Experience Engine"
        title="Activity Publishing"
        description="Lovable built the platform. Frassy and the Founder build the experiences. Nothing is hardcoded — every activity is a content object."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Activities" }]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setForm({ ...EMPTY })}
            className="rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-background"
          >
            + New activity
          </button>
          <button
            onClick={() => setFilter("")}
            className="rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
          >
            All ({activities.length})
          </button>
          {ACTIVITY_LIFECYCLE.map((s) => (
            <button
              key={s.status}
              onClick={() => setFilter(s.status)}
              className="rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
              style={{ borderColor: filter === s.status ? "var(--gold)" : undefined }}
            >
              {s.label} ({activities.filter((a) => a.status === s.status).length})
            </button>
          ))}
        </div>

        {form && (
          <div className="mt-8 rounded-[1.75rem] border border-[color:var(--gold)]/30 bg-card p-7">
            <h2 className="font-display text-2xl uppercase">
              {form.id ? "Edit activity" : "New activity"}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="Slug">
                <input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              </Field>
              <Field label="District">
                <select className={input} value={form.district} onChange={(e) => set("district", e.target.value)}>
                  {CONTENT_DISTRICTS.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Age group">
                <select className={input} value={form.age_group} onChange={(e) => set("age_group", e.target.value)}>
                  {KIDS_WORLDS.map((w) => (
                    <option key={w.slug} value={w.slug}>
                      {w.ageLabel} — {w.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Place slug (optional)">
                <input className={input} value={form.place_slug} onChange={(e) => set("place_slug", e.target.value)} />
              </Field>
              <Field label="Category">
                <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">—</option>
                  {ACTIVITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Difficulty">
                <select className={input} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Duration (minutes)">
                <input
                  type="number"
                  className={input}
                  value={form.duration_minutes}
                  onChange={(e) => set("duration_minutes", Number(e.target.value))}
                />
              </Field>
              <Field label="Hero image URL">
                <input className={input} value={form.hero_image} onChange={(e) => set("hero_image", e.target.value)} />
              </Field>
              <Field label="Thumbnail URL">
                <input className={input} value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} />
              </Field>
              <Field label="Video URL (embed or file)">
                <input className={input} value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
              </Field>
              <Field label="Audio URL">
                <input className={input} value={form.audio_url} onChange={(e) => set("audio_url", e.target.value)} />
              </Field>
              <Field label="Learning objective" wide>
                <input
                  className={input}
                  value={form.learning_objective}
                  onChange={(e) => set("learning_objective", e.target.value)}
                />
              </Field>
              <Field label="Description" wide>
                <textarea
                  rows={2}
                  className={input}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="Story / reading text" wide>
                <textarea
                  rows={5}
                  className={input}
                  value={form.story}
                  onChange={(e) => set("story", e.target.value)}
                />
              </Field>
              <Field label="Instructions (one step per line)">
                <textarea
                  rows={5}
                  className={input}
                  value={form.instructions}
                  onChange={(e) => set("instructions", e.target.value)}
                />
              </Field>
              <Field label="Materials (one per line)">
                <textarea
                  rows={5}
                  className={input}
                  value={form.materials}
                  onChange={(e) => set("materials", e.target.value)}
                />
              </Field>
              <Field label="Discussion questions (one per line)">
                <textarea
                  rows={4}
                  className={input}
                  value={form.discussion_questions}
                  onChange={(e) => set("discussion_questions", e.target.value)}
                />
              </Field>
              <Field label="Reflection questions (one per line)">
                <textarea
                  rows={4}
                  className={input}
                  value={form.reflection_questions}
                  onChange={(e) => set("reflection_questions", e.target.value)}
                />
              </Field>
              <Field label="Parent guide">
                <textarea
                  rows={3}
                  className={input}
                  value={form.parent_guide}
                  onChange={(e) => set("parent_guide", e.target.value)}
                />
              </Field>
              <Field label="Teacher guide">
                <textarea
                  rows={3}
                  className={input}
                  value={form.teacher_guide}
                  onChange={(e) => set("teacher_guide", e.target.value)}
                />
              </Field>
              <Field label="Downloads (Label | URL per line)">
                <textarea
                  rows={3}
                  className={input}
                  value={form.downloads}
                  onChange={(e) => set("downloads", e.target.value)}
                />
              </Field>
              <Field label="Skills (one per line)">
                <textarea
                  rows={3}
                  className={input}
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                />
              </Field>
              <Field label="Badge name">
                <input className={input} value={form.badge_name} onChange={(e) => set("badge_name", e.target.value)} />
              </Field>
              <Field label="Badge emoji">
                <input className={input} value={form.badge_emoji} onChange={(e) => set("badge_emoji", e.target.value)} />
              </Field>
              <Field label="Badge line" wide>
                <input
                  className={input}
                  value={form.badge_description}
                  onChange={(e) => set("badge_description", e.target.value)}
                />
              </Field>
              <Field label="Order position">
                <input
                  type="number"
                  className={input}
                  value={form.position}
                  onChange={(e) => set("position", Number(e.target.value))}
                />
              </Field>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4"
                />
                Feature this activity
              </label>
            </div>

            {form.id && versions.length > 0 && (
              <p className="mt-5 text-xs text-muted-foreground">
                Version history: {versions.length} snapshot{versions.length === 1 ? "" : "s"} (latest v
                {versions[0]?.version}).
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-background disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setForm(null)}
                className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.24em]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading activities…</p>}
          {!isLoading && list.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing here yet. Create the first activity.</p>
          )}
          {list.map((a) => {
            const next = nextStatus(a.status);
            return (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    {a.district} · {a.age_group} · {a.category ?? "—"} · v{a.version}
                  </p>
                  <h3 className="mt-1 font-display text-xl uppercase">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">/{a.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                    style={{ borderColor: a.status === "published" ? "var(--gold)" : undefined }}
                  >
                    {a.status.replace("_", " ")}
                  </span>
                  {next && (
                    <button
                      onClick={() => move(a, next)}
                      className="rounded-full border border-[color:var(--gold)]/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]"
                    >
                      → {next.replace("_", " ")}
                    </button>
                  )}
                  {a.status !== "draft" && (
                    <select
                      value={a.status}
                      onChange={(e) => move(a, e.target.value as ActivityStatus)}
                      className="rounded-full border border-border bg-background px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                    >
                      {ACTIVITY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => setForm(toDraft(a))}
                    className="rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

const input =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]";

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block text-sm ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
