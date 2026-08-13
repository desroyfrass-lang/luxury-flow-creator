// FRASS-0519 — Founder Path inside the existing onboarding. Same front door,
// same engine; Frassy simply recognises the Founder and adds validation.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  activeFounderSession,
  completeFounderSession,
  listFounderSessions,
  recordFounderObservation,
  setFounderChecklist,
  startFounderSession,
} from "@/lib/founder/founder.functions";
import {
  FOUNDER_OBJECTIVES,
  OBSERVATION_KINDS,
  OBSERVATION_SIGNALS,
  type ExperienceReport,
  type ObservationKind,
  type ObservationSignal,
} from "@/lib/founder/walkthrough";

export function FounderWalkthrough({
  stepId,
  stepLabel,
}: {
  stepId?: string | null;
  stepLabel?: string | null;
}) {
  const start = useServerFn(startFounderSession);
  const loadActive = useServerFn(activeFounderSession);
  const loadPast = useServerFn(listFounderSessions);
  const record = useServerFn(recordFounderObservation);
  const saveChecklist = useServerFn(setFounderChecklist);
  const complete = useServerFn(completeFounderSession);
  const qc = useQueryClient();

  const [note, setNote] = useState("");
  const [kind, setKind] = useState<ObservationKind>("improvement");
  const [signal, setSignal] = useState<ObservationSignal>("neutral");
  const [report, setReport] = useState<ExperienceReport | null>(null);

  const { data } = useQuery({ queryKey: ["founder", "session"], queryFn: () => loadActive() });
  const { data: past } = useQuery({ queryKey: ["founder", "sessions"], queryFn: () => loadPast() });
  const session = data?.session ?? null;
  const observations = data?.observations ?? [];
  const checklist = (session?.checklist ?? {}) as Record<string, boolean>;
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["founder", "session"] });
    void qc.invalidateQueries({ queryKey: ["founder", "sessions"] });
  };

  const begin = useMutation({
    mutationFn: () => start({ data: { label: "Founder walkthrough", releaseRef: null } }),
    onSuccess: () => {
      setReport(null);
      refresh();
      toast.success("Walkthrough started. Walk it exactly as a new member would.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNote = useMutation({
    mutationFn: () =>
      record({
        data: {
          sessionId: session!.id,
          stepId: stepId ?? null,
          stepLabel: stepLabel ?? null,
          kind,
          signal,
          note: note.trim(),
          area: null,
        },
      }),
    onSuccess: () => {
      setNote("");
      refresh();
      toast.success("Founder observation recorded.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: (id: string) =>
      saveChecklist({
        data: { sessionId: session!.id, checklist: { ...checklist, [id]: !checklist[id] } },
      }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const finish = useMutation({
    mutationFn: () => complete({ data: { sessionId: session!.id } }),
    onSuccess: (r) => {
      setReport(r);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const confirmed = FOUNDER_OBJECTIVES.filter((o) => checklist[o.id]).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-3">
        <h2 className="text-lg font-black uppercase tracking-wide">Founder Path</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You're walking the same onboarding every member walks. I'll record what you notice as we
          go, so nothing gets lost between "that felt awkward" and a real improvement.
        </p>
      </header>

      {!session ? (
        <button
          type="button"
          onClick={() => begin.mutate()}
          disabled={begin.isPending}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
        >
          {begin.isPending ? "Starting…" : "Start a walkthrough"}
        </button>
      ) : (
        <>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-bold">
              Objectives confirmed {confirmed}/{FOUNDER_OBJECTIVES.length}
            </p>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {FOUNDER_OBJECTIVES.map((o) => (
                <label key={o.id} className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[o.id])}
                    onChange={() => toggle.mutate(o.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-semibold">{o.label}</span>
                    <span className="block text-muted-foreground">{o.plain}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border p-3">
            <p className="text-sm font-bold">
              Record a Founder observation{stepLabel ? ` — ${stepLabel}` : ""}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What did you notice? Say it plainly."
              className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {OBSERVATION_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    kind === k.id ? "bg-primary text-primary-foreground" : "border border-border"
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {OBSERVATION_SIGNALS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSignal(s.id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    signal === s.id ? "bg-muted font-bold" : "border border-border"
                  }`}
                >
                  {s.dot} {s.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={addNote.isPending || note.trim().length < 2}
                onClick={() => addNote.mutate()}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground disabled:opacity-50"
              >
                Record observation
              </button>
              <button
                type="button"
                disabled={finish.isPending}
                onClick={() => finish.mutate()}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase"
              >
                Finish and show my report
              </button>
            </div>
            {observations.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {observations.length} observation{observations.length === 1 ? "" : "s"} so far.
              </p>
            ) : null}
          </div>
        </>
      )}

      {report ? (
        <div className="mt-4 rounded-xl border border-border p-3">
          <p className="text-sm font-bold">Founder Experience Report</p>
          <p className="mt-1 text-sm">{report.headline}</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>{report.confusionPoints} point(s) of confusion</li>
            <li>{report.navigationIssues} navigation issue(s)</li>
            <li>{report.smoothMoments} exceptionally smooth interaction(s)</li>
            <li>Onboarding time: about {report.durationMinutes} minute(s)</li>
            <li>
              Objectives confirmed: {report.objectivesConfirmed}/{report.objectivesTotal}
            </li>
            <li>{report.recommendations.length} recommended improvement(s)</li>
          </ul>
          {report.recommendations.length ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(report.recommendations.join("\n"));
                  toast.success("Copied — paste it straight into an engineering request.");
                }}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                Copy engineering tasks
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {past?.filter((s) => s.status === "complete").length ? (
        <div className="mt-4">
          <p className="text-sm font-bold">Past walkthroughs</p>
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {past
              .filter((s) => s.status === "complete")
              .map((s) => (
                <li key={s.id}>
                  {new Date(s.started_at).toLocaleDateString()} — {s.report?.headline ?? "Recorded"}{" "}
                  ({s.report?.durationMinutes ?? "?"} min)
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
