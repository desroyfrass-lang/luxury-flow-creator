import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VIRAL_CATEGORIES } from "@/lib/social-virals";
import type { ViralProductRow } from "@/hooks/use-viral-products";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/virals")({
  component: AdminViralsPage,
});

type FormState = {
  id?: string;
  category_slug: string;
  sub_slug: string;
  slug: string;
  title: string;
  blurb: string;
  price: string;
  compare_at: string;
  rating: string;
  reviews: string;
  sold: string;
  badge: string;
  image: string;
  sort_order: string;
};

const BADGES = ["", "Viral", "Hot", "New", "Deal", "Creator Pick"];

function emptyForm(cat = VIRAL_CATEGORIES[0].slug, sub = VIRAL_CATEGORIES[0].subs[0].slug): FormState {
  return {
    category_slug: cat,
    sub_slug: sub,
    slug: "",
    title: "",
    blurb: "",
    price: "0",
    compare_at: "",
    rating: "4.8",
    reviews: "0",
    sold: "",
    badge: "",
    image: "",
    sort_order: "0",
  };
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminViralsPage() {
  const qc = useQueryClient();
  const [filterCat, setFilterCat] = useState<string>(VIRAL_CATEGORIES[0].slug);
  const [filterSub, setFilterSub] = useState<string>(VIRAL_CATEGORIES[0].subs[0].slug);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const currentCat = VIRAL_CATEGORIES.find((c) => c.slug === filterCat)!;
  const subs = currentCat.subs;

  const { data: rows = [], refetch } = useQuery({
    queryKey: ["admin-viral-products", filterCat, filterSub],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viral_products")
        .select("*")
        .eq("category_slug", filterCat)
        .eq("sub_slug", filterSub)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ViralProductRow[];
    },
  });

  const formCat = useMemo(() => VIRAL_CATEGORIES.find((c) => c.slug === form.category_slug)!, [form.category_slug]);

  const startNew = () => {
    setForm(emptyForm(filterCat, filterSub));
    setEditing(true);
  };
  const startEdit = (row: ViralProductRow) => {
    setForm({
      id: row.id,
      category_slug: row.category_slug,
      sub_slug: row.sub_slug,
      slug: row.slug,
      title: row.title,
      blurb: row.blurb,
      price: String(row.price),
      compare_at: row.compare_at != null ? String(row.compare_at) : "",
      rating: String(row.rating),
      reviews: String(row.reviews),
      sold: row.sold,
      badge: row.badge ?? "",
      image: row.image,
      sort_order: String(row.sort_order),
    });
    setEditing(true);
  };

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-viral-products"] });
    qc.invalidateQueries({ queryKey: ["viral-products"] });
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      category_slug: form.category_slug,
      sub_slug: form.sub_slug,
      slug,
      title: form.title.trim(),
      blurb: form.blurb.trim(),
      price: Number(form.price) || 0,
      compare_at: form.compare_at ? Number(form.compare_at) : null,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      sold: form.sold.trim(),
      badge: form.badge || null,
      image: form.image.trim(),
      sort_order: Number(form.sort_order) || 0,
    };
    setSaving(true);
    try {
      const { error } = form.id
        ? await supabase.from("viral_products").update(payload).eq("id", form.id)
        : await supabase.from("viral_products").insert(payload);
      if (error) throw error;
      toast.success(form.id ? "Product updated" : "Product added");
      setEditing(false);
      setForm(emptyForm(filterCat, filterSub));
      invalidateAll();
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("viral_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    invalidateAll();
    refetch();
  };

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      {/* Product list */}
      <div>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Category</label>
            <select
              value={filterCat}
              onChange={(e) => {
                const c = VIRAL_CATEGORIES.find((x) => x.slug === e.target.value)!;
                setFilterCat(c.slug);
                setFilterSub(c.subs[0].slug);
              }}
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            >
              {VIRAL_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.emoji} {c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Sub-collection</label>
            <select
              value={filterSub}
              onChange={(e) => setFilterSub(e.target.value)}
              className="rounded border border-border bg-background px-3 py-2 text-sm"
            >
              {subs.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={startNew}
            className="ml-auto inline-flex items-center gap-2 rounded-sm bg-[color:var(--gold)] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--ink)]"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No custom products yet in this sub-collection. Defaults are still shown on the storefront until you add your own.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Image</th>
                  <th className="text-left px-3 py-2">Title</th>
                  <th className="text-left px-3 py-2">Price</th>
                  <th className="text-left px-3 py-2">Badge</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      {r.image ? (
                        <img src={r.image} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.slug}</div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      ${Number(r.price).toFixed(2)}
                      {r.compare_at && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">
                          ${Number(r.compare_at).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{r.badge ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => startEdit(r)} className="p-1.5 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(r.id)} className="p-1.5 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form */}
      <aside className="rounded-lg border border-border p-5 h-fit sticky top-6">
        <h3 className="font-display text-2xl mb-4">{editing ? (form.id ? "Edit product" : "New product") : "Product editor"}</h3>
        {!editing ? (
          <p className="text-sm text-muted-foreground">Select a product to edit, or click "Add product".</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Category</span>
                <select
                  value={form.category_slug}
                  onChange={(e) => {
                    const c = VIRAL_CATEGORIES.find((x) => x.slug === e.target.value)!;
                    upd("category_slug", c.slug);
                    upd("sub_slug", c.subs[0].slug);
                  }}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {VIRAL_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Sub</span>
                <select
                  value={form.sub_slug}
                  onChange={(e) => upd("sub_slug", e.target.value)}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                >
                  {formCat.subs.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <Field label="Title" value={form.title} onChange={(v) => upd("title", v)} />
            <Field label="Slug (auto if blank)" value={form.slug} onChange={(v) => upd("slug", v)} placeholder="cloud-slides" />
            <Field label="Blurb" value={form.blurb} onChange={(v) => upd("blurb", v)} />
            <Field label="Image URL" value={form.image} onChange={(v) => upd("image", v)} placeholder="https://…" />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Price" type="number" value={form.price} onChange={(v) => upd("price", v)} />
              <Field label="Compare at" type="number" value={form.compare_at} onChange={(v) => upd("compare_at", v)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Rating" type="number" value={form.rating} onChange={(v) => upd("rating", v)} />
              <Field label="Reviews" type="number" value={form.reviews} onChange={(v) => upd("reviews", v)} />
              <Field label="Sort" type="number" value={form.sort_order} onChange={(v) => upd("sort_order", v)} />
            </div>
            <Field label="Sold (e.g. '1.2k sold')" value={form.sold} onChange={(v) => upd("sold", v)} />
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Badge</span>
              <select
                value={form.badge}
                onChange={(e) => upd("badge", e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>{b || "— none —"}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 rounded-sm bg-[color:var(--gold)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--ink)] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setForm(emptyForm(filterCat, filterSub)); }}
                className="rounded-sm border border-border px-4 py-2.5 text-xs uppercase tracking-[0.25em]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
      />
    </label>
  );
}
