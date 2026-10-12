// Founder-only CJ supplier queue. Reads existing cj_import_queue records;
// the only write is an explicitly saved working name. No import, no publish.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { founderListCjPending, founderSaveCjDraftName, type CjReviewItem } from "@/lib/cj.functions";

/** Founder-approved working names — suggestions only until explicitly saved. */
export const SUGGESTED_NAMES: Record<string, string> = {
  "2607170938071630700": "The Empress Lace Maxi",
  "2607170943591639200": "Rebel Chic Shoulder Bag",
  "2607171029281633900": "Everyday Muse Top",
  "2607170956071616600": "Little Legend Plaid Shirt",
  "2607170940371632800": "The Class Act Blouse",
};

export function CjReviewQueue() {
  const { userId } = useAuthUserId();
  const listFn = useServerFn(founderListCjPending);
  const q = useQuery({ queryKey: ["founder-cj-queue", userId], queryFn: () => listFn(), enabled: Boolean(userId) });
  const [open, setOpen] = useState<string | null>(null);
  const items = [...(q.data ?? [])].sort((a, b) => Number(Boolean(SUGGESTED_NAMES[b.cjPid])) - Number(Boolean(SUGGESTED_NAMES[a.cjPid])));

  return (
    <div className="mt-8 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">CJ supplier queue — not products yet</div>
          <h2 className="mt-1 font-display text-2xl">CJ records waiting for you{q.data ? ` (${q.data.length})` : ""}</h2>
          <p className="text-xs text-muted-foreground">Supplier listings saved from CJ. Nothing here is imported, priced or published.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Refreshing…" : "Refresh"}</Button>
      </div>
      {q.isLoading && <p className="mt-3 text-sm text-muted-foreground">Loading CJ records…</p>}
      {q.isError && <p role="alert" className="mt-3 text-sm text-destructive">Could not load the CJ queue: {(q.error as Error).message}</p>}
      {q.data && q.data.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No pending CJ records.</p>}
      <ul className="mt-3 divide-y divide-border">
        {items.map((it) => (
          <li key={it.id} className="py-2">
            <button type="button" aria-expanded={open === it.id} onClick={() => setOpen(open === it.id ? null : it.id)} className="flex w-full items-center gap-3 text-left">
              {it.imageUrl ? <img src={it.imageUrl} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded object-cover" /> : <div className="h-14 w-14 shrink-0 rounded bg-muted" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{it.draftName ?? it.supplierTitle}</span>
                <span className="block text-xs text-muted-foreground">CJ {it.cjPid} · {it.supplierPrice != null ? `CJ price $${it.supplierPrice.toFixed(2)}` : "CJ price not recorded"} · {it.status}{SUGGESTED_NAMES[it.cjPid] ? " · priority" : ""}</span>
              </span>
            </button>
            {open === it.id && <CjDetail item={it} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CjDetail({ item }: { item: CjReviewItem }) {
  const { userId } = useAuthUserId();
  const qc = useQueryClient();
  const saveFn = useServerFn(founderSaveCjDraftName);
  const [name, setName] = useState(item.draftName ?? SUGGESTED_NAMES[item.cjPid] ?? "");
  const save = useMutation({
    mutationFn: () => saveFn({ data: { id: item.id, name } }),
    onSuccess: () => { toast.success("Working name saved. Not imported or published."); qc.invalidateQueries({ queryKey: ["founder-cj-queue", userId] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Not saved."),
  });
  const unsaved = name.trim() !== (item.draftName ?? "");
  return (
    <div className="mt-3 space-y-3 rounded border border-border p-3 text-sm">
      <div><span className="text-muted-foreground">CJ original title (unchanged):</span> {item.supplierTitle}</div>
      <div><span className="text-muted-foreground">CJ ID:</span> {item.cjPid}</div>
      <div className="flex flex-wrap gap-2">
        {item.images.map((u) => (
          <a key={u} href={u} target="_blank" rel="noreferrer noopener" title={u}>
            <img src={u} alt="CJ supplier photo" loading="lazy" className="h-24 w-24 rounded object-cover" />
          </a>
        ))}
      </div>
      {item.imageUrl && <div className="break-all text-xs text-muted-foreground">Image: {item.imageUrl}</div>}
      <label className="block">
        <span className="text-xs text-muted-foreground">Founder working name (draft{item.draftName ? ", saved" : ", not saved"})</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
      </label>
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={!unsaved || save.isPending || name.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save working name"}</Button>
        {unsaved && <span className="text-xs text-muted-foreground">Unsaved</span>}
      </div>
    </div>
  );
}
