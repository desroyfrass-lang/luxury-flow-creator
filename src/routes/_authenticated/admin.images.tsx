import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SLOT_SECTIONS, LOOKBOOK_STORY_SLUGS, type SlotDef } from "@/lib/image-slots";
import {
  useSiteImages,
  useLookbookStoryImages,
  useProductOverrides,
} from "@/hooks/use-site-images";
import { toast } from "sonner";
import { Upload, RotateCcw, Trash2, Plus, Search } from "lucide-react";

const SIGNED_EXPIRY = 60 * 60 * 24 * 365 * 100; // ~100 years

async function uploadAndSign(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("site-images")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data: signed, error: signErr } = await supabase.storage
    .from("site-images")
    .createSignedUrl(path, SIGNED_EXPIRY);
  if (signErr) throw signErr;
  return { url: signed.signedUrl, path };
}

export const Route = createFileRoute("/_authenticated/admin/images")({
  component: AdminImagesPage,
});

function AdminImagesPage() {
  const [tab, setTab] = useState<"site" | "lookbook" | "products">("site");
  return (
    <div>
      <div className="mb-8 flex items-center gap-2 border-b border-border/60">
        {(["site", "lookbook", "products"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-3 text-[11px] uppercase tracking-[0.3em] transition ${
              tab === t ? "text-[color:var(--gold)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "site" ? "Site" : t === "lookbook" ? "Lookbook spreads" : "Product overrides"}
            {tab === t && <span className="absolute bottom-0 left-4 right-4 h-px bg-[color:var(--gold)]" />}
          </button>
        ))}
      </div>

      {tab === "site" && <SiteSlotsTab />}
      {tab === "lookbook" && <LookbookTab />}
      {tab === "products" && <ProductOverridesTab />}
    </div>
  );
}

/* ---------- Site slots tab ---------- */

function SiteSlotsTab() {
  const { data: overrides } = useSiteImages();
  return (
    <div className="space-y-12">
      {SLOT_SECTIONS.map((section) => (
        <section key={section.title}>
          <div className="mb-6">
            <h2 className="font-display text-2xl">{section.title}</h2>
            {section.description && (
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.slots.map((slot) => (
              <SlotCard key={slot.key} slot={slot} currentUrl={overrides?.get(slot.key)?.url} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({ slot, currentUrl }: { slot: SlotDef; currentUrl?: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const displayUrl = currentUrl ?? slot.fallback;
  const isOverride = Boolean(currentUrl);

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const { url } = await uploadAndSign(file, slot.key);
      const { error } = await supabase
        .from("site_images")
        .upsert({ slot_key: slot.key, url, alt: slot.label }, { onConflict: "slot_key" });
      if (error) throw error;
      toast.success(`${slot.label} updated`);
      qc.invalidateQueries({ queryKey: ["site-images"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!isOverride) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("site_images").delete().eq("slot_key", slot.key);
      if (error) throw error;
      toast.success(`${slot.label} reset to default`);
      qc.invalidateQueries({ queryKey: ["site-images"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="relative aspect-[4/3] bg-secondary/30">
        <img src={displayUrl} alt={slot.label} className="absolute inset-0 h-full w-full object-cover" />
        {isOverride && (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--gold)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[color:var(--ink)]">
            Custom
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm font-medium">{slot.label}</div>
        {slot.hint && <div className="mt-1 text-[11px] text-muted-foreground">{slot.hint}</div>}
        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-[color:var(--gold)] disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Working…" : isOverride ? "Replace" : "Upload"}
          </button>
          {isOverride && (
            <button
              onClick={onReset}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-sm border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-destructive hover:text-destructive disabled:opacity-50"
              title="Reset to default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Lookbook gallery tab ---------- */

function LookbookTab() {
  const [slug, setSlug] = useState<string>(LOOKBOOK_STORY_SLUGS[0]);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {LOOKBOOK_STORY_SLUGS.map((s) => (
          <button
            key={s}
            onClick={() => setSlug(s)}
            className={`rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] transition ${
              slug === s
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.replace("-drip", "").replace(/-/g, " ")}
          </button>
        ))}
      </div>
      <StoryGallery slug={slug} />
    </div>
  );
}

function StoryGallery({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: images } = useLookbookStoryImages(slug);
  const [busy, setBusy] = useState(false);

  const onAdd = async (files: FileList) => {
    setBusy(true);
    try {
      const nextPos = (images?.length ?? 0);
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const { url } = await uploadAndSign(f, `lookbook/${slug}`);
        const { error } = await supabase
          .from("lookbook_story_images")
          .insert({ story_slug: slug, url, position: nextPos + i, alt: slug });
        if (error) throw error;
      }
      toast.success(`Added ${files.length} image(s)`);
      qc.invalidateQueries({ queryKey: ["lookbook-story-images", slug] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Remove this image?")) return;
    const { error } = await supabase.from("lookbook_story_images").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["lookbook-story-images", slug] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {images?.length ?? 0} image{(images?.length ?? 0) === 1 ? "" : "s"} in this volume
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--ink)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Add images"}
        </button>
      </div>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border/60">
              <img src={img.url} alt={img.alt ?? ""} className="absolute inset-0 h-full w-full object-cover" />
              <button
                onClick={() => onDelete(img.id)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
          No custom spreads yet — defaults from the codebase are shown on the live site.
        </div>
      )}
    </div>
  );
}

/* ---------- Product overrides tab ---------- */

function ProductOverridesTab() {
  const [productId, setProductId] = useState("");
  const [active, setActive] = useState<string | null>(null);
  return (
    <div>
      <div className="mb-8 rounded-xl border border-border/60 bg-card p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Shopify product ID
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. 7891234567890"
            className="flex-1 rounded-sm border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <button
            onClick={() => setActive(productId.trim() || null)}
            className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--ink)]"
          >
            <Search className="h-3.5 w-3.5" /> Load
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Find the ID in the Shopify admin URL when editing a product. Overrides here replace the Shopify gallery on the product page.
        </p>
      </div>
      {active && <ProductOverrideEditor productId={active} />}
    </div>
  );
}

function ProductOverrideEditor({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: images } = useProductOverrides(productId);
  const [busy, setBusy] = useState(false);

  const onAdd = async (files: FileList) => {
    setBusy(true);
    try {
      const nextPos = images?.length ?? 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const { url } = await uploadAndSign(f, `products/${productId}`);
        const { error } = await supabase
          .from("product_image_overrides")
          .insert({ product_id: productId, url, position: nextPos + i });
        if (error) throw error;
      }
      toast.success(`Added ${files.length} image(s)`);
      qc.invalidateQueries({ queryKey: ["product-image-overrides", productId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("product_image_overrides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["product-image-overrides", productId] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Product <span className="text-foreground font-mono">{productId}</span> — {images?.length ?? 0} override{images?.length === 1 ? "" : "s"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--ink)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Add images"}
        </button>
      </div>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border/60">
              <img src={img.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <button
                onClick={() => onDelete(img.id)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
          No overrides yet — the product page will show Shopify's gallery.
        </div>
      )}
    </div>
  );
}
