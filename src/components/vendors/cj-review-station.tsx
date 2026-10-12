// Founder CJ review station — one stored CJ queue record at a time in the
// Vendor Room workspace. Back/Next never change status; only a confirmed
// draft save marks a record "drafted". No import, publish, Shopify or CJ writes.
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import { isEditableProductCategory } from "@/lib/vendors/cj-pilot";
import { stationPricing, type StationItem } from "@/lib/vendors/cj-station";
import { listCjStation, reopenCjStationItem, saveCjStationDraft } from "@/lib/vendors/cj-station.functions";
import { SupplierPhotos } from "./cj-pilot-panel";
import { PilotCategoryPicker } from "./pilot-category-picker";

type Brand = { id: string; display_name: string };

export function CjReviewStation({ supplierBrands, onSaved }: { supplierBrands: Brand[]; onSaved: () => void }) {
  const { userId } = useAuthUserId();
  const listFn = useServerFn(listCjStation);
  const q = useQuery({ queryKey: ["cj-station", userId], queryFn: () => listFn(), enabled: Boolean(userId) });
  const items = q.data?.items ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!items.length) return;
    if (!activeId || !items.some((i) => i.id === activeId)) setActiveId((items.find((i) => i.status === "pending") ?? items[0]).id);
  }, [items, activeId]);
  const index = items.findIndex((i) => i.id === activeId);
  const active = index >= 0 ? items[index] : null;

  const goNextPending = (fromId: string, list: StationItem[]) => {
    const start = list.findIndex((i) => i.id === fromId);
    const next = [...list.slice(start + 1), ...list.slice(0, start)].find((i) => i.status === "pending");
    setActiveId(next?.id ?? fromId);
  };

  return (
    <section className="mt-12 rounded-xl border border-[color:var(--gold)]/50 p-5" aria-label="CJ product review station">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Founder · CJ product review station</div>
          <h2 className="mt-2 font-display text-2xl">CJ records, one at a time</h2>
          <p className="mt-1 text-xs text-muted-foreground">Stored CJ supplier records — not store products. Saving makes a private draft only; nothing is imported, priced or published.</p>
          {q.data && <p className="mt-2 text-sm" data-testid="station-counts">{q.data.counts.pending} waiting · {q.data.counts.drafted} drafted</p>}
        </div>
        <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Refreshing…" : "Refresh"}</Button>
      </div>
      {q.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading CJ records…</p>}
      {q.isError && <p role="alert" className="mt-4 text-sm text-destructive">Could not load the CJ records: {(q.error as Error).message}</p>}
      {q.data && items.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No CJ records waiting.</p>}

      {items.length > 0 && (
        <label className="mt-4 block text-xs">Current record
          <select aria-label="Choose CJ record" className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm" value={activeId ?? ""} onChange={(e) => setActiveId(e.target.value)}>
            {items.map((i, n) => <option key={i.id} value={i.id}>{n + 1}. {i.workingName ?? i.supplierTitle} — {i.status === "drafted" ? "drafted" : "waiting"}{i.suggestedName ? " · priority" : ""}</option>)}
          </select>
        </label>
      )}

      {active && (
        <>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button size="sm" variant="outline" disabled={index <= 0} onClick={() => setActiveId(items[index - 1].id)}>← Back</Button>
            <span className="text-xs text-muted-foreground">{index + 1} of {items.length}</span>
            <Button size="sm" variant="outline" disabled={index >= items.length - 1} onClick={() => setActiveId(items[index + 1].id)}>Next →</Button>
          </div>
          <StationWorkspace key={active.id} item={active} supplierBrands={supplierBrands}
            onSaved={(list) => { onSaved(); goNextPending(active.id, list); }} />
        </>
      )}
    </section>
  );
}

function StationWorkspace({ item, supplierBrands, onSaved }: { item: StationItem; supplierBrands: Brand[]; onSaved: (list: StationItem[]) => void }) {
  const { userId } = useAuthUserId();
  const qc = useQueryClient();
  const listFn = useServerFn(listCjStation);
  const saveFn = useServerFn(saveCjStationDraft);
  const reopenFn = useServerFn(reopenCjStationItem);
  const [name, setName] = useState(item.workingName ?? item.suggestedName ?? "");
  const [store, setStore] = useState("drip");
  const [category, setCategory] = useState("");
  const [vendorId, setVendorId] = useState(supplierBrands.length === 1 ? supplierBrands[0].id : "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const pricing = useMemo(() => stationPricing(item), [item]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { queueId: item.id, vendorId, finalName: name.trim(), primaryStore: store, categoryKey: category } }),
    onSuccess: async (r) => {
      setError(null);
      setSaved(`Private draft ${r.reused ? "already existed and was kept" : "saved"}. Not published.`);
      const fresh = await qc.fetchQuery({ queryKey: ["cj-station", userId], queryFn: () => listFn() });
      onSaved(fresh.items);
    },
    onError: (e) => { setSaved(null); setError(e instanceof Error ? e.message : "Draft not saved."); },
  });
  const reopen = useMutation({
    mutationFn: () => reopenFn({ data: { queueId: item.id } }),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ["cj-station", userId] }); },
    onError: (e) => setError(e instanceof Error ? e.message : "Not reopened."),
  });
  const blockers = [
    name.trim().length < 3 && "a FRASS working name",
    !isEditableProductCategory(store, category) && "a confirmed category",
    !vendorId && "a supplier brand",
  ].filter(Boolean) as string[];

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2" data-testid="station-workspace">
      <div>
        <SupplierPhotos urls={item.images} />
        <dl className="mt-4 space-y-1 text-sm">
          <div><dt className="inline text-muted-foreground">Supplier original name (unchanged): </dt><dd className="inline" data-testid="station-original">{item.supplierTitle}</dd></div>
          <div><dt className="inline text-muted-foreground">CJ product ID: </dt><dd className="inline" data-testid="station-pid">{item.cjPid}</dd></div>
          <div><dt className="inline text-muted-foreground">Source SKU: </dt><dd className="inline">{item.sourceSku ?? "Missing"}</dd></div>
          <div><dt className="inline text-muted-foreground">CJ category: </dt><dd className="inline">{item.cjCategory ?? "Missing"}</dd></div>
          <div><dt className="inline text-muted-foreground">Weight: </dt><dd className="inline">{item.weightGrams != null ? `${item.weightGrams} g (CJ listed)` : "Missing"}</dd></div>
        </dl>
        <div className="mt-4 rounded-sm border border-border p-3 text-sm">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Provisional costs — not verified</div>
          <div data-testid="station-cost">Supplier cost: {pricing.supplierCost != null ? `$${pricing.supplierCost.toFixed(2)} USD (stored CJ list price)` : "Missing"}</div>
          <div>Shipping: not quoted</div>
          <div>Profit / margin: not calculated until shipping and costs are verified</div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Missing or unverified</div>
          <ul className="list-disc pl-5">{item.missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm">Status: <strong data-testid="station-status">{item.status === "drafted" ? "Drafted (private, not published)" : "Waiting for your review"}</strong></div>
        <label className="block text-xs">FRASS working name{item.suggestedName && !item.workingName ? " (your approved suggestion — not saved yet)" : ""}
          <Input aria-label="FRASS working name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
        </label>
        <PilotCategoryPicker mode="edit" store={store} category={category} onChange={(s, c) => { setStore(s); setCategory(c); }} />
        {category && <p className="text-xs text-muted-foreground">{classificationBreadcrumb(category)}</p>}
        <label className="block text-xs">Supplier brand
          <select aria-label="Supplier brand" className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
            <option value="">Choose…</option>
            {supplierBrands.map((b) => <option key={b.id} value={b.id}>{b.display_name}</option>)}
          </select>
        </label>
        {blockers.length > 0 && <p className="text-xs text-muted-foreground">To save, choose {blockers.join(", ")}.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {saved && <p role="status" className="text-sm">{saved}</p>}
        <div className="flex flex-wrap gap-2">
          <Button disabled={blockers.length > 0 || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : item.status === "drafted" ? "Save draft again" : "Save private draft"}</Button>
          {item.status === "drafted" && <Button variant="outline" disabled={reopen.isPending} onClick={() => reopen.mutate()}>Move back to waiting</Button>}
        </div>
      </div>
    </div>
  );
}
