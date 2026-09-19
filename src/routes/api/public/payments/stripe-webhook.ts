// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 4 — the real provider door for direct Frass Card sales.
//
// Stripe POSTs its signed events here. This route does NOT verify anything by
// itself: it checks the Stripe signature, translates the event into the one
// internal confirmation shape, and hands it to the SAME trusted path that
// already binds order, seller, amount and currency exactly, refuses replays and
// records each event once.
//
// Verified still never means settled, withdrawn, available or paid out.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payments/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { stripeWebhookSecret, verifyStripeSignature } = await import(
          "@/lib/finance/providers/stripe.server"
        );

        const secret = stripeWebhookSecret();
        if (!secret) {
          return Response.json(
            { ok: false, reason: "Stripe is not connected yet." },
            { status: 503 },
          );
        }

        // The raw body, byte for byte — the signature covers exactly this text.
        const rawBody = await request.text();
        const sig = verifyStripeSignature(
          rawBody,
          request.headers.get("stripe-signature"),
          secret,
        );
        if (!sig.ok) return Response.json({ ok: false, reason: sig.reason }, { status: 401 });

        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          return Response.json({ ok: false, reason: "Malformed event." }, { status: 400 });
        }

        const { mapStripeEvent } = await import("@/lib/finance/providers/stripe");
        const mapped = mapStripeEvent(parsedBody);
        if (!mapped.ok) {
          // A genuine Stripe event Frass does not act on is acknowledged, so
          // Stripe stops retrying it. Anything else is refused.
          return Response.json(
            { ok: false, reason: mapped.reason },
            { status: mapped.ignorable ? 200 : 400 },
          );
        }

        const { recordPaymentConfirmation } = await import(
          "@/lib/finance/payment-verification.server"
        );
        const result = await recordPaymentConfirmation(mapped.event);

        // A duplicate is a success that changes nothing — Stripe must not retry.
        return Response.json(result, { status: result.ok ? 200 : 409 });
      },
    },
  },
});
