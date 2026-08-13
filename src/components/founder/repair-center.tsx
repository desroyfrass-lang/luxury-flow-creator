// FRASS-0515 — Repair Center: every issue Frassy diagnosed, repaired or escalated.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Wrench, ShieldCheck, AlertTriangle, ClipboardCopy, History, Repeat, Scale } from "lucide-react";
import {
  annotateRepairIncident,
  listRepairIncidents,
  type RepairIncident,
} from "@/lib/repair/repair.functions";
import { SAFE_REPAIRS, REPAIR_FORBIDDEN } from "@/lib/repair/engine";

const STATUS_TONE: Record<string, string> = {
  auto_repaired: "text-emerald-400 border-emerald-400/40",
  resolved: "text-emerald-400 border-emerald-400/40",
  escalated: "text-amber-400 border-amber-400/40",
  diagnosed: "text-sky-400 border-sky-400/40",
  open: "text-white/60 border-white/20",
};

const MODE_LABEL: Record<string, string> = {
  automatic: "Automatic — Frassy repaired it",
  manual: "Manual — a person fixed it",
  escalated: "Escalated to engineering",
  no_action: "No action needed",
};

export function RepairCenter() {
  const listFn = useServerFn(listRepairIncidents);
  const annotateFn = useServerFn(annotateRepairIncident);
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const annotate = useMutation({
    mutationFn: annotateFn,
    onSuccess: () => {
      toast.success("Repair History updated.");
      void qc.invalidateQueries({ queryKey: ["repair", "incidents"] });
    },
    onError: () => toast.error("Could not save that. Try again."),
  });

  const incidents = useQuery<RepairIncident[]>({
    queryKey: ["repair", "incidents"],
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  const items = incidents.data ?? [];
  const escalated = items.filter((i) => i.status === "escalated").length;
  const repaired = items.filter((i) => i.status === "auto_repaired").length;
  const recurring = items.filter((i) => i.recurring).length;
  const amendments = items.filter((i) => i.amendment_ref).length;

  return (
    <section className="rounded-sm border border-white/10 bg-white/[0.02] p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">FRASS-0515</div>
          <h2 className="mt-2 flex items-center gap-2 font-display text-2xl text-white">
            <Wrench className="h-5 w-5" /> Repair Center
          </h2>
          <p className="mt-1 text-sm text-white/50">
            What this means in plain English: Frassy is the first person on the scene when something
            breaks. She fixes what's safe, and writes the engineering ticket when it isn't.
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="font-display text-2xl text-emerald-400">{repaired}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Auto-repaired</div>
          </div>
          <div>
            <div className="font-display text-2xl text-amber-400">{escalated}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Escalated</div>
          </div>
          <div>
            <div className="font-display text-2xl text-sky-400">{recurring}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Recurring</div>
          </div>
          <div>
            <div className="font-display text-2xl text-[color:var(--gold)]">{amendments}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Amendments</div>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Frassy may repair
          </div>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {SAFE_REPAIRS.map((r) => (
              <li key={r.id}>· {r.label}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-sm border border-amber-400/20 bg-amber-400/[0.04] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Never without approval
          </div>
          <ul className="mt-3 space-y-1 text-sm text-white/70">
            {REPAIR_FORBIDDEN.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 divide-y divide-white/5 rounded-sm border border-white/10">
        {incidents.isLoading && (
          <div className="px-5 py-8 text-center text-xs uppercase tracking-[0.3em] text-white/40">
            Loading incidents…
          </div>
        )}
        {!incidents.isLoading && items.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-white/50">
            No issues reported. Nothing needs repair.
          </div>
        )}
        {items.map((i) => (
          <div key={i.id} className="px-5 py-4">
            <button
              onClick={() => setOpen(open === i.id ? null : i.id)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="truncate text-sm text-white">{i.reported_text}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  <span>
                    {i.category} · {i.severity} · {i.context_path ?? "no path"} ·{" "}
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                  {i.recurring && (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-sky-400/40 px-1.5 py-0.5 text-sky-400">
                      <Repeat className="h-3 w-3" /> seen {i.times_seen}×
                    </span>
                  )}
                  {i.amendment_ref && (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-[color:var(--gold)]/40 px-1.5 py-0.5 text-[color:var(--gold)]">
                      <Scale className="h-3 w-3" /> {i.amendment_ref}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-sm border px-2 py-1 text-[10px] uppercase tracking-[0.25em] ${
                  STATUS_TONE[i.status] ?? STATUS_TONE.open
                }`}
              >
                {i.status.replace("_", " ")}
              </span>
            </button>

            {open === i.id && (
              <div className="mt-4 space-y-3 border-l border-white/10 pl-4">
                {/* FRASS-0515-H — Repair History: the six questions, always answered. */}
                <div className="rounded-sm border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
                    <History className="h-3 w-3" /> Repair History
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">What was repaired</dt>
                      <dd className="text-white/75">
                        {Array.isArray(i.repairs_applied) && i.repairs_applied.length > 0
                          ? i.repairs_applied.join(", ")
                          : i.status === "escalated"
                            ? "Nothing — escalated instead"
                            : "Nothing yet"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">When</dt>
                      <dd className="text-white/75">
                        {i.resolved_at
                          ? new Date(i.resolved_at).toLocaleString()
                          : `Reported ${new Date(i.created_at).toLocaleString()} — still open`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">Automatic or manual</dt>
                      <dd className="text-white/75">
                        {i.resolution_mode ? MODE_LABEL[i.resolution_mode] ?? i.resolution_mode : "Not decided yet"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">Happened before?</dt>
                      <dd className="text-white/75">
                        {i.recurring
                          ? `Yes — this pattern has been seen ${i.times_seen} times.`
                          : "No — first time this pattern appeared."}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        Constitutional amendment
                      </dt>
                      <dd className="text-white/75">
                        {i.amendment_ref
                          ? `${i.amendment_ref}${i.amendment_note ? ` — ${i.amendment_note}` : ""}`
                          : "None recorded."}
                      </dd>
                    </div>
                    {i.resolution_note && (
                      <div className="sm:col-span-2">
                        <dt className="text-[10px] uppercase tracking-[0.25em] text-white/40">Note</dt>
                        <dd className="text-white/75">{i.resolution_note}</dd>
                      </div>
                    )}
                  </dl>

                  <AnnotateForm
                    incident={i}
                    busy={annotate.isPending}
                    onSave={(values) => annotate.mutate({ data: { id: i.id, ...values } })}
                  />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Root cause</div>
                  <p className="mt-1 text-sm text-white/70">{i.root_cause ?? "—"}</p>
                </div>
                {Array.isArray(i.repairs_applied) && i.repairs_applied.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Repairs applied</div>
                    <p className="mt-1 text-sm text-emerald-400">{i.repairs_applied.join(", ")}</p>
                  </div>
                )}
                {i.engineering_report && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        Engineering ticket
                      </div>
                      <button
                        onClick={() => {
                          void navigator.clipboard.writeText(i.engineering_report ?? "");
                          toast.success("Engineering ticket copied.");
                        }}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)] hover:underline"
                      >
                        <ClipboardCopy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-sm border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-white/70">
                      {i.engineering_report}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Founder closes the loop on an incident. Members never see this. */
function AnnotateForm({
  incident,
  busy,
  onSave,
}: {
  incident: RepairIncident;
  busy: boolean;
  onSave: (values: {
    resolutionMode: "automatic" | "manual" | "escalated" | "no_action" | null;
    resolutionNote: string | null;
    amendmentRef: string | null;
    amendmentNote: string | null;
    markResolved: boolean;
  }) => void;
}) {
  const [mode, setMode] = useState<string>(incident.resolution_mode ?? "");
  const [note, setNote] = useState(incident.resolution_note ?? "");
  const [ref, setRef] = useState(incident.amendment_ref ?? "");
  const [amendNote, setAmendNote] = useState(incident.amendment_note ?? "");
  const [close, setClose] = useState(false);

  return (
    <div className="mt-4 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="rounded-sm border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white"
        aria-label="How it was resolved"
      >
        <option value="">How was it resolved?</option>
        <option value="automatic">Automatic — Frassy repaired it</option>
        <option value="manual">Manual — a person fixed it</option>
        <option value="escalated">Escalated to engineering</option>
        <option value="no_action">No action needed</option>
      </select>
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="Amendment created? e.g. FRASS-0514"
        className="rounded-sm border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white placeholder:text-white/30"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What actually fixed it"
        className="rounded-sm border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white placeholder:text-white/30"
      />
      <input
        value={amendNote}
        onChange={(e) => setAmendNote(e.target.value)}
        placeholder="Why the amendment was written"
        className="rounded-sm border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white placeholder:text-white/30"
      />
      <label className="flex items-center gap-2 text-[11px] text-white/60">
        <input type="checkbox" checked={close} onChange={(e) => setClose(e.target.checked)} />
        Mark this incident resolved
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          onSave({
            resolutionMode: (mode || null) as never,
            resolutionNote: note.trim() || null,
            amendmentRef: ref.trim() || null,
            amendmentNote: amendNote.trim() || null,
            markResolved: close,
          })
        }
        className="rounded-sm border border-[color:var(--gold)]/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] disabled:opacity-40"
      >
        {busy ? "Saving…" : "Save to Repair History"}
      </button>
    </div>
  );
}
