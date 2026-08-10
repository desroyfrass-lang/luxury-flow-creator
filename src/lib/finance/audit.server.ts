// FRASS-0450 — server-only collection of the financial audit ledger.
//
// Read-only by construction: this file only ever selects. Nothing here writes,
// settles, approves or corrects anything. Corrections happen through the
// audited workflows that created the records in the first place.

import {
  FINAL_ORDER_STATES,
  FINAL_REQUEST_STATES,
  reconcile,
  type AuditEvent,
  type AuditRow,
} from "@/lib/finance/audit";

const round2 = (n: unknown) => Math.round((Number(n) || 0) * 100) / 100;

function ev(at: string | null | undefined, label: string, detail?: string | null): AuditEvent[] {
  return at ? [{ at, label, detail: detail ?? null }] : [];
}

export type AuditWindow = { from?: string; to?: string; limit?: number };

export async function collectAudit(opts: AuditWindow) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const limit = opts.limit ?? 400;
  const from = opts.from ?? new Date(Date.now() - 90 * 86400_000).toISOString();
  const to = opts.to ?? new Date(Date.now() + 86400_000).toISOString();

  const [orders, requests, receipts, adjustments, fraud] = await Promise.all([
    supabaseAdmin
      .from("card_orders")
      .select("*")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("payment_requests")
      .select("*")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("financial_receipts")
      .select("*")
      .gte("occurred_at", from)
      .lte("occurred_at", to)
      .order("occurred_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("financial_adjustments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("fraud_reports")
      .select("id, kind, status, details, order_reference, subject_handle, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const err = orders.error ?? requests.error ?? receipts.error ?? adjustments.error ?? fraud.error;
  if (err) throw err;

  const rows: AuditRow[] = [];

  for (const o of orders.data ?? []) {
    const final = FINAL_ORDER_STATES.includes(o.status);
    const r = reconcile({
      gross: round2(o.subtotal),
      platformAllocation: round2(o.platform_fee),
      processingFee: round2(o.processing_fee_estimate),
      otherDeductions: 0,
      net: round2(o.net_to_seller),
      final,
      settled: o.status === "paid",
    });
    rows.push({
      id: o.id,
      source: "order",
      reference: o.reference,
      title: `Order · ${o.quantity} × ${round2(o.unit_price).toFixed(2)}`,
      counterparty: o.buyer_name || o.buyer_email || null,
      partyId: o.seller_id,
      currency: o.currency,
      gross: round2(o.subtotal),
      platformAllocation: round2(o.platform_fee),
      processingFee: round2(o.processing_fee_estimate),
      otherDeductions: 0,
      net: round2(o.net_to_seller),
      status: o.status,
      occurredAt: o.created_at,
      settledAt: o.status === "paid" ? o.updated_at : null,
      events: [
        ...ev(o.created_at, "Order recorded", o.payout_provider ? `via ${o.payout_provider}` : null),
        ...ev(o.updated_at !== o.created_at ? o.updated_at : null, `Status → ${o.status}`),
      ],
      reconciliation: r.state,
      reconciliationNote: r.note,
    });
  }

  for (const p of requests.data ?? []) {
    const gross = round2(Number(p.amount) * Number(p.quantity || 1));
    const platform = round2(gross * 0.1);
    const final = FINAL_REQUEST_STATES.includes(p.status);
    const orphanPaid =
      p.status === "paid" && !p.order_id ? "Marked paid but no order was ever created." : null;
    const r = reconcile({
      gross,
      platformAllocation: platform,
      processingFee: 0,
      otherDeductions: 0,
      net: round2(gross - platform),
      final,
      settled: p.status === "paid",
      extraProblem: orphanPaid,
    });
    rows.push({
      id: p.id,
      source: "payment_request",
      reference: p.idempotency_key ?? p.token?.slice(0, 8) ?? null,
      title: p.title,
      counterparty: p.buyer_name || p.buyer_email || p.buyer_phone || null,
      partyId: p.seller_id,
      currency: p.currency,
      gross,
      platformAllocation: platform,
      processingFee: 0,
      otherDeductions: 0,
      net: round2(gross - platform),
      status: p.status,
      occurredAt: p.created_at,
      settledAt: p.paid_at,
      events: [
        ...ev(p.created_at, "Request created", `${p.kind} · ${p.delivery}`),
        ...ev(p.first_viewed_at, "Customer opened it"),
        ...ev(p.processing_started_at, "Processing started", `attempt ${p.attempts}`),
        ...ev(p.paid_at, "Paid"),
        ...ev(p.declined_at, "Declined", p.failure_reason),
        ...ev(p.cancelled_at, "Cancelled"),
        ...ev(p.expired_at, "Expired"),
        ...ev(p.refunded_at, "Refunded"),
      ].sort((a, b) => (a.at < b.at ? -1 : 1)),
      reconciliation: r.state,
      reconciliationNote: r.note,
    });
  }

  for (const f of receipts.data ?? []) {
    const final = ["settled", "refunded", "withdrawn", "cancelled"].includes(f.status);
    const settledMissing =
      f.status === "settled" && !f.settled_at ? "Marked settled with no settlement timestamp." : null;
    const r = reconcile({
      gross: round2(f.gross),
      platformAllocation: round2(f.platform_allocation),
      processingFee: round2(f.processing_fee),
      otherDeductions: round2(f.other_deductions),
      net: round2(f.net),
      final,
      settled: f.status === "settled",
      extraProblem: settledMissing,
    });
    rows.push({
      id: f.id,
      source: "receipt",
      reference: f.reference ?? f.external_id,
      title: f.title,
      counterparty: f.counterparty_name,
      partyId: f.user_id,
      currency: f.currency,
      gross: round2(f.gross),
      platformAllocation: round2(f.platform_allocation),
      processingFee: round2(f.processing_fee),
      otherDeductions: round2(f.other_deductions),
      net: round2(f.net),
      status: f.status,
      occurredAt: f.occurred_at,
      settledAt: f.settled_at,
      events: [
        ...ev(f.created_at, "Receipt written", `${f.kind} · ${f.source}`),
        ...ev(f.occurred_at !== f.created_at ? f.occurred_at : null, "Money moved"),
        ...ev(f.settled_at, "Settled"),
        ...(adjustments.data ?? [])
          .filter((a) => a.receipt_id === f.id)
          .map((a) => ({
            at: a.created_at as string,
            label: "Adjustment",
            detail: a.reason as string | null,
          })),
      ].sort((a, b) => (a.at < b.at ? -1 : 1)),
      reconciliation: r.state,
      reconciliationNote: r.note,
    });
  }

  rows.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

  const processing = (requests.data ?? []).filter((p) =>
    ["preparing", "awaiting_approval", "processing"].includes(p.status),
  ).length;

  return {
    rows,
    window: { from, to },
    queue: {
      processing,
      openFraud: (fraud.data ?? []).filter((f) => f.status === "received" || f.status === "investigating")
        .length,
      adjustments: (adjustments.data ?? []).length,
    },
    fraud: fraud.data ?? [],
  };
}

/** A compact, model-readable rendering of the ledger. Facts only. */
export function ledgerBriefing(rows: AuditRow[], max = 220): string {
  return rows
    .slice(0, max)
    .map(
      (r) =>
        `${r.occurredAt} | ${r.source} | ${r.status} | ${r.currency} gross ${r.gross} platform ${r.platformAllocation} fee ${r.processingFee} net ${r.net} | ${r.reconciliation}${
          r.reconciliation === "attention" ? ` (${r.reconciliationNote})` : ""
        } | ${r.counterparty ?? "—"} | party ${r.partyId ?? "—"} | ref ${r.reference ?? r.id}`,
    )
    .join("\n");
}
