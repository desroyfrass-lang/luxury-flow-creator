// Founder CJ review station — one stored CJ queue record at a time in the
// Vendor Room workspace. Back/Next never change status; only a confirmed
// draft save marks a record "drafted". No import, publish, Shopify or CJ writes.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import { isEditableProductCategory } from "@/lib/vendors/cj-pilot";
import { stationPricing, type StationItem } from "@/lib/vendors/cj-station";
import { listCjStation, reopenCjStationItem, saveCjStationDraft } from "@/lib/vendors/cj-station.functions";
import { refreshCjQueueDetail } from "@/lib/vendors/cj-detail.functions";
import { PilotSaved, SupplierPhotos, type SavedDraft } from "./cj-pilot-panel";
import { PilotCategoryPicker } from "./pilot-category-picker";

type Brand = { id: string; display_name: string };
type Vendor = { id: string; display_name: string; vendor_kind: string; verification_status: string };
type VendorProduct = { id: string; title: string; vendor_id?: string; draft_status: string };

/**
 * The original Vendor Room product workspace, now vendor-aware and sequential.
 * Position 1 is the existing CJ pilot (chiffon) workspace exactly as before;
 * positions 2+ are the stored CJ queue records. Back/Next never change status.
 */
export function CjReviewStation({ vendors, products, cjVendorId, pilot, savedDraftFor, onSaved }: {
  vendors: Vendor[];
  products: VendorProduct[];
  cjVendorId: string | null;
  pilot: ReactNode;
  savedDraftFor: (productId: string) => SavedDraft | null;
  onSaved: () => void;
}) {
  const { userId } = useAuthUserId();
  const listFn = useServerFn(listCjStation);
  const q = useQuery({ queryKey: ["cj-station", userId], queryFn: () => listFn(), enabled: Boolean(userId) });
  const items = q.data?.items ?? [];
  const supplierBrands: Brand[] = vendors.filter((v) => v.vendor_kind === "supplier");
  const [vendorId, setVendorId] = useState<string>(cjVendorId ?? vendors[0]?.id ?? "");
  useEffect(() => { if (!vendorId && (cjVendorId || vendors[0])) setVendorId(cjVendorId ?? vendors[0].id); }, [cjVendorId, vendors, vendorId]);
  // Position is kept per vendor, so switching brands never loses your place.
  const [positions, setPositions] = useState<Record<string, string>>({});
  const PILOT = "__pilot__";
  const sequence = [PILOT, ...items.map((i) => i.id)];
  const activeId = positions[vendorId] && sequence.includes(positions[vendorId]) ? positions[vendorId] : PILOT;
  const setActiveId = (id: string) => setPositions((p) => ({ ...p, [vendorId]: id }));
  const index = sequence.indexOf(activeId);
  const active = items.find((i) => i.id === activeId) ?? null;
  const isCjVendor = Boolean(vendorId) && vendorId === cjVendorId;
  const vendor = vendors.find((v) => v.id === vendorId);

  const goNextPending = (fromId: string, list: StationItem[]) => {
    const start = list.findIndex((i) => i.id === fromId);
    const next = [...list.slice(start + 1), ...list.slice(0, start)].find((i) => i.status === "pending");
    setActiveId(next?.id ?? fromId);
  };

  return (
    <section className="mt-12" aria-label="Vendor product workspace">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block min-w-[16rem] flex-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vendor
          <select aria-label="Vendor" className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm normal-case tracking-normal" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
            {vendors.length === 0 && <option value="">No vendor brands saved yet</option>}
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.display_name} ({v.vendor_kind.replace("_", " ")} · {v.verification_status})</option>)}
            {(q.data?.podProviders ?? []).map((p) => <option key={`pod-${p.name}`} value="" disabled>{p.name} (print on demand · {p.status === "connected" ? "connected" : "not connected"})</option>)}
          </select>
        </label>
        {isCjVendor && <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Refreshing…" : "Refresh"}</Button>}
      </div>

      {!isCjVendor ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm" data-testid="vendor-empty">
          {vendor ? (
            <>
              <div className="font-display text-lg">{vendor.display_name}</div>
              <p className="mt-1 text-xs text-muted-foreground">No supplier queue is connected for this vendor. Its saved drafts are below in its brand card.</p>
              <ul className="mt-2 list-disc pl-5 text-xs">{products.filter((p) => p.vendor_id === vendor.id).map((p) => <li key={p.id}>{p.title} — {p.draft_status}</li>)}</ul>
              {products.every((p) => p.vendor_id !== vendor.id) && <p className="mt-2 text-xs text-muted-foreground">No drafts yet.</p>}
            </>
          ) : <p className="text-xs text-muted-foreground">Choose a vendor.</p>}
        </div>
      ) : (
        <>
          <div className="mt-3 text-xs text-muted-foreground">
            {q.data && <span data-testid="station-counts">CJ queue: {q.data.counts.pending} waiting · {q.data.counts.drafted} drafted · </span>}
            Stored CJ supplier records — saving makes a private draft only; nothing is imported or published.
          </div>
          {q.isLoading && <p className="mt-2 text-sm text-muted-foreground">Loading CJ records…</p>}
          {q.isError && <p role="alert" className="mt-2 text-sm text-destructive">Could not load the CJ records: {(q.error as Error).message}</p>}
          <label className="mt-3 block text-xs">Product
            <select aria-label="Choose product" className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm" value={activeId} onChange={(e) => setActiveId(e.target.value)}>
              <option value={PILOT}>1. CJ pilot product (saved draft)</option>
              {items.map((i, n) => <option key={i.id} value={i.id}>{n + 2}. {i.workingName ?? i.supplierTitle} — {i.status === "drafted" ? "drafted" : "waiting"}{i.suggestedName ? " · priority" : ""}</option>)}
            </select>
          </label>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button size="sm" variant="outline" disabled={index <= 0} onClick={() => setActiveId(sequence[index - 1])}>← Back</Button>
            <span className="text-xs text-muted-foreground">{index + 1} of {sequence.length}</span>
            <Button size="sm" variant="outline" disabled={index >= sequence.length - 1} onClick={() => setActiveId(sequence[index + 1])}>Next →</Button>
          </div>
          {activeId === PILOT ? pilot : active ? (
            <div className="mt-6 rounded-xl border border-[color:var(--gold)]/50 p-5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Founder · CJ product review</div>
              {active.status === "drafted" && active.draftProductId && savedDraftFor(active.draftProductId) ? (
                <>
                  <PilotSaved key={active.draftProductId} draft={savedDraftFor(active.draftProductId)!} justCreated={false} onSaved={onSaved} pilotNames={false} />
                  <ReopenControl item={active} />
                </>
              ) : (
                <StationWorkspace key={active.id} item={active} supplierBrands={supplierBrands}
                  onSaved={(list) => { onSaved(); goNextPending(active.id, list); }} />
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function ReopenControl({ item }: { item: StationItem }) {
  const { userId } = useAuthUserId();
  const qc = useQueryClient();
  const reopenFn = useServerFn(reopenCjStationItem);
  const reopen = useMutation({
    mutationFn: () => reopenFn({ data: { queueId: item.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cj-station", userId] }),
  });
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs">
      <span className="text-muted-foreground">Queue status: drafted (private, not published). CJ original: {item.supplierTitle} · CJ {item.cjPid}</span>
      <Button size="sm" variant="outline" disabled={reopen.isPending} onClick={() => reopen.mutate()}>Move back to waiting</Button>
      {reopen.error && <span role="alert" className="text-destructive">{(reopen.error as Error).message}</span>}
    </div>
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
        <SupplierPhotos urls={item.detail && item.detail.images.length ? item.detail.images.map((i) => i.url) : item.images} />
        <SupplierDetailStatus item={item} />
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

/** Minimal truthful status for the cached read-only CJ detail. */
function SupplierDetailStatus({ item }: { item: StationItem }) {
  const qc = useQueryClient();
  const fn = useServerFn(refreshCjQueueDetail);
  const [msg, setMsg] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: () => fn({ data: { queueId: item.id } }),
    onSuccess: (r) => { setMsg(`Fetched ${r.images} photos and ${r.variants} variants from CJ.`); qc.invalidateQueries({ queryKey: ["cj-station"] }); },
    onError: (e) => setMsg(e instanceof Error ? e.message : "CJ details unavailable."),
  });
  const d = item.detail;
  return (
    <div className="mt-3 rounded-sm border border-border p-3 text-sm" data-testid="station-detail">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CJ supplier detail (read-only)</div>
      {d ? (
        <ul className="mt-1 space-y-0.5">
          <li>Fetched from CJ: {new Date(item.detailFetchedAt ?? d.fetchedAt).toLocaleString()}</li>
          <li>Photos: {d.images.length} original (dimensions not provided by CJ)</li>
          <li>Variants: {d.variants.length}{d.variants.length ? ` · CJ cost $${Math.min(...d.variants.map((v) => v.cost ?? Infinity)).toFixed(2)}–$${Math.max(...d.variants.map((v) => v.cost ?? 0)).toFixed(2)} USD` : ""}</li>
          <li>Colours: {d.colours.length ? d.colours.join(", ") : "none listed"}</li>
          <li>Sizes: {d.sizes.length ? d.sizes.join(", ") : "none listed"}</li>
          <li>Stock: not fetched</li>
        </ul>
      ) : <p className="mt-1">Not fetched yet — showing the stored snapshot only.</p>}
      {item.detailError && <p className="mt-1 text-destructive">Last fetch failed: {item.detailError}</p>}
      <Button type="button" size="sm" variant="outline" className="mt-2" disabled={m.isPending} onClick={() => { setMsg(null); m.mutate(); }}>
        {m.isPending ? "Reading from CJ…" : d ? "Refresh from CJ" : "Fetch full details from CJ"}
      </Button>
      {msg && <p className="mt-1 text-xs" role="status">{msg}</p>}
    </div>
  );
}
