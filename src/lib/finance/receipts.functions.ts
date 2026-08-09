import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { receiptKind, type Receipt, type ReceiptStatus } from "@/lib/finance/receipts";

// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0433 — Receipt retrieval.
//
// Receipts come from two places and are presented as one timeline:
//   1. Stored receipts (financial_receipts) — the permanent, immutable ledger.
//   2. Derived receipts — money that already lives in its own table (card
//      orders, affiliate commissions, recruitment bonuses). Deriving them keeps
//      one source of truth instead of a second copy that can drift.
// ─────────────────────────────────────────────────────────────────────────────

const round = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

function orderStatus(status: string): ReceiptStatus {
  switch (status) {
    case "paid":
      return "settled";
    case "refunded":
      return "refunded";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

function orderKind(reference: string | null, quick: boolean): string {
  if (reference?.startsWith("gift")) return "gift_received";
  if (reference?.startsWith("tip")) return "tip_received";
  if (reference?.startsWith("money")) return "direct_payment";
  return quick ? "quick_sell" : "marketplace_sale";
}

export const listMyReceipts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const out: Receipt[] = [];

    const [stored, orders, commissions, bonuses] = await Promise.all([
      supabase
        .from("financial_receipts")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .limit(500),
      supabase
        .from("card_orders")
        .select("*, card_listings(title, is_quick_sell)")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("commissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("recruitment_bonuses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    for (const r of stored.data ?? []) {
      out.push({
        id: r.id,
        kind: r.kind,
        direction: (r.direction as "in" | "out") ?? "in",
        source: r.source,
        title: r.title,
        description: r.description,
        counterparty: r.counterparty_name,
        gross: round(r.gross),
        platformAllocation: round(r.platform_allocation),
        processingFee: round(r.processing_fee),
        otherDeductions: round(r.other_deductions),
        net: round(r.net),
        currency: r.currency,
        status: r.status as ReceiptStatus,
        reference: r.reference,
        occurredAt: r.occurred_at,
      });
    }

    for (const o of orders.data ?? []) {
      const listing = (o as unknown as { card_listings?: { title?: string; is_quick_sell?: boolean } }).card_listings;
      const kind = orderKind(o.reference, Boolean(listing?.is_quick_sell));
      out.push({
        id: `order:${o.id}`,
        kind,
        direction: "in",
        source: "frass-card",
        title: listing?.title ?? receiptKind(kind).label,
        description: o.quantity > 1 ? `${o.quantity} × ${round(o.unit_price)}` : null,
        counterparty: o.buyer_name || o.buyer_email || null,
        gross: round(o.subtotal),
        platformAllocation: round(o.platform_fee),
        processingFee: round(o.processing_fee_estimate),
        otherDeductions: 0,
        net: round(o.net_to_seller),
        currency: o.currency,
        status: orderStatus(o.status),
        reference: o.reference,
        occurredAt: o.created_at,
        derived: true,
      });
    }

    for (const c of commissions.data ?? []) {
      out.push({
        id: `commission:${c.id}`,
        kind: "affiliate_commission",
        direction: "in",
        source: "affiliate",
        title: `Commission · ${c.shopify_order_name ?? c.shopify_order_id}`,
        description: `${c.commission_rate}% of ${round(c.commissionable_amount)} commissionable`,
        counterparty: null,
        gross: round(c.commission_amount),
        platformAllocation: 0,
        processingFee: 0,
        otherDeductions: 0,
        net: round(c.commission_amount),
        currency: c.currency,
        status: c.paid_at ? "settled" : c.status === "reversed" ? "refunded" : "pending",
        reference: c.shopify_order_id,
        occurredAt: c.order_created_at ?? c.created_at,
        derived: true,
      });
    }

    for (const b of bonuses.data ?? []) {
      out.push({
        id: `bonus:${b.id}`,
        kind: "recruitment_bonus",
        direction: "in",
        source: "frass-link",
        title: `Recruitment bonus · ${b.kind}`,
        description: b.note,
        counterparty: null,
        gross: round(b.amount),
        platformAllocation: 0,
        processingFee: 0,
        otherDeductions: 0,
        net: round(b.amount),
        currency: b.currency,
        status: b.status === "paid" ? "settled" : b.status === "cancelled" ? "cancelled" : "pending",
        reference: b.referral_id,
        occurredAt: b.created_at,
        derived: true,
      });
    }

    out.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    return out;
  });

/** Corrections attached to a member's receipts — history is never rewritten. */
export const listMyAdjustments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("financial_adjustments")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

const ReceiptInput = z.object({
  kind: z.string().trim().min(1).max(60),
  direction: z.enum(["in", "out"]).default("in"),
  source: z.string().trim().max(60).default("frass"),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(600).nullable().optional(),
  counterparty_name: z.string().trim().max(160).nullable().optional(),
  gross: z.number().min(0).max(10_000_000),
  platform_allocation: z.number().min(0).max(10_000_000).default(0),
  processing_fee: z.number().min(0).max(10_000_000).default(0),
  other_deductions: z.number().min(0).max(10_000_000).default(0),
  net: z.number().min(0).max(10_000_000),
  currency: z.string().trim().length(3).default("USD"),
  status: z.enum(["pending", "settled", "refunded", "withdrawn", "cancelled"]).default("pending"),
  reference: z.string().trim().max(200).nullable().optional(),
});

/** Record a movement that has no other home yet (deposit, withdrawal, manual entry). */
export const recordReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof ReceiptInput>) => ReceiptInput.parse(d))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("financial_receipts")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        direction: data.direction,
        source: data.source,
        title: data.title,
        description: data.description ?? null,
        counterparty_name: data.counterparty_name ?? null,
        gross: data.gross,
        platform_allocation: data.platform_allocation,
        processing_fee: data.processing_fee,
        other_deductions: data.other_deductions,
        net: data.net,
        currency: data.currency.toUpperCase(),
        status: data.status,
        reference: data.reference ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });
