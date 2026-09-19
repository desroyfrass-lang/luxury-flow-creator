// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 5 — the customer's "Pay" action.
//
// The browser sends ONE thing: which Frass Card order is being paid. The
// seller, the amount and the currency are read from the order in the database.
// Nothing a customer types can change what is charged or who is credited.
//
// This function opens a payment page. It never verifies a payment, never marks
// an order paid, and never records money. Only the signed Stripe webhook can.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type StripeCheckoutResult =
  | { ok: true; url: string; reused: boolean }
  | { ok: false; reason: string; connected: boolean };

export const startStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { order_id: string }) =>
    z.object({ order_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }): Promise<StripeCheckoutResult> => {
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const {
      STRIPE_NOT_CONNECTED,
      checkoutPayable,
      checkoutSessionForm,
      reusableSession,
    } = await import("./stripe-checkout");
    const { createStripeCheckoutSession, stripeCheckoutReady } = await import(
      "./stripe-checkout.server"
    );

    if (!stripeCheckoutReady()) {
      return { ok: false, reason: STRIPE_NOT_CONNECTED, connected: false };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("card_orders")
      .select(
        "id, seller_id, subtotal, currency, status, verified_at, reference, buyer_email, listing_id, stripe_session_id, stripe_session_url, stripe_session_expires_at",
      )
      .eq("id", data.order_id)
      .maybeSingle();

    const payable = checkoutPayable(order as never);
    if (!payable.ok) return { ok: false, reason: payable.reason, connected: true };
    const row = order as NonNullable<typeof order>;

    // Same order, same payment page — no pile of payable links.
    const existing = reusableSession(row as never);
    if (existing) return { ok: true, url: existing.url, reused: true };

    let productName = "Frass Card order";
    if (row.listing_id) {
      const { data: listing } = await supabaseAdmin
        .from("card_listings")
        .select("title")
        .eq("id", row.listing_id)
        .maybeSingle();
      if (listing?.title) productName = listing.title;
    } else if (row.reference) {
      productName = String(row.reference);
    }

    const origin = getRequestUrl().origin;
    const form = checkoutSessionForm({
      orderId: row.id,
      sellerId: row.seller_id,
      amount: payable.amount,
      currency: payable.currency,
      productName,
      successUrl: `${origin}/pay/result?outcome=returned&order=${row.id}`,
      cancelUrl: `${origin}/pay/result?outcome=cancelled&order=${row.id}`,
      customerEmail: row.buyer_email ?? null,
    });

    const session = await createStripeCheckoutSession(form, row.id);
    if (!session.ok) return { ok: false, reason: session.reason, connected: true };

    // Remembered by trusted server code only; the order stays "pending".
    await supabaseAdmin
      .from("card_orders")
      .update({
        stripe_session_id: session.sessionId,
        stripe_session_url: session.url,
        stripe_session_expires_at: session.expiresAt,
      })
      .eq("id", row.id)
      .is("verified_at", null);

    return { ok: true, url: session.url, reused: false };
  });
