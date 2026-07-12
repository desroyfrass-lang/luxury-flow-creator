import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Eye, EyeOff, Upload, Search, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/capsules")({
  component: AdminCapsulesPage,
});

const SIGNED_EXPIRY = 60 * 60 * 24 * 365 * 100;
const SLOTS = [
  "hat", "sunglasses", "outerwear", "shirt", "top", "bottom",
  "dress", "underwear", "swimwear", "shoes", "bag", "fragrance", "accessory",
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function uploadHero(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `capsules/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from("site-media").createSignedUrl(path, SIGNED_EXPIRY);
  if (sErr) throw sErr;
  return data.signedUrl;
}

interface CapsuleRecord {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  style: string | null;
  gender: string | null;
  occasion: string | null;
  season: string | null;
  hero_image: string | null;
  collection: string | null;
  bundle_discount_pct: number;
  published: boolean;
  position: number;
}

function useCapsules() {
  return useQuery({
    queryKey: ["admin-capsules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capsules")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as CapsuleRecord[];
    },
  });
}

function AdminCapsulesPage() {
  const { data: capsules, isLoading } = useCapsules();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      const existing = new Set((capsules ?? []).map((c) => c.handle));
      let handle = "new-capsule";
      let n = 1;
      while (existing.has(handle)) handle = `new-capsule-${++n}`;
      const { data, error } = await supabase
        .from("capsules")
        .insert({ handle, name: "New capsule", published: false, position: (capsules?.length ?? 0) })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Capsule created");
      qc.invalidateQueries({ queryKey: ["admin-capsules"] });
      setEditing(data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this capsule?")) return;
    const { error } = await supabase.from("capsules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (editing === id) setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-capsules"] });
  };

  const togglePublish = async (c: CapsuleRecord) => {
    const { error } = await supabase.from("capsules").update({ published: !c.published }).eq("id", c.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-capsules"] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Curated capsules appear on /capsules. Add items from the product catalog for each slot.
        </p>
        <button
          onClick={create}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> New capsule
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : !capsules || capsules.length === 0 ? (
        <div className="rounded border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          No capsules yet — create your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capsules.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 transition ${
                editing === c.id ? "border-[color:var(--gold)] bg-card" : "border-border/60 bg-card/60"
              }`}
            >
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {c.hero_image ? (
                    <img src={c.hero_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full chrome-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg truncate">{c.name}</h3>
                    {c.published ? (
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[color:var(--gold)]">Live</span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Draft</span>
                    )}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground truncate">/{c.handle}</div>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {[c.gender, c.style, c.collection].filter(Boolean).map((t) => (
                      <span key={t} className="rounded-full border border-border px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setEditing(editing === c.id ? null : c.id)}
                  className="flex-1 rounded border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] hover:border-foreground"
                >
                  {editing === c.id ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => togglePublish(c)}
                  className="rounded border border-border p-1.5 hover:border-foreground"
                  aria-label={c.published ? "Unpublish" : "Publish"}
                >
                  {c.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="rounded border border-border p-1.5 hover:border-destructive hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CapsuleEditor id={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CapsuleEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: capsule } = useQuery({
    queryKey: ["admin-capsule", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("capsules").select("*").eq("id", id).single();
      if (error) throw error;
      return data as CapsuleRecord;
    },
  });

  const [form, setForm] = useState<Partial<CapsuleRecord>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (capsule) setForm(capsule);
  }, [capsule]);

  const save = async () => {
    setSaving(true);
    try {
      const patch = {
        handle: form.handle ? slugify(form.handle) : capsule?.handle,
        name: form.name ?? capsule?.name,
        description: form.description ?? null,
        style: form.style ?? null,
        gender: form.gender ?? null,
        occasion: form.occasion ?? null,
        season: form.season ?? null,
        collection: form.collection ?? null,
        bundle_discount_pct: Number(form.bundle_discount_pct ?? 0),
        hero_image: form.hero_image ?? null,
      };
      const { error } = await supabase.from("capsules").update(patch).eq("id", id);
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-capsules"] });
      qc.invalidateQueries({ queryKey: ["admin-capsule", id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (f: File) => {
    setSaving(true);
    try {
      const url = await uploadHero(f);
      setForm((p) => ({ ...p, hero_image: url }));
      toast.success("Image uploaded — click Save to persist");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (!capsule) return null;

  return (
    <div className="mt-8 rounded-2xl border border-[color:var(--gold)]/50 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-2xl">Edit capsule</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Hero image */}
        <div>
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-muted relative">
            {form.hero_image ? (
              <img src={form.hero_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full chrome-surface" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded border border-border py-2 text-[11px] uppercase tracking-[0.25em] hover:border-foreground"
          >
            <Upload className="h-3.5 w-3.5" /> {form.hero_image ? "Replace image" : "Upload hero"}
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Row label="Name">
            <input
              value={form.name ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input"
            />
          </Row>
          <Row label="Handle (URL)">
            <input
              value={form.handle ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, handle: e.target.value }))}
              className="input font-mono text-sm"
            />
          </Row>
          <Row label="Description">
            <textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input"
            />
          </Row>
          <div className="grid grid-cols-2 gap-4">
            <Row label="Gender">
              <select
                value={form.gender ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value || null }))}
                className="input"
              >
                <option value="">—</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </Row>
            <Row label="Style">
              <input value={form.style ?? ""} onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))} className="input" placeholder="Street Luxury, Executive…" />
            </Row>
            <Row label="Occasion">
              <input value={form.occasion ?? ""} onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))} className="input" placeholder="Date Night, Airport…" />
            </Row>
            <Row label="Season">
              <input value={form.season ?? ""} onChange={(e) => setForm((p) => ({ ...p, season: e.target.value }))} className="input" placeholder="Summer, Winter…" />
            </Row>
            <Row label="Collection group">
              <input value={form.collection ?? ""} onChange={(e) => setForm((p) => ({ ...p, collection: e.target.value }))} className="input" placeholder="Street Luxury, New Arrivals…" />
            </Row>
            <Row label="Bundle discount %">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.bundle_discount_pct ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, bundle_discount_pct: Number(e.target.value) }))}
                className="input"
              />
            </Row>
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-2 text-[11px] uppercase tracking-[0.3em] font-bold text-[color:var(--ink)] disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-10 border-t border-border pt-6">
        <ItemsEditor capsuleId={id} />
      </div>

      <style>{`.input { width: 100%; background: transparent; border: 1px solid hsl(var(--border)); border-radius: 4px; padding: 8px 12px; font-size: 14px; outline: none; } .input:focus { border-color: var(--gold); }`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

interface AdminItem {
  id: string;
  slot: string;
  position: number;
  required: boolean;
  variant_id: string | null;
  product_id: string;
  product: { title: string; handle: string; min_price: number; currency: string; hero_image: string | null } | null;
  variant: { title: string; price: number } | null;
}

function ItemsEditor({ capsuleId }: { capsuleId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: items } = useQuery({
    queryKey: ["admin-capsule-items", capsuleId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("capsule_items")
        .select("*")
        .eq("capsule_id", capsuleId)
        .order("position", { ascending: true });
      if (error) throw error;
      const productIds = [...new Set((rows ?? []).map((r) => r.product_id))];
      const variantIds = (rows ?? []).map((r) => r.variant_id).filter((v): v is string => !!v);
      const [prods, vars] = await Promise.all([
        productIds.length
          ? supabase.from("products").select("id, title, handle, min_price, currency, hero_image").in("id", productIds)
          : Promise.resolve({ data: [] as never[] }),
        variantIds.length
          ? supabase.from("product_variants").select("id, title, price").in("id", variantIds)
          : Promise.resolve({ data: [] as never[] }),
      ]);
      const pmap = new Map((prods.data ?? []).map((p) => [p.id, p]));
      const vmap = new Map((vars.data ?? []).map((v) => [v.id, v]));
      return (rows ?? []).map((r) => ({
        id: r.id,
        slot: r.slot,
        position: r.position,
        required: r.required,
        variant_id: r.variant_id,
        product_id: r.product_id,
        product: pmap.get(r.product_id) ?? null,
        variant: r.variant_id ? vmap.get(r.variant_id) ?? null : null,
      })) as AdminItem[];
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("capsule_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-capsule-items", capsuleId] });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-display text-xl">Items in this capsule</h4>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)]"
        >
          <Plus className="h-3 w-3" /> Add product
        </button>
      </div>

      {showAdd && (
        <AddItemPanel
          capsuleId={capsuleId}
          nextPos={items?.length ?? 0}
          onAdded={() => {
            qc.invalidateQueries({ queryKey: ["admin-capsule-items", capsuleId] });
            setShowAdd(false);
          }}
        />
      )}

      {!items || items.length === 0 ? (
        <div className="rounded border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pieces yet — add products to build the look.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-4 rounded border border-border/60 bg-background/50 p-3">
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {it.product?.hero_image && <img src={it.product.hero_image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] rounded-full bg-[color:var(--gold)]/20 text-[color:var(--gold)] px-2 py-0.5">
                    {it.slot}
                  </span>
                  <span className="truncate text-sm font-medium">{it.product?.title ?? "(missing)"}</span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {it.variant ? `${it.variant.title} · ${it.product?.currency ?? ""} ${it.variant.price.toFixed(2)}` : "No default variant"}
                </div>
              </div>
              <button
                onClick={() => remove(it.id)}
                className="rounded border border-border p-2 hover:border-destructive hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductLite {
  id: string;
  title: string;
  handle: string;
  min_price: number;
  currency: string;
  hero_image: string | null;
}
interface VariantLite { id: string; title: string; price: number }

function AddItemPanel({ capsuleId, nextPos, onAdded }: { capsuleId: string; nextPos: number; onAdded: () => void }) {
  const [q, setQ] = useState("");
  const [slot, setSlot] = useState<string>(SLOTS[0]);
  const [picked, setPicked] = useState<ProductLite | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: results } = useQuery({
    queryKey: ["admin-product-search", q],
    queryFn: async () => {
      let req = supabase
        .from("products")
        .select("id, title, handle, min_price, currency, hero_image")
        .order("title", { ascending: true })
        .limit(20);
      if (q.trim()) req = req.ilike("title", `%${q.trim()}%`);
      const { data, error } = await req;
      if (error) throw error;
      return data as ProductLite[];
    },
  });

  const { data: variants } = useQuery({
    queryKey: ["admin-product-variants", picked?.id],
    enabled: !!picked,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, title, price")
        .eq("product_id", picked!.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data as VariantLite[];
    },
  });

  const add = async () => {
    if (!picked) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("capsule_items").insert({
        capsule_id: capsuleId,
        product_id: picked.id,
        variant_id: variantId,
        slot,
        position: nextPos,
        required: true,
      });
      if (error) throw error;
      toast.success("Added");
      setPicked(null);
      setVariantId(null);
      setQ("");
      onAdded();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-border bg-background/50 p-4">
      {!picked ? (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search catalog…"
              className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {(results ?? []).map((p) => (
              <button
                key={p.id}
                onClick={() => setPicked(p)}
                className="w-full flex items-center gap-3 rounded p-2 hover:bg-foreground/5 text-left"
              >
                <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  {p.hero_image && <img src={p.hero_image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{p.title}</div>
                  <div className="text-[10px] text-muted-foreground">{p.currency} {Number(p.min_price).toFixed(2)}</div>
                </div>
              </button>
            ))}
            {results?.length === 0 && <div className="text-center py-4 text-xs text-muted-foreground">No matches</div>}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded overflow-hidden bg-muted flex-shrink-0">
              {picked.hero_image && <img src={picked.hero_image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{picked.title}</div>
            </div>
            <button onClick={() => setPicked(null)} className="text-xs text-muted-foreground hover:text-foreground">
              Change
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Slot</div>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm outline-none"
              >
                {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Default variant</div>
              <select
                value={variantId ?? ""}
                onChange={(e) => setVariantId(e.target.value || null)}
                className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm outline-none"
              >
                <option value="">— none —</option>
                {(variants ?? []).map((v) => (
                  <option key={v.id} value={v.id}>{v.title} · {Number(v.price).toFixed(2)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              onClick={add}
              disabled={adding}
              className="inline-flex items-center gap-2 rounded border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] font-bold text-[color:var(--ink)] disabled:opacity-50"
            >
              Add to capsule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
