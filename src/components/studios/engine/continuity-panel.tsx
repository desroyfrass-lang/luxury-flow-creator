// FRASS-0601 — the Continuity Checker. Canon is only changed on the Founder's word.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton, StudioCard } from "@/components/studios/studio-ui";
import { checkContinuity } from "@/lib/studios/production-engine.functions";
import { useContinuityFindings } from "@/lib/studios/use-engine";
import { logStudioActivity } from "@/lib/studios/use-studios";

const RESOLUTIONS = [
  { id: "fixed", label: "Fixed with Frassy" },
  { id: "ignored", label: "Ignore" },
  { id: "intentional", label: "Mark intentional" },
  { id: "canon_updated", label: "Update canon" },
];

export function ContinuityPanel({ production }: { production: any }) {
  const qc = useQueryClient();
  const { data: findings = [] } = useContinuityFindings(production.id);
  const check = useServerFn(checkContinuity);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      const res = await check({ data: { productionId: production.id } });
      setVerdict(String(res.verdict ?? ""));
      qc.invalidateQueries({ queryKey: ["studio", "continuity", production.id] });
      toast.success(res.count === 0 ? "Nothing conflicts. Clean run." : `${res.count} thing(s) to look at.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't run the check.");
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (finding: any, resolution: string) => {
    const { data: auth } = await supabase.auth.getUser();
    await supabase
      .from("studio_continuity_findings")
      .update({ resolution, resolved_at: new Date().toISOString(), resolved_by: auth.user?.id ?? null })
      .eq("id", finding.id);
    await logStudioActivity("continuity_" + resolution, "production", production.id, { finding: finding.summary });
    qc.invalidateQueries({ queryKey: ["studio", "continuity", production.id] });
    if (resolution === "canon_updated")
      toast.success("Marked as a canon update. Write it into the Series Bible so it stays true next time.");
  };

  const open = findings.filter((f: any) => f.resolution === "open");
  const settled = findings.filter((f: any) => f.resolution !== "open");

  return (
    <div className="space-y-5">
      <StudioCard eyebrow="Step 6 — protect the world" title="Continuity check">
        <p className="text-sm text-muted-foreground">
          Frassy compares this production against the Series Bible, the characters, the timeline, the locations and every
          episode before it. She flags what looks wrong. She never changes canon on her own.
        </p>
        <div className="mt-3">
          <GoldButton onClick={run} disabled={busy}>
            {busy ? "Frassy is checking…" : "Run the continuity check"}
          </GoldButton>
        </div>
        {verdict ? <p className="mt-3 text-sm">{verdict}</p> : null}
      </StudioCard>

      {open.length === 0 && findings.length > 0 ? (
        <StudioCard eyebrow="All clear" title="Nothing outstanding">
          <p className="text-sm text-muted-foreground">Every flag has been dealt with.</p>
        </StudioCard>
      ) : null}

      {open.map((f: any) => (
        <div
          key={f.id}
          className={`rounded-lg border p-5 ${f.severity === "conflict" ? "border-red-500/50 bg-red-500/5" : "border-amber-500/40 bg-amber-500/5"}`}
        >
          <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
            Continuity {f.severity} · {f.area}
          </div>
          <h3 className="mt-1 font-display text-lg uppercase tracking-tight">{f.summary}</h3>
          {f.detail ? <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p> : null}
          {f.conflicts_with ? <p className="mt-2 text-sm">Conflicts with: {f.conflicts_with}</p> : null}
          {f.suggestion ? <p className="mt-2 text-sm text-muted-foreground">Frassy suggests: {f.suggestion}</p> : null}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => resolve(f, r.id)}
                className="rounded-sm border border-border/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {settled.length ? (
        <StudioCard eyebrow="Already handled" title="Settled">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {settled.map((f: any) => (
              <li key={f.id}>
                <span className="text-foreground">{f.summary}</span> — {f.resolution.replace("_", " ")}
              </li>
            ))}
          </ul>
        </StudioCard>
      ) : null}
    </div>
  );
}
