// Loads the destination's saved CJ quotes, saved worksheet and the server's
// authoritative readiness check (Founder/admin only), and wires read-only quote
// refresh, revision-checked save and Founder-only approval. Each destination
// has its own worksheet; nothing is copied between countries.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCjShippingQuotes, listCjShippingQuotes } from "@/lib/vendors/shipping-quotes.functions";
import { getPricingWorksheet, savePricingWorksheet, evaluatePricingDestination, approvePricingWorksheet } from "@/lib/vendors/pricing-room.functions";
import { useMyRoles } from "@/hooks/use-my-roles";
import { SHIPPING_ZONES } from "@/lib/commerce/shipping-zones";
import { DESTINATIONS } from "@/lib/commerce/pricing-worksheet";
import type { DestinationPricing } from "@/lib/commerce/destination-pricing";
import { ProfitBreakdownPanel, Disclosure, type VariantQuotes } from "./profit-breakdown-panel";

type PanelProps = React.ComponentProps<typeof ProfitBreakdownPanel>;
type Props = Omit<PanelProps, "quotes" | "onFetchQuotes" | "fetchingQuotes" | "quoteError" | "initial" | "onSave" | "saving" | "saveError" | "destination" | "destinationControl" | "serverSection" | "onDirtyChange"> & { productId: string; canFetch: boolean };
type Dest = (typeof DESTINATIONS)[number];
const NAME = (d: string) => SHIPPING_ZONES.find((z) => z.code === d)?.name ?? d;

export function ProfitBreakdownWithQuotes({ productId, canFetch, ...rest }: Props) {
  const [destination, setDestination] = useState<Dest>("US");
  const [dirty, setDirty] = useState(false);
  const { roles } = useMyRoles();
  const isFounder = roles.includes("super_admin");
  const qc = useQueryClient();
  const list = useServerFn(listCjShippingQuotes);
  const fetchFn = useServerFn(fetchCjShippingQuotes);
  const getWs = useServerFn(getPricingWorksheet);
  const saveWs = useServerFn(savePricingWorksheet);
  const evalFn = useServerFn(evaluatePricingDestination);
  const approveFn = useServerFn(approvePricingWorksheet);
  const ids = rest.variants.map((v) => v.id);
  const qKey = ["cj-shipping-quotes", productId, destination];
  const wKey = ["pricing-worksheet", productId, destination];
  const eKey = ["pricing-evaluation", productId, destination];
  const { data } = useQuery({ queryKey: qKey, queryFn: () => list({ data: { variantIds: ids, country: destination } }), enabled: ids.length > 0 });
  const ws = useQuery({ queryKey: wKey, queryFn: () => getWs({ data: { productId, destination } }) });
  const ev = useQuery({ queryKey: eKey, queryFn: () => evalFn({ data: { productId, destination } }) });
  const quotes: VariantQuotes = {};
  for (const q of data ?? []) (quotes[q.variant_id] ??= []).push(q);
  const refresh = () => { qc.invalidateQueries({ queryKey: wKey }); qc.invalidateQueries({ queryKey: eKey }); };
  const m = useMutation({
    mutationFn: () => fetchFn({ data: { productId, country: destination } }),
    onSettled: () => { qc.invalidateQueries({ queryKey: qKey }); qc.invalidateQueries({ queryKey: eKey }); },
  });
  const save = useMutation({
    mutationFn: (p: Parameters<NonNullable<PanelProps["onSave"]>>[0]) =>
      saveWs({ data: { productId, destination, expectedRevision: ws.data?.revision, ...p } }),
    onSettled: refresh,
  });
  const failed = m.data?.results.filter((r) => r.error) ?? [];
  const err = m.error ? (m.error as Error).message : failed.length ? `${failed.length} variant(s) without a quote: ${failed[0].error}` : null;

  const switchTo = (d: Dest) => {
    if (d === destination) return;
    if (dirty && typeof window !== "undefined" && !window.confirm(`You have unsaved ${NAME(destination)} changes. Leave without saving?`)) return;
    save.reset(); m.reset(); setDirty(false); setDestination(d);
  };
  const selector = (
    <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Pricing destination" data-testid="destination-selector">
      {DESTINATIONS.map((d) => (
        <Button key={d} type="button" variant="outline" className="pricing-variant" role="radio" aria-checked={d === destination} onClick={() => switchTo(d)}>
          {NAME(d)}
        </Button>
      ))}
    </div>
  );

  if (ws.isLoading) return <p className="mt-3 text-base text-muted-foreground">Opening the {NAME(destination)} Pricing Room…</p>;
  if (ws.error) return <div className="mt-3">{selector}<p role="alert" className="text-base text-destructive">The {NAME(destination)} worksheet could not load: {(ws.error as Error).message}</p></div>;
  return (
    <ProfitBreakdownPanel
      key={`${destination}:${ws.data?.updatedAt ?? "new"}:${ws.data?.revision ?? 0}`}
      {...rest}
      destination={destination}
      destinationControl={selector}
      onDirtyChange={setDirty}
      quotes={quotes}
      onFetchQuotes={canFetch ? () => m.mutate() : undefined}
      fetchingQuotes={m.isPending}
      quoteError={err}
      initial={ws.data ?? null}
      onSave={(p) => save.mutate(p)}
      saving={save.isPending}
      saveError={save.error ? (save.error as Error).message : null}
      serverSection={
        <ReadinessSection
          productId={productId} destination={destination} dirty={dirty} isFounder={isFounder}
          worksheet={ws.data ?? null} evaluation={ev.data?.pricing ?? null} evaluatedAt={ev.data?.evaluatedAt ?? null}
          loading={ev.isLoading || ev.isFetching} error={ev.error ? (ev.error as Error).message : null}
          approve={(note) => approveFn({ data: { productId, destination, expectedRevision: ws.data!.revision, note: note || undefined } })}
          onApproved={refresh}
        />
      }
    />
  );
}

export function ReadinessSection(p: {
  productId: string; destination: string; dirty: boolean; isFounder: boolean;
  worksheet: { revision: number; approvalStatus: string; approvedRevision: number | null; approvedAt: string | null } | null;
  evaluation: DestinationPricing | null; evaluatedAt: string | null; loading: boolean; error: string | null;
  approve: (note: string) => Promise<unknown>; onApproved: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const e = p.evaluation;
  const met = e?.requirements.filter((r) => r.met).length ?? 0;
  const total = e?.requirements.length ?? 14;
  const status = !p.worksheet ? "Not saved yet"
    : p.worksheet.approvalStatus === "approved" ? `Approved · version ${p.worksheet.approvedRevision}`
    : p.worksheet.approvalStatus === "revised_after_approval" ? `Changed after approval (approved version ${p.worksheet.approvedRevision}, now version ${p.worksheet.revision}) — needs approval again`
    : `Draft · version ${p.worksheet.revision}`;
  const blockers: string[] = [];
  if (!p.isFounder) blockers.push("Only the Founder account can approve.");
  if (!p.worksheet) blockers.push(`Save the ${NAME(p.destination)} worksheet first.`);
  if (p.dirty) blockers.push("Save your changes first — approval checks the saved version only.");
  if (e && !e.ready) blockers.push(`${total - met} readiness check(s) not met.`);
  if (e?.requiresReviewNote && !note.trim()) blockers.push("Margin is 25–29.99% — write a review note.");
  if (p.worksheet?.approvalStatus === "approved" && p.worksheet.approvedRevision === p.worksheet.revision) blockers.push("This version is already approved.");
  if (!e) blockers.push("Server check not available yet.");
  const canApprove = blockers.length === 0 && !busy;

  const onApprove = async () => {
    setBusy(true); setMsg(null);
    try { await p.approve(note.trim()); setMsg({ ok: true, text: "Approved. Recorded in the approval history. Nothing was published and no shop price changed." }); setNote(""); p.onApproved(); }
    catch (x) { setMsg({ ok: false, text: x instanceof Error ? x.message : "Approval failed." }); p.onApproved(); }
    finally { setBusy(false); }
  };

  return (
    <Disclosure title="Financial readiness & Founder approval" summary={p.loading ? "Server checking…" : e ? `${met} of ${total} checks met · ${status}` : status}>
      <div data-testid="readiness">
        <p className="font-semibold" data-testid="approval-status"><ShieldCheck className="mr-1 inline size-4" />{status}</p>
        <p className="mt-1 text-muted-foreground">
          Server check of the <strong>saved</strong> {NAME(p.destination)} worksheet{p.evaluatedAt ? ` · checked ${p.evaluatedAt.slice(0, 16).replace("T", " ")} UTC` : ""}.
          {p.dirty ? " Your unsaved edits are not included until you save." : ""}
        </p>
        {p.error && <p role="alert" className="mt-2 text-destructive">The server check could not run: {p.error}</p>}
        {e && (
          <>
            <p className="mt-2 text-muted-foreground">
              Server figures: recommended (40%) {e.recommendedPrice != null ? `USD ${e.recommendedPrice.toFixed(2)}` : "not computable"} · 25% minimum {e.minimumPrice != null ? `USD ${e.minimumPrice.toFixed(2)}` : "not computable"} · basis {e.basis === "verified" ? "verified" : e.basis === "estimated" ? "estimate only" : "blocked"}.
            </p>
            <ul className="mt-3 space-y-2" aria-label="Readiness checks">
              {e.requirements.map((r) => (
                <li key={r.key} className="flex gap-2">
                  {r.met ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 pricing-gold" aria-hidden /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />}
                  <span><strong>{r.label}</strong> — {r.met ? "met" : "not met"}<span className="block text-muted-foreground">Source: {r.provenance}{r.met ? "" : ` · Action: ${ACTION[r.key] ?? "Resolve before approval."}`}</span></span>
                </li>
              ))}
            </ul>
          </>
        )}
        {e?.requiresReviewNote && (
          <label className="mt-3 block">
            <span className="font-semibold">Founder review note (required for 25–29.99% margin)</span>
            <textarea className="mt-1 block w-full rounded-md border p-2" rows={3} maxLength={1000} value={note} onChange={(x) => setNote(x.target.value)} />
          </label>
        )}
        <div className="pricing-actions mt-3">
          <Button type="button" disabled={!canApprove} aria-describedby="approve-why" onClick={onApprove}>{busy ? "Approving…" : `Approve ${NAME(p.destination)} price`}</Button>
        </div>
        {blockers.length > 0 && <ul id="approve-why" className="mt-2 list-disc pl-5 text-muted-foreground">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>}
        {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 ${msg.ok ? "pricing-gold" : "text-destructive"}`}>{msg.text}</p>}
        <p className="mt-2 text-muted-foreground">Approval only records your decision. It never publishes, changes a shop price, or touches checkout.</p>
      </div>
    </Disclosure>
  );
}

const ACTION: Record<string, string> = {
  zone: "This country is not set up for shipping.",
  currency: "Connect a verified exchange-rate source (Founder decision).",
  variants: "Import the product's sizes/colours first.",
  supplier: "Confirm each variant's supplier cost in USD.",
  shipping_fresh: "Use “Get fresh CJ shipping quotes” in Shipping & destination.",
  shipping_method: "Founder chooses the standard shipping method.",
  processingFeePct: "Confirm the real card-fee percentage.",
  processingFeeFixed: "Confirm the real fixed card fee.",
  packagingCost: "Confirm the real packaging cost.",
  otherCost: "Confirm other expenses or mark not applicable.",
  discountPct: "Decide the discount or mark not applicable.",
  commissionPct: "Decide whether commission applies to shop sales.",
  final_price: "Type a final selling price and save.",
  minimum: "Raise the price or verify costs until every variant keeps 25%.",
};
