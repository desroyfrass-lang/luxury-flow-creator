// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 3 (server only) — recording a trusted payment confirmation.
//
// Nothing in this file can be reached from a browser. It is called by the
// signed webhook route only, after the signature has been checked.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, timingSafeEqual } from "crypto";
import {
  SIGNATURE_TOLERANCE_SECONDS,
  matchesOrder,
  type OrderForVerification,
  type PaymentConfirmationEvent,
} from "./payment-verification";

/** The shared signing secret a connected provider must also hold. */
export function verificationSecret(): string | null {
  const s = process.env["CARD_PAYMENT_WEBHOOK_SECRET"];
  return s && s.length >= 16 ? s : null;
}

/**
 * Signature format: `t=<unix seconds>,v1=<hex hmac-sha256 of "<t>.<raw body>">`.
 * A stale timestamp is refused, so a captured event cannot be replayed later.
 */
export function verifySignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { ok: true } | { ok: false; reason: string } {
  if (!header) return { ok: false, reason: "Missing signature." };
  const parts = Object.fromEntries(
    header
      .split(",")
      .map((p) => p.trim().split("="))
      .filter((p) => p.length === 2) as [string, string][],
  );
  const t = Number(parts["t"]);
  const v1 = parts["v1"];
  if (!t || !v1) return { ok: false, reason: "Malformed signature." };
  if (Math.abs(nowSeconds - t) > SIGNATURE_TOLERANCE_SECONDS) {
    return { ok: false, reason: "Signature timestamp is out of date." };
  }
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "Signature does not match." };
  }
  return { ok: true };
}

export type RecordResult =
  | { ok: true; duplicate: boolean; confirmationId: string; orderId: string }
  | { ok: false; reason: string };

/**
 * Record one provider confirmation and verify the order exactly once.
 * Idempotent on (provider, event_id): a repeated event changes nothing.
 */
export async function recordPaymentConfirmation(
  event: PaymentConfirmationEvent,
): Promise<RecordResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Already seen? Say so and stop — never transition or post twice.
  const { data: seen } = await supabaseAdmin
    .from("payment_confirmations")
    .select("id, order_id, outcome")
    .eq("provider", event.provider)
    .eq("event_id", event.event_id)
    .maybeSingle();
  if (seen) {
    return seen.outcome === "verified"
      ? { ok: true, duplicate: true, confirmationId: seen.id, orderId: seen.order_id ?? "" }
      : { ok: false, reason: "This event was already refused." };
  }

  const { data: order } = await supabaseAdmin
    .from("card_orders")
    .select("id, seller_id, subtotal, currency, status, verified_at")
    .eq("id", event.order_id)
    .maybeSingle();

  const match = matchesOrder(order as OrderForVerification | null, event);
  if (!match.ok) {
    await supabaseAdmin.from("payment_confirmations").insert({
      provider: event.provider,
      event_id: event.event_id,
      event_type: event.event_type ?? "payment.succeeded",
      order_id: order?.id ?? null,
      seller_id: order?.seller_id ?? event.seller_id ?? "00000000-0000-0000-0000-000000000000",
      amount: event.amount,
      currency: (event.currency || "").toUpperCase(),
      provider_payment_id: event.provider_payment_id ?? null,
      outcome: "rejected",
      reject_reason: match.reason,
      payload: event as never,
    });
    return { ok: false, reason: match.reason };
  }

  const confirmed = order as OrderForVerification;

  const { data: confirmation, error } = await supabaseAdmin
    .from("payment_confirmations")
    .insert({
      provider: event.provider,
      event_id: event.event_id,
      event_type: event.event_type ?? "payment.succeeded",
      order_id: confirmed.id,
      seller_id: confirmed.seller_id,
      amount: event.amount,
      currency: (event.currency || "").toUpperCase(),
      provider_payment_id: event.provider_payment_id ?? null,
      outcome: "verified",
      payload: event as never,
    })
    .select("id, received_at")
    .single();
  if (error) {
    // A racing duplicate lost the unique constraint — that is success, once.
    return { ok: false, reason: "This confirmation is already recorded." };
  }

  // Verify the order exactly once. The conditional guard means a second event
  // that slipped past the checks above still cannot transition it twice.
  await supabaseAdmin
    .from("card_orders")
    .update({
      status: "verified",
      verified_at: confirmation.received_at,
      payment_confirmation_id: confirmation.id,
    })
    .eq("id", confirmed.id)
    .is("verified_at", null);

  // Only now may the 3% ecosystem Reserve Vault allocation be recorded.
  const { postReserveVaultEntry } = await import("./reserve-vault.server");
  await postReserveVaultEntry({
    ownerId: confirmed.seller_id,
    sourceKind: "card-order",
    sourceRef: confirmed.id,
    gross: Number(confirmed.subtotal),
    currency: confirmed.currency,
    verifiedAt: confirmation.received_at,
    confirmationId: confirmation.id,
  });

  return { ok: true, duplicate: false, confirmationId: confirmation.id, orderId: confirmed.id };
}
