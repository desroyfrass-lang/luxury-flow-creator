// FRASS-0600 — the Review Queue. Nothing publishes because it was generated.
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProductions, logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, GoldButton, QuietButton, StatusPill, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/review")({
  head: () => ({
    meta: [
      { title: "Review Queue | Frassy Studios" },
      { name: "description", content: "Approve, reject or request changes before anything reaches the publishing queue." },
      { property: "og:title", content: "Review Queue | Frassy Studios" },
      { property: "og:description", content: "Draft → Generated → Review → Approved → Scheduled → Published." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const qc = useQueryClient();
  const { data: all = [] } = useProductions();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const waiting = all.filter((p) => ["review", "editing", "generating", "changes_required"].includes(p.status));

  const decide = async (id: string, decision: "approved" | "rejected" | "changes_required") => {
    const { data: user } = await supabase.auth.getUser();
    const status = decision === "approved" ? "approved" : decision === "rejected" ? "archived" : "changes_required";
    const { error } = await supabase.from("studio_productions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("studio_reviews").insert({
      production_id: id,
      reviewer_id: user.user?.id ?? null,
      decision,
      notes: notes[id] ?? null,
    });
    await logStudioActivity(`review.${decision}`, "production", id, {});
    toast.success(`Recorded: ${prettify(decision)}.`);
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Review Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Draft → Generated → Review → Changes Required → Approved → Scheduled → Published. Only approved work can move
        into publishing.
      </p>

      <div className="mt-6 space-y-3">
        {waiting.length === 0 ? (
          <EmptyState title="Nothing waiting on you" body="When a production reaches review, it appears here first." />
        ) : null}
        {waiting.map((p) => (
          <StudioCard key={p.id} eyebrow={p.studio_series?.name ?? "No series"} title={p.title}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={p.status} />
              <span className="text-xs text-muted-foreground">
                {prettify(p.production_type)} · {p.aspect_ratio} · Rights: {prettify(p.rights_status)}
              </span>
              <Link to="/studios/production/$id" params={{ id: p.id }} className="text-xs text-[color:var(--gold)]">
                Preview & edit scenes →
              </Link>
            </div>
            <textarea
              rows={2}
              className={`${inputClass} mt-3`}
              placeholder="Notes for this decision…"
              value={notes[p.id] ?? ""}
              onChange={(e) => setNotes({ ...notes, [p.id]: e.target.value })}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <GoldButton onClick={() => decide(p.id, "approved")}>Approve</GoldButton>
              <QuietButton onClick={() => decide(p.id, "changes_required")}>Request changes</QuietButton>
              <QuietButton onClick={() => decide(p.id, "rejected")}>Reject</QuietButton>
            </div>
          </StudioCard>
        ))}
      </div>
    </>
  );
}
