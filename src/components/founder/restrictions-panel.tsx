// Founder Control Room → Business → Commissioning: Global Restrictions.
// Lists, drafts and edits restriction rules; only the Founder (super_admin)
// can approve or reject — enforced by the database, not by this screen.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import {
  listRestrictionRules, restrictionRuleHistory, saveRestrictionRule, decideRestrictionRule,
} from "@/lib/compliance/restriction-rules.functions";
import { APPLIES_TO, EFFECTS, REASONS, TARGET_LEVELS, approvalBlockers } from "@/lib/compliance/restriction-rules";

type Row = Record<string, any>;
const EMPTY: Row = {
  target_level: "listing", target_ref: "", country: "", subdivision: "", effect: "prohibit",
  reason: "needs_review", applies_to: "both", min_age: "", evidence_source: "", evidence_reference: "",
  verified_at: "", expires_at: "",
};
const REASON_LABEL: Record<string, string> = {
  legal_prohibition: "Legal ban", shipping_unavailable: "Shipping unavailable", age_gated: "Age limit",
  needs_review: "Needs review", verified_permitted: "Verified permitted",
};
const MODE_LABEL: Record<string, string> = {
  off: "Off — checkout is not checked", shadow: "Shadow — checked and logged, never blocks", enforce: "Enforce — blocks checkout",
};
const day = (v?: string | null) => (v ? v.slice(0, 10) : "");
const field = "w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm";

export function RestrictionsPanel() {
  const { userId } = useAuthUserId();
  const qc = useQueryClient();
  const list = useServerFn(listRestrictionRules);
  const save = useServerFn(saveRestrictionRule);
  const decide = useServerFn(decideRestrictionRule);
  const key = ["restriction-rules", userId];
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => list(), enabled: Boolean(userId) });
  const [editing, setEditing] = useState<Row | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  const submit = async () => {
    if (!editing) return;
    setBusy(true); setErrors([]);
    const { id, ...rule } = editing;
    const res = await save({ data: { id, rule } });
    setBusy(false);
    if (!res.ok) return setErrors(res.errors);
    setEditing(null);
    void qc.invalidateQueries({ queryKey: key });
  };
  const onDecide = async (ruleId: string, decision: "approved" | "rejected") => {
    const note = window.prompt(decision === "approved" ? "Approval note (optional)" : "Why reject? (optional)") ?? "";
    setBusy(true);
    const res = await decide({ data: { ruleId, decision, note } });
    setBusy(false);
    if (!res.ok) window.alert(res.error);
    void qc.invalidateQueries({ queryKey: key });
  };

  return (
    <section aria-labelledby="restrictions-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="restrictions-heading" className="font-display text-2xl">Global Restrictions</h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Rules about what may be sold or shipped where. Anyone on the admin team may draft; only you give final approval.
            Editing a rule always sends it back to pending.
          </p>
        </div>
        <button type="button" onClick={() => { setErrors([]); setEditing({ ...EMPTY }); }}
          className="rounded-sm border border-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">
          New draft rule
        </button>
      </div>

      {data && (
        <div className="rounded-sm border border-border bg-background/40 p-3 text-xs" data-testid="enforcement-mode">
          <span className="uppercase tracking-[0.2em] text-muted-foreground">Checkout enforcement (read-only): </span>
          <strong>{MODE_LABEL[data.enforcementMode] ?? data.enforcementMode}</strong>
          {!data.canDecide && <div className="mt-1 text-muted-foreground">You can draft and edit. Final approval needs the Founder (super admin) role.</div>}
        </div>
      )}

      {editing && (
        <div className="grid gap-3 rounded-sm border border-[color:var(--gold)]/50 p-4 md:grid-cols-3">
          <L t="Applies to"><select className={field} value={editing.target_level} onChange={(e) => setEditing({ ...editing, target_level: e.target.value })}>{TARGET_LEVELS.map((v) => <option key={v}>{v}</option>)}</select></L>
          <L t="Reference (ID / category key)"><input className={field} value={editing.target_ref} onChange={(e) => setEditing({ ...editing, target_ref: e.target.value })} /></L>
          <L t="Product / service"><select className={field} value={editing.applies_to} onChange={(e) => setEditing({ ...editing, applies_to: e.target.value })}>{APPLIES_TO.map((v) => <option key={v}>{v}</option>)}</select></L>
          <L t="Country (2 letters)"><input className={field} maxLength={2} value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value.toUpperCase() })} /></L>
          <L t="Region (optional, e.g. US-CA)"><input className={field} value={editing.subdivision ?? ""} onChange={(e) => setEditing({ ...editing, subdivision: e.target.value.toUpperCase() })} /></L>
          <L t="Effect"><select className={field} value={editing.effect} onChange={(e) => setEditing({ ...editing, effect: e.target.value })}>{EFFECTS.map((v) => <option key={v}>{v}</option>)}</select></L>
          <L t="Reason"><select className={field} value={editing.reason} onChange={(e) => setEditing({ ...editing, reason: e.target.value })}>{REASONS.map((v) => <option key={v} value={v}>{REASON_LABEL[v]}</option>)}</select></L>
          <L t="Minimum age (age rules)"><input className={field} type="number" value={editing.min_age ?? ""} onChange={(e) => setEditing({ ...editing, min_age: e.target.value })} /></L>
          <L t="Evidence source"><input className={field} value={editing.evidence_source ?? ""} onChange={(e) => setEditing({ ...editing, evidence_source: e.target.value })} /></L>
          <L t="Evidence reference / link"><input className={field} value={editing.evidence_reference ?? ""} onChange={(e) => setEditing({ ...editing, evidence_reference: e.target.value })} /></L>
          <L t="Verified on"><input className={field} type="date" value={day(editing.verified_at)} onChange={(e) => setEditing({ ...editing, verified_at: e.target.value })} /></L>
          <L t="Expires on (optional)"><input className={field} type="date" value={day(editing.expires_at)} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} /></L>
          {errors.length > 0 && <ul role="alert" className="md:col-span-3 list-disc pl-5 text-xs text-destructive">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <div className="flex gap-2 md:col-span-3">
            <button type="button" disabled={busy} onClick={submit} className="rounded-sm bg-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--ink)]">Save as pending</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-sm border border-border px-4 py-2 text-[11px] uppercase tracking-[0.25em]">Cancel</button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading rules…</p>}
      {error && <p className="text-sm text-destructive">Could not load rules. Your access is checked on the server.</p>}
      {data && data.rules.length === 0 && <p className="text-sm text-muted-foreground">No restriction rules yet. Nothing is seeded — every rule starts as your draft.</p>}

      {data && data.rules.length > 0 && (
        <div className="space-y-2">
          {data.rules.map((r: Row) => {
            const blockers = approvalBlockers(r as Parameters<typeof approvalBlockers>[0]);
            return (
              <div key={r.id} className="rounded-sm border border-border bg-background/40 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-border px-2 text-[10px] uppercase tracking-[0.2em]">{r.approval}</span>
                  <strong>{r.country}{r.subdivision ? ` · ${r.subdivision}` : ""}</strong>
                  <span>{r.effect} · {REASON_LABEL[r.reason] ?? r.reason}{r.min_age ? ` (${r.min_age}+)` : ""}</span>
                  <span className="text-muted-foreground">{r.target_level}: {r.target_ref} · {r.applies_to}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Evidence: {r.evidence_source || "—"} · {r.evidence_reference || "—"} · verified {day(r.verified_at) || "—"} · expires {day(r.expires_at) || "never"}
                </div>
                {r.approval === "pending" && blockers.length > 0 && <div className="mt-1 text-xs text-[color:var(--gold)]">Before approval: {blockers.join(", ")}</div>}
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em]">
                  <button type="button" onClick={() => { setErrors([]); setEditing({ ...r }); }} className="border border-border px-2 py-1">Edit</button>
                  <button type="button" onClick={() => setHistoryFor(historyFor === r.id ? null : r.id)} className="border border-border px-2 py-1">History</button>
                  {data.canDecide && r.approval === "pending" && (
                    <>
                      <button type="button" disabled={busy || blockers.length > 0} onClick={() => onDecide(r.id, "approved")} className="border border-[color:var(--gold)] px-2 py-1 text-[color:var(--gold)] disabled:opacity-40">Approve</button>
                      <button type="button" disabled={busy} onClick={() => onDecide(r.id, "rejected")} className="border border-border px-2 py-1">Reject</button>
                    </>
                  )}
                </div>
                {historyFor === r.id && <History ruleId={r.id} />}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function History({ ruleId }: { ruleId: string }) {
  const fn = useServerFn(restrictionRuleHistory);
  const { data, isLoading } = useQuery({ queryKey: ["restriction-history", ruleId], queryFn: () => fn({ data: { ruleId } }) });
  if (isLoading) return <p className="mt-2 text-xs text-muted-foreground">Loading history…</p>;
  return (
    <ol className="mt-2 space-y-1 border-l border-border pl-3 text-xs text-muted-foreground">
      {(data ?? []).map((h: Row) => (
        <li key={h.id}>{h.created_at?.slice(0, 16).replace("T", " ")} — {h.action} → {h.snapshot?.approval}</li>
      ))}
    </ol>
  );
}

function L({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t}<div className="mt-1 normal-case tracking-normal">{children}</div></label>;
}
