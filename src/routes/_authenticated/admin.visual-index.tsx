import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { backfillVisualEmbeddings, purgeExpiredUploads } from "@/lib/visual-discovery.functions";

export const Route = createFileRoute("/_authenticated/admin/visual-index")({
  component: VisualIndexPage,
});

function VisualIndexPage() {
  const backfill = useServerFn(backfillVisualEmbeddings);
  const purge = useServerFn(purgeExpiredUploads);
  const [source, setSource] = useState<"shopify" | "viral" | "both">("both");
  const [limit, setLimit] = useState(100);
  const [force, setForce] = useState(false);
  const [result, setResult] = useState<null | Awaited<ReturnType<typeof backfillVisualEmbeddings>>>(null);

  const runBackfill = useMutation({
    mutationFn: () => backfill({ data: { source, limit, force } }),
    onSuccess: (r) => {
      setResult(r);
      toast.success(`Indexed ${r.indexed} · Failed ${r.failed}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runPurge = useMutation({
    mutationFn: () => purge({}),
    onSuccess: (r) => toast.success(`Purged ${r.removed} expired uploads`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-light tracking-wide">Visual Index</h1>
        <p className="mt-2 text-sm text-white/60">
          Build the visual fingerprints Frassy uses to find similar Frass Hill pieces
          from a customer's inspiration image. Covers Frass Drip, Kicks, Bare, and Viral Products.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs uppercase tracking-widest text-white/50">
            Source
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="both">Shopify + Viral</option>
              <option value="shopify">Shopify only</option>
              <option value="viral">Viral only</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest text-white/50">
            Limit
            <input
              type="number"
              min={1}
              max={500}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
            Re-index existing
          </label>
        </div>

        <button
          type="button"
          onClick={() => runBackfill.mutate()}
          disabled={runBackfill.isPending}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium tracking-wide text-black hover:bg-white/90 disabled:opacity-50"
        >
          {runBackfill.isPending ? "Indexing…" : "Build embeddings"}
        </button>

        {result && (
          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-white/80 space-y-1">
            <div>Considered: {result.considered}</div>
            <div>Processed: {result.processed}</div>
            <div>Indexed: {result.indexed}</div>
            <div>Failed: {result.failed}</div>
            {result.errors.length > 0 && (
              <ul className="mt-2 text-xs text-red-300/80 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>· {e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
        <h2 className="text-lg tracking-wide">Retention</h2>
        <p className="text-sm text-white/60">
          Customer uploads auto-expire after 24 hours unless saved to an inspiration board.
          Run purge to remove any expired uploads from storage now.
        </p>
        <button
          type="button"
          onClick={() => runPurge.mutate()}
          disabled={runPurge.isPending}
          className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {runPurge.isPending ? "Purging…" : "Purge expired uploads"}
        </button>
      </section>
    </div>
  );
}
