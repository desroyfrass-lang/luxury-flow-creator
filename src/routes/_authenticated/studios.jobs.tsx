// FRASS-0601 — the Generation Queue. Every job, what it cost, and why it waits.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGenerationJobs, logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, QuietButton, StatTile, StudioSection } from "@/components/studios/studio-ui";
import { capabilityLabel } from "@/lib/studios/generation-layer";

export const Route = createFileRoute("/_authenticated/studios/jobs")({
  head: () => ({
    meta: [
      { title: "Generation Queue | Frassy Studios" },
      { name: "description", content: "Every queued, running, finished and failed generation job in Frassy Studios." },
      { property: "og:title", content: "Generation Queue | Frassy Studios" },
      { property: "og:description", content: "See exactly what is waiting, what ran, and what it cost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const qc = useQueryClient();
  const { data: jobs = [], isLoading } = useGenerationJobs();

  const cancel = async (job: any) => {
    await supabase
      .from("studio_generation_jobs")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", job.id);
    await logStudioActivity("job_cancelled", "generation_job", job.id);
    qc.invalidateQueries({ queryKey: ["studio", "generation-jobs"] });
    toast.success("Job cancelled. Nothing was spent.");
  };

  const retry = async (job: any) => {
    await supabase
      .from("studio_generation_jobs")
      .update({ status: "queued", retry_count: (job.retry_count ?? 0) + 1, error: null, queued_at: new Date().toISOString() })
      .eq("id", job.id);
    qc.invalidateQueries({ queryKey: ["studio", "generation-jobs"] });
    toast.success("Back in the queue.");
  };

  const waiting = jobs.filter((j: any) => ["queued", "awaiting_provider", "running"].includes(j.status));
  const failed = jobs.filter((j: any) => j.status === "failed");
  const spent = jobs.reduce((sum: number, j: any) => sum + Number(j.actual_cost ?? j.cost ?? 0), 0);

  return (
    <StudioSection
      eyebrow="FRASS-0601 · Engine"
      title="Generation Queue"
      hint="Nothing runs quietly in the background. Every job is listed here with its state and its cost."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile label="Waiting" value={String(waiting.length)} hint="Queued or running now." />
        <StatTile label="Didn't finish" value={String(failed.length)} hint="Look at the reason before retrying." />
        <StatTile label="Recorded spend" value={`$${spent.toFixed(2)}`} hint="Only real recorded costs." />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading the queue…</p>
      ) : jobs.length === 0 ? (
        <EmptyState title="The queue is empty" body="Queue scene work from a production and it will appear here." />
      ) : (
        <ul className="space-y-2">
          {jobs.map((j: any) => (
            <li key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border/60 bg-card/60 p-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                  {capabilityLabel(j.job_type)} · {j.status.replace("_", " ")}
                  {j.provider ? ` · ${j.provider}` : ""}
                </div>
                <p className="mt-0.5 truncate text-sm">{j.prompt || "No prompt recorded"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(j.created_at).toLocaleString()}
                  {j.retry_count ? ` · retried ${j.retry_count}×` : ""}
                  {j.error ? ` · ${j.error}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {j.production_id ? (
                  <Link
                    to="/studios/engine/$id"
                    params={{ id: j.production_id }}
                    className="rounded-sm border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                  >
                    Open
                  </Link>
                ) : null}
                {j.status === "failed" ? <QuietButton onClick={() => retry(j)}>Try again</QuietButton> : null}
                {["queued", "awaiting_provider"].includes(j.status) ? <QuietButton onClick={() => cancel(j)}>Cancel</QuietButton> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </StudioSection>
  );
}
