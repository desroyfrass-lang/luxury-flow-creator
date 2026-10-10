import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listTryOnQueue, decideTryOnReadiness, type QueueRow } from "@/lib/tryon/readiness.functions";
import { READINESS_LABEL, SUPPORT_LABEL, departmentOf, tryOnAdapter, type ReadinessStatus } from "@/lib/tryon/readiness";

export const Route = createFileRoute("/_authenticated/admin/tryon-prep")({
  head: () => ({
    meta: [
      { title: "Try-On Preparation Studio — Frass Admin" },
      { name: "description", content: "Founder-only preparation queue for try-on readiness." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TryOnPrepPage,
});

function TryOnPrepPage() {
  const listFn = useServerFn(listTryOnQueue);
  const { data, isLoading, error } = useQuery({ queryKey: ["tryon-prep-queue"], queryFn: () => listFn() });
  const [dept, setDept] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const rows = data ?? [];
  const depts = useMemo(() => Array.from(new Set(rows.map((r) => departmentOf(r.categoryKey)))).sort(), [rows]);
  const shown = rows.filter(
    (r) => (dept === "all" || departmentOf(r.categoryKey) === dept) && (statusFilter === "all" || r.status === statusFilter),
  );

  return (
    <div className="max-w-5xl">
      <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">Founder only · private</p>
      <h1 className="mt-2 text-3xl font-bold">Try-On Preparation Studio</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every saved product size enters this queue as <strong>Not ready</strong>. Check the photo, the size and the method, then
        record your decision. Nothing here is shown to shoppers, nothing is generated, and no product is changed or published.
        A Ready mark resets to "Needs re-review" if the photos, sizes or category change — never for price or stock.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        No try-on has been run on these products. "Ready" means you checked the records, not that a try-on was tested.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          Department
          <select className="rounded border border-border bg-background px-2 py-1" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          Status
          <select className="rounded border border-border bg-background px-2 py-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            {Object.entries(READINESS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading the queue…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{(error as Error).message}</p>}
      {!isLoading && !error && shown.length === 0 && <p className="mt-8 text-sm text-muted-foreground">Nothing in this view.</p>}

      <div className="mt-6 grid gap-4">
        {shown.map((r) => <QueueCard key={r.variantId} row={r} />)}
      </div>
    </div>
  );
}

function QueueCard({ row }: { row: QueueRow }) {
  const qc = useQueryClient();
  const decideFn = useServerFn(decideTryOnReadiness);
  const adapter = tryOnAdapter(row.categoryKey);
  const [note, setNote] = useState(row.reviewNote);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function decide(status: "not_ready" | "in_review" | "ready" | "not_supported") {
    setBusy(true);
    setMsg(null);
    try {
      await decideFn({ data: { variantId: row.variantId, status, method: status === "not_supported" ? null : adapter.method, note } });
      setMsg("Saved and recorded in the audit ledger.");
      await qc.invalidateQueries({ queryKey: ["tryon-prep-queue"] });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-xl border border-border/70 p-4">
      {row.variantImageUrl ? (
        <img src={row.variantImageUrl} alt={`${row.productTitle} ${row.optionLabel ?? ""}`} className="h-28 w-24 shrink-0 rounded object-cover" loading="lazy" />
      ) : (
        <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">No variant photo</div>
      )}
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="font-semibold">{row.productTitle} · {row.optionLabel ?? "No size label"}</div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wider">
            {READINESS_LABEL[row.status as ReadinessStatus] ?? row.status}
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {row.categoryKey ?? "No category"} · SKU {row.sku ?? "—"} · {row.publicationStatus === "unpublished" ? "Private, unpublished" : row.publicationStatus}
        </div>
        <div className="mt-1 text-xs">Method plan: {SUPPORT_LABEL[adapter.support]}</div>
        <div className="mt-1 text-xs text-muted-foreground">Measurements: none recorded yet — size label only.</div>
        <textarea
          className="mt-3 w-full rounded border border-border bg-background p-2 text-xs"
          rows={2}
          maxLength={2000}
          placeholder="Review note: what you checked (required for Ready)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <button disabled={busy} onClick={() => decide("in_review")} className="rounded border border-border px-3 py-1.5">Start review</button>
          <button disabled={busy || adapter.support !== "supported"} onClick={() => decide("ready")} className="rounded border border-[color:var(--gold)] px-3 py-1.5 disabled:opacity-40">Mark Try-On Ready</button>
          <button disabled={busy} onClick={() => decide("not_ready")} className="rounded border border-border px-3 py-1.5">Set not ready</button>
          <button disabled={busy} onClick={() => decide("not_supported")} className="rounded border border-border px-3 py-1.5">Not supported</button>
        </div>
        {msg && <p className="mt-2 text-xs text-muted-foreground" role="status">{msg}</p>}
      </div>
    </div>
  );
}
