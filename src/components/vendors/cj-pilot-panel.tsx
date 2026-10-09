// Pilot P1 — one CJ product, sorted and named, Founder-only.
// Reads CJ (read-only), suggests names with Frassy, and creates ONE private,
// unpublished draft only after the Founder ticks both confirmations.
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRIMARY_STORES, TAXONOMY, getTaxonomyNode } from "@/lib/taxonomy/registry";
import { PILOT_CATEGORY, PILOT_CJ_PID, type NameSuggestion } from "@/lib/vendors/cj-pilot";
import { createPilotDraft, getCjPilotDetail, suggestPilotNames } from "@/lib/vendors/cj-pilot.functions";

const STYLE_LABEL: Record<string, string> = {
  simple_elegant: "Simple & elegant",
  playful: "Playful",
  caribbean_frass: "Caribbean / Frass spirit",
};

type Brand = { id: string; display_name: string; verification_status: string };

export function CjPilotPanel({ supplierBrands, onCreated }: { supplierBrands: Brand[]; onCreated: () => void }) {
  const detailFn = useServerFn(getCjPilotDetail);
  const namesFn = useServerFn(suggestPilotNames);
  const createFn = useServerFn(createPilotDraft);

  const [open, setOpen] = useState(false);
  const detail = useQuery({ queryKey: ["cj-pilot", PILOT_CJ_PID], queryFn: () => detailFn(), enabled: open, retry: false, staleTime: 300_000 });

  const [store, setStore] = useState<string>(PILOT_CATEGORY.primaryStore);
  const [category, setCategory] = useState<string>(PILOT_CATEGORY.categoryKey);
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const [finalName, setFinalName] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [confirmName, setConfirmName] = useState(false);
  const [confirmCategory, setConfirmCategory] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

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
      createFn({ data: { vendorId, finalName, primaryStore: store, categoryKey: category, confirmName: true, confirmCategory: true } }),
    onSuccess: (r) => { setCreatedId(r.id); toast.success("Private draft created. Nothing was published."); onCreated(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const categories = TAXONOMY.filter((n) => n.store === store && n.kind !== "service");
  const node = getTaxonomyNode(category);
  const d = detail.data;
  const ready = Boolean(d && vendorId && finalName.trim().length >= 3 && confirmName && confirmCategory && !createdId);

  return (
    <section className="mt-12 rounded-xl border border-[color:var(--gold)]/50 p-5" aria-labelledby="cj-pilot-h">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Founder · Pilot P1</div>
      <h2 id="cj-pilot-h" className="mt-1 font-display text-2xl">One CJ product: sort and name</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Only this one item from your CJ My Products. The other 494 stay untouched. Nothing is published.
      </p>

      {!open ? (
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
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {d.images.slice(0, 6).map((u) => (
                <img key={u} src={u} alt="Supplier product photo" className="h-24 w-20 shrink-0 rounded-sm object-cover" loading="lazy" />
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Department
              <select className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal" value={store}
                onChange={(e) => { setStore(e.target.value); setCategory(""); setConfirmCategory(false); }}>
                {PRIMARY_STORES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Category
              <select className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal" value={category}
                onChange={(e) => { setCategory(e.target.value); setConfirmCategory(false); }}>
                <option value="">Choose…</option>
                {categories.map((n) => <option key={n.key} value={n.key}>{n.title}</option>)}
              </select>
            </label>
          </div>
          {category && category !== PILOT_CATEGORY.categoryKey && (
            <p className="text-xs text-[color:var(--gold)]">The pilot is approved only for Women's Work Drip — Work Blouses. Other choices will be refused.</p>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled={suggest.isPending} onClick={() => suggest.mutate()}>
                {suggestions.length ? "Ask Frassy again" : "Ask Frassy for names"}
              </Button>
              {suggest.isPending && <span className="text-xs text-muted-foreground">Frassy is thinking…</span>}
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-3 space-y-2">
                {suggestions.map((s) => (
                  <li key={s.style}>
                    <button type="button" onClick={() => { setFinalName(s.name); setConfirmName(false); }}
                      className={`w-full rounded-sm border px-3 py-2 text-left text-sm ${finalName === s.name ? "border-[color:var(--gold)]" : "border-border"}`}>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {STYLE_LABEL[s.style]}{recommended === s.style ? " · Frassy recommends" : ""}
                      </div>
                      <div className="font-display text-lg">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.why}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Final name (edit freely)
              <Input className="mt-1" value={finalName} maxLength={120} onChange={(e) => { setFinalName(e.target.value); setConfirmName(false); }} />
            </label>
          </div>

          <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Supplier brand (yours, stays unverified until you verify it)
            <select className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">{supplierBrands.length ? "Choose…" : "No supplier brand yet — add one above as kind “supplier”"}</option>
              {supplierBrands.map((b) => <option key={b.id} value={b.id}>{b.display_name} ({b.verification_status})</option>)}
            </select>
          </label>

          <div className="space-y-2 text-sm">
            <label className="flex gap-2"><input type="checkbox" checked={confirmName} disabled={finalName.trim().length < 3} onChange={(e) => setConfirmName(e.target.checked)} />
              I confirm the final name: <strong>{finalName || "—"}</strong></label>
            <label className="flex gap-2"><input type="checkbox" checked={confirmCategory} disabled={!node} onChange={(e) => setConfirmCategory(e.target.checked)} />
              I confirm the category: <strong>{node?.title ?? "—"}</strong></label>
          </div>

          {createdId ? (
            <p className="text-sm">Draft created privately. It appears in your brand list above as a draft. Not published.</p>
          ) : (
            <Button disabled={!ready || create.isPending} onClick={() => create.mutate()}>Create one private draft</Button>
          )}
        </div>
      ) : null}
    </section>
  );
}
