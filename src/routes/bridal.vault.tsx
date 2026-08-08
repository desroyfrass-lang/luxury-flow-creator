import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { CHECKLIST_CATEGORIES, FAMILY_VISION_AREAS } from "@/lib/bridal";
import { useBridalVault } from "@/hooks/use-bridal-vault";

export const Route = createFileRoute("/bridal/vault")({
  head: () => ({
    meta: [
      { title: "The Wedding Vault — Frass Bridal" },
      {
        name: "description",
        content:
          "Budget, timeline, guest list, vendors, contracts and a smart wedding checklist — the couple's headquarters, all in one place.",
      },
      { property: "og:title", content: "The Wedding Vault — Frass Bridal" },
      {
        property: "og:description",
        content: "One shared couple's workspace for the whole wedding, which later becomes the Family Vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  const { vault, ready, update, toggleTask, patchTask } = useBridalVault();
  const [filter, setFilter] = useState<string>("All");

  const done = vault.tasks.filter((t) => t.done).length;
  const pct = Math.round((done / vault.tasks.length) * 100);
  const allocated = vault.tasks.reduce((s, t) => s + (t.budget ?? 0), 0);
  const shown =
    filter === "All" ? vault.tasks : vault.tasks.filter((t) => t.category === filter);

  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass Bridal · the stone office by the fountain
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">The Wedding Vault</h1>
          <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
            A shared couple's workspace. Both partners, one source of truth. After the wedding this
            Vault quietly becomes your Family Vault.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Partner one" value={vault.coupleA} onChange={(v) => update({ coupleA: v })} />
            <Field label="Partner two" value={vault.coupleB} onChange={(v) => update({ coupleB: v })} />
            <Field label="Wedding date" type="date" value={vault.date} onChange={(v) => update({ date: v })} />
            <Field
              label="Total budget"
              type="number"
              value={vault.budget ? String(vault.budget) : ""}
              onChange={(v) => update({ budget: Number(v) || 0 })}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Checklist complete" value={`${pct}%`} note={`${done} of ${vault.tasks.length} tasks`} />
            <Stat
              label="Budget allocated"
              value={allocated ? `$${allocated.toLocaleString()}` : "$0"}
              note={vault.budget ? `of $${vault.budget.toLocaleString()}` : "No budget set yet"}
            />
            <Stat
              label="Sourcing cases"
              value={String(vault.cases.length)}
              note={vault.cases.length ? "Tracked at the Sourcing Desk" : "Nothing requested yet"}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {["All", ...CHECKLIST_CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                  filter === c
                    ? "border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)] text-black"
                    : "border-white/20 text-[oklch(0.8_0.01_80)] hover:bg-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {ready &&
              shown.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-[color:var(--hill-gold)]/35"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTask(t.id)}
                      aria-label={t.task}
                      className="mt-1 h-4 w-4 accent-[color:var(--hill-gold)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm ${t.done ? "line-through opacity-50" : ""}`}>
                          {t.task}
                        </span>
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[oklch(0.66_0.01_80)]">
                          {t.category}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-4">
                        <MiniField
                          label="Due"
                          type="date"
                          value={t.due ?? ""}
                          onChange={(v) => patchTask(t.id, { due: v })}
                        />
                        <MiniField
                          label="Owner"
                          value={t.owner ?? ""}
                          onChange={(v) => patchTask(t.id, { owner: v })}
                        />
                        <MiniField
                          label="Budget"
                          type="number"
                          value={t.budget ? String(t.budget) : ""}
                          onChange={(v) => patchTask(t.id, { budget: Number(v) || 0 })}
                        />
                        <MiniField
                          label="Vendor"
                          value={t.vendor ?? ""}
                          onChange={(v) => patchTask(t.id, { vendor: v })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-12 rounded-2xl border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
              Family Vision — begins during planning, not after
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {FAMILY_VISION_AREAS.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-[oklch(0.82_0.01_80)]"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/bridal/journey"
              className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
            >
              See it as a journey
            </Link>
            <Link
              to="/bridal"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Back to the village
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block rounded-xl border border-white/12 bg-white/[0.02] p-3">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
        placeholder="—"
      />
    </label>
  );
}

function MiniField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5">
      <span className="text-[9px] uppercase tracking-[0.2em] text-[oklch(0.6_0.01_80)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-xs outline-none placeholder:text-white/20"
        placeholder="—"
      />
    </label>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
      <div className="text-xs text-[oklch(0.66_0.01_80)]">{note}</div>
    </div>
  );
}
