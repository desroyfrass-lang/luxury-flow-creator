// Pilot P1 — one CJ product, sorted and named, Founder-only.
// Reads CJ (read-only), suggests names with Frassy, and creates ONE private,
// unpublished draft only after the Founder ticks both confirmations.
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { getTaxonomyNode } from "@/lib/taxonomy/registry";
import { classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import { PilotCategoryPicker } from "./pilot-category-picker";
import { PILOT_CATEGORY, PILOT_CJ_PID, isPilotCategoryAllowed, isEditableProductCategory, type NameSuggestion } from "@/lib/vendors/cj-pilot";
import { createPilotDraft, getCjPilotDetail, suggestPilotNames, updatePilotDraft } from "@/lib/vendors/cj-pilot.functions";
import { createVendorProfile } from "@/lib/vendors/products.functions";

const STYLE_LABEL: Record<string, string> = {
  simple_elegant: "Simple & elegant",
  playful: "Playful",
  caribbean_frass: "Caribbean / Frass spirit",
};

type SavedVariant = { source_variant_ref: string; sku: string | null; option_label: string | null; supplier_cost: number | null; currency: string };
export type SavedDraft = { id: string; title: string; category_key: string | null; originalName?: string | null; media?: string[]; variants?: SavedVariant[]; cost?: number | null; draftStatus?: string; publicationStatus?: string };

/** Supplier photos with a visible fallback when a CJ link fails — never silently dropped. */
export function SupplierPhotos({ urls }: { urls: string[] }) {
  const [failed, setFailed] = useState<string[]>([]);
  if (urls.length === 0) return <p className="mt-2 text-xs text-destructive" role="status">No supplier photos are saved for this product.</p>;
  return (
    <div>
      <div className="mt-3 flex gap-2 overflow-x-auto" aria-label="Supplier photos">
        {urls.map((u, i) => failed.includes(u) ? (
          <a key={u} href={u} target="_blank" rel="noreferrer" className="flex h-24 w-20 shrink-0 items-center justify-center rounded-sm border border-dashed border-destructive p-1 text-center text-[10px] text-destructive">Photo {i + 1} did not load — open link</a>
        ) : (
          <img key={u} src={u} alt={`Supplier product photo ${i + 1}`} className="h-24 w-20 shrink-0 rounded-sm object-cover" loading="lazy" onError={() => setFailed((f) => [...f, u])} />
        ))}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{urls.length - failed.length} of {urls.length} photos showing{failed.length ? " · CJ did not deliver some photos; they are still saved" : ""}</div>
    </div>
  );
}

function NameSuggestions({ suggestions, recommended, selected, onPick }: { suggestions: NameSuggestion[]; recommended: string | null; selected: string; onPick: (n: string) => void }) {
  if (!suggestions.length) return null;
  return (
    <ul className="mt-3 space-y-2" aria-label="Frassy name suggestions">
      {suggestions.map((s) => (
        <li key={s.style}>
          <button type="button" onClick={() => onPick(s.name)}
            className={`w-full rounded-sm border px-3 py-2 text-left text-sm ${selected === s.name ? "border-[color:var(--gold)]" : "border-border"}`}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Suggestion · {STYLE_LABEL[s.style]}{recommended === s.style ? " · Frassy recommends" : ""}
            </div>
            <div className="font-display text-lg">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.why}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

type Brand = { id: string; display_name: string; verification_status: string };

export function CjPilotPanel({ supplierBrands, existingDraft, onCreated }: {
  supplierBrands: Brand[];
  existingDraft: SavedDraft | null;
  onCreated: () => void;
}) {
  const detailFn = useServerFn(getCjPilotDetail);
  const namesFn = useServerFn(suggestPilotNames);
  const createFn = useServerFn(createPilotDraft);
  const createBrandFn = useServerFn(createVendorProfile);

  const [open, setOpen] = useState(false);
  const detail = useQuery({ queryKey: ["cj-pilot", PILOT_CJ_PID], queryFn: () => detailFn(), enabled: open, retry: false, staleTime: 300_000 });

  const [store, setStore] = useState<string>(PILOT_CATEGORY.primaryStore);
  const [category, setCategory] = useState<string>(PILOT_CATEGORY.categoryKey);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const [finalName, setFinalName] = useState("Soft Life Chiffon");
  const [vendorId, setVendorId] = useState("");
  const [confirmName, setConfirmName] = useState(false);
  const [confirmCategory, setConfirmCategory] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState("CJ Dropshipping");

  // Remember the supplier brand: a saved brand is picked automatically when it is the only one.
  const effectiveVendorId =
    vendorId && supplierBrands.some((b) => b.id === vendorId) ? vendorId
    : supplierBrands.length === 1 ? supplierBrands[0].id
    : vendorId;
  useEffect(() => {
    if (!vendorId && supplierBrands.length === 1) setVendorId(supplierBrands[0].id);
  }, [supplierBrands, vendorId]);

  const addBrand = useMutation({
    mutationFn: () => createBrandFn({ data: { displayName: newBrandName.trim(), vendorKind: "supplier" } }),
    onSuccess: (row) => { setVendorId(row.id); toast.success("Supplier brand created — pending, not verified."); onCreated(); },
    onError: (e: Error) => toast.error(`Could not create the supplier brand: ${e.message}`),
  });

  const suggest = useMutation({
    mutationFn: () => namesFn(),
    onSuccess: (r) => {
      setSuggestions(r.suggestions);
      setRecommended(r.recommended);
      const rec = r.suggestions.find((s) => s.style === r.recommended);
      if (rec && !finalName) setFinalName(rec.name);
      setConfirmName(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: () =>
      createFn({ data: { vendorId: effectiveVendorId, finalName: finalName.trim(), primaryStore: store, categoryKey: category, confirmName: true, confirmCategory: true } }),
    onSuccess: (r) => { setCreatedId(r.id); toast.success("Private draft created. Nothing was published."); onCreated(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const node = getTaxonomyNode(category);
  const categoryAllowed = isPilotCategoryAllowed(store, category);
  const d = detail.data;
  const missing = [
    !effectiveVendorId && "create or choose a supplier brand",
    finalName.trim().length < 3 && "enter a final name (3+ letters)",
    !node && "choose a category",
    node && !categoryAllowed && "choose a supported Women's Frass Drip product category for Pilot P1",
    !confirmName && "tick the name confirmation",
    !confirmCategory && "tick the category confirmation",
  ].filter(Boolean) as string[];
  const ready = Boolean(d && missing.length === 0 && !createdId);
  const saved: SavedDraft | null = existingDraft ?? (createdId ? { id: createdId, title: finalName.trim(), category_key: category, originalName: d?.originalName, media: d?.images, cost: d?.supplierCost } : null);

  return (
    <section className="mt-12 rounded-xl border border-[color:var(--gold)]/50 p-5" aria-labelledby="cj-pilot-h">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Founder · Pilot P1</div>
      <h2 id="cj-pilot-h" className="mt-1 font-display text-2xl">One CJ product: sort and name</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Only this one item from your CJ My Products. The other 494 stay untouched. Nothing is published.
      </p>

      {saved ? (
        <PilotSaved draft={saved} justCreated={Boolean(createdId)} onSaved={onCreated} />
      ) : !open ? (
        <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>Read it from CJ</Button>
      ) : detail.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Checking it is in your CJ My Products, then reading details…</p>
      ) : detail.error ? (
        <p className="mt-4 text-sm text-destructive">{(detail.error as Error).message}</p>
      ) : d ? (
        <div className="mt-5 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Supplier's original name (kept private)</div>
            <div className="text-sm">{d.originalName}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              CJ {d.sku} · supplier cost {d.supplierCost != null ? `$${d.supplierCost.toFixed(2)}` : "unknown"} · {d.variants.length} variants · {d.images.length} photos ·
              stock and delivery time: unknown (needs destination, never guessed)
            </div>
            <SupplierPhotos urls={d.images} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Where it goes</div>
            <PilotCategoryPicker store={store} category={category} onChange={(s, c) => {
              setStore(s); setCategory(c); setConfirmCategory(false);
            }} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled={suggest.isPending} onClick={() => suggest.mutate()}>
                {suggestions.length ? "Ask Frassy again" : "Ask Frassy for names"}
              </Button>
              {suggest.isPending && <span className="text-xs text-muted-foreground">Frassy is thinking…</span>}
            </div>
            <NameSuggestions suggestions={suggestions} recommended={recommended} selected={finalName} onPick={(n) => { setFinalName(n); setConfirmName(false); }} />
            <label className="mt-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Final name (edit freely)
              <Input className="mt-1" value={finalName} maxLength={120} onChange={(e) => { setFinalName(e.target.value); setConfirmName(false); }} />
            </label>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Supplier brand (yours, stays pending until you verify it)
              <select className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal" value={effectiveVendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">{supplierBrands.length ? "Choose…" : "No supplier brand yet — create one below"}</option>
                {supplierBrands.map((b) => <option key={b.id} value={b.id}>{b.display_name} ({b.verification_status})</option>)}
              </select>
            </label>
            {!effectiveVendorId && supplierBrands.length === 0 && (
              <div className="mt-3 rounded-sm border border-dashed border-border p-3">
                <div className="text-xs">Create a pending supplier brand here (kind: supplier, owner: you, not verified).</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Truthfully: CJ Dropshipping is the sourcing intermediary you buy through, not the maker. The actual manufacturer is unknown and is not claimed.
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input value={newBrandName} maxLength={160} onChange={(e) => setNewBrandName(e.target.value)} aria-label="Supplier brand name" />
                  <Button variant="outline" disabled={newBrandName.trim().length < 2 || addBrand.isPending} onClick={() => addBrand.mutate()}>
                    {addBrand.isPending ? "Creating…" : "Create pending supplier brand"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <label className="flex gap-2"><input type="checkbox" checked={confirmName} disabled={finalName.trim().length < 3} onChange={(e) => setConfirmName(e.target.checked)} />
              I confirm the final name: <strong>{finalName || "—"}</strong></label>
            <label className="flex gap-2"><input type="checkbox" checked={confirmCategory} disabled={!categoryAllowed} onChange={(e) => setConfirmCategory(e.target.checked)} />
              I confirm the category: <strong>{category ? classificationBreadcrumb(category) : "—"}</strong></label>
          </div>

          {createdId ? null : (
            <div>
              <Button disabled={!ready || create.isPending} onClick={() => create.mutate()}>
                {create.isPending ? "Saving…" : "Create one private draft"}
              </Button>
              {missing.length > 0 && <p className="mt-2 text-xs text-[color:var(--gold)]">Before saving: {missing.join(" · ")}.</p>}
              {create.error && <p className="mt-2 text-xs text-destructive">Not saved: {(create.error as Error).message}</p>}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

/** After saving: honest next steps. Only real, existing tools; nothing auto-generates, charges or publishes. */
function PilotSaved({ draft: initialDraft, justCreated, onSaved }: { draft: SavedDraft; justCreated: boolean; onSaved: () => void }) {
  const updateFn = useServerFn(updatePilotDraft);
  const namesFn = useServerFn(suggestPilotNames);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const suggest = useMutation({
    mutationFn: () => namesFn(),
    onSuccess: (r) => { setSuggestions(r.suggestions); setRecommended(r.recommended); },
    onError: (e: Error) => toast.error(e.message),
  });
  const [draft, setDraft] = useState<SavedDraft>(initialDraft);
  useEffect(() => setDraft(initialDraft), [initialDraft.id, initialDraft.title, initialDraft.category_key]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(draft.title);
  const [store, setStore] = useState(draft.category_key?.split("/")[0] ?? "");
  const [cat, setCat] = useState(draft.category_key ?? "");
  const [confirm, setConfirm] = useState(false);
  const startEdit = () => { setName(draft.title); setStore(draft.category_key?.split("/")[0] ?? ""); setCat(draft.category_key ?? ""); setConfirm(false); setEditing(true); };
  const save = useMutation({
    mutationFn: () => updateFn({ data: { productId: draft.id, finalName: name.trim(), primaryStore: store, categoryKey: cat, confirm: true } }),
    onSuccess: (r) => { setDraft((d) => ({ ...d, title: r.title, category_key: r.category_key })); setEditing(false); toast.success("Draft updated. Still private, not published."); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const locked = (draft.draftStatus != null && !["draft", "prepared"].includes(draft.draftStatus)) || (draft.publicationStatus != null && draft.publicationStatus !== "unpublished");
  const unchanged = name.trim() === draft.title && cat === draft.category_key;
  const editMissing = [
    name.trim().length < 3 && "enter a name (3+ letters)",
    !cat && "choose a subcategory",
    cat && !isEditableProductCategory(store, cat) && "choose a confirmed product category",
    unchanged && "change the name or category",
    !confirm && "tick the confirmation",
  ].filter(Boolean) as string[];
  const steps = [
    {
      title: "Make image / video",
      tool: "FV Studios → Create",
      to: "/studios/create" as const,
      blocker: "Studio productions start from a story brief, not a product. It cannot receive this draft's photos yet, so nothing would be carried over.",
    },
    {
      title: "Send to capsules",
      tool: "Capsule builder",
      to: "/admin/capsules" as const,
      blocker: "Capsules can only hold items from the existing live shop list. This draft lives in the new product list, so it cannot be added until the two are linked.",
    },
    {
      title: "Send to try-ons",
      tool: "Fitting Room",
      to: "/try-on" as const,
      blocker: "The Fitting Room only uses items in a shopper's cart from the live shop, and only accepts photos from trusted image hosts. CJ photos and unpublished drafts are not accepted yet.",
    },
  ];
  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-sm border border-[color:var(--gold)]/60 p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">{justCreated ? "Saved just now" : "Already saved"} · private · not published</div>
        <div className="mt-1 font-display text-2xl">{draft.title}</div>
        <div className="text-xs text-muted-foreground">{classificationBreadcrumb(draft.category_key)} · Draft ID {draft.id.slice(0, 8)}…</div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Saved name above · supplier's original name (private): <span className="normal-case tracking-normal">{draft.originalName ?? "not recorded"}</span></div>
        <SupplierPhotos urls={draft.media ?? []} />
        {draft.variants && draft.variants.length > 0 && (
          <details className="mt-2 text-xs"><summary className="cursor-pointer text-muted-foreground">{draft.variants.length} sizes/colours · supplier cost {draft.cost != null ? `$${Number(draft.cost).toFixed(2)}` : "unknown"} (permanent)</summary>
            <ul className="mt-1 space-y-0.5">{draft.variants.map((v) => <li key={v.source_variant_ref}>{v.option_label ?? v.sku ?? v.source_variant_ref} · {v.supplier_cost != null ? `${v.currency} ${Number(v.supplier_cost).toFixed(2)}` : "cost unknown"}</li>)}</ul>
          </details>
        )}
        <p className="mt-2 text-xs text-muted-foreground">It also appears under your supplier brand above. Supplier stays unverified until you verify it. CJ's original name, photos, sizes/colours and cost are permanent and cannot be edited.</p>
        {!editing && locked ? (
          <p className="mt-3 text-xs text-muted-foreground" role="status">Editing is locked: this product is {draft.draftStatus?.replaceAll("_", " ")}{draft.publicationStatus && draft.publicationStatus !== "unpublished" ? `, ${draft.publicationStatus}` : ""}. Only private drafts can be edited.</p>
        ) : !editing ? (
          <Button className="mt-3" variant="outline" size="sm" onClick={startEdit}>Edit name and category</Button>
        ) : (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <Button variant="outline" size="sm" disabled={suggest.isPending} onClick={() => suggest.mutate()}>{suggestions.length ? "Ask Frassy again" : "Ask Frassy for 3 names"}</Button>
              {suggest.isPending && <span className="ml-2 text-xs text-muted-foreground">Frassy is thinking…</span>}
              <p className="mt-1 text-[10px] text-muted-foreground">Suggestions only. Nothing changes until you pick or type a name, confirm and save.</p>
              <NameSuggestions suggestions={suggestions} recommended={recommended} selected={name} onPick={(n) => { setName(n); setConfirm(false); }} />
            </div>
            <label className="block text-xs">Product name (your final say)
              <Input aria-label="Product name" className="mt-1" value={name} maxLength={120} onChange={(e) => { setName(e.target.value); setConfirm(false); }} />
            </label>
            <PilotCategoryPicker mode="edit" store={store} category={cat} onChange={(s, c) => { setStore(s); setCat(c); setConfirm(false); }} />
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              I confirm: <strong>{name.trim() || "—"}</strong> in <strong>{cat ? classificationBreadcrumb(cat) : "—"}</strong></label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={editMissing.length > 0 || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save changes"}</Button>
              <Button size="sm" variant="ghost" disabled={save.isPending} onClick={() => setEditing(false)}>Cancel</Button>
            </div>
            {editMissing.length > 0 && <p className="text-xs text-[color:var(--gold)]">Before saving: {editMissing.join(" · ")}</p>}
            {save.error && <p className="text-xs text-destructive" role="alert">{(save.error as Error).message}</p>}
          </div>
        )}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Next steps for this product</div>
        <ul className="mt-2 space-y-2">
          {steps.map((s) => (
            <li key={s.title} className="rounded-sm border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">{s.title}</div>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Not connected yet</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.blocker}</p>
              <Link to={s.to} className="mt-2 inline-block text-xs underline">Open {s.tool} on its own (this product will not be carried over)</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
