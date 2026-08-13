// FRASS-0524 — Founder Guided Platform Audit.
// The Founder and Frassy walk the platform one page at a time: does it work,
// what does it do, what does it cost, does it keep its promises. Not a separate
// application — an extension of Founder Mode.
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AUDIT_DIMENSIONS,
  AUDIT_PAGES,
  buildAuditReport,
  pageFinancials,
  reportToMarkdown,
  trustBand,
  trustScore,
  INVITATION_QUESTION,
  INVITATION_VERDICTS,
  invitationLabel,
  type AuditDimension,
  type InvitationVerdict,
  type DimensionScores,
  type PageAuditResult,
} from "@/lib/founder/platform-audit";
import {
  completePlatformAudit,
  currentPlatformAudit,
  savePlatformAuditPage,
  startPlatformAudit,
} from "@/lib/founder/audit.functions";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  in_development: "Under development",
  disabled: "Disabled",
  experimental: "Experimental",
};

export function GuidedAuditPanel() {
  const start = useServerFn(startPlatformAudit);
  const load = useServerFn(currentPlatformAudit);
  const savePage = useServerFn(savePlatformAuditPage);
  const complete = useServerFn(completePlatformAudit);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["platform-audit"],
    queryFn: () => load(),
  });

  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<DimensionScores>({});
  const [notes, setNotes] = useState("");
  const [finding, setFinding] = useState("");
  const [findings, setFindings] = useState<string[]>([]);
  // FRASS-0528 — the closing question of every audit.
  const [verdict, setVerdict] = useState<InvitationVerdict | null>(null);
  const [verdictNote, setVerdictNote] = useState("");

  const page = AUDIT_PAGES[index];
  const financials = useMemo(() => pageFinancials(page), [page]);
  const score = trustScore(scores);
  const band = trustBand(score);

  const audit = data?.audit ?? null;
  const done = data?.pages ?? [];

  // FRASS-0528 — unresolved findings from the last completed audit stay visible.
  const openFindings = useMemo(() => {
    const last = (data?.history ?? []).find((h) => h.status === "complete" && h.report);
    const readiness = last?.report?.invitationReadiness;
    if (!last || !readiness || readiness.verdict === "yes") return null;
    return { audit: last, readiness };
  }, [data?.history]);

  const startMutation = useMutation({
    mutationFn: () => start({ data: { label: "Platform audit" } }),
    onSuccess: () => {
      toast.success("Audit started. Let's walk Frass together, one page at a time.");
      void qc.invalidateQueries({ queryKey: ["platform-audit"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start the audit."),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!audit) throw new Error("Start an audit first.");
      await savePage({
        data: {
          auditId: audit.id,
          pageId: page.id,
          scores: scores as Record<string, number>,
          trustScore: score,
          findings,
          notes,
        },
      });
    },
    onSuccess: () => {
      toast.success(`${page.label} recorded.`);
      setScores({});
      setNotes("");
      setFindings([]);
      setIndex((i) => Math.min(AUDIT_PAGES.length - 1, i + 1));
      void qc.invalidateQueries({ queryKey: ["platform-audit"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save that page."),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!audit) throw new Error("No active audit.");
      const results: PageAuditResult[] = done.map((p) => ({
        pageId: p.page_id,
        scores: p.scores,
        findings: p.findings,
        notes: p.notes,
      }));
      if (!verdict) throw new Error("Answer the invitation question before archiving.");
      const unresolved =
        verdict === "yes"
          ? []
          : done.flatMap((p) =>
              p.findings.map(
                (f) => `${AUDIT_PAGES.find((x) => x.id === p.page_id)?.label ?? p.page_id}: ${f}`,
              ),
            );
      const report = buildAuditReport(results, audit.started_at, {
        invitationReadiness: {
          verdict,
          answeredAt: new Date().toISOString(),
          note: verdictNote.trim(),
          unresolved,
        },
      });
      await complete({
        data: { auditId: audit.id, overallTrustScore: report.overallTrustScore, report },
      });
      return report;
    },
    onSuccess: (report) => {
      toast.success(`Audit archived. Overall Trust Score ${report.overallTrustScore}/100.`);
      setIndex(0);
      setVerdict(null);
      setVerdictNote("");
      void qc.invalidateQueries({ queryKey: ["platform-audit"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not finish the audit."),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading the audit…</p>;
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0524</p>
        <h2 className="text-2xl font-black uppercase tracking-tight">Guided Platform Audit</h2>
        <p className="text-sm text-muted-foreground">
          Every page. Every feature. Every promise. Say “Frassy, let's audit Frass” anywhere on the
          platform, or begin here.
        </p>
      </header>

      {openFindings ? (
        <div className="space-y-2 rounded-xl border border-amber-500/50 bg-amber-500/5 p-4">
          <p className="text-sm font-bold text-amber-500">
            {invitationLabel(openFindings.readiness.verdict)} — last audit on{" "}
            {new Date(openFindings.readiness.answeredAt).toLocaleDateString()}
          </p>
          {openFindings.readiness.note ? (
            <p className="text-xs text-muted-foreground">{openFindings.readiness.note}</p>
          ) : null}
          <ul className="space-y-1 text-xs text-muted-foreground">
            {openFindings.readiness.unresolved.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            These stay visible until an audit ends with “Yes”.
          </p>
        </div>
      ) : null}

      {!audit ? (
        <button
          onClick={() => startMutation.mutate()}
          disabled={startMutation.isPending}
          className="rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black disabled:opacity-40"
        >
          {startMutation.isPending ? "Starting…" : "Start an audit"}
        </button>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {AUDIT_PAGES.map((p, i) => {
              const record = done.find((d) => d.page_id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={`rounded-full border px-3 py-1 transition ${
                    i === index
                      ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                      : record
                        ? "border-emerald-500/40 text-emerald-500"
                        : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                  {record ? ` · ${record.trust_score}` : ""}
                </button>
              );
            })}
          </div>

          <div className="space-y-6 rounded-2xl border border-border/70 p-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-xl font-bold">{page.label}</h3>
                <Link to={page.path} className="text-xs text-[color:var(--gold)] underline">
                  Open the page
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">{page.purpose}</p>
            </div>

            {/* 2. Feature audit — no hidden functionality. */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider">Features on this page</h4>
              <ul className="space-y-1 text-xs">
                {page.features.map((f) => (
                  <li key={f.name} className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground">— {STATUS_LABEL[f.status]}</span>
                    <span className="text-muted-foreground">· {f.plain}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Financial audit. */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider">What it costs</h4>
              <div className="space-y-2 text-xs">
                {financials.rows.map((r) => (
                  <div key={r.feature} className="rounded-lg border border-border/50 p-3">
                    <p className="font-medium">
                      {r.feature}{" "}
                      <span className={r.free ? "text-emerald-500" : "text-amber-500"}>
                        {r.free
                          ? "Free"
                          : r.usesCredits
                            ? `${r.creditsPerUse ?? 1} credit${(r.creditsPerUse ?? 1) === 1 ? "" : "s"}`
                            : "Optional paid"}
                      </span>
                    </p>
                    <p className="mt-1 text-muted-foreground">Frass pays: {r.costsFrass}</p>
                    <p className="text-muted-foreground">Funded by: {r.funding}</p>
                    <p className="text-muted-foreground">If credits run out: {r.degradesTo}</p>
                  </div>
                ))}
              </div>
              {financials.criticalTrustIssues.length ? (
                <ul className="space-y-1 text-xs text-red-500">
                  {financials.criticalTrustIssues.map((c) => (
                    <li key={c}>Critical Trust Issue — {c}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* 4. Promise audit. */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider">Promises this page keeps</h4>
              <p className="text-xs text-muted-foreground">{page.promises.join(" · ")}</p>
            </div>

            {/* Trust Score — private Founder instrument. */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                Trust Score (private) — {score}/100 · {band.label}
              </h4>
              {AUDIT_DIMENSIONS.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center gap-2">
                  <span className="w-52 text-xs">{d.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setScores({ ...scores, [d.id]: v } as DimensionScores)}
                        className={`h-6 w-6 rounded border text-[10px] ${
                          (scores[d.id as AuditDimension] ?? 0) >= v
                            ? "border-[color:var(--gold)] bg-[color:var(--gold)]/20"
                            : "border-border"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{d.plain}</span>
                </div>
              ))}
            </div>

            {/* 5. Improvement review. */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider">Findings</h4>
              <div className="flex gap-2">
                <input
                  value={finding}
                  onChange={(e) => setFinding(e.target.value)}
                  placeholder="Move this, hide this, simplify this, rename this…"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => {
                    if (!finding.trim()) return;
                    setFindings([...findings, finding.trim()]);
                    setFinding("");
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  Add
                </button>
              </div>
              {findings.length ? (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {findings.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                Findings are sorted by the Founder Change Advisor (FRASS-0521) before any
                engineering is requested — only what genuinely needs Lovable is escalated.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Your own words about this page."
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
            />

            {/* FRASS-0528 — Invitation readiness: the one question every audit ends with. */}
            <div className="space-y-3 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-4">
              <h4 className="text-sm font-bold">{INVITATION_QUESTION}</h4>
              <div className="flex flex-wrap gap-2">
                {INVITATION_VERDICTS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVerdict(v.id)}
                    className={`rounded-full border px-4 py-1.5 text-xs transition ${
                      verdict === v.id
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/20 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title={v.plain}
                  >
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
              {verdict ? (
                <p className="text-[11px] text-muted-foreground">
                  {INVITATION_VERDICTS.find((v) => v.id === verdict)?.plain}
                </p>
              ) : null}
              {verdict && verdict !== "yes" ? (
                <>
                  <textarea
                    value={verdictNote}
                    onChange={(e) => setVerdictNote(e.target.value)}
                    rows={2}
                    placeholder="What has to be true before you'd say yes?"
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                  />
                  <p className="text-[11px] text-amber-500">
                    Every finding from this audit stays visible here until the next audit ends in
                    “Yes”.
                  </p>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !Object.keys(scores).length}
                className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-black disabled:opacity-40"
              >
                {saveMutation.isPending ? "Saving…" : "Record and continue"}
              </button>
              <button
                onClick={() => finishMutation.mutate()}
                disabled={finishMutation.isPending || !done.length || !verdict}
                className="rounded-full border border-border px-5 py-2 text-sm disabled:opacity-40"
              >
                Finish and archive the report
              </button>
            </div>
          </div>
        </>
      )}

      {data?.history?.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Audit history</h3>
          {data.history.map((h) => (
            <details key={h.id} className="rounded-xl border border-border/60 p-4 text-xs">
              <summary className="cursor-pointer">
                {new Date(h.started_at).toLocaleDateString()} · {h.status}
                {h.overall_trust_score != null ? ` · Trust ${h.overall_trust_score}/100` : ""}
              </summary>
              {h.report ? (
                <pre className="mt-3 whitespace-pre-wrap text-[11px] text-muted-foreground">
                  {reportToMarkdown(h.report)}
                </pre>
              ) : null}
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
