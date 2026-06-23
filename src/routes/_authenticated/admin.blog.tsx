import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBlogPosts, type BlogPost } from "@/hooks/use-blog-posts";
import { toast } from "sonner";
import { Upload, Trash2, Plus, Save, Eye, EyeOff } from "lucide-react";

const SIGNED_EXPIRY = 60 * 60 * 24 * 365 * 100;

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: AdminBlogPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadCover(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("site-media")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from("site-media")
    .createSignedUrl(path, SIGNED_EXPIRY);
  if (error) throw error;
  return data.signedUrl;
}

function AdminBlogPage() {
  const { data, isLoading } = useBlogPosts({ includeDrafts: true });
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const addNew = async () => {
    setAdding(true);
    try {
      const base = "new-post";
      let slug = base;
      let n = 1;
      const existing = new Set((data ?? []).map((p) => p.slug));
      while (existing.has(slug)) slug = `${base}-${++n}`;
      const { error } = await supabase.from("blog_posts").insert({
        slug,
        title: "New post",
        author: "Frass Hill",
      });
      if (error) throw error;
      toast.success("Draft created");
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Posts shown on /blog. Drafts stay hidden until you toggle Publish.
        </p>
        <button
          onClick={addNew}
          disabled={adding}
          className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> New post
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="grid grid-cols-1 gap-4">
        {(data ?? []).map((p) => (
          <PostRow key={p.id} post={p} />
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No posts yet — create your first one.
          </div>
        )}
      </div>
    </div>
  );
}

function PostRow({ post }: { post: BlogPost }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(post);
  const [saving, setSaving] = useState(false);
  const [busyCover, setBusyCover] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<BlogPost>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const cleanSlug = slugify(form.slug || form.title);
      const publishedAt =
        form.published && !post.published_at
          ? new Date().toISOString()
          : form.published_at;
      const { error } = await supabase
        .from("blog_posts")
        .update({
          slug: cleanSlug,
          title: form.title,
          excerpt: form.excerpt,
          body: form.body,
          cover_url: form.cover_url,
          tag: form.tag,
          author: form.author,
          published: form.published,
          published_at: publishedAt,
        })
        .eq("id", post.id);
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    const next = !form.published;
    update({ published: next });
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          published: next,
          published_at: next && !post.published_at ? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);
      if (error) throw error;
      toast.success(next ? "Published" : "Unpublished");
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    } catch (e) {
      update({ published: !next });
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["blog_posts"] });
  };

  const onCover = async (file: File) => {
    setBusyCover(true);
    try {
      const url = await uploadCover(file);
      update({ cover_url: url });
      toast.success("Uploaded — remember to Save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyCover(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
          <span className={form.published ? "text-[color:var(--gold)]" : "text-muted-foreground"}>
            {form.published ? "Published" : "Draft"}
          </span>
          <button
            onClick={togglePublish}
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            {form.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {form.published ? "Unpublish" : "Publish"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={remove}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <Field label="Title" className="md:col-span-6">
          <input value={form.title} onChange={(e) => update({ title: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Slug (/blog/…)" className="md:col-span-3">
          <input
            value={form.slug}
            onChange={(e) => update({ slug: e.target.value })}
            onBlur={(e) => update({ slug: slugify(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field label="Tag" className="md:col-span-2">
          <input value={form.tag ?? ""} onChange={(e) => update({ tag: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Author" className="md:col-span-1">
          <input value={form.author ?? ""} onChange={(e) => update({ author: e.target.value })} className={inputCls} />
        </Field>
      </div>

      <Field label="Cover image (URL or upload)">
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://…"
            value={form.cover_url ?? ""}
            onChange={(e) => update({ cover_url: e.target.value })}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            disabled={busyCover}
            className="shrink-0 inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" /> {busyCover ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCover(f);
              e.target.value = "";
            }}
          />
        </div>
        {form.cover_url && (
          <img src={form.cover_url} alt="" className="mt-2 h-32 w-auto rounded border border-border/60 object-cover" />
        )}
      </Field>

      <Field label="Excerpt (shown on cards)">
        <textarea
          value={form.excerpt ?? ""}
          onChange={(e) => update({ excerpt: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </Field>

      <Field label="Body (plain text / markdown-ish — line breaks preserved)">
        <textarea
          value={form.body ?? ""}
          onChange={(e) => update({ body: e.target.value })}
          rows={10}
          className={`${inputCls} font-mono text-sm`}
        />
      </Field>
    </div>
  );
}

const inputCls =
  "w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--gold)]";

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
