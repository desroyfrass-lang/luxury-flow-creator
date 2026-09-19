// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 3 — the only door a payment confirmation may come through.
//
// A payment provider (or the payment system of record) POSTs a signed event
// here. Nothing else on the platform can verify a sale: not the seller, not the
// buyer, not a redirect back from a payment page, not any browser request.
//
// Until the Founder connects a provider and saves CARD_PAYMENT_WEBHOOK_SECRET,
// this door answers "not configured" and verifies nothing.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const EventSchema = z.object({
  provider: z.string().trim().min(2).max(40),
  event_id: z.string().trim().min(6).max(200),
  event_type: z.string().trim().max(60).optional(),
  order_id: z.string().uuid(),
  provider_payment_id: z.string().trim().max(200).nullable().optional(),
  amount: z.number().min(0).max(1_000_000),
  currency: z.string().trim().length(3),
  seller_id: z.string().uuid().nullable().optional(),
});

export const Route = createFileRoute("/api/public/payments/card-confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verificationSecret, verifySignature, recordPaymentConfirmation } = await import(
          "@/lib/finance/payment-verification.server"
        );

        const secret = verificationSecret();
        if (!secret) {
          return Response.json(
            { ok: false, reason: "Payment verification is not configured." },
            { status: 503 },
          );
        }

        const rawBody = await request.text();
        const sig = verifySignature(rawBody, request.headers.get("x-frass-signature"), secret);
        if (!sig.ok) return Response.json({ ok: false, reason: sig.reason }, { status: 401 });

        let parsed: z.infer<typeof EventSchema>;
        try {
          parsed = EventSchema.parse(JSON.parse(rawBody));
        } catch {
          return Response.json({ ok: false, reason: "Malformed event." }, { status: 400 });
        }

        const result = await recordPaymentConfirmation(parsed);
        return Response.json(result, { status: result.ok ? 200 : 409 });
      },
    },
  },
});
