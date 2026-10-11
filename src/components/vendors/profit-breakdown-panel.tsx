// Frassy Pricing Room (Phase 1) — Founder/Admin only, never shown to shoppers.
// All money math comes from profitBreakdown()/priceForMargin() in pricing-floor.ts
// (the same source as the 25% retail guardrail). Standard US shipping is INCLUDED
// in the price as a FRASS cost; checkout is untouched. Nothing here writes a
// product price, Shopify or CJ — Save stores only this private worksheet.
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { standardQuote, type SavedQuote, QUOTE_TTL_HOURS } from "@/lib/commerce/shipping-zones";
import {
  RETAIL_MIN_MARGIN_PCT, RETAIL_TARGET_ACCEPTABLE_MIN_PCT, RETAIL_TARGET_PREFERRED_PCT,
  profitBreakdown, type Breakdown, type CostEntry, type CostState,
} from "@/lib/commerce/pricing-floor";
import { DEFAULT_INPUTS, type WorksheetInputs } from "@/lib/commerce/pricing-worksheet";

type Variant = { id: string; option_label: string | null; sku: string | null; supplier_cost: number | null; currency: string };
export type VariantQuotes = Record<string, SavedQuote[]>;
type EntryKey = Exclude<keyof WorksheetInputs, "oversized">;

const STATE_LABEL: Record<CostState, string> = {
  verified: "Verified",
  estimated: "Estimate",
  missing: "Not decided — blocks approval",
  not_applicable: "Does not apply",
  pending_policy: "Waiting on Founder policy — blocks approval",
};
const STATUS_TEXT = {
  protected_verified: "Verified — keeps the protected 25%",
  protected_estimated: "Meets 25% on estimates only — not approved",
  below_minimum: `Below the ${RETAIL_MIN_MARGIN_PCT}% minimum — blocked`,
  incomplete: "Costs not all known — approval blocked",
} as const;
const BAND_TEXT = { preferred: "40%+ preferred", acceptable: "30–39.99% acceptable", founder_review: "25–29.99% needs Founder review", blocked: "Below 25% — blocked" } as const;

const toEntry = (e: { amount: string; state: CostState }): CostEntry => {
  const n = e.amount.trim() === "" ? null : Number(e.amount);
  return { amount: n != null && Number.isFinite(n) ? n : null, state: e.state };
};
const money = (n: number | null | undefined, cur: string) => (n == null ? "Not known yet" : `${cur} ${n.toFixed(2)}`);
const maxOf = (xs: Array<number | null>) => (xs.length && xs.every((x) => x != null) ? Math.max(...(xs as number[])) : null);

export function ProfitBreakdownPanel(props: {
  currency: string; offerCost: number | null; variants: Variant[];
  knownShipping?: { amount: number; note: string } | null;
  quotes?: VariantQuotes; onFetchQuotes?: () => void; fetchingQuotes?: boolean; quoteError?: string | null;
  now?: Date;
  initial?: { finalPrice: number | null; inputs: WorksheetInputs; updatedAt: string } | null;
  onSave?: (p: { finalPrice: number | null; inputs: WorksheetInputs; summary: { status: string; marginPct: number | null; approvable: boolean } }) => void;
  saving?: boolean; saveError?: string | null;
}) {
  const cur = props.currency || "USD";
  const now = props.now ?? new Date();
  const [inputs, setInputs] = useState<WorksheetInputs>(props.initial?.inputs ?? DEFAULT_INPUTS);
  const [typedPrice, setTypedPrice] = useState<string | null>(props.initial?.finalPrice != null ? props.initial.finalPrice.toFixed(2) : null);
  const [selected, setSelected] = useState<string | null>(null);
  const setEntry = (k: EntryKey) => (e: { amount: string; state: CostState }) => setInputs({ ...inputs, [k]: e });

  const vs: Variant[] = useMemo(
    () => (props.variants.length ? props.variants : [{ id: "offer", option_label: "Product", sku: null, supplier_cost: props.offerCost, currency: cur }]),
    [props.variants, props.offerCost, cur],
  );

  // Each variant uses ITS OWN supplier cost and ITS OWN shipping quote.
  const shippingFor = (v: Variant): { entry: CostEntry; note: string } => {
    const q = standardQuote("US", props.quotes?.[v.id] ?? [], now, inputs.oversized ? "oversized" : null);
    if (q.status === "ok") return { entry: { amount: q.quote.price, state: "estimated" }, note: `CJ ${q.quote.method}, ${q.quote.aging_days ?? "?"} days, quoted ${q.quote.fetched_at.slice(0, 16).replace("T", " ")} UTC — cheapest option; standard method not chosen yet` };
    if (q.status === "stale") return { entry: { amount: null, state: "missing" }, note: `Quote expired (older than ${QUOTE_TTL_HOURS} hours) — get a fresh quote` };
    if (q.status === "quote_required" || q.status === "unsupported") return { entry: { amount: null, state: "missing" }, note: q.reason };
    if (props.knownShipping) return { entry: { amount: props.knownShipping.amount, state: "estimated" }, note: `${props.knownShipping.note} — earlier reading, not a saved quote` };
    return { entry: { amount: null, state: "missing" }, note: "No CJ shipping quote yet — get a quote" };
  };
  const build = (v: Variant, lp: number | null): Breakdown => profitBreakdown({
    listPrice: lp, currency: cur,
    supplierCost: v.supplier_cost != null ? { amount: Number(v.supplier_cost), state: "verified" } : { amount: null, state: "missing" },
    shippingCost: shippingFor(v).entry, customerShippingCharge: { amount: null, state: "not_applicable" },
    packagingCost: toEntry(inputs.packagingCost), otherCost: toEntry(inputs.otherCost),
    processingFeePct: toEntry(inputs.processingFeePct), processingFeeFixed: toEntry(inputs.processingFeeFixed),
    discountPct: toEntry(inputs.discountPct), commissionPct: toEntry(inputs.commissionPct),
  });

  // Frassy's recommendation: 40% target across ALL variants (costliest variant decides).
  const rec = useMemo(() => {
    const base = vs.map((v) => build(v, null));
    const v40 = maxOf(base.map((b) => b.targets?.preferred ?? null));
    const v30 = maxOf(base.map((b) => b.targets?.acceptableMin ?? null));
    const v25 = maxOf(base.map((b) => b.floorPrice));
    const p40 = maxOf(base.map((b) => b.provisional.targetPreferredOnKnown));
    const p30 = maxOf(base.map((b) => b.provisional.targetAcceptableOnKnown));
    const p25 = maxOf(base.map((b) => b.provisional.floorOnKnownCosts));
    const verified = v40 != null;
    return { verified, p40: verified ? v40 : p40, p30: verified ? v30 : p30, p25: verified ? v25 : p25 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vs, inputs, props.quotes, props.knownShipping]);

  const isAuto = typedPrice == null;
  const price = isAuto ? (rec.p40 != null ? rec.p40.toFixed(2) : "") : typedPrice;
  const lp = price.trim() === "" ? null : Number(price);
  const rows = useMemo(
    () => vs.map((v) => ({ v, ship: shippingFor(v), b: build(v, lp != null && Number.isFinite(lp) && lp > 0 ? lp : null) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vs, lp, inputs, props.quotes, props.knownShipping],
  );
  const worst = rows.reduce((a, r) => ((r.b.profit ?? r.b.provisional.profitBeforeMissing ?? Infinity) < (a.b.profit ?? a.b.provisional.profitBeforeMissing ?? Infinity) ? r : a), rows[0]);
  const allApprovable = rows.every((r) => r.b.canApprove);
  const sel = rows.find((r) => r.v.id === selected) ?? worst;
  const missing = [...new Set(rows.flatMap((r) => r.b.provisional.missing))];
  const summary = { status: allApprovable ? "approvable" : worst.b.status, marginPct: worst.b.marginPct, approvable: allApprovable };

  return (
    <details className="mt-3 rounded-xl border border-primary/40 bg-background p-4" data-testid="profit-breakdown" open>
      <summary className="cursor-pointer text-lg font-semibold">Frassy Pricing Room · US · Standard shipping included</summary>
      <p className="mt-2 text-base text-muted-foreground">
        Private to you. Nothing here changes the shop price or is shown to shoppers. Standard US delivery is built into the price, so customers are not charged shipping again.
      </p>

      {/* FINAL SELLING PRICE */}
      <section className="mt-4 rounded-xl border-2 border-primary p-4">
        <label htmlFor="final-price" className="block text-base font-semibold uppercase tracking-wide">Final selling price ({cur})</label>
        <Input id="final-price" aria-label="Final selling price" inputMode="decimal" value={price}
          onChange={(e) => setTypedPrice(e.target.value)}
          className="mt-2 h-16 max-w-xs text-4xl font-bold" />
        <p className="mt-2 text-base" data-testid={rec.verified ? "frassy-target-verified" : "frassy-target-provisional"}>
          {isAuto ? "Prefilled with " : "Frassy recommends "}
          <strong>{rec.p40 != null ? money(rec.p40, cur) : "a price once supplier cost is known"}</strong> for a {RETAIL_TARGET_PREFERRED_PCT}% net margin.{" "}
          {rec.verified
            ? "All costs verified."
            : "Provisional — a lower bound, not safe or approved: some costs are still unknown and will raise it."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rec.p40 != null && <Button type="button" variant="outline" onClick={() => setTypedPrice(rec.p40!.toFixed(2))}>Use {RETAIL_TARGET_PREFERRED_PCT}% ({money(rec.p40, cur)})</Button>}
          {rec.p30 != null && <Button type="button" variant="outline" onClick={() => setTypedPrice(rec.p30!.toFixed(2))}>Use {RETAIL_TARGET_ACCEPTABLE_MIN_PCT}% ({money(rec.p30, cur)})</Button>}
          {rec.p25 != null && <Button type="button" variant="outline" onClick={() => setTypedPrice(rec.p25!.toFixed(2))}>25% minimum ({money(rec.p25, cur)})</Button>}
          {!isAuto && <Button type="button" variant="ghost" onClick={() => setTypedPrice(null)}>Back to Frassy's recommendation</Button>}
        </div>
        <p className={`mt-3 text-lg font-semibold ${allApprovable ? "text-primary" : "text-destructive"}`}>
          {allApprovable ? "Every variant keeps the protected 25% — ready for your approval." : "Financial approval blocked for this product."}
        </p>
        {missing.length > 0 && <p className="text-base text-muted-foreground">Still unknown: {missing.join(", ")}.</p>}
      </section>

      {/* VARIANTS */}
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Variants — tap one to see its own costs</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ v, ship, b }) => (
            <button key={v.id} type="button" onClick={() => setSelected(v.id)} aria-pressed={sel.v.id === v.id}
              className={`rounded-lg border p-3 text-left text-base ${sel.v.id === v.id ? "border-primary bg-primary/10" : "border-border"}`}>
              <div className="font-semibold">{v.option_label ?? v.sku ?? "Variant"}</div>
              <div>Supplier {money(v.supplier_cost != null ? Number(v.supplier_cost) : null, cur)} · Shipping {money(ship.entry.amount, cur)}</div>
              <div>Profit {b.profit != null ? money(b.profit, cur) : b.provisional.profitBeforeMissing != null ? `at most ${money(b.provisional.profitBeforeMissing, cur)}` : "Not known yet"}
                {" · "}Margin {b.marginPct != null ? `${b.marginPct}%` : "not known yet"}</div>
              <div className={b.canApprove ? "text-primary" : "text-destructive"}>{b.band && b.status !== "incomplete" ? BAND_TEXT[b.band] : STATUS_TEXT[b.status]}</div>
            </button>
          ))}
        </div>
      </section>

      {/* SELECTED VARIANT BREAKDOWN */}
      <section className="mt-4 rounded-lg border border-border p-3 text-base" data-testid="variant-detail">
        <h3 className="text-lg font-semibold">{sel.v.option_label ?? "Variant"} — full breakdown</h3>
        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          <dt>Customer pays</dt><dd className="font-semibold">{money(sel.b.charged ?? sel.b.provisional.charged, cur)}</dd>
          {sel.b.lines.map((l) => (
            <div key={l.key} className="contents">
              <dt>{l.key === "shippingCost" ? "Standard shipping (included)" : l.label}</dt>
              <dd>{l.state === "not_applicable" ? "Does not apply" : l.amount != null ? `${money(l.amount, cur)}${l.state === "estimated" ? " (estimate)" : ""}` : STATE_LABEL[l.state]}</dd>
            </div>
          ))}
          <dt>Total cost</dt><dd>{sel.b.totalCost != null ? money(sel.b.totalCost, cur) : sel.b.provisional.knownCost != null ? `at least ${money(sel.b.provisional.knownCost, cur)}` : "Not known yet"}</dd>
          <dt>Profit</dt><dd className="font-semibold">{sel.b.profit != null ? money(sel.b.profit, cur) : sel.b.provisional.profitBeforeMissing != null ? `at most ${money(sel.b.provisional.profitBeforeMissing, cur)}` : "Not known yet"}</dd>
          <dt>Protected profit (25%)</dt><dd>{money(sel.b.protectedProfit ?? (sel.b.provisional.charged != null ? Math.round(sel.b.provisional.charged * RETAIL_MIN_MARGIN_PCT) / 100 : null), cur)}</dd>
          <dt>Surplus above 25%</dt><dd>{sel.b.surplus != null ? money(sel.b.surplus, cur) : "Not known yet"}</dd>
        </dl>
        <p className="mt-2 text-muted-foreground">Shipping source: {sel.ship.note}</p>
        {sel.b.warnings.length > 0 && <ul className="mt-2 list-disc pl-5 text-muted-foreground">{sel.b.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
      </section>

      {/* SHIPPING */}
      <section className="mt-4 rounded-lg border border-border p-3 text-base" data-testid="shipping-included">
        <h3 className="text-lg font-semibold">Standard shipping included in the price (US)</h3>
        <p className="text-muted-foreground">FRASS pays standard delivery out of the price. Shopify checkout settings are not changed in this phase.</p>
        <label className="mt-2 flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={inputs.oversized} onChange={(e) => setInputs({ ...inputs, oversized: e.target.checked })} /> Oversized or heavy — needs an individual quote</label>
        {props.onFetchQuotes && (
          <Button type="button" variant="outline" className="mt-2" disabled={props.fetchingQuotes} onClick={props.onFetchQuotes}>
            {props.fetchingQuotes ? "Asking CJ…" : "Get fresh CJ US shipping quotes (read-only)"}
          </Button>
        )}
        {props.quoteError && <p className="mt-1 text-destructive">{props.quoteError}</p>}
      </section>

      {/* SHARED COSTS */}
      <section className="mt-4 rounded-lg border border-border p-3 text-base">
        <h3 className="text-lg font-semibold">Costs that apply to every variant</h3>
        <p className="text-muted-foreground">Nothing is assumed. Anything not decided stays marked and blocks approval.</p>
        <div className="mt-2 space-y-2">
          <CostRow label="Card / payment fee (%)" entry={inputs.processingFeePct} onChange={setEntry("processingFeePct")} />
          <CostRow label={`Card / payment fixed fee (${cur})`} entry={inputs.processingFeeFixed} onChange={setEntry("processingFeeFixed")} />
          <CostRow label={`Packaging (${cur})`} entry={inputs.packagingCost} onChange={setEntry("packagingCost")} />
          <CostRow label="Commission, only if it applies (%)" entry={inputs.commissionPct} onChange={setEntry("commissionPct")} />
          <CostRow label="Discount (%)" entry={inputs.discountPct} onChange={setEntry("discountPct")} />
          <CostRow label={`Other costs (${cur})`} entry={inputs.otherCost} onChange={setEntry("otherCost")} />
        </div>
      </section>

      {props.onSave && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" size="lg" disabled={props.saving}
            onClick={() => props.onSave!({ finalPrice: isAuto ? null : (lp != null && Number.isFinite(lp) && lp > 0 ? lp : null), inputs, summary })}>
            {props.saving ? "Saving…" : "Save this worksheet"}
          </Button>
          <span className="text-base text-muted-foreground">
            {props.initial?.updatedAt ? `Last saved ${props.initial.updatedAt.slice(0, 16).replace("T", " ")} UTC` : "Not saved yet"} · saves only to this private room
          </span>
          {props.saveError && <span className="text-base text-destructive">{props.saveError}</span>}
        </div>
      )}
    </details>
  );
}

function CostRow(props: { label: string; entry: { amount: string; state: CostState }; onChange: (e: { amount: string; state: CostState }) => void }) {
  const { entry } = props;
  const needsAmount = entry.state === "verified" || entry.state === "estimated";
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[1fr_8rem_16rem]">
      <span className="font-medium">{props.label}</span>
      {needsAmount ? (
        <Input className="h-11 text-lg" inputMode="decimal" value={entry.amount} placeholder="Enter amount" aria-label={props.label}
          onChange={(e) => props.onChange({ ...entry, amount: e.target.value })} />
      ) : (
        <span className="text-muted-foreground">{entry.state === "not_applicable" ? "—" : "No amount"}</span>
      )}
      <select className="h-11 rounded-md border border-input bg-background px-2 text-base" value={entry.state} aria-label={`${props.label} status`}
        onChange={(e) => props.onChange({ ...entry, state: e.target.value as CostState })}>
        {(Object.keys(STATE_LABEL) as CostState[]).map((s) => <option key={s} value={s}>{STATE_LABEL[s]}</option>)}
      </select>
    </div>
  );
}
