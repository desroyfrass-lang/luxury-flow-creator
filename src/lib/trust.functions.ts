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

/* ── FRASS-0493 — Trust & Reputation Engine ──────────────────────────────── */

/**
 * The Trust Profile. Verified facts, no score, no ranking.
 *
 * It extends the existing card/profile/verifications architecture — nothing
 * here is a second identity, and popularity signals are never read.
 */
export type TrustProfile = {
  handle: string;
  name: string;
  stage: import("@/lib/trust").BuilderStage;
  monthsActive: number;
  memberSince: string | null;
  facts: import("@/lib/trust").TrustFact[];
  completedTransactions: number;
  commitmentsMet: number;
  commitmentsTotal: number;
  feedback: {
    id: string;
    experience: "positive" | "mixed" | "negative";
    body: string | null;
    source: string;
    createdAt: string;
    author: string;
  }[];
  positiveCount: number;
  distinctCustomers: number;
};

function monthsBetween(iso: string | null | undefined): number {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24 * 30.44)));
}

export const getTrustProfile = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => z.object({ handle: z.string().max(40) }).parse(d))
  .handler(async ({ data }): Promise<TrustProfile | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const {
      TRUST_BADGES: BADGES,
      builderStage,
      FEEDBACK_SOURCES,
      reliabilityLabel,
    } = await import("@/lib/trust");

    const handle = data.handle.replace(/^@/, "").toLowerCase();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("handle", handle)
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;

    const [{ data: verifications }, { data: orders }, { data: feedbackRows }, { data: founding }] =
      await Promise.all([
        supabaseAdmin.from("trust_verifications").select("badge").eq("user_id", profile.id),
        supabaseAdmin
          .from("card_orders")
          .select("id, status, buyer_email")
          .eq("seller_id", profile.id),
        supabaseAdmin
          .from("verified_feedback")
          .select("id, experience, body, source, created_at, author_id")
          .eq("subject_id", profile.id)
          .eq("is_published", true)
          .eq("removed_by_founder", false)
          .order("created_at", { ascending: false })
          .limit(20),
        supabaseAdmin
          .from("founding_partners")
          .select("sequence, visibility, accepted_at")
          .eq("user_id", profile.id)
          .maybeSingle(),
      ]);

    const all = orders ?? [];
    const completedStatuses = ["paid", "fulfilled", "completed"];
    const completed = all.filter((o) => completedStatuses.includes(o.status ?? ""));
    const commitmentsTotal = all.filter((o) =>
      [...completedStatuses, "cancelled", "refunded", "failed"].includes(o.status ?? ""),
    ).length;
    // Orders identify a customer by email, so distinct people means distinct emails.
    const distinctCustomers = new Set(
      completed.map((o) => (o.buyer_email ?? "").toLowerCase()).filter(Boolean),
    ).size;

    const monthsActive = monthsBetween(profile.created_at);
    const stage = builderStage(completed.length, monthsActive);

    // Author names, so feedback reads like a person rather than a UUID.
    const authorIds = [...new Set((feedbackRows ?? []).map((f) => f.author_id))];
    const { data: authors } = authorIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", authorIds)
      : { data: [] as { id: string; display_name: string | null }[] };
    const nameOf = new Map((authors ?? []).map((a) => [a.id, a.display_name ?? "A verified customer"]));

    const positive = (feedbackRows ?? []).filter((f) => f.experience === "positive").length;

    const facts: import("@/lib/trust").TrustFact[] = [];
    for (const v of verifications ?? []) {
      const badge = BADGES[v.badge as keyof typeof BADGES];
      if (badge) facts.push({ icon: "✔️", label: badge.label, plain: badge.plain });
    }
    if (completed.length > 0) {
      facts.push({
        icon: "✔️",
        label: `${completed.length} successful ${completed.length === 1 ? "transaction" : "transactions"}`,
        plain: "Each one a real order that was paid for and fulfilled through Frass.",
      });
    }
    const reliability = reliabilityLabel(completed.length, commitmentsTotal);
    if (reliability) {
      facts.push({
        icon: "✔️",
        label: reliability,
        plain: "Orders accepted and then seen through to the end.",
      });
    }
    if (distinctCustomers > 0) {
      facts.push({
        icon: "✔️",
        label: `Trusted by ${distinctCustomers} verified ${distinctCustomers === 1 ? "customer" : "customers"}`,
        plain: "Different people, each with a completed transaction — not repeat clicks.",
      });
    }
    if (founding?.accepted_at && founding.visibility === "public") {
      facts.push({
        icon: "✔️",
        label: `First Partner No. ${founding.sequence}`,
        plain: "Recognised by the Founder as one of the first builders of Frass.",
      });
    }
    if (monthsActive >= 6) {
      facts.push({
        icon: "✔️",
        label: `${monthsActive} months on Frass`,
        plain: "Longevity is its own kind of reliability.",
      });
    }

    const sourceLabel = (id: string) =>
      FEEDBACK_SOURCES.find((s) => s.id === id)?.label ?? "Verified transaction";

    return {
      handle,
      name: profile.display_name ?? handle,
      stage,
      monthsActive,
      memberSince: profile.created_at ?? null,
      facts,
      completedTransactions: completed.length,
      commitmentsMet: completed.length,
      commitmentsTotal,
      positiveCount: positive,
      distinctCustomers,
      feedback: (feedbackRows ?? []).map((f) => ({
        id: f.id,
        experience: f.experience as "positive" | "mixed" | "negative",
        body: f.body,
        source: sourceLabel(f.source),
        createdAt: f.created_at,
        author: nameOf.get(f.author_id) ?? "A verified customer",
      })),
    };
  });

/**
 * Transactions this member completed with somebody else and can still speak
 * about. Feedback is offered here and nowhere else — you cannot review a
 * stranger, and you cannot review the same order twice.
 */
export const getFeedbackInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims?.email as string | undefined)?.toLowerCase();
    if (!email) return [] as { orderId: string; reference: string; sellerName: string; createdAt: string }[];

    const { data: orders } = await context.supabase
      .from("card_orders")
      .select("id, reference, seller_id, status, created_at")
      .ilike("buyer_email", email)
      .in("status", ["paid", "fulfilled", "completed"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!orders?.length) return [] as { orderId: string; reference: string; sellerName: string; createdAt: string }[];

    // Internal author/subject UUIDs are server-only; scope strictly to the caller.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: given } = await supabaseAdmin
      .from("verified_feedback")
      .select("source_id")
      .eq("author_id", context.userId);
    const already = new Set((given ?? []).map((g) => g.source_id));

    const sellerIds = [...new Set(orders.map((o) => o.seller_id).filter(Boolean))];
    const { data: sellers } = sellerIds.length
      ? await context.supabase.from("profiles").select("id, display_name").in("id", sellerIds)
      : { data: [] as { id: string; display_name: string | null }[] };
    const nameOf = new Map((sellers ?? []).map((s) => [s.id, s.display_name ?? "A Frass member"]));

    return orders
      .filter((o) => !already.has(o.id))
      .map((o) => ({
        orderId: o.id,
        reference: o.reference ?? o.id.slice(0, 8),
        sellerName: nameOf.get(o.seller_id as string) ?? "A Frass member",
        createdAt: o.created_at,
      }));
  });

export const leaveVerifiedFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; experience: string; body?: string }) =>
    z
      .object({
        orderId: z.string().uuid(),
        experience: z.enum(["positive", "mixed", "negative"]),
        body: z.string().trim().max(1200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    // The subject is derived from the order itself, never from the request.
    // Buyer email is never handed to a browser session: the match happens
    // entirely server-side against the verified token claim.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = (context.claims?.email as string | undefined)?.toLowerCase();
    const { data: order } = await supabaseAdmin
      .from("card_orders")
      .select("id, seller_id, buyer_email, status")
      .eq("id", data.orderId)
      .maybeSingle();

    if (!order || !email || (order.buyer_email ?? "").toLowerCase() !== email) {
      throw new Error("You can only leave feedback for your own completed transactions.");
    }

    const { error } = await context.supabase.from("verified_feedback").insert({
      subject_id: order.seller_id,
      author_id: context.userId,
      source: "marketplace_order",
      source_id: order.id,
      experience: data.experience,
      body: data.body || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** A member's own view: what is helping, what needs work. Nothing hidden. */
export const getMyTrustProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { builderStage, stageGuidance, BUILDER_STAGES } = await import("@/lib/trust");

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("created_at")
      .eq("id", context.userId)
      .maybeSingle();

    const { data: orders } = await context.supabase
      .from("card_orders")
      .select("id, status")
      .eq("seller_id", context.userId);

    const all = orders ?? [];
    const completed = all.filter((o) => ["paid", "fulfilled", "completed"].includes(o.status ?? ""));
    const open = all.filter((o) => ["pending", "awaiting_payment", "accepted"].includes(o.status ?? ""));
    const monthsActive = monthsBetween(profile?.created_at);
    const stage = builderStage(completed.length, monthsActive);

    // Internal subject UUID is server-only; scope strictly to the caller.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: feedback } = await supabaseAdmin
      .from("verified_feedback")
      .select("id, experience, body, created_at, is_published")
      .eq("subject_id", context.userId)
      .eq("removed_by_founder", false)
      .order("created_at", { ascending: false })
      .limit(20);

    const improvements: string[] = [];
    if (open.length > 0) {
      improvements.push(
        `Finish the ${open.length} ${open.length === 1 ? "commitment" : "commitments"} still open. Completing work is the single strongest trust signal on Frass.`,
      );
    }
    if ((feedback ?? []).some((f) => f.experience !== "positive")) {
      improvements.push(
        "Some feedback wasn't positive. It stays on your record, but a run of well-finished work sits above it over time — trust here recovers.",
      );
    }
    if (completed.length === 0) {
      improvements.push("Your first completed transaction is what turns a profile into a reputation.");
    }

    return {
      stage,
      stageLabel: BUILDER_STAGES[stage].label,
      stageIcon: BUILDER_STAGES[stage].icon,
      stagePlain: BUILDER_STAGES[stage].plain,
      guidance: stageGuidance(stage, completed.length, monthsActive),
      completed: completed.length,
      open: open.length,
      monthsActive,
      feedback: feedback ?? [],
      improvements,
    };
  });
