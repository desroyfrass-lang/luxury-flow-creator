import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAllStories } from "@/hooks/use-for-us-stories";
import {
  FOR_US_CATEGORIES,
  FOR_US_SECTIONS,
  type ForUsStoryRow,
  type StoryStatus,
} from "@/lib/for-us";
import { CheckCircle2, Send, Archive, Trash2, Plus, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/newsroom")({
  component: NewsroomPage,
});

type FormState = {
  id?: string;
  section_id: string;
  series: string;
  source_label: string;
  title: string;
  summary: string;
  body: string;
  categories: string[];
  tags: string;
  media_url: string;
  media_kind: "none" | "image" | "video" | "audio";
  cta_label: string;
  cta_to: string;
  impact_note: string;
  revenue_note: string;
  audience: "everyone" | "members" | "founder";
};

function emptyForm(): FormState {
  return {
    section_id: "today",
    series: "",
    source_label: "Founder Hall",
    title: "",
    summary: "",
    body: "",
    categories: ["Platform Development"],
    tags: "",
    media_url: "",
    media_kind: "none",
    cta_label: "",
    cta_to: "",
    impact_note: "",
    revenue_note: "",
    audience: "everyone",
  };
}

const FILTERS: { id: StoryStatus | "all"; label: string }[] = [
  { id: "proposed", label: "Frassy's proposals" },
  { id: "approved", label: "Approved" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "Everything" },
];

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]";
const label = "text-[10px] uppercase tracking-[0.25em] text-muted-foreground";

function NewsroomPage() {
  const qc = useQueryClient();
  const { data: stories = [], isLoading } = useAllStories();
  const [filter, setFilter] = useState<StoryStatus | "all">("proposed");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const visible = useMemo(
    () => (filter === "all" ? stories : stories.filter((s) => s.status === filter)),
    [stories, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of stories) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [stories]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["for-us-stories"] });

  async function setStatus(story: ForUsStoryRow, status: StoryStatus) {
    const { data: auth } = await supabase.auth.getUser();
    const patch: {
      status: StoryStatus;
      published_at?: string;
      approved_by?: string | null;
    } = { status };
    if (status === "published") {
      patch.published_at = new Date().toISOString();
      patch.approved_by = auth.user?.id ?? null;
    }
    if (status === "approved") patch.approved_by = auth.user?.id ?? null;
    const { error } = await supabase.from("for_us_stories").update(patch).eq("id", story.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      status === "published"
        ? "Published to For Us."
        : status === "archived"
          ? "Archived — it stays in the community history."
          : "Story approved.",
    );
    refresh();
  }

  async function remove(story: ForUsStoryRow) {
    const { error } = await supabase.from("for_us_stories").delete().eq("id", story.id);
    if (error) return toast.error(error.message);
    toast.success("Removed.");
    refresh();
  }

  async function save() {
    if (!form) return;
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("A story needs a title and a summary.");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const payload = {
      section_id: form.section_id,
      series: form.series.trim() || null,
      source_label: form.source_label.trim() || "Frass Hill",
      title: form.title.trim(),
      summary: form.summary.trim(),
      body: form.body.trim() || null,
      categories: form.categories,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      media_url: form.media_url.trim() || null,
      media_kind: form.media_kind,
      cta_label: form.cta_label.trim() || null,
      cta_to: form.cta_to.trim() || null,
      impact_note: form.impact_note.trim() || null,
      revenue_note: form.revenue_note.trim() || null,
      audience: form.audience,
    };
    const { error } = form.id
      ? await supabase.from("for_us_stories").update(payload).eq("id", form.id)
      : await supabase
          .from("for_us_stories")
          .insert({ ...payload, origin: "founder", status: "draft", proposed_by: auth.user?.id ?? null });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Story updated." : "Draft saved.");
    setForm(null);
    refresh();
  }

  function edit(story: ForUsStoryRow) {
    setForm({
      id: story.id,
      section_id: story.section_id,
      series: story.series ?? "",
      source_label: story.source_label,
      title: story.title,
      summary: story.summary,
      body: story.body ?? "",
      categories: story.categories,
      tags: story.tags.join(", "),
      media_url: story.media_url ?? "",
      media_kind: story.media_kind,
      cta_label: story.cta_label ?? "",
      cta_to: story.cta_to ?? "",
      impact_note: story.impact_note ?? "",
      revenue_note: story.revenue_note ?? "",
      audience: story.audience,
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          FRASS-0922 · Community Storytelling
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.12em]">The Newsroom</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Frassy is the Editor-in-Chief and community historian. She proposes stories from real
          milestones; nothing reaches For Us until you approve it. Revenue is never celebrated on its
          own — every financial story records what it made possible.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition ${
              filter === f.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {f.id !== "all" && counts[f.id] ? ` · ${counts[f.id]}` : ""}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Write a story
        </button>
      </div>

      {form && (
        <div className="mb-8 rounded-2xl border border-[color:var(--gold)]/50 bg-secondary/30 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {form.id ? "Edit story" : "New community story"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className={label}>Title</p>
              <input
                className={field}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Source (who or where)</p>
              <input
                className={field}
                value={form.source_label}
                onChange={(e) => setForm({ ...form, source_label: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <p className={label}>Summary (what the community reads)</p>
              <textarea
                rows={3}
                className={field}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <p className={label}>Full story (optional)</p>
              <textarea
                rows={5}
                className={field}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Section in the hall</p>
              <select
                className={field}
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
              >
                {FOR_US_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={label}>Series (e.g. Behind the Build)</p>
              <input
                className={field}
                value={form.series}
                onChange={(e) => setForm({ ...form, series: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Impact — what this made possible</p>
              <input
                className={field}
                placeholder="Three classrooms received new resources."
                value={form.impact_note}
                onChange={(e) => setForm({ ...form, impact_note: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Revenue with purpose (optional)</p>
              <input
                className={field}
                placeholder="A share of this season's podcast revenue funded the drive."
                value={form.revenue_note}
                onChange={(e) => setForm({ ...form, revenue_note: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Link label</p>
              <input
                className={field}
                value={form.cta_label}
                onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Link destination (e.g. /academy)</p>
              <input
                className={field}
                value={form.cta_to}
                onChange={(e) => setForm({ ...form, cta_to: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Tags (comma separated)</p>
              <input
                className={field}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <div>
              <p className={label}>Audience</p>
              <select
                className={field}
                value={form.audience}
                onChange={(e) =>
                  setForm({ ...form, audience: e.target.value as FormState["audience"] })
                }
              >
                <option value="everyone">Everyone (public version)</option>
                <option value="members">Signed-in members</option>
                <option value="founder">Founder only</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <p className={label}>Categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FOR_US_CATEGORIES.map((c) => {
                  const on = form.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          categories: on
                            ? form.categories.filter((x) => x !== c)
                            : [...form.categories, c],
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                        on
                          ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink)] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-full border border-border px-6 py-2.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Opening the newsroom…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-secondary/20 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing here yet. As Frass grows, Frassy will propose stories from real milestones — and
            ask whether you'd like to share them with the community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-border/60 bg-background p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {s.status}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                  {s.origin === "frassy" ? "Proposed by Frassy" : "Founder"} · {s.source_label}
                </span>
                {s.series && (
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {s.series}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              {s.impact_note && (
                <p className="mt-2 text-sm text-foreground">Impact: {s.impact_note}</p>
              )}
              {s.revenue_note && (
                <p className="mt-1 text-sm text-muted-foreground">{s.revenue_note}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {s.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => setStatus(s, "published")}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink)]"
                  >
                    <Send className="h-3.5 w-3.5" /> Publish to For Us
                  </button>
                )}
                {s.status === "proposed" && (
                  <button
                    type="button"
                    onClick={() => setStatus(s, "approved")}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve, publish later
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => edit(s)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {s.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => setStatus(s, "archived")}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
