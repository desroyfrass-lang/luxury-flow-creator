// FRASS-0529 — Founder Release Approval.
// Nothing reaches production without one deliberate answer: "Are you ready to
// approve this release?" Frassy lays out what changed and what's still open;
// the Founder decides. Publishing is only recommended after an approval.
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  founderSnapshot,
  recentReleaseApprovals,
  recordReleaseApproval,
} from "@/lib/founder/home.functions";
import { invitationLabel, type InvitationVerdict } from "@/lib/founder/platform-audit";

const DECISIONS = [
  {
    id: "approved" as const,
    icon: "🚀",
    label: "Approve Release",
    plain: "This can go to production. Publish next.",
  },
  {
    id: "delayed" as const,
    icon: "⏸",
    label: "Delay Release",
    plain: "Hold it. Nothing is wrong enough to change, but not today.",
  },
  {
    id: "changes_requested" as const,
    icon: "📝",
    label: "Request Additional Changes",
    plain: "Something has to change before this ships.",
  },
];

export function ReleaseApprovalPanel() {
  const loadSnapshot = useServerFn(founderSnapshot);
  const loadHistory = useServerFn(recentReleaseApprovals);
  const record = useServerFn(recordReleaseApproval);
  const qc = useQueryClient();

  const { data: snapshot } = useQuery({
    queryKey: ["founder-snapshot"],
    queryFn: () => loadSnapshot(),
  });
  const { data: history } = useQuery({
    queryKey: ["release-approvals"],
    queryFn: () => loadHistory(),
  });

  const [decision, setDecision] = useState<(typeof DECISIONS)[number]["id"] | null>(null);
  const [note, setNote] = useState("");
  const [changes, setChanges] = useState("");

  const readiness = snapshot?.today.invitationVerdict ?? null;
  const outstanding = useMemo(
    () => snapshot?.today.unresolvedFindings ?? [],
    [snapshot?.today.unresolvedFindings],
  );

  const summaryLines = useMemo(() => {
    if (!snapshot) return [] as string[];
    return [
      `What changed: ${changes.trim() || "Not described yet."}`,
      `Open incidents: ${snapshot.platform.openIncidents} (${snapshot.platform.blockingIncidents} blocking)`,
      `Fixed in the last 7 days: ${snapshot.platform.resolvedLast7Days}`,
      `Platform status: ${snapshot.platform.statusPlain}`,
      `Invitation readiness: ${readiness ? invitationLabel(readiness as InvitationVerdict) : "not answered"}`,
      `Outstanding known issues: ${outstanding.length}`,
    ];
  }, [snapshot, changes, readiness, outstanding]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!decision) throw new Error("Choose a decision first.");
      return record({
        data: {
          decision,
          note: note.trim(),
          outstanding,
          invitationVerdict: readiness,
          summary: summaryLines.join("\n"),
        },
      });
    },
    onSuccess: () => {
      toast.success(
        decision === "approved"
          ? "Release approved. Publishing is now recommended."
          : "Decision recorded. Nothing goes to production until it's approved.",
      );
      setDecision(null);
      setNote("");
      setChanges("");
      void qc.invalidateQueries({ queryKey: ["release-approvals"] });
      void qc.invalidateQueries({ queryKey: ["founder-snapshot"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record that decision."),
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0529</p>
        <h2 className="text-2xl font-black uppercase tracking-tight">Release Approval</h2>
        <p className="text-sm text-muted-foreground">
          Are you ready to approve this release for production? Here's the honest picture before
          you answer.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-border/70 p-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider">
            What went into this release
          </label>
          <textarea
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
            rows={3}
            placeholder="Features added, bugs fixed, amendments implemented…"
            className="w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
        </div>

        <ul className="space-y-1 rounded-xl border border-border/50 p-4 text-xs text-muted-foreground">
          {summaryLines.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>

        {outstanding.length ? (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-4">
            <p className="text-xs font-bold text-amber-500">Outstanding known issues</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {outstanding.map((o) => (
                <li key={o}>• {o}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-3 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-4">
          <h3 className="text-sm font-bold">Are you ready to approve this release for production?</h3>
          <div className="flex flex-wrap gap-2">
            {DECISIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDecision(d.id)}
                title={d.plain}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  decision === d.id
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/20 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>
          {decision ? (
            <p className="text-[11px] text-muted-foreground">
              {DECISIONS.find((d) => d.id === decision)?.plain}
            </p>
          ) : null}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Your words on this decision."
            className="w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={!decision || mutation.isPending}
            className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-black disabled:opacity-40"
          >
            {mutation.isPending ? "Recording…" : "Record decision"}
          </button>
          {decision === "approved" ? (
            <p className="text-[11px] text-emerald-500">
              After recording, publish from the Publish button. Frassy only recommends publishing
              once a release has been approved here.
            </p>
          ) : null}
        </div>
      </div>

      {history?.length ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Release history</h3>
          {history.map((h) => (
            <details key={h.id} className="rounded-xl border border-border/60 p-4 text-xs">
              <summary className="cursor-pointer">
                {new Date(h.created_at).toLocaleString()} · {h.decision.replace("_", " ")}
                {h.outstanding.length ? ` · ${h.outstanding.length} known issue(s)` : ""}
              </summary>
              {h.note ? <p className="mt-2 text-muted-foreground">{h.note}</p> : null}
              <pre className="mt-2 whitespace-pre-wrap text-[11px] text-muted-foreground">
                {h.summary}
              </pre>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
