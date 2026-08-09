import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { settle } from "@/lib/card-commerce";
import {
  DEFAULT_EXPIRY_MINUTES,
  DELIVERY_IDS,
  REQUEST_KIND_IDS,
  isExpired,
  newRequestToken,
  recoveryMessage,
} from "@/lib/payment-request";

export type PaymentRequestRow = Database["public"]["Tables"]["payment_requests"]["Row"];

/**
 * FRASS-0436 — the seller creates the sale, never the payment.
 * Nothing here ever touches a card number: Frass records the request and the
 * customer authorises it on their own device with their own provider.
 */
export const createPaymentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      kind: string;
      title: string;
      amount: number;
      quantity?: number;
      note?: string;
      currency?: string;
      listing_id?: string | null;
      buyer_name?: string;
      buyer_email?: string;
      buyer_phone?: string;
      delivery?: string;
      expires_in_minutes?: number | null;
      idempotency_key?: string;
    }) =>
      z
        .object({
          kind: z.enum(REQUEST_KIND_IDS),
          title: z.string().trim().min(1).max(120),
          amount: z.number().min(0.5).max(1_000_000),
          quantity: z.number().int().min(1).max(100_000).default(1),
          note: z.string().trim().max(240).optional(),
          currency: z.string().trim().length(3).default("USD"),
          listing_id: z.string().uuid().nullable().optional(),
          buyer_name: z.string().trim().max(120).optional(),
          buyer_email: z.string().trim().email().max(255).optional(),
          buyer_phone: z.string().trim().max(40).optional(),
          delivery: z.enum(DELIVERY_IDS).default("qr"),
          expires_in_minutes: z.number().int().min(5).max(20_160).nullable().optional(),
          idempotency_key: z.string().trim().min(8).max(64).optional(),
        })
        .parse(d),
  )
  .handler(async ({ context, data }) => {
    // FRASS-0439 — requests do not live forever.
    const minutes = data.expires_in_minutes ?? DEFAULT_EXPIRY_MINUTES;
    const expires_at = new Date(Date.now() + minutes * 60_000).toISOString();

    // FRASS-0439 — duplicate protection. A double tap on "Request payment"
    // returns the request that already exists instead of creating a second one.
    if (data.idempotency_key) {
      const { data: existing } = await context.supabase
        .from("payment_requests")
        .select("*")
        .eq("seller_id", context.userId)
        .eq("idempotency_key", data.idempotency_key)
        .maybeSingle();
      if (existing) return existing as PaymentRequestRow;
    }

    const { data: row, error } = await context.supabase
      .from("payment_requests")
      .insert({
        token: newRequestToken(),
        seller_id: context.userId,
        listing_id: data.listing_id ?? null,
        kind: data.kind,
        title: data.title,
        note: data.note ?? null,
        amount: data.amount,
        quantity: data.quantity,
        currency: data.currency.toUpperCase(),
        buyer_name: data.buyer_name ?? null,
        buyer_email: data.buyer_email ?? null,
        buyer_phone: data.buyer_phone ?? null,
        delivery: data.delivery,
        expires_at,
        idempotency_key: data.idempotency_key ?? null,
        status: "awaiting_approval",
      })
      .select()
      .single();
    if (error) throw error;
    return row as PaymentRequestRow;
  });

export const listMyPaymentRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("payment_requests")
      .select("*")
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as PaymentRequestRow[];
  });

export const cancelPaymentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("payment_requests")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("seller_id", context.userId)
      .in("status", ["preparing", "awaiting_approval"]);
    if (error) throw error;
    return { ok: true as const };
  });

/* ── The customer's own device ───────────────────────────────────────────── */

export type PublicPaymentRequest = {
  token: string;
  kind: string;
  title: string;
  note: string | null;
  amount: number;
  quantity: number;
  currency: string;
  status: string;
  expires_at: string | null;
  seller_name: string;
  seller_handle: string | null;
  seller_avatar: string | null;
  payments_enabled: boolean;
  provider: string | null;
  order_id: string | null;
};

/**
 * Served with the admin client so the public page never needs table access.
 * Seller identifiers and buyer contact details are stripped before returning.
 */
export const getPaymentRequest = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) =>
    z.object({ token: z.string().trim().min(6).max(64) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: req } = await supabaseAdmin
      .from("payment_requests")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (!req) return { ok: false as const, reason: "This payment request could not be found." };

    const expired =
      ["preparing", "awaiting_approval"].includes(req.status) && isExpired(req.expires_at);
    if (expired) {
      await supabaseAdmin
        .from("payment_requests")
        .update({ status: "expired", expired_at: new Date().toISOString() })
        .eq("id", req.id);
    } else if (!req.first_viewed_at) {
      await supabaseAdmin
        .from("payment_requests")
        .update({ first_viewed_at: new Date().toISOString() })
        .eq("id", req.id);
    }

    const [{ data: profile }, { data: card }] = await Promise.all([
      supabaseAdmin.from("profiles").select("display_name, handle, avatar_url").eq("id", req.seller_id).maybeSingle(),
      supabaseAdmin
        .from("business_cards")
        .select("commerce_enabled, payout_provider, payout_url")
        .eq("user_id", req.seller_id)
        .maybeSingle(),
    ]);

    const payload: PublicPaymentRequest = {
      token: req.token,
      kind: req.kind,
      title: req.title,
      note: req.note,
      amount: Number(req.amount),
      quantity: req.quantity,
      currency: req.currency,
      status: expired ? "expired" : req.status,
      expires_at: req.expires_at,
      seller_name: profile?.display_name || profile?.handle || "A Frass member",
      seller_handle: profile?.handle ?? null,
      seller_avatar: profile?.avatar_url ?? null,
      payments_enabled: Boolean(card?.commerce_enabled && card?.payout_url),
      provider: card?.payout_provider ?? null,
      order_id: req.order_id,
    };
    return { ok: true as const, request: payload };
  });

/**
 * The customer approves on their own device. Frass records the sale, the
 * constitutional allocation and the audit trail, then hands the customer to
 * the seller's own secure payment provider. Frass never sees the credentials.
 */
export const approvePaymentRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; buyer_name?: string; buyer_email?: string }) =>
    z
      .object({
        token: z.string().trim().min(6).max(64),
        buyer_name: z.string().trim().max(120).optional(),
        buyer_email: z.string().trim().email().max(255).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: req } = await supabaseAdmin
      .from("payment_requests")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();
    if (!req) return { ok: false as const, reason: "This payment request could not be found." };

    if (isExpired(req.expires_at) && ["preparing", "awaiting_approval"].includes(req.status)) {
      await supabaseAdmin
        .from("payment_requests")
        .update({ status: "expired", expired_at: new Date().toISOString() })
        .eq("id", req.id);
      return { ok: false as const, reason: "This payment request has expired." };
    }

    // FRASS-0439 — duplicate protection. This conditional update is the single
    // gate into the transaction: only the first tap can move the request out of
    // "awaiting approval", so a second tap can never create a second sale.
    const { data: claimed } = await supabaseAdmin
      .from("payment_requests")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        attempts: (req.attempts ?? 0) + 1,
      })
      .eq("id", req.id)
      .eq("status", "awaiting_approval")
      .select()
      .maybeSingle();

    if (!claimed) {
      // Someone (probably this same customer, tapping twice) got here first.
      const { data: current } = await supabaseAdmin
        .from("payment_requests")
        .select("status, order_id")
        .eq("id", req.id)
        .maybeSingle();
      const status = current?.status ?? req.status;
      if (status === "successful" && current?.order_id) {
        return {
          ok: true as const,
          duplicate: true as const,
          order_id: current.order_id,
          pay_url: null,
          provider: null,
          total: Math.round(Number(req.amount) * req.quantity * 100) / 100,
          currency: req.currency,
        };
      }
      return { ok: false as const, reason: recoveryMessage(status), status };
    }



    const { data: card } = await supabaseAdmin
      .from("business_cards")
      .select("commerce_enabled, payout_provider, payout_url")
      .eq("user_id", req.seller_id)
      .maybeSingle();
    if (!card?.commerce_enabled || !card.payout_url) {
      return { ok: false as const, reason: "This seller has not switched on payments yet." };
    }

    const unit = Number(req.amount);
    const s = settle(unit, req.quantity, card.payout_provider);

    const { data: order, error } = await supabaseAdmin
      .from("card_orders")
      .insert({
        listing_id: req.listing_id,
        seller_id: req.seller_id,
        buyer_name: data.buyer_name ?? req.buyer_name ?? null,
        buyer_email: data.buyer_email ?? req.buyer_email ?? null,
        quantity: req.quantity,
        unit_price: unit,
        subtotal: s.gross,
        platform_fee: s.platformFee,
        processing_fee_estimate: s.processingFeeEstimate,
        net_to_seller: s.netToSeller,
        currency: req.currency,
        status: "pending",
        payout_provider: card.payout_provider,
        reference: `${req.kind}: ${req.title}`.slice(0, 240),
      })
      .select()
      .single();
    if (error) throw error;

    // Inventory follows the sale automatically when a listing is attached.
    if (req.listing_id) {
      const { data: listing } = await supabaseAdmin
        .from("card_listings")
        .select("quantity, sold")
        .eq("id", req.listing_id)
        .maybeSingle();
      if (listing) {
        const sold = (listing.sold ?? 0) + req.quantity;
        const soldOut = listing.quantity != null && sold >= listing.quantity;
        await supabaseAdmin
          .from("card_listings")
          .update({ sold, status: soldOut ? "sold_out" : "live" })
          .eq("id", req.listing_id);
      }
    }

    await supabaseAdmin
      .from("payment_requests")
      .update({ status: "paid", paid_at: new Date().toISOString(), order_id: order.id })
      .eq("id", req.id);

    await supabaseAdmin
      .from("business_card_events")
      .insert({ card_user_id: req.seller_id, kind: "sale", detail: req.title.slice(0, 120) });

    return {
      ok: true as const,
      order_id: order.id,
      pay_url: card.payout_url,
      provider: card.payout_provider,
      total: s.gross,
      currency: req.currency,
    };
  });

export const declinePaymentRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) =>
    z.object({ token: z.string().trim().min(6).max(64) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("payment_requests")
      .update({ status: "declined", declined_at: new Date().toISOString() })
      .eq("token", data.token)
      .in("status", ["preparing", "awaiting_approval"]);
    return { ok: true as const };
  });
