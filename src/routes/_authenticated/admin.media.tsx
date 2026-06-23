import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMediaItems, type MediaItem, type MediaKind } from "@/hooks/use-media-items";
import { toast } from "sonner";
import { Upload, Trash2, Plus, Save } from "lucide-react";

const SIGNED_EXPIRY = 60 * 60 * 24 * 365 * 100;

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: AdminMediaPage,
});

async function uploadAndSign(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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

function AdminMediaPage() {
  const [tab, setTab] = useState<MediaKind>("track");
  return (
    <div>
      <div className="mb-8 flex items-center gap-2 border-b border-border/60">
        {(["track", "video"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-3 text-[11px] uppercase tracking-[0.3em] transition ${
              tab === t ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "track" ? "Tracks (audio)" : "Visuals (video)"}
            {tab === t && <span className="absolute bottom-0 left-4 right-4 h-px bg-[color:var(--gold)]" />}
          </button>
        ))}
      </div>
      <MediaList kind={tab} />
    </div>
  );
}

function MediaList({ kind }: { kind: MediaKind }) {
  const { data, isLoading } = useMediaItems(kind);
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const addNew = async () => {
    setAdding(true);
    try {
      const nextPos = (data?.length ?? 0) + 1;
      const { error } = await supabase.from("media_items").insert({
        kind,
        title: kind === "track" ? "New track" : "New visual",
        position: nextPos,
      });
      if (error) throw error;
      toast.success("Added");
      qc.invalidateQueries({ queryKey: ["media_items"] });
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
          {kind === "track"
            ? "Tracks shown on the Music & Media page. Upload an audio file or paste any URL (Spotify, SoundCloud, MP3, etc.)."
            : "Visuals on the Music & Media page. Upload a video file or paste a YouTube/Vimeo/MP4 URL. Add a poster image for the card thumbnail."}
        </p>
        <button
          onClick={addNew}
          disabled={adding}
          className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add {kind}
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="grid grid-cols-1 gap-4">
        {(data ?? []).map((item) => (
          <MediaRow key={item.id} item={item} />
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Nothing here yet — add your first {kind}.
          </div>
        )}
      </div>
    </div>
  );
}

function MediaRow({ item }: { item: MediaItem }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [busyField, setBusyField] = useState<"source" | "poster" | null>(null);
  const srcRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<MediaItem>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("media_items")
        .update({
          title: form.title,
          subtitle: form.subtitle,
          tag: form.tag,
          length: form.length,
          source_url: form.source_url,
          poster_url: form.poster_url,
          position: form.position,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["media_items"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("media_items").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["media_items"] });
  };

  const onUpload = async (file: File, field: "source" | "poster") => {
    setBusyField(field);
    try {
      const url = await uploadAndSign(file, item.kind);
      update(field === "source" ? { source_url: url } : { poster_url: url });
      toast.success("Uploaded — remember to Save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusyField(null);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <Field label="Title" className="md:col-span-5">
          <input value={form.title} onChange={(e) => update({ title: e.target.value })} className={inputCls} />
        </Field>
        <Field label={item.kind === "track" ? "Artist" : "Subtitle"} className="md:col-span-4">
          <input value={form.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} className={inputCls} />
        </Field>
        <Field label={item.kind === "track" ? "Tag (New / Mix / Single)" : "Kind (Film / Mix / Interview)"} className="md:col-span-2">
          <input value={form.tag ?? ""} onChange={(e) => update({ tag: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Length" className="md:col-span-1">
          <input value={form.length ?? ""} onChange={(e) => update({ length: e.target.value })} className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UrlOrUpload
          label={item.kind === "track" ? "Audio source (URL or upload)" : "Video source (URL or upload)"}
          accept={item.kind === "track" ? "audio/*" : "video/*"}
          value={form.source_url ?? ""}
          onChange={(v) => update({ source_url: v })}
          inputRef={srcRef}
          busy={busyField === "source"}
          onFile={(f) => onUpload(f, "source")}
        />
        <UrlOrUpload
          label="Poster image (optional)"
          accept="image/*"
          value={form.poster_url ?? ""}
          onChange={(v) => update({ poster_url: v })}
          inputRef={posterRef}
          busy={busyField === "poster"}
          onFile={(f) => onUpload(f, "poster")}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Field label="Order" className="w-24">
          <input
            type="number"
            value={form.position}
            onChange={(e) => update({ position: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
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

function UrlOrUpload({
  label,
  accept,
  value,
  onChange,
  inputRef,
  busy,
  onFile,
}: {
  label: string;
  accept: string;
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  busy: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {value && (
        <div className="mt-1 truncate text-[10px] text-muted-foreground">{value}</div>
      )}
    </div>
  );
}
