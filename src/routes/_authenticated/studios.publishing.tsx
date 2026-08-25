// FRASS-0600/0602 — Publishing Center. Prepares, queues and runs; never posts on its own.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useDistributionJobs, useConnectionAccounts } from "@/lib/studios/use-distribution";
import { cancelPublishJob, retryPublishJob, runPublishJob } from "@/lib/studios/distribution.functions";
import { EmptyState, QuietButton, StatusPill, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { JOB_STATUSES, labelOf, platformMeta } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/publishing")({
  head: () => ({
    meta: [
      { title: "Publishing Center | Frassy Studios" },
      { name: "description", content: "Scheduled and prepared releases across every Frass Hill channel." },
      { property: "og:title", content: "Publishing Center | Frassy Studios" },
      { property: "og:description", content: "Nothing goes out until it is approved and a channel is connected." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PublishingCenter,
});

function PublishingCenter() {
  const qc = useQueryClient();
  const { data: jobs = [] } = useDistributionJobs();
  const { data: accounts = [] } = useConnectionAccounts();
  const run = useServerFn(runPublishJob);
  const retry = useServerFn(retryPublishJob);
  const cancel = useServerFn(cancelPublishJob);

  const connected = new Set(accounts.filter((c) => c.status === "connected").map((c) => c.platform));

  const act = async (fn: (a: { data: { jobId: string } }) => Promise<unknown>, jobId: string, ok: string) => {
    try {
      const r = (await fn({ data: { jobId } })) as { note?: string } | undefined;
      toast.success(r?.note ?? ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      qc.invalidateQueries({ queryKey: ["studio"] });
    }
  };

  const attention = jobs.filter((j) => j.status === "needs_attention" || j.status === "failed");

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Publishing Center</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything here is prepared and waiting. A release only leaves Frass Hill when the production is approved, the
        channel is properly connected, and you say go.
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <Link to="/studios/distribution" className="text-[color:var(--gold)]">
          Distribution Network →
        </Link>
        <Link to="/studios/calendar" className="text-[color:var(--gold)]">
          Content Calendar →
        </Link>
        <Link to="/studios/connections" className="text-[color:var(--gold)]">
          Platform Connections →
        </Link>
      </div>

      {attention.length ? (
        <StudioSection title="Needs your attention" hint="Frassy stopped rather than risk a double post.">
          <div className="space-y-2">
            {attention.map((j) => (
              <StudioCard key={j.id} eyebrow={platformMeta(j.platform).label} title={j.studio_productions?.title ?? "Untitled"}>
                <p className="text-xs text-red-400">{j.attention_reason ?? j.error ?? "The platform did not confirm the outcome."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <QuietButton onClick={() => act(retry, j.id, "Retried safely.")}>Retry safely</QuietButton>
                  <QuietButton onClick={() => act(cancel, j.id, "Release cancelled.")}>Cancel</QuietButton>
                </div>
              </StudioCard>
            ))}
          </div>
        </StudioSection>
      ) : null}

      <StudioSection title="Queue">
        {jobs.length === 0 ? (
          <EmptyState
            title="Nothing queued"
            body="Approve a production, prepare its platform packages, then choose destinations in the Distribution Network."
            action={
              <Link to="/studios/distribution" className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
                Open the network →
              </Link>
            }
          />
        ) : null}
        <div className="space-y-3">
          {jobs.map((j) => (
            <StudioCard key={j.id} eyebrow={platformMeta(j.platform).label} title={j.studio_productions?.title ?? "Untitled"}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <StatusPill status={labelOf(JOB_STATUSES, j.status)} />
                <span>{j.account_label ?? "No channel"}</span>
                <span>{j.scheduled_for ? `Scheduled ${new Date(j.scheduled_for).toLocaleString()}` : "No date set"}</span>
                {j.retry_count ? <span>{j.retry_count} retr{j.retry_count === 1 ? "y" : "ies"}</span> : null}
                {!connected.has(j.platform) ? (
                  <span className="text-amber-400">Channel not connected yet — this stays on hold.</span>
                ) : null}
                {j.attention_reason ? <span className="text-amber-400">{j.attention_reason}</span> : null}
                {j.error ? <span className="text-red-400">{j.error}</span> : null}
              </div>
              {j.status !== "cancelled" && j.status !== "published" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <QuietButton onClick={() => act(run, j.id, "Sent to the platform.")}>Run now</QuietButton>
                  <QuietButton onClick={() => act(cancel, j.id, "Release cancelled.")}>Cancel release</QuietButton>
                </div>
              ) : null}
            </StudioCard>
          ))}
        </div>
      </StudioSection>

      <StudioSection title="Channels" hint="Connect a channel before scheduling anything to it.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((c) => (
            <StudioCard key={c.id} eyebrow={c.status} title={platformMeta(c.platform).label}>
              <p className="text-xs text-muted-foreground">{c.account_label ?? "No account linked yet."}</p>
              <Link to="/studios/connections" className="mt-3 inline-block text-xs text-[color:var(--gold)]">
                Manage connection →
              </Link>
            </StudioCard>
          ))}
        </div>
      </StudioSection>
    </>
  );
}
