// Founder/Admin-only Protected Profit + Surplus Profit breakdown for one product.
// All math comes from profitBreakdown() in pricing-floor.ts (same source as the
// 25% retail guardrail). Inputs here are a private worksheet: nothing is saved,
// no price is written, nothing is published. Never rendered for shoppers.
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RETAIL_MIN_MARGIN_PCT, RETAIL_TARGET_ACCEPTABLE_MIN_PCT, RETAIL_TARGET_PREFERRED_PCT, profitBreakdown, type CostEntry, type CostState } from "@/lib/commerce/pricing-floor";

type Variant = { id: string; option_label: string | null; sku: string | null; supplier_cost: number | null; currency: string };

const STATES: Array<{ v: CostState; l: string }> = [
  { v: "missing", l: "Not provided" },
  { v: "estimated", l: "Estimate" },
  { v: "verified", l: "Verified" },
  { v: "not_applicable", l: "Does not apply" },
  { v: "pending_policy", l: "Waiting on Founder policy" },
];

const STATUS_TEXT = {
  protected_verified: "25% protected profit verified",
  protected_estimated: "Meets 25% on estimates only — cannot approve yet",
  below_minimum: `Below the ${RETAIL_MIN_MARGIN_PCT}% minimum — blocked`,
  incomplete: "Costs incomplete — 25% cannot be verified, approval blocked",
} as const;

const BAND_TEXT = { preferred: "preferred target", acceptable: "acceptable band", founder_review: "needs Founder review", blocked: "blocked" } as const;

function Row(props: { label: string; entry: { amount: string; state: CostState }; onChange: (e: { amount: string; state: CostState }) => void; suffix?: string }) {
  const { entry } = props;
  return (
    <div className="grid grid-cols-[1fr_6rem_9rem] items-center gap-2 text-xs">
      <span>{props.label}{props.suffix ? ` (${props.suffix})` : ""}</span>
      <Input className="h-8" inputMode="decimal" value={entry.amount} disabled={entry.state === "not_applicable" || entry.state === "pending_policy"}
        onChange={(e) => props.onChange({ ...entry, amount: e.target.value })} aria-label={props.label} />
      <select className="h-8 rounded-md border border-input bg-background px-2" value={entry.state} aria-label={`${props.label} status`}
        onChange={(e) => props.onChange({ ...entry, state: e.target.value as CostState })}>
        {STATES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select>
    </div>
  );
}

const toEntry = (e: { amount: string; state: CostState }): CostEntry => {
  const n = e.amount.trim() === "" ? null : Number(e.amount);
  return { amount: n != null && Number.isFinite(n) ? n : null, state: e.state };
};
const money = (n: number | null, cur: string) => (n == null ? "—" : `${cur} ${n.toFixed(2)}`);

export function ProfitBreakdownPanel(props: { currency: string; offerCost: number | null; variants: Variant[]; knownShipping?: { amount: number; note: string } | null }) {
  const cur = props.currency || "USD";
  const blank = (state: CostState = "missing") => ({ amount: "", state });
  const [typedPrice, setTypedPrice] = useState<string | null>(null);
  const [c, setC] = useState({
    shippingCost: props.knownShipping ? { amount: String(props.knownShipping.amount), state: "estimated" as CostState } : blank(), packagingCost: blank(), otherCost: blank(),
    processingFeePct: blank(), processingFeeFixed: blank(),
    discountPct: blank("not_applicable"), commissionPct: blank("pending_policy"),
  });
  const set = (k: keyof typeof c) => (e: { amount: string; state: CostState }) => setC({ ...c, [k]: e });

  // Each variant is checked on its own supplier cost; offer cost is the fallback.
  const vs = useMemo(() => (props.variants.length ? props.variants : [{ id: "offer", option_label: "Product", sku: null, supplier_cost: props.offerCost, currency: cur }]), [props.variants, props.offerCost, cur]);
  const build = (v: Variant, lp: number | null) => profitBreakdown({
        listPrice: lp,
        currency: cur,
        supplierCost: v.supplier_cost != null ? { amount: Number(v.supplier_cost), state: "verified" } : { amount: null, state: "missing" },
        shippingCost: toEntry(c.shippingCost), packagingCost: toEntry(c.packagingCost), otherCost: toEntry(c.otherCost),
        processingFeePct: toEntry(c.processingFeePct), processingFeeFixed: toEntry(c.processingFeeFixed),
        discountPct: toEntry(c.discountPct), commissionPct: toEntry(c.commissionPct),
      });
  // Provisional suggestion: highest known-costs floor across variants (lower bound, never "safe").
  const autoPrice = useMemo(() => {
    const f = vs.map((v) => build(v, null).provisional.floorOnKnownCosts).filter((x): x is number => x != null);
    return f.length ? Math.max(...f) : null;
  }, [vs, c, cur]);
  const isAuto = typedPrice == null;
  const price = isAuto ? (autoPrice != null ? autoPrice.toFixed(2) : "") : typedPrice;
  const setPrice = (p: string) => setTypedPrice(p);
  const rows = useMemo(() => {
    const lp = price.trim() === "" ? null : Number(price);
    return vs.map((v) => ({ v, b: build(v, lp != null && Number.isFinite(lp) ? lp : null) }));
  }, [vs, price, c, cur]);

  const worst = rows.reduce((a, r) => ((r.b.profit ?? -Infinity) < (a.b.profit ?? -Infinity) ? r : a), rows[0]);
  const allApprovable = rows.every((r) => r.b.canApprove);
  const safeFull = rows.every((r) => r.b.floorPrice != null) ? Math.max(...rows.map((r) => r.b.floorPrice!)) : null;
  const safeKnown = rows.some((r) => r.b.provisional.floorOnKnownCosts != null) ? Math.max(...rows.map((r) => r.b.provisional.floorOnKnownCosts ?? 0)) : null;
  const maxOf = (xs: Array<number | null>) => (xs.every((x) => x != null) && xs.length ? Math.max(...(xs as number[])) : null);
  const target40 = maxOf(rows.map((r) => r.b.targets?.preferred ?? null));
  const target30 = maxOf(rows.map((r) => r.b.targets?.acceptableMin ?? null));
  const prov40 = maxOf(rows.map((r) => r.b.provisional.targetPreferredOnKnown));
  const prov30 = maxOf(rows.map((r) => r.b.provisional.targetAcceptableOnKnown));
  const missing = [...new Set(rows.flatMap((r) => r.b.provisional.missing))];

  return (
    <details className="mt-3 rounded-lg border border-primary/30 bg-background/60 p-3" data-testid="profit-breakdown">
      <summary className="cursor-pointer text-sm font-medium">Founder only · Protected Profit &amp; Surplus</summary>
      <p className="mt-2 text-xs text-muted-foreground">
        Private worksheet. Nothing here is saved, priced, or shown to shoppers. Protected profit is {RETAIL_MIN_MARGIN_PCT}% of the price the customer actually pays, after every cost. Commission counts once, and only if it applies to this sale.
      </p>
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-[1fr_6rem_9rem] items-center gap-2 text-xs">
          <span>Proposed selling price ({cur})</span>
          <Input className="h-8" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Proposed selling price" />
          <span className="text-muted-foreground">Not saved · applies to every variant</span>
        </div>
        {isAuto && autoPrice != null && (
          <div className="text-[11px] text-muted-foreground" data-testid="provisional-price-note">
            Frassy's provisional starting price — lower bound only, not safe or approved: known costs ÷ 0.75 (25% kept), rounded up to the cent. Processing, packaging, commission and other unknown costs will raise it.
          </div>
        )}
        {!isAuto && <button type="button" className="text-left text-[11px] underline" onClick={() => setTypedPrice(null)}>Back to Frassy's provisional price</button>}
        {props.knownShipping && <div className="text-[11px] text-muted-foreground">Shipping prefilled as an estimate: {props.knownShipping.note}. Verify before approval.</div>}
        <Row label="Shipping paid by FRASS" suffix={cur} entry={c.shippingCost} onChange={set("shippingCost")} />
        <Row label="Packaging" suffix={cur} entry={c.packagingCost} onChange={set("packagingCost")} />
        <Row label="Processing" suffix="%" entry={c.processingFeePct} onChange={set("processingFeePct")} />
        <Row label="Processing fixed fee" suffix={cur} entry={c.processingFeeFixed} onChange={set("processingFeeFixed")} />
        <Row label="Discount" suffix="%" entry={c.discountPct} onChange={set("discountPct")} />
        <Row label="Commission" suffix="%" entry={c.commissionPct} onChange={set("commissionPct")} />
        <Row label="Other costs" suffix={cur} entry={c.otherCost} onChange={set("otherCost")} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-1">Variant</th><th>Supplier</th><th>Customer pays</th><th>Total cost</th><th>Profit</th><th>Margin</th><th>Protected (25%)</th><th>Surplus</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map(({ v, b }) => (
              <tr key={v.id} className="border-t border-border">
                <td className="py-1">{v.option_label ?? v.sku ?? "Variant"}</td>
                <td>{money(v.supplier_cost != null ? Number(v.supplier_cost) : null, cur)}</td>
                <td>{money(b.charged ?? b.provisional.charged, cur)}</td>
                <td>{b.totalCost != null ? money(b.totalCost, cur) : b.provisional.knownCost != null ? `≥ ${money(b.provisional.knownCost, cur)}` : "—"}</td>
                <td>{b.profit != null ? money(b.profit, cur) : b.provisional.profitBeforeMissing != null ? `≤ ${money(b.provisional.profitBeforeMissing, cur)}` : "—"}</td>
                <td>{b.marginPct == null ? "—" : `${b.marginPct}%`}</td>
                <td>{money(b.protectedProfit ?? (b.provisional.charged != null ? Math.round(b.provisional.charged * RETAIL_MIN_MARGIN_PCT) / 100 : null), cur)}</td>
                <td>{money(b.surplus, cur)}</td>
                <td className={b.canApprove ? "text-primary" : "text-destructive"}>{STATUS_TEXT[b.status]}{b.band && b.status !== "incomplete" ? ` · ${BAND_TEXT[b.band]}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-md border border-border p-2 text-xs" data-testid="frassy-recommendation">
        <div className="font-medium">Frassy's price check</div>
        <div>Minimum safe price (all variants): {safeFull != null ? money(safeFull, cur) : safeKnown != null ? `at least ${money(safeKnown, cur)} — rises once missing costs are filled in` : "needs supplier cost"}</div>
        {target40 != null && target30 != null ? (
          <div data-testid="frassy-target-verified">
            Recommended starting price ({RETAIL_TARGET_PREFERRED_PCT}% target): {money(target40, cur)} · acceptable band ({RETAIL_TARGET_ACCEPTABLE_MIN_PCT}–39.99%) from {money(target30, cur)}. All costs verified. {RETAIL_TARGET_PREFERRED_PCT}% is a target, not a floor.
            <button type="button" className="ml-2 underline" onClick={() => setPrice(target40.toFixed(2))}>Use {RETAIL_TARGET_PREFERRED_PCT}% target</button>
          </div>
        ) : (
          <div data-testid="frassy-target-provisional">
            Recommended price: not available until every cost is verified.
            {prov40 != null && prov30 != null && <> Lower-bound estimate on known costs only — NOT safe or approved: {RETAIL_TARGET_PREFERRED_PCT}% target at least {money(prov40, cur)}, {RETAIL_TARGET_ACCEPTABLE_MIN_PCT}% at least {money(prov30, cur)}.</>}
          </div>
        )}
        <div className="text-muted-foreground">Bands: {RETAIL_TARGET_PREFERRED_PCT}%+ preferred · {RETAIL_TARGET_ACCEPTABLE_MIN_PCT}–39.99% acceptable · {RETAIL_MIN_MARGIN_PCT}–29.99% Founder review · below {RETAIL_MIN_MARGIN_PCT}% blocked.</div>
        {missing.length > 0 && <div className="text-muted-foreground">Still missing: {missing.join(", ")}.</div>}
        {safeFull == null && safeKnown != null && (
          <button type="button" className="mt-1 underline" onClick={() => setPrice(String(safeKnown))}>Try the known-costs minimum ({money(safeKnown, cur)})</button>
        )}
        {safeFull != null && <button type="button" className="mt-1 underline" onClick={() => setPrice(String(safeFull))}>Try the minimum safe price</button>}
      </div>

      {worst && (
        <div className="mt-3 text-xs">
          <div className="font-medium">{allApprovable ? "Every variant keeps the protected 25%." : "Price approval and publication are blocked for this product."}</div>
          {worst.b.floorPrice != null && <div className="text-muted-foreground">Lowest safe listed price for the costliest variant: {money(worst.b.floorPrice, cur)}</div>}
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {[...new Set(rows.flatMap((r) => r.b.warnings))].map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}
    </details>
  );
}
