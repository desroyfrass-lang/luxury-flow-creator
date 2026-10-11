// Founder/Admin-only Protected Profit + Surplus Profit breakdown for one product.
// All math comes from profitBreakdown() in pricing-floor.ts (same source as the
// 25% retail guardrail). Inputs here are a private worksheet: nothing is saved,
// no price is written, nothing is published. Never rendered for shoppers.
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RETAIL_MIN_MARGIN_PCT, profitBreakdown, type CostEntry, type CostState } from "@/lib/commerce/pricing-floor";

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

export function ProfitBreakdownPanel(props: { currency: string; offerCost: number | null; variants: Variant[] }) {
  const cur = props.currency || "USD";
  const blank = (state: CostState = "missing") => ({ amount: "", state });
  const [price, setPrice] = useState("");
  const [c, setC] = useState({
    shippingCost: blank(), packagingCost: blank(), otherCost: blank(),
    processingFeePct: blank(), processingFeeFixed: blank(),
    discountPct: blank("not_applicable"), commissionPct: blank("pending_policy"),
  });
  const set = (k: keyof typeof c) => (e: { amount: string; state: CostState }) => setC({ ...c, [k]: e });

  // Each variant is checked on its own supplier cost; offer cost is the fallback.
  const rows = useMemo(() => {
    const vs = props.variants.length ? props.variants : [{ id: "offer", option_label: "Product", sku: null, supplier_cost: props.offerCost, currency: cur }];
    const lp = price.trim() === "" ? null : Number(price);
    return vs.map((v) => ({
      v,
      b: profitBreakdown({
        listPrice: lp != null && Number.isFinite(lp) ? lp : null,
        currency: cur,
        supplierCost: v.supplier_cost != null ? { amount: Number(v.supplier_cost), state: "verified" } : { amount: null, state: "missing" },
        shippingCost: toEntry(c.shippingCost), packagingCost: toEntry(c.packagingCost), otherCost: toEntry(c.otherCost),
        processingFeePct: toEntry(c.processingFeePct), processingFeeFixed: toEntry(c.processingFeeFixed),
        discountPct: toEntry(c.discountPct), commissionPct: toEntry(c.commissionPct),
      }),
    }));
  }, [props.variants, props.offerCost, price, c, cur]);

  const worst = rows.reduce((a, r) => ((r.b.profit ?? -Infinity) < (a.b.profit ?? -Infinity) ? r : a), rows[0]);
  const allApprovable = rows.every((r) => r.b.canApprove);

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
          <span className="text-muted-foreground">Not saved</span>
        </div>
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
                <td>{money(b.charged, cur)}</td>
                <td>{money(b.totalCost, cur)}</td>
                <td>{money(b.profit, cur)}</td>
                <td>{b.marginPct == null ? "—" : `${b.marginPct}%`}</td>
                <td>{money(b.protectedProfit, cur)}</td>
                <td>{money(b.surplus, cur)}</td>
                <td className={b.canApprove ? "text-primary" : "text-destructive"}>{STATUS_TEXT[b.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
