// FRASS-0484 — Frassy Tax Intelligence, rendered inside the existing Financial
// Center "Taxes" tab. No new ledger, no new fetch of money: it derives from the
// same receipts the Financial Center already loaded.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/finance/financial-center";
import type { Receipt } from "@/lib/finance/receipts";
import {
  COMPLIANCE_AREAS,
  COMPLIANCE_NOTICE,
  CONFIDENCE_LABEL,
  COUNTRY_TAX_RULES,
  CUSTOMS_CHECKLIST,
  TAX_CONSTITUTION,
  TRADE_CAPABILITIES,
  TRADE_CONSTITUTION,
  TRADE_NOTICE,
  complianceState,
} from "@/lib/compliance";

const toneRing: Record<string, string> = {
  green: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  yellow: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  orange: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  red: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

function useMyCountry() {
  return useQuery({
    queryKey: ["my-country"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase.from("profiles").select("country").eq("id", auth.user.id).maybeSingle();
      return (data?.country as string | null) ?? null;
    },
    staleTime: 5 * 60_000,
  });
}

export function TaxIntelligencePanel({ receipts }: { receipts: Receipt[] }) {
  const { data: profileCountry } = useMyCountry();
  const [override, setOverride] = useState<string>("");
  const country = override || profileCountry || null;
  const state = useMemo(() => complianceState(receipts, { country }), [receipts, country]);
  const { year: y, signal, narrative } = state;
  const c = y.currency;

  return (
    <div className="space-y-6">
      {/* Signal */}
      <div className={`rounded-2xl border p-4 text-sm ${toneRing[signal.tone]}`}>
        <span className="mr-2">{signal.dot}</span>
        {signal.message}
      </div>

      {/* How am I doing this year? */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">How you're doing in {y.year}</h3>
          <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Country
            <select
              value={country ?? ""}
              onChange={(e) => setOverride(e.target.value)}
              className="ml-2 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-foreground"
            >
              <option value="">Not set</option>
              {COUNTRY_TAX_RULES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.flag} {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Estimated income" value={money(y.totalIncome, c)} confidence="records" />
          <Stat label="Estimated expenses" value={money(y.totalExpenses, c)} confidence="records" />
          <Stat label="Estimated taxable income" value={money(y.taxableIncome, c)} confidence="records" />
          <Stat label="Suggested tax reserve" value={y.country ? money(y.reserve, c) : "—"} confidence={y.reserveConfidence} />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{narrative}</p>
      </section>

      {/* Categories */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Lines title="Income" lines={y.income} currency={c} empty="No income recorded for this year yet." />
        <Lines title="Business expenses" lines={y.expenses} currency={c} empty="No expenses recorded for this year yet." />
      </div>

      {/* Outstanding records */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Records still needed</h3>
        {y.needsCategory.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing outstanding. Every record has a category.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {y.needsCategory.slice(0, 12).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span className="truncate">{r.title}</span>
                <span className="shrink-0 text-muted-foreground">{money(r.gross, r.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Next steps */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Suggested next steps</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {y.nextSteps.map((s) => (
            <li key={s} className="rounded-xl border border-white/10 bg-black/20 p-3">{s}</li>
          ))}
        </ul>
      </section>

      {/* Needs confirmation */}
      <section className="rounded-2xl border border-rose-400/25 bg-rose-400/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-200">Frassy will not guess these</h3>
        <ul className="mt-3 space-y-2 text-sm text-rose-100/85">
          {y.verifyFirst.map((v) => (
            <li key={v}>• {v}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-rose-100/70">{COMPLIANCE_NOTICE}</p>
      </section>

      {/* Trade & tariff */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Trade &amp; Tariff Intelligence</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Shipping guidance lives with Freight Brokerage &amp; Logistics in the Services Marketplace. Frassy watches
          shipments and speaks up only when something needs attention.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TRADE_CAPABILITIES.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.plain}</div>
            </div>
          ))}
        </div>
        <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Documentation checklist</h4>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {CUSTOMS_CHECKLIST.map((i) => (
            <li key={i}>☐ {i}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{TRADE_NOTICE}</p>
      </section>

      {/* Compliance layer */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Financial &amp; Compliance Intelligence</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          One compliance layer, not separate systems. Each area lives where it already belongs.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {COMPLIANCE_AREAS.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
              <div className="font-medium">
                <span className="mr-2">{a.icon}</span>
                {a.label}
                {a.status === "structure" && (
                  <span className="ml-2 rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Structure ready
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{a.plain}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">{a.home}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Constitution */}
      <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">The rules Frassy follows</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {[...TAX_CONSTITUTION, ...TRADE_CONSTITUTION].map((r) => (
            <li key={r} className="rounded-xl border border-white/10 bg-black/20 p-3">{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, confidence }: { label: string; value: string; confidence: keyof typeof CONFIDENCE_LABEL }) {
  const conf = CONFIDENCE_LABEL[confidence];
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80" title={conf.plain}>
        {conf.label}
      </div>
    </div>
  );
}

function Lines({
  title,
  lines,
  currency,
  empty,
}: {
  title: string;
  lines: { category: { id: string; label: string; plain: string }; total: number; count: number }[];
  currency: string;
  empty: string;
}) {
  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</h3>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {lines.map((l) => (
            <li key={l.category.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{l.category.label}</span>
                <span>{money(l.total, currency)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {l.category.plain} · {l.count} record{l.count === 1 ? "" : "s"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
