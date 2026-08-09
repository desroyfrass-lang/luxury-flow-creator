import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { LISTING_KIND_IDS, settle } from "@/lib/card-commerce";

export type CardListing = Database["public"]["Tables"]["card_listings"]["Row"];
export type CardOrder = Database["public"]["Tables"]["card_orders"]["Row"];

const ListingInput = z.object({
  kind: z.enum(LISTING_KIND_IDS),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).nullable().optional(),
  image_url: z.string().trim().max(1000).nullable().optional(),
  price: z.number().min(0).max(1_000_000),
  currency: z.string().trim().min(3).max(3).default("USD"),
  quantity: z.number().int().min(1).max(100_000).nullable().optional(),
  is_quick_sell: z.boolean().optional(),
});

/* ── Seller side ─────────────────────────────────────────────────────────── */

export const listMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("card_listings")
      .select("*")
      .eq("user_id", context.userId)
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CardListing[];
  });

/** Quick Sell: photo, price, quantity, done. Nothing else is required. */
export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof ListingInput>) => ListingInput.parse(d))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("card_listings")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        title: data.title,
        description: data.description ?? null,
        image_url: data.image_url ?? null,
        price: data.price,
        currency: data.currency.toUpperCase(),
        quantity: data.quantity ?? null,
        is_quick_sell: data.is_quick_sell ?? false,
        status: "live",
      })
      .select()
      .single();
    if (error) throw error;
    return row as CardListing;
  });

export const setListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "live" | "sold_out" | "archived" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["live", "sold_out", "archived"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("card_listings")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true as const };
  });

export const listMyCardOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("card_orders")
      .select("*")
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as CardOrder[];
  });

export const setCardOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "pending" | "paid" | "cancelled" | "refunded" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "paid", "cancelled", "refunded"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: order, error } = await context.supabase
      .from("card_orders")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("seller_id", context.userId)
      .select()
      .single();
    if (error) throw error;

    // Cancelling or refunding returns the stock to the basket.
    if ((data.status === "cancelled" || data.status === "refunded") && order?.listing_id) {
      const { data: listing } = await context.supabase
        .from("card_listings")
        .select("sold, quantity")
        .eq("id", order.listing_id)
        .maybeSingle();
      if (listing) {
        const sold = Math.max(0, (listing.sold ?? 0) - (order.quantity ?? 1));
        await context.supabase
          .from("card_listings")
          .update({ sold, status: "live" })
          .eq("id", order.listing_id)
          .eq("user_id", context.userId);
      }
    }
    return order as CardOrder;
  });

/* ── Buyer side ──────────────────────────────────────────────────────────── */

/**
 * Records the sale and hands the buyer to the seller's own payment account.
 * Frass never takes custody of the money — it keeps the receipt.
 */
export const startCardCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { listing_id: string; quantity: number; buyer_name?: string; buyer_email?: string }) =>
      z
        .object({
          listing_id: z.string().uuid(),
          quantity: z.number().int().min(1).max(100),
          buyer_name: z.string().trim().max(120).optional(),
          buyer_email: z.string().trim().email().max(255).optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing } = await supabaseAdmin
      .from("card_listings")
      .select("*")
      .eq("id", data.listing_id)
      .maybeSingle();
    if (!listing || listing.status !== "live") {
      return { ok: false as const, reason: "This item is no longer available." };
    }

    const left = listing.quantity == null ? null : Math.max(0, listing.quantity - (listing.sold ?? 0));
    if (left != null && data.quantity > left) {
      return { ok: false as const, reason: left === 0 ? "Sold out." : `Only ${left} left.` };
    }

    const { data: card } = await supabaseAdmin
      .from("business_cards")
      .select("commerce_enabled, payout_provider, payout_url")
      .eq("user_id", listing.user_id)
      .maybeSingle();
    if (!card?.commerce_enabled || !card.payout_url) {
      return { ok: false as const, reason: "This seller has not switched on payments yet." };
    }

    const s = settle(Number(listing.price), data.quantity, card.payout_provider);

    const { data: order, error } = await supabaseAdmin
      .from("card_orders")
      .insert({
        listing_id: listing.id,
        seller_id: listing.user_id,
        buyer_name: data.buyer_name ?? null,
        buyer_email: data.buyer_email ?? null,
        quantity: data.quantity,
        unit_price: Number(listing.price),
        subtotal: s.gross,
        platform_fee: s.platformFee,
        processing_fee_estimate: s.processingFeeEstimate,
        net_to_seller: s.netToSeller,
        currency: listing.currency,
        status: "pending",
        payout_provider: card.payout_provider,
      })
      .select()
      .single();
    if (error) throw error;

    const sold = (listing.sold ?? 0) + data.quantity;
    const soldOut = listing.quantity != null && sold >= listing.quantity;
    await supabaseAdmin
      .from("card_listings")
      .update({ sold, status: soldOut ? "sold_out" : "live" })
      .eq("id", listing.id);

    await supabaseAdmin
      .from("business_card_events")
      .insert({ card_user_id: listing.user_id, kind: "sale", detail: listing.title.slice(0, 120) });

    return {
      ok: true as const,
      order_id: order.id,
      pay_url: card.payout_url,
      provider: card.payout_provider,
      total: s.gross,
      currency: listing.currency,
    };
  });
