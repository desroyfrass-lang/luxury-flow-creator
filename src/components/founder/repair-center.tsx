// FRASS-0515 — Repair Center: every issue Frassy diagnosed, repaired or escalated.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Wrench, ShieldCheck, AlertTriangle, ClipboardCopy } from "lucide-react";
import { listRepairIncidents, type RepairIncident } from "@/lib/repair/repair.functions";
import { SAFE_REPAIRS, REPAIR_FORBIDDEN } from "@/lib/repair/engine";

const STATUS_TONE: Record<string, string> = {
  auto_repaired: "text-emerald-400 border-emerald-400/40",
  resolved: "text-emerald-400 border-emerald-400/40",
  escalated: "text-amber-400 border-amber-400/40",
  diagnosed: "text-sky-400 border-sky-400/40",
  open: "text-white/60 border-white/20",
};

export function RepairCenter() {
  const listFn = useServerFn(listRepairIncidents);
  const [open, setOpen] = useState<string | null>(null);

  const incidents = useQuery<RepairIncident[]>({
    queryKey: ["repair", "incidents"],
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  const items = incidents.data ?? [];
  const escalated = items.filter((i) => i.status === "escalated").length;
  const repaired = items.filter((i) => i.status === "auto_repaired").length;

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
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {i.category} · {i.severity} · {i.context_path ?? "no path"} ·{" "}
                  {new Date(i.created_at).toLocaleString()}
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
