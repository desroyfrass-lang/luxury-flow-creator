// FRASS-0521 — Founder Change Advisor. Optimize before engineering.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adviseChange } from "@/lib/founder/founder.functions";
import {
  BUCKET_META,
  COST_META,
  specToMarkdown,
  type ChangeAnalysis,
  type ChangeBucket,
} from "@/lib/founder/change-advisor";

const ORDER: ChangeBucket[] = ["already_possible", "founder_editable", "engineering", "constitutional"];

export function ChangeAdvisorPanel() {
  const advise = useServerFn(adviseChange);
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<ChangeAnalysis | null>(null);

  const run = useMutation({
    mutationFn: (text: string) => advise({ data: { idea: text } }),
    onSuccess: (r) => setResult(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const spec = result?.spec ? specToMarkdown(result.spec) : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-4">
        <h2 className="text-lg font-black uppercase tracking-wide">Change Advisor</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Say the whole idea first. Frassy sorts it into what she can do now, what you can edit
          yourself, what truly needs engineering, and what should be a constitutional amendment —
          so one clean request goes out instead of many.
        </p>
      </header>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={6}
        placeholder="Describe everything you want to change, in your own words. One idea per line is fine."
        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={run.isPending || idea.trim().length < 3}
          onClick={() => run.mutate(idea)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
        >
          {run.isPending ? "Analyzing…" : "Analyze before engineering"}
        </button>
        {result ? (
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setIdea("");
            }}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
          >
            Clear
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-5 space-y-4">
          <p className="rounded-xl bg-muted/50 p-3 text-sm font-medium">{result.summary}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            {ORDER.filter((b) => result.counts[b] > 0).map((b) => (
              <div key={b} className="rounded-xl border border-border p-3">
                <p className="text-sm font-bold">
                  {BUCKET_META[b].dot} {BUCKET_META[b].label} · {result.counts[b]}
                </p>
                <p className="text-xs text-muted-foreground">{BUCKET_META[b].plain}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-2">
            {result.changes.map((c, i) => (
              <li key={i} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">
                  {BUCKET_META[c.bucket].dot} {c.text}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{c.why}</p>
                <p className="mt-1 text-xs">
                  <span className="font-semibold">
                    {COST_META[c.cost].dot} {COST_META[c.cost].label}
                  </span>
                  {c.action ? <span className="text-muted-foreground"> — {c.action}</span> : null}
                </p>
                {c.affects.length ? (
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Touches: {c.affects.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          {result.optimizations.length ? (
            <div className="rounded-xl border border-border p-3">
              <p className="text-sm font-bold">Ways to spend less engineering</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {result.optimizations.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {spec ? (
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">One engineering request</p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(spec);
                    toast.success("Specification copied — send it as one request.");
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                >
                  Copy specification
                </button>
              </div>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs">
                {spec}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing here needs engineering. That's the best possible outcome.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
