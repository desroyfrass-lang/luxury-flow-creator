// R2 — human-written design brief for the verified product + size. Save/Reload only; no generation.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { getFashionBrief, saveFashionBrief } from "@/lib/studios/fashion-brief.functions";
import { FASHION_BRIEF_MAX, type FashionBrief } from "@/lib/studios/fashion-brief";

const FIELDS: Array<[keyof Omit<FashionBrief, "updatedAt">, string]> = [
  ["concept", "Concept"],
  ["stylingDirection", "Styling direction"],
  ["notes", "Notes"],
];

export function FashionBriefPanel({ productId, variantId }: { productId: string; variantId: string }) {
  const qc = useQueryClient();
  const key = ["fashion-brief", productId, variantId];
  const load = useServerFn(getFashionBrief);
  const saveFn = useServerFn(saveFashionBrief);
  const brief = useQuery({ queryKey: key, queryFn: () => load({ data: { productId, variantId } }), retry: false });
  const [form, setForm] = useState({ concept: "", stylingDirection: "", notes: "" });
  useEffect(() => {
    if (brief.data) setForm({ concept: brief.data.concept, stylingDirection: brief.data.stylingDirection, notes: brief.data.notes });
  }, [brief.data]);
  const save = useMutation({
    mutationFn: () => saveFn({ data: { productId, variantId, ...form } }),
    onSuccess: (b) => qc.setQueryData(key, b),
  });
  const dirty = !!brief.data && FIELDS.some(([k]) => form[k] !== brief.data![k]);

  return (
    <section aria-label="Design brief" className="rounded-lg border border-border/70 p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Design brief · private · for this product and size</div>
      {brief.isLoading ? (
        <p className="mt-2 text-sm">Loading the saved brief…</p>
      ) : brief.error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">{brief.error instanceof Error ? brief.error.message : "The brief could not be loaded."}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {FIELDS.map(([k, label]) => (
            <label key={k} className="block text-xs">{label}
              <textarea rows={3} maxLength={FASHION_BRIEF_MAX} aria-label={label} value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                className="mt-1 w-full rounded-sm border border-border bg-background p-2 text-sm" />
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save brief"}</Button>
            <Button size="sm" variant="outline" disabled={brief.isFetching || save.isPending} onClick={() => { save.reset(); brief.refetch(); }}>Reload saved brief</Button>
            <span className="text-xs text-muted-foreground" role="status">
              {save.error ? <span className="text-destructive">{(save.error as Error).message}</span>
                : dirty ? "Unsaved changes."
                : brief.data?.updatedAt ? `Saved ${new Date(brief.data.updatedAt).toLocaleString()}.` : "Nothing saved yet."}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Written by you. Saving stores words only: no images, videos, try-ons, capsules, orders or publishing. The product and its CJ records are not changed.</p>
        </div>
      )}
    </section>
  );
}
