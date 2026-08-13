// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0532-B — Member Success Blueprints
//
// The Knowledge Vault section where personalization lives. A Blueprint teaches
// Frassy who someone is; she generates their Daily, Money Moves, pace and tone
// from it. Writing a Blueprint replaces writing an engineering specification.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ViewModeFrame } from "@/components/view-mode/simplified-view";
import { ViewModeToggle } from "@/components/view-mode/view-mode-toggle";
import {
  BLUEPRINT_FIELDS,
  BLUEPRINT_INVARIANTS,
  BLUEPRINT_KINDS,
  blueprintCompleteness,
  blueprintGaps,
  type MemberBlueprint,
} from "@/lib/blueprints/member-blueprint";
import {
  deleteMemberBlueprint,
  listMemberBlueprints,
  saveMemberBlueprint,
} from "@/lib/blueprints/member-blueprint.functions";
import { ONLINE_FIRST_PRINCIPLE } from "@/lib/business/online-first";

export const Route = createFileRoute("/_authenticated/blueprints")({
  head: () => ({
    meta: [
      { title: "Member Success Blueprints — Frass" },
      {
        name: "description",
        content:
          "Teach Frassy who someone is — urgency, vision, strengths, pace, technology comfort — and she builds their Daily and Money Moves from it.",
      },
      { property: "og:title", content: "Member Success Blueprints — Frass" },
      {
        property: "og:description",
        content: "Personalization by conversation, not engineering. One Blueprint per member.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BlueprintsPage,
});

const splitList = (v: string) =>
  v
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

function BlueprintsPage() {
  const listFn = useServerFn(listMemberBlueprints);
  const saveFn = useServerFn(saveMemberBlueprint);
  const deleteFn = useServerFn(deleteMemberBlueprint);
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ["member-blueprints"], queryFn: () => listFn({}) });
  const rows = useMemo<MemberBlueprint[]>(() => query.data ?? [], [query.data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["member-blueprints"] });

  const save = useMutation({
    mutationFn: (v: Record<string, unknown>) => saveFn({ data: v as never }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: invalidate,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    member_name: "",
    relationship: "",
    blueprint_kind: "entrepreneurial",
    financial_urgency: "",
    long_term_vision: "",
    strengths: "",
    technology_comfort: "moderate",
    communication_style: "",
    daily_priorities: "",
    money_moves_philosophy: "",
    business_vaults: "",
    learning_style: "",
    motivation_style: "",
    simplified_view: false,
    accessibility_notes: "",
    online_first: true,
    avoid: "",
    hours_per_day: "",
    status: "active",
    notes: "",
  });

  const field = (k: keyof typeof form) => ({
    value: String(form[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
    className: "w-full rounded-xl border border-white/12 bg-black/30 p-2 text-sm",
  });

  const submit = () => {
    save.mutate({
      id: null,
      member_name: form.member_name.trim(),
      relationship: form.relationship.trim() || null,
      blueprint_kind: form.blueprint_kind,
      financial_urgency: form.financial_urgency.trim() || null,
      long_term_vision: form.long_term_vision.trim() || null,
      strengths: splitList(form.strengths),
      technology_comfort: form.technology_comfort,
      communication_style: form.communication_style.trim() || null,
      daily_priorities: splitList(form.daily_priorities),
      money_moves_philosophy: form.money_moves_philosophy.trim() || null,
      business_vaults: splitList(form.business_vaults),
      learning_style: form.learning_style.trim() || null,
      motivation_style: form.motivation_style.trim() || null,
      simplified_view: form.simplified_view,
      accessibility_notes: form.accessibility_notes.trim() || null,
      online_first: form.online_first,
      avoid: splitList(form.avoid),
      hours_per_day: form.hours_per_day ? Number(form.hours_per_day) : null,
      status: form.status,
      notes: form.notes.trim() || null,
      user_id: null,
    });
  };

  return (
    <ViewModeFrame
      place="Member Success Blueprints"
      task={{
        title: "Tell me about the person, and I'll write the Blueprint",
        detail:
          "Say something like \"create a Daily for my father\" or \"Kanko has more time this week\" and I'll update it here — no engineering needed.",
      }}
    >
      <SiteShell>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
                <Sparkles className="h-3 w-3" /> FRASS-0532-B
              </div>
              <h1 className="mt-2 font-display text-3xl">Member Success Blueprints</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                A Blueprint is what Frassy knows about serving one person. She reads it and builds
                their Daily, their Money Moves, their pace and her tone from it. Teaching her is a
                conversation — not a release.
              </p>
            </div>
            <ViewModeToggle className="shrink-0" />
          </div>

          <div className="mt-6 rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-4 text-sm">
            <strong>{ONLINE_FIRST_PRINCIPLE.title} —</strong> {ONLINE_FIRST_PRINCIPLE.rule}
            <p className="mt-2 text-white/60">{ONLINE_FIRST_PRINCIPLE.founderPrinciple}</p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-xl">Blueprints</h2>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em]"
            >
              <Plus className="h-3.5 w-3.5" /> New Blueprint
            </button>
          </div>

          {open && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:grid-cols-2">
              <label className="text-xs text-white/60">
                Who this person is
                <input {...field("member_name")} placeholder="Name" />
              </label>
              <label className="text-xs text-white/60">
                Relationship
                <input {...field("relationship")} placeholder="my father" />
              </label>
              <label className="text-xs text-white/60">
                Foundation
                <select {...field("blueprint_kind")}>
                  {BLUEPRINT_KINDS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-white/60">
                Technology comfort
                <select {...field("technology_comfort")}>
                  <option value="low">Low — Frassy does the computer part</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="text-xs text-white/60">
                Financial urgency
                <input {...field("financial_urgency")} placeholder="Needs income within 30 days" />
              </label>
              <label className="text-xs text-white/60">
                Long-term vision
                <input {...field("long_term_vision")} placeholder="Retire from physical work" />
              </label>
              <label className="text-xs text-white/60">
                Strengths (comma separated)
                <input {...field("strengths")} placeholder="Electrical, renovation, teaching" />
              </label>
              <label className="text-xs text-white/60">
                Daily priorities (comma separated)
                <input {...field("daily_priorities")} placeholder="Income, knowledge, rest" />
              </label>
              <label className="text-xs text-white/60">
                Communication style
                <input {...field("communication_style")} placeholder="Slow, respectful, plain" />
              </label>
              <label className="text-xs text-white/60">
                Motivation style
                <input {...field("motivation_style")} placeholder="Pride in his work" />
              </label>
              <label className="text-xs text-white/60">
                Learning style
                <input {...field("learning_style")} placeholder="Show me once, by voice" />
              </label>
              <label className="text-xs text-white/60">
                Hours a day
                <input {...field("hours_per_day")} inputMode="decimal" placeholder="2" />
              </label>
              <label className="text-xs text-white/60">
                Money Moves philosophy
                <input {...field("money_moves_philosophy")} placeholder="Online income only" />
              </label>
              <label className="text-xs text-white/60">
                Business Vaults (comma separated)
                <input {...field("business_vaults")} placeholder="tradesperson" />
              </label>
              <label className="text-xs text-white/60">
                Never recommend (comma separated)
                <input {...field("avoid")} placeholder="Local job boards, site work" />
              </label>
              <label className="text-xs text-white/60">
                Accessibility
                <input {...field("accessibility_notes")} placeholder="Large text, voice first" />
              </label>
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={form.simplified_view}
                  onChange={(e) => setForm((f) => ({ ...f, simplified_view: e.target.checked }))}
                />
                Simplified View by default
              </label>
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={form.online_first}
                  onChange={(e) => setForm((f) => ({ ...f, online_first: e.target.checked }))}
                />
                Online-first Money Moves (FRASS-0532-A)
              </label>
              <label className="text-xs text-white/60 sm:col-span-2">
                Anything else Frassy should know
                <textarea {...field("notes")} rows={3} />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  disabled={!form.member_name.trim() || save.isPending}
                  onClick={submit}
                  className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-[11px] uppercase tracking-[0.24em] text-black disabled:opacity-40"
                >
                  {save.isPending ? "Saving…" : "Save Blueprint"}
                </button>
                {save.isError && (
                  <p className="mt-2 text-xs text-red-400">{(save.error as Error).message}</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {query.isLoading && <p className="text-sm text-white/50">Loading…</p>}
            {!query.isLoading && rows.length === 0 && (
              <p className="text-sm text-white/50">
                No Blueprints yet. Write one here, or simply ask Frassy to create one.
              </p>
            )}
            {rows.map((b) => {
              const gaps = blueprintGaps(b);
              return (
                <div key={b.id} className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-medium">
                        {b.member_name}
                        {b.relationship ? ` · ${b.relationship}` : ""}
                      </p>
                      <p className="text-xs text-white/50">
                        {BLUEPRINT_KINDS.find((k) => k.id === b.blueprint_kind)?.label} ·{" "}
                        {b.status} · {blueprintCompleteness(b)}% complete
                        {b.online_first ? " · online-first" : " · hands-on by request"}
                        {b.simplified_view ? " · Simplified View" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove.mutate(b.id)}
                      className="rounded-full border border-white/15 p-2 text-white/50"
                      aria-label={`Delete blueprint for ${b.member_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {b.long_term_vision && (
                    <p className="mt-2 text-sm text-white/70">🎯 {b.long_term_vision}</p>
                  )}
                  {b.daily_priorities.length > 0 && (
                    <p className="mt-1 text-sm text-white/60">
                      Day built around: {b.daily_priorities.join(" · ")}
                    </p>
                  )}
                  {gaps.length > 0 && (
                    <p className="mt-2 text-xs text-amber-300/80">
                      Still missing: {gaps.join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <h3 className="font-display text-lg">What a Blueprint contains</h3>
            <ul className="mt-2 grid gap-1 text-sm text-white/65 sm:grid-cols-2">
              {BLUEPRINT_FIELDS.map((f) => (
                <li key={f.key}>
                  • <strong>{f.label}</strong> — {f.plain}
                </li>
              ))}
            </ul>
            <h3 className="mt-5 font-display text-lg">What a Blueprint can never do</h3>
            <ul className="mt-2 space-y-1 text-sm text-white/60">
              {BLUEPRINT_INVARIANTS.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </SiteShell>
    </ViewModeFrame>
  );
}
