// FRASS-0520 — Founder Design Authority. Natural-language interface editing
// with preview, approval and an individually revertible Change History.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  decideDesignChange,
  listDesignChanges,
  prepareDesignChange,
} from "@/lib/founder/founder.functions";
import {
  DESIGN_AUTHORITY_MAY,
  DESIGN_AUTHORITY_MAY_NEVER,
  DESIGN_STUDIO_EXAMPLES,
} from "@/lib/founder/design-authority";

export function DesignAuthorityPanel() {
  const prepare = useServerFn(prepareDesignChange);
  const decide = useServerFn(decideDesignChange);
  const load = useServerFn(listDesignChanges);
  const qc = useQueryClient();
  const [instruction, setInstruction] = useState("");
  const [reason, setReason] = useState("");
  const [refusal, setRefusal] = useState<string | null>(null);

  const { data: history } = useQuery({
    queryKey: ["founder", "design-changes"],
    queryFn: () => load(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["founder", "design-changes"] });

  const propose = useMutation({
    mutationFn: () =>
      prepare({ data: { instruction, reason: reason.trim() ? reason.trim() : null } }),
    onSuccess: (r) => {
      if (!r.proposal.allowed) {
        setRefusal(r.proposal.refusal);
        return;
      }
      setRefusal(null);
      setInstruction("");
      setReason("");
      toast.success(r.proposal.plain);
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: (v: { id: string; decision: "approved" | "rejected" | "reverted" }) =>
      decide({ data: { id: v.id, decision: v.decision, beforeState: null, afterState: null } }),
    onSuccess: () => {
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-4">
        <h2 className="text-lg font-black uppercase tracking-wide">Design Authority</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the interface change the way you'd say it out loud. Nothing is applied until you
          approve the preview, and every approved change can be reverted on its own.
        </p>
      </header>

      <input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder={DESIGN_STUDIO_EXAMPLES[0]}
        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why this change? (optional — it's kept with the history)"
        className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={propose.isPending || instruction.trim().length < 3}
          onClick={() => propose.mutate()}
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
        >
          {propose.isPending ? "Preparing…" : "Prepare preview"}
        </button>
        {DESIGN_STUDIO_EXAMPLES.slice(1, 4).map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInstruction(ex)}
            className="rounded-full border border-border px-3 py-2 text-xs"
          >
            {ex}
          </button>
        ))}
      </div>

      {refusal ? (
        <p className="mt-3 rounded-xl border border-border bg-muted/50 p-3 text-sm">
          That one goes to engineering, not to me. {refusal}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-bold uppercase tracking-wide">I can change</p>
          <p className="mt-1 text-xs text-muted-foreground">{DESIGN_AUTHORITY_MAY.join(" · ")}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-bold uppercase tracking-wide">I can never change</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {DESIGN_AUTHORITY_MAY_NEVER.join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold">Change history</p>
        {!history?.length ? (
          <p className="mt-1 text-sm text-muted-foreground">No Founder edits yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {history.map((c) => (
              <li key={c.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">{c.instruction}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.change_type.replace("-", " ")} · {c.surface} ·{" "}
                  {new Date(c.created_at).toLocaleString()} · {c.status}
                  {c.reason ? ` · ${c.reason}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.status === "preview" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => act.mutate({ id: c.id, decision: "approved" })}
                        className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => act.mutate({ id: c.id, decision: "rejected" })}
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  ) : c.status === "approved" ? (
                    <button
                      type="button"
                      onClick={() => act.mutate({ id: c.id, decision: "reverted" })}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                    >
                      Revert this change
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
