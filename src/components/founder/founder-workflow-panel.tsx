// FRASS-0527 — the Founder Workflow Standard, shown where the Founder works.
import { Link } from "@tanstack/react-router";
import { FOUNDER_WORKFLOW, FOUNDER_PRINCIPLE } from "@/lib/founder/workflow";

export function FounderWorkflowPanel() {
  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0527</p>
      <h2 className="mt-1 text-xl font-black uppercase tracking-tight">Founder Workflow</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Founder Path, Design Authority and the Change Advisor are one workflow, not three tools.
        Talk to Frassy first — she does what she can, prepares what she can, and only what truly
        needs code becomes an engineering request.
      </p>

      <ol className="mt-5 space-y-3">
        {FOUNDER_WORKFLOW.map((s) => (
          <li key={s.id} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--gold)] text-[11px] text-[color:var(--gold)]">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {s.label}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {s.owner}
                  {s.amendment ? ` · ${s.amendment}` : ""}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{s.plain}</p>
              {s.path ? (
                <Link to={s.path} className="text-[11px] text-[color:var(--gold)] underline">
                  Go there
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 border-t border-border/60 pt-3 text-sm italic">{FOUNDER_PRINCIPLE}</p>
    </section>
  );
}
