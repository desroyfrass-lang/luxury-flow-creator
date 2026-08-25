// FRASS-0600 — Publishing Center. Prepares and schedules; never posts on its own.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useConnections, usePublishJobs } from "@/lib/studios/use-studios";
import { EmptyState, QuietButton, StatusPill, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

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
  const { data: jobs = [] } = usePublishJobs();
  const { data: connections = [] } = useConnections();

  const connected = new Set(connections.filter((c) => c.status === "connected").map((c) => c.platform));

  const cancel = async (id: string) => {
    const { error } = await supabase.from("studio_publish_jobs").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Release cancelled.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Publishing Center</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything here is prepared and waiting. A release only leaves Frass Hill when the production is approved and
        that channel is properly connected.
      </p>

      <StudioSection title="Queue">
        {jobs.length === 0 ? (
          <EmptyState
            title="Nothing queued"
            body="Approve a production, then send it to publishing from its page."
            action={
              <Link to="/studios/productions" className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
                Go to productions →
              </Link>
            }
          />
        ) : null}
        <div className="space-y-3">
          {jobs.map((j) => (
            <StudioCard key={j.id} eyebrow={prettify(j.platform)} title={j.studio_productions?.title ?? "Untitled"}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <StatusPill status={j.status} />
                <span>
                  {j.scheduled_for ? `Scheduled ${new Date(j.scheduled_for).toLocaleString()}` : "No date set"}
                </span>
                {!connected.has(j.platform) ? (
                  <span className="text-amber-400">Channel not connected yet — this stays on hold.</span>
                ) : null}
                {j.error ? <span className="text-red-400">{j.error}</span> : null}
              </div>
              {j.status !== "cancelled" && j.status !== "published" ? (
                <div className="mt-3">
                  <QuietButton onClick={() => cancel(j.id)}>Cancel release</QuietButton>
                </div>
              ) : null}
            </StudioCard>
          ))}
        </div>
      </StudioSection>

      <StudioSection title="Channels" subtitle="Connect a channel before scheduling anything to it.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((c) => (
            <StudioCard key={c.id} eyebrow={prettify(c.status)} title={prettify(c.platform)}>
              <p className="text-xs text-muted-foreground">{c.account_name ?? "No account linked yet."}</p>
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
