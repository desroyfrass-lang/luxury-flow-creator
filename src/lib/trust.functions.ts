import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TrustBadgeId } from "@/lib/trust";

/**
 * FRASS-0431 — Trust & Fraud Protection.
 *
 * Everything here obeys one rule: a member's payment credentials never travel
 * between members. These functions only ever return what somebody legitimately
 * needs to decide whether to buy, book or pay — never card data, never banking
 * details, not even a masked fragment of them.
 */

export type MemberStatus = {
  live: { id: string; title: string; destination: string } | null;
  radio: boolean;
  studio: boolean;
  selling: boolean;
};

/**
 * The mini Frass Card's living indicators — what a member is doing right now,
 * and only what they have themselves chosen to make public.
 */
export const getMemberStatus = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => z.object({ handle: z.string().max(40) }).parse(d))
  .handler(async ({ data }): Promise<MemberStatus | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const handle = data.handle.replace(/^@/, "").toLowerCase();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;

    const { data: live } = await supabaseAdmin
      .from("live_broadcasts")
      .select("id, title, destination, purpose")
      .eq("host_id", profile.id)
      .eq("status", "live")
      .limit(1)
      .maybeSingle();

    const { count: liveListings } = await supabaseAdmin
      .from("card_listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("status", "live");

    const destination = (live?.destination ?? "").toLowerCase();
    const purpose = (live?.purpose ?? "").toLowerCase();

    return {
      live: live ? { id: live.id, title: live.title, destination: live.destination } : null,
      radio: destination.includes("radio"),
      studio: purpose.includes("studio") || destination.includes("studio"),
      selling: (liveListings ?? 0) > 0,
    };
  });

/* ── Trust section on a Frass Card ───────────────────────────────────────── */

export type CardTrust = {
  badges: TrustBadgeId[];
  paymentConnected: boolean;
  memberSince: string | null;
  ordersCompleted: number;
  rating: { average: number | null; count: number };
};

export const getCardTrust = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => z.object({ handle: z.string().max(40) }).parse(d))
  .handler(async ({ data }): Promise<CardTrust | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const handle = data.handle.replace(/^@/, "").toLowerCase();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, created_at")
      .eq("handle", handle)
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;

    const { data: card } = await supabaseAdmin
      .from("business_cards")
      .select("payout_url, commerce_enabled")
      .eq("user_id", profile.id)
      .maybeSingle();

    const { data: verifications } = await supabaseAdmin
      .from("trust_verifications")
      .select("badge")
      .eq("user_id", profile.id);

    const { count: orders } = await supabaseAdmin
      .from("card_orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", profile.id)
      .in("status", ["paid", "fulfilled", "completed"]);

    return {
      badges: (verifications ?? []).map((v) => v.badge as TrustBadgeId),
      // A destination exists — never the account behind it.
      paymentConnected: Boolean(card?.commerce_enabled && card?.payout_url),
      memberSince: profile.created_at ?? null,
      ordersCompleted: orders ?? 0,
      // Zeros stay honest: reviews are not built yet, so no rating is invented.
      rating: { average: null, count: 0 },
    };
  });

/* ── The member's own Trust Center ───────────────────────────────────────── */

export const getMyTrustCenter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: card } = await context.supabase
      .from("business_cards")
      .select("payout_provider, payout_display_name, payout_url, commerce_enabled, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    const { data: verifications } = await context.supabase
      .from("trust_verifications")
      .select("badge, created_at")
      .eq("user_id", context.userId);

    const { data: reports } = await context.supabase
      .from("fraud_reports")
      .select("id, kind, status, details, created_at, resolution")
      .eq("reporter_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: orders } = await context.supabase
      .from("card_orders")
      .select("id, reference, status, subtotal, currency, created_at, buyer_name")
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      payout: card
        ? {
            connected: Boolean(card.commerce_enabled && card.payout_url),
            provider: card.payout_provider,
            // The destination's public name only — never the account behind it.
            displayName: card.payout_display_name,
            updatedAt: card.updated_at,
          }
        : { connected: false, provider: null, displayName: null, updatedAt: null },
      badges: (verifications ?? []).map((v) => ({
        badge: v.badge as TrustBadgeId,
        createdAt: v.created_at,
      })),
      reports: reports ?? [],
      recentTransactions: (orders ?? []).map((o) => ({
        id: o.id,
        reference: o.reference,
        status: o.status,
        amount: Number(o.subtotal ?? 0),
        currency: o.currency,
        createdAt: o.created_at,
        buyer: o.buyer_name,
      })),
    };
  });

export const reportFraud = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { kind: string; details: string; subjectHandle?: string; orderReference?: string }) =>
      z
        .object({
          kind: z.enum([
            "fraud",
            "scam",
            "identity_misuse",
            "counterfeit",
            "unauthorized_activity",
            "suspicious_message",
            "other",
          ]),
          details: z.string().trim().min(10).max(2000),
          subjectHandle: z.string().trim().max(40).optional(),
          orderReference: z.string().trim().max(120).optional(),
        })
        .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("fraud_reports").insert({
      reporter_id: context.userId,
      kind: data.kind,
      details: data.details,
      subject_handle: data.subjectHandle ? data.subjectHandle.replace(/^@/, "").toLowerCase() : null,
      order_reference: data.orderReference ?? null,
    });
    if (error) throw error;
    return { ok: true as const };
  });
