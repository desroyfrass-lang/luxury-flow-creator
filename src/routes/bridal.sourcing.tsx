import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { SOURCING_STAGES, VENDOR_CAPABILITIES } from "@/lib/bridal";
import { useBridalVault } from "@/hooks/use-bridal-vault";

export const Route = createFileRoute("/bridal/sourcing")({
  head: () => ({
    meta: [
      { title: "The Sourcing Desk — Frass Bridal" },
      {
        name: "description",
        content:
          "Found a dress Frass doesn't carry? Submit the reference and we open a sourcing case — the boutique becomes part of the Frass Marketplace.",
      },
      { property: "og:title", content: "The Sourcing Desk — Frass Bridal" },
      {
        property: "og:description",
        content: "Every request becomes a vendor relationship. Every wedding grows the marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcingPage,
});

function SourcingPage() {
  const { vault, ready, addCase, advanceCase } = useBridalVault();
  const [form, setForm] = useState({ designer: "", boutique: "", reference: "", note: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.designer && !form.reference) return;
    addCase(form);
    setForm({ designer: "", boutique: "", reference: "", note: "" });
  };

  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass Bridal · the concierge desk at the gate
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">The Sourcing Desk</h1>
          <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
            Found a dress somewhere else? Bring it to us. We contact the boutique, review quality
            and shipping, and bring them into the Frass Marketplace. Instead of losing the dress,
            the marketplace grows — for you and for every couple after you.
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-3 sm:grid-cols-2">
            <Input label="Designer" value={form.designer} onChange={(v) => setForm({ ...form, designer: v })} />
            <Input label="Boutique or store" value={form.boutique} onChange={(v) => setForm({ ...form, boutique: v })} />
            <Input
              label="Link or reference"
              value={form.reference}
              onChange={(v) => setForm({ ...form, reference: v })}
            />
            <Input label="Anything else" value={form.note} onChange={(v) => setForm({ ...form, note: v })} />
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
              >
                Open a sourcing case
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
              How a request travels
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {SOURCING_STAGES.map((s, i) => (
                <span key={s.id} className="flex items-center gap-2">
                  <span
                    title={s.says}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs"
                  >
                    {s.label}
                  </span>
                  {i < SOURCING_STAGES.length - 1 && (
                    <span className="text-[color:var(--hill-gold)]">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {ready && vault.cases.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[oklch(0.7_0.01_80)]">
                No sourcing cases yet. When you open one, you'll be updated at every stage — you
                never have to chase us.
              </p>
            )}
            {vault.cases.map((c) => {
              const stage = SOURCING_STAGES[c.stage];
              return (
                <div key={c.id} className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-lg uppercase">
                      {c.designer || "Unnamed reference"}
                    </span>
                    <span className="rounded-full bg-[color:var(--hill-gold)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-black">
                      {stage.label}
                    </span>
                  </div>
                  {c.boutique && (
                    <p className="mt-1 text-xs text-[oklch(0.66_0.01_80)]">{c.boutique}</p>
                  )}
                  {c.reference && (
                    <p className="mt-2 break-all text-xs text-[oklch(0.7_0.01_80)]">{c.reference}</p>
                  )}
                  <p className="mt-3 text-sm italic text-[oklch(0.82_0.01_80)]">“{stage.says}”</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[color:var(--hill-gold)] transition-all duration-700"
                      style={{ width: `${((c.stage + 1) / SOURCING_STAGES.length) * 100}%` }}
                    />
                  </div>
                  {c.stage < SOURCING_STAGES.length - 1 && (
                    <button
                      type="button"
                      onClick={() => advanceCase(c.id)}
                      className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em]"
                    >
                      Simulate next update
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-6">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
              What the boutique receives when they join
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {VENDOR_CAPABILITIES.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-[oklch(0.82_0.01_80)]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-xl border border-white/12 bg-white/[0.02] p-3">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
        placeholder="—"
      />
    </label>
  );
}
