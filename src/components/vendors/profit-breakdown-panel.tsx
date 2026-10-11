// Private Pricing Room only. Shared margin math; estimates never grant approval.
import { useEffect, useId, useState } from "react";
import { ChevronDown, Save, RefreshCw, ShieldCheck, Truck, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { standardQuote, type SavedQuote, QUOTE_TTL_HOURS } from "@/lib/commerce/shipping-zones";
import { profitBreakdown, type BreakdownInput, type CostEntry, type CostState } from "@/lib/commerce/pricing-floor";
import { DEFAULT_INPUTS, withPlanningEstimates, planningBreakdown, type WorksheetInputs } from "@/lib/commerce/pricing-worksheet";
import { pctOf } from "@/lib/commerce/money";
import "./pricing-room.css";

type Variant = { id: string; option_label: string | null; sku: string | null; supplier_cost: number | null; currency: string };
export type VariantQuotes = Record<string, SavedQuote[]>;
type EntryKey = Exclude<keyof WorksheetInputs, "oversized" | "shippingMethod">;
const STATE_LABEL: Record<CostState, string> = { verified: "Verified source", estimated: "Planning estimate", missing: "Missing — blocks approval", not_applicable: "Does not apply", pending_policy: "Policy not confirmed" };
const toEntry = (e: { amount: string; state: CostState }): CostEntry => ({ amount: e.amount.trim() !== "" && Number.isFinite(Number(e.amount)) ? Number(e.amount) : null, state: e.state });
const money = (n: number | null | undefined, cur: string) => n == null ? "Not known yet" : `${cur} ${n.toFixed(2)}`;
const maximum = (xs: Array<number | null>) => xs.length && xs.every((x) => x != null) ? Math.max(...xs.filter((x): x is number => x != null)) : null;

export function ProfitBreakdownPanel(props: {
  currency: string; offerCost: number | null; variants: Variant[];
  knownShipping?: { amount: number; note: string } | null;
  quotes?: VariantQuotes; onFetchQuotes?: () => void; fetchingQuotes?: boolean; quoteError?: string | null;
  now?: Date;
  initial?: { finalPrice: number | null; inputs: WorksheetInputs; updatedAt: string } | null;
  onSave?: (p: { finalPrice: number | null; inputs: WorksheetInputs; summary: { status: string; marginPct: number | null; approvable: boolean } }) => void;
  saving?: boolean; saveError?: string | null;
}) {
  const id = useId();
  const cur = props.currency;
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(timer); }, []);
  const now = props.now ?? clock;
  const [inputs, setInputs] = useState<WorksheetInputs>(() => withPlanningEstimates(props.initial?.inputs ?? DEFAULT_INPUTS));
  const [typedPrice, setTypedPrice] = useState<string | null>(props.initial?.finalPrice != null ? props.initial.finalPrice.toFixed(2) : null);
  const [selected, setSelected] = useState<string | null>(null);
  const vs: Variant[] = props.variants.length ? props.variants : [{ id: "offer", option_label: "Product", sku: null, supplier_cost: props.offerCost, currency: cur }];
  const shippingFor = (v: Variant): { entry: CostEntry; note: string } => {
    if (cur !== "USD" || v.currency !== cur) return { entry: { amount: null, state: "missing" }, note: "US pricing requires matching USD supplier and shipping costs; no exchange rate assumed." };
    const q = standardQuote("US", props.quotes?.[v.id] ?? [], now, inputs.oversized ? "oversized" : null);
    if (q.status === "ok" && q.quote.currency === cur) return { entry: { amount: q.quote.price, state: "estimated" }, note: `CJ ${q.quote.method} · ${q.quote.aging_days ?? "unconfirmed"} days · quoted ${q.quote.fetched_at.slice(0, 16).replace("T", " ")} UTC · expires ${q.quote.expires_at.slice(0, 16).replace("T", " ")} UTC. Cheapest fresh option; standard method awaits Founder confirmation.` };
    if (q.status === "ok") return { entry: { amount: null, state: "missing" }, note: "Shipping quote currency does not match — no conversion assumed." };
    if (q.status === "stale") return { entry: { amount: null, state: "missing" }, note: `Quote expired — ${QUOTE_TTL_HOURS}-hour freshness limit; get a fresh quote.` };
    if (q.status === "quote_required" || q.status === "unsupported") return { entry: { amount: null, state: "missing" }, note: q.reason };
    // Historical product-level reading is explicitly a planning fallback,
    // never represented as a true per-variant quote or financial verification.
    if (props.knownShipping) return { entry: { amount: props.knownShipping.amount, state: "estimated" }, note: `${props.knownShipping.note} — historical product-level planning reading, not a verified per-variant quote.` };
    return { entry: { amount: null, state: "missing" }, note: "No CJ shipping quote yet — get a quote." };
  };
  const inputFor = (v: Variant, price: number | null): BreakdownInput => ({
    listPrice: price, currency: cur,
    supplierCost: v.currency === cur && v.supplier_cost != null ? { amount: Number(v.supplier_cost), state: "verified" } : { amount: null, state: "missing" },
    shippingCost: shippingFor(v).entry, customerShippingCharge: { amount: null, state: "not_applicable" },
    packagingCost: toEntry(inputs.packagingCost), otherCost: toEntry(inputs.otherCost),
    processingFeePct: toEntry(inputs.processingFeePct), processingFeeFixed: toEntry(inputs.processingFeeFixed),
    discountPct: toEntry(inputs.discountPct), commissionPct: toEntry(inputs.commissionPct),
  });
  const base = vs.map((v) => planningBreakdown(inputFor(v, null)));
  const rec = { p40: maximum(base.map((b) => b.preferred)), p30: maximum(base.map((b) => b.acceptable)), p25: maximum(base.map((b) => b.minimum)) };
  const isAuto = typedPrice == null;
  const price = isAuto ? rec.p40?.toFixed(2) ?? "" : typedPrice;
  const lp = price.trim() !== "" && Number.isFinite(Number(price)) && Number(price) > 0 ? Number(price) : null;
  const rows = vs.map((v) => { const i = inputFor(v, lp); return { v, ship: shippingFor(v), b: profitBreakdown(i), p: planningBreakdown(i) }; });
  const worst = rows.reduce((a, r) => (r.p.profit ?? -Infinity) < (a.p.profit ?? -Infinity) ? r : a, rows[0]);
  const sel = rows.find((r) => r.v.id === selected) ?? worst;
  const allApprovable = rows.every((r) => r.b.canApprove);
  const projected = rows.every((r) => r.p.marginPct != null);
  const margin = projected ? worst.p.marginPct : null;
  const profit = projected ? worst.p.profit : null;
  const variance = margin == null ? null : margin - 40;
  const summaries = { status: allApprovable ? "approvable" : worst.b.status, marginPct: worst.b.marginPct, approvable: allApprovable };
  const setEntry = (key: EntryKey) => (e: { amount: string; state: CostState }) => setInputs((prev) => ({ ...prev, [key]: e }));
  const knownMargins = rows.map((r) => r.p.marginPct).filter((x): x is number => x != null);
  const projection = sel.p.result;
  const setTarget = (p: number | null) => { if (p != null) setTypedPrice(p.toFixed(2)); };

  return <section className="pricing-room" data-testid="profit-breakdown" aria-label="Frassy Pricing Room">
    <div className="pricing-summary" data-testid="pricing-summary">
    <header className="pricing-header">
      <h3 className="pricing-title">Frassy Pricing Room</h3>
      <span className="pricing-eyebrow">United States · USD · Private planning</span>
    </header>
    <div className="pricing-dashboard">
      <div>
        <label htmlFor={`${id}-price`} className="pricing-eyebrow block">FINAL SELLING PRICE ({cur})</label>
        <Input id={`${id}-price`} aria-label="Final selling price" inputMode="decimal" value={price} onChange={(e) => setTypedPrice(e.target.value)} className="pricing-final mt-2" placeholder="Costs needed" />
        <p className="mt-2 text-muted-foreground" data-testid="frassy-target-provisional">{isAuto ? "Frassy’s estimated 40% recommendation" : `Frassy’s estimated 40% recommendation: ${money(rec.p40, cur)}`}</p>
      </div>
      <div className="pricing-metrics" aria-live="polite" aria-atomic="true">
        <div><span className="text-muted-foreground">Projected net profit</span><strong className="pricing-metric" data-testid="projected-profit">{money(profit, cur)}</strong><span className="text-muted-foreground">Costliest variant</span></div>
        <div><span className="text-muted-foreground">Projected net margin</span><strong className="pricing-metric" data-testid="projected-margin">{margin == null ? "Unknown" : `${margin.toFixed(2)}%`}</strong><span className="pricing-gold">{variance == null ? "Needs cost information" : `${variance >= 0 ? "+" : ""}${variance.toFixed(2)} pts vs 40%`}</span></div>
      </div>
    </div>
    <div className="pricing-status">
      <span className={margin != null && margin < 25 ? "text-destructive" : "pricing-gold"}><ShieldCheck className="mr-1 inline size-4" />25% minimum · {margin == null ? "unconfirmed" : margin < 25 ? "below minimum — blocked" : "met on projection"}</span>
      <span><ArrowUpRight className="mr-1 inline size-4" />40% target · {margin == null ? "unconfirmed" : margin >= 40 ? "preferred" : margin >= 30 ? "acceptable 30–39.99%" : margin >= 25 ? "Founder review needed" : "blocked"}</span>
      <span><Truck className="mr-1 inline size-4" />US shipping included · planning only</span>
    </div>
    </div>
    <div className="pricing-body">
    <p className={`font-semibold ${allApprovable ? "pricing-gold" : "text-destructive"}`}>{allApprovable ? "Ready for Founder review." : "Approval blocked · estimates are not verified."}</p>
    <p className="mt-1 text-muted-foreground">{projected ? `Costliest variant: ${worst.v.option_label ?? "Product"}.` : "Missing or expired costs — projection incomplete."} {inputs.commissionPct.state === "pending_policy" ? "No-commission scenario; policy unconfirmed." : ""} Tax/duties unconfirmed.</p>
    <div className="pricing-actions">
      <Button type="button" variant="outline" disabled={rec.p40 == null} onClick={() => setTarget(rec.p40)}>Use 40% · {money(rec.p40, cur)}</Button>
      <Button type="button" variant="outline" disabled={rec.p30 == null} onClick={() => setTarget(rec.p30)}>Use 30% · {money(rec.p30, cur)}</Button>
      <Button type="button" variant="outline" disabled={rec.p25 == null} onClick={() => setTarget(rec.p25)}>25% floor · {money(rec.p25, cur)}</Button>
      {!isAuto && <Button type="button" variant="ghost" onClick={() => setTypedPrice(null)}><RefreshCw />Auto recommendation</Button>}
      {props.onSave && <Button type="button" disabled={props.saving} onClick={() => props.onSave?.({ finalPrice: isAuto ? null : lp, inputs, summary: summaries })}><Save />{props.saving ? "Saving…" : "Save worksheet"}</Button>}
    </div>
    {props.onSave && <p className="mb-3 text-muted-foreground">{props.initial?.updatedAt ? `Last saved ${props.initial.updatedAt.slice(0, 16).replace("T", " ")} UTC` : "Not saved yet"} · Private worksheet only; shop prices unchanged.</p>}
    {props.saveError && <p role="alert" className="text-destructive">{props.saveError}</p>}

    <Disclosure title="Planning assumptions & fees" summary="Editable estimates · not actual charges">
      <p className="mb-2 text-muted-foreground">Illustrative, editable: payment 3% + USD 0.30; packaging USD 0.50; other USD 0.50. Not verified Shopify or supplier charges. Commission applies only when confirmed.</p>
      <CostRow label="Payment processing (%)" entry={inputs.processingFeePct} onChange={setEntry("processingFeePct")} />
      <CostRow label={`Payment fixed fee (${cur})`} entry={inputs.processingFeeFixed} onChange={setEntry("processingFeeFixed")} />
      <CostRow label={`Packaging (${cur})`} entry={inputs.packagingCost} onChange={setEntry("packagingCost")} />
      <CostRow label={`Other expenses (${cur})`} entry={inputs.otherCost} onChange={setEntry("otherCost")} />
      <CostRow label="Discount (%)" entry={inputs.discountPct} onChange={setEntry("discountPct")} />
      <CostRow label="Commission, only if applicable (%)" entry={inputs.commissionPct} onChange={setEntry("commissionPct")} />
    </Disclosure>
    <Disclosure title="Variants & profit breakdown" summary={`${rows.length} variants · ${knownMargins.length ? `${Math.min(...knownMargins).toFixed(2)}–${Math.max(...knownMargins).toFixed(2)}% projected margin` : "costs incomplete"}`}>
      <div className="mb-4 flex flex-wrap gap-2" aria-label="Choose variant">{rows.map(({ v, p }) => <Button type="button" variant="outline" className="pricing-variant" key={v.id} aria-pressed={sel.v.id === v.id} onClick={() => setSelected(v.id)}>{v.option_label ?? v.sku ?? "Product"} · {p.marginPct == null ? "unconfirmed" : `${p.marginPct.toFixed(2)}%`}</Button>)}</div>
      <div data-testid="variant-detail" aria-live="polite">
        <h4 className="mb-2 text-lg font-bold">{sel.v.option_label ?? "Product"} — full breakdown</h4>
        <dl className="pricing-breakdown">
          <dt>Customer pays after discount</dt><dd>{money(projection.charged, cur)}</dd>
          {projection.lines.map((l) => <div className="contents" key={l.key}><dt>{l.key === "shippingCost" ? "Standard shipping (included)" : l.key === "commissionPct" && inputs.commissionPct.state === "pending_policy" ? "Commission (conditional scenario)" : l.label}</dt><dd>{l.state === "not_applicable" ? "Does not apply" : l.amount == null ? STATE_LABEL[l.state] : `${money(l.amount, cur)}${l.state === "estimated" ? " · estimate" : ""}`}</dd></div>)}
          <dt>Total planned cost</dt><dd>{projected ? money(projection.totalCost, cur) : "Incomplete"}</dd>
          <dt>Projected net profit</dt><dd className="font-bold">{money(sel.p.profit, cur)}</dd>
          <dt>Protected profit (25%)</dt><dd>{money(projection.charged != null ? pctOf(projection.charged, 25) : null, cur)}</dd>
          <dt>Surplus above 25%</dt><dd>{sel.p.profit != null ? money(projection.surplus, cur) : "Unconfirmed"}</dd>
        </dl>
        <p className="mt-3 text-muted-foreground">Supplier {money(sel.v.supplier_cost, cur)} · Shipping {money(sel.ship.entry.amount, cur)}</p>
        <p className="text-muted-foreground">Shipping source: {sel.ship.note}</p>
      </div>
    </Disclosure>
    <Disclosure title="Shipping & destination" summary="US only · not live at checkout">
      <div data-testid="shipping-included"><h4 className="font-bold">Standard shipping included in the price (US)</h4><p className="text-muted-foreground">Planning: delivery comes from the price, not charged shipping again. Checkout unchanged; offer not live. Other countries and multi-item delivery need confirmation.</p>
      <label className="my-3 flex min-h-11 items-center gap-3"><input type="checkbox" className="size-5" checked={inputs.oversized} onChange={(e) => setInputs({ ...inputs, oversized: e.target.checked })} />Oversized or heavy — needs an individual quote</label>
      {props.onFetchQuotes && <Button type="button" variant="outline" disabled={props.fetchingQuotes} onClick={props.onFetchQuotes}><RefreshCw />{props.fetchingQuotes ? "Asking CJ…" : "Get fresh CJ US shipping quotes (read-only)"}</Button>}
      {props.quoteError && <p role="alert" className="mt-2 text-destructive">{props.quoteError}</p>}
      <p className="mt-2 text-muted-foreground">{sel.ship.note}</p></div>
    </Disclosure>
    <Disclosure title="Approval checks & calculation" summary={allApprovable ? "Ready for Founder review" : "Verification required"}>
      <p className="text-muted-foreground">Listed price = (supplier + included shipping + packaging + other expenses + fixed fee) ÷ (1 − target margin − processing % − applicable commission %) ÷ (1 − discount %). Rounded up to whole cents for the costliest variant.</p>
      <p className="mt-2 text-muted-foreground">In plain English: the price must leave the target profit after the sale’s costs, like setting aside your share before spending the rest. Estimates are planning only, never permission to publish.</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">{[...new Set(rows.flatMap((r) => r.b.warnings))].map((w) => <li key={w}>{w}</li>)}</ul>
      <p className="mt-3 font-semibold">Tax/duties and standard delivery method unconfirmed. Shop prices and checkout unchanged.</p>
    </Disclosure>
    </div>
  </section>;
}

function Disclosure({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  return <details className="pricing-disclosure"><summary><span className="pricing-disclosure-label"><strong>{title}</strong><span className="text-muted-foreground">{summary}</span></span><ChevronDown className="pricing-chevron size-5" /></summary><div className="pricing-disclosure-content">{children}</div></details>;
}
function CostRow({ label, entry, onChange }: { label: string; entry: { amount: string; state: CostState }; onChange: (e: { amount: string; state: CostState }) => void }) {
  const needsAmount = entry.state === "verified" || entry.state === "estimated";
  return <div className="pricing-cost-row"><span className="font-medium">{label}</span>
    {needsAmount ? <Input inputMode="decimal" value={entry.amount} aria-label={label} onChange={(e) => onChange({ amount: e.target.value, state: "estimated" })} /> : <span className="text-muted-foreground">{entry.state === "not_applicable" ? "Does not apply" : "Unconfirmed"}</span>}
    <select value={entry.state} aria-label={`${label} status`} onChange={(e) => { const state = e.target.value as CostState; onChange({ amount: state === "estimated" && entry.amount === "" ? "0" : entry.amount, state }); }}>
      {(Object.keys(STATE_LABEL) as CostState[]).map((s) => <option key={s} value={s} disabled={s === "verified"}>{STATE_LABEL[s]}</option>)}
    </select>
  </div>;
}
