import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BONUS_RULES, stageRank, type ReferralStage } from "@/lib/frass-link";

/**
 * FRASS-0428 — the Welcome Link.
 * When someone joins through a member's permanent link, the platform remembers
 * who introduced them. The Human Link and the Digital Link stay connected.
 */
export const claimWelcomeLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { handle: string; source?: string; path?: string }) =>
    z
      .object({
        handle: z.string().trim().max(40),
        source: z.enum(["link", "qr", "card", "campaign", "affiliate"]).default("link"),
        path: z.string().max(300).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("link_referrals")
      .select("id")
      .eq("invited_user_id", context.userId)
      .maybeSingle();
    if (existing) return { ok: false as const, reason: "already_introduced" };

    const { data: referrer } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("handle", data.handle.replace(/^@/, "").toLowerCase())
      .maybeSingle();
    if (!referrer || referrer.id === context.userId) {
      return { ok: false as const, reason: "no_referrer" };
    }

    await supabaseAdmin.from("link_referrals").insert({
      referrer_id: referrer.id,
      invited_user_id: context.userId,
      source: data.source,
      stage: "signed_up",
      landing_path: data.path ?? null,
    });

    await supabaseAdmin
      .from("profiles")
      .update({ referred_by: referrer.id, referred_via: data.source })
      .eq("id", context.userId);

    return { ok: true as const };
  });

/** Who introduced me — the Human Link, shown honestly on both sides. */
export const getMyIntroducer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row } = await context.supabase
      .from("link_referrals")
      .select("referrer_id, source, created_at")
      .eq("invited_user_id", context.userId)
      .maybeSingle();
    if (!row) return null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, handle, avatar_url")
      .eq("id", row.referrer_id)
      .maybeSingle();

    return {
      source: row.source,
      created_at: row.created_at,
      display_name: profile?.display_name ?? "A Frass member",
      handle: profile?.handle ?? null,
      avatar_url: profile?.avatar_url ?? null,
    };
  });

/**
 * One dashboard: link analytics, recruitment progress and recruitment bonuses.
 * Milestones are re-evaluated on read, so progress is never stale — and only
 * ever moves forward.
 */
export const getMyLinkDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const me = context.userId;

    const { data: referrals } = await supabaseAdmin
      .from("link_referrals")
      .select("*")
      .eq("referrer_id", me)
      .order("created_at", { ascending: false });

    const rows = referrals ?? [];
    const invitedIds = rows.map((r) => r.invited_user_id).filter(Boolean) as string[];

    // ── Evaluate milestones ───────────────────────────────────────────────
    const profiles = invitedIds.length
      ? (
          await supabaseAdmin
            .from("profiles")
            .select("id, display_name, handle, avatar_url, onboarding_completed_at")
            .in("id", invitedIds)
        ).data ?? []
      : [];
    const roles = invitedIds.length
      ? (
          await supabaseAdmin
            .from("user_roles")
            .select("user_id, role, created_at")
            .in("user_id", invitedIds)
        ).data ?? []
      : [];
    const products = invitedIds.length
      ? (await supabaseAdmin.from("builder_products").select("user_id").in("user_id", invitedIds)).data ?? []
      : [];
    // FRASS-0429 — the relationship timeline needs the first real sale, if any.
    const salesRows = invitedIds.length
      ? (
          await supabaseAdmin
            .from("card_orders")
            .select("seller_id, created_at")
            .in("seller_id", invitedIds)
            .order("created_at", { ascending: true })
        ).data ?? []
      : [];

    const profileById = new Map(profiles.map((p) => [p.id, p]));
    const rolesByUser = new Map<string, string[]>();
    const roleDate = new Map<string, string>();
    for (const r of roles) {
      rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
      const key = `${r.user_id}:${r.role}`;
      if (!roleDate.has(key)) roleDate.set(key, r.created_at);
    }
    const hasBusiness = new Set(products.map((p) => p.user_id));
    const firstSale = new Map<string, string>();
    for (const s of salesRows) if (!firstSale.has(s.seller_id)) firstSale.set(s.seller_id, s.created_at);

    type TimelineEvent = { label: string; at: string };

    const enriched = [] as Array<{
      id: string;
      stage: ReferralStage;
      source: string;
      created_at: string;
      display_name: string;
      handle: string | null;
      avatar_url: string | null;
      events: TimelineEvent[];
    }>;

    for (const row of rows) {
      const p = row.invited_user_id ? profileById.get(row.invited_user_id) : null;
      const userRoles = row.invited_user_id ? rolesByUser.get(row.invited_user_id) ?? [] : [];

      let stage: ReferralStage = (row.stage as ReferralStage) ?? "signed_up";
      const advance = (next: ReferralStage) => {
        if (stageRank(next) > stageRank(stage)) stage = next;
      };
      if (p?.onboarding_completed_at) advance("qualified_member");
      if (userRoles.includes("affiliate")) advance("qualified_affiliate");
      if (userRoles.includes("partner") || userRoles.includes("ambassador")) advance("qualified_partner");
      if (row.invited_user_id && hasBusiness.has(row.invited_user_id)) advance("business_launched");

      if (stage !== row.stage) {
        await supabaseAdmin.from("link_referrals").update({ stage }).eq("id", row.id);
      }

      // A relationship, not a statistic — only moments that actually happened.
      const events: TimelineEvent[] = [{ label: "Joined through your link", at: row.created_at }];
      if (p?.onboarding_completed_at) events.push({ label: "Activated", at: p.onboarding_completed_at });
      const uid = row.invited_user_id;
      if (uid) {
        const affiliateAt = roleDate.get(`${uid}:affiliate`);
        if (affiliateAt) events.push({ label: "Became an affiliate", at: affiliateAt });
        const partnerAt = roleDate.get(`${uid}:partner`) ?? roleDate.get(`${uid}:ambassador`);
        if (partnerAt) events.push({ label: "Became a partner", at: partnerAt });
        const saleAt = firstSale.get(uid);
        if (saleAt) events.push({ label: "First sale", at: saleAt });
      }

      enriched.push({
        id: row.id,
        stage,
        source: row.source,
        created_at: row.created_at,
        display_name: p?.display_name ?? "A new member",
        handle: p?.handle ?? null,
        avatar_url: p?.avatar_url ?? null,
        events,
      });
    }


    // ── Award milestone bonuses (each one earned exactly once) ────────────
    const { data: existingBonuses } = await supabaseAdmin
      .from("recruitment_bonuses")
      .select("*")
      .eq("user_id", me);
    const held = new Set((existingBonuses ?? []).map((b) => `${b.referral_id}:${b.kind}`));

    const toAward: Array<{
      user_id: string;
      referral_id: string;
      kind: string;
      amount: number;
      status: string;
      note: string;
    }> = [];
    for (const r of enriched) {
      for (const rule of BONUS_RULES) {
        if (stageRank(r.stage) < stageRank(rule.stage)) continue;
        if (held.has(`${r.id}:${rule.kind}`)) continue;
        toAward.push({
          user_id: me,
          referral_id: r.id,
          kind: rule.kind,
          amount: rule.amount,
          status: "pending",
          note: rule.plain,
        });
      }
    }
    if (toAward.length) {
      await supabaseAdmin.from("recruitment_bonuses").insert(toAward);
    }

    const { data: bonuses } = await supabaseAdmin
      .from("recruitment_bonuses")
      .select("*")
      .eq("user_id", me)
      .order("created_at", { ascending: false });

    // Bonuses belong on the relationship timeline too.
    const byReferral = new Map(enriched.map((r) => [r.id, r]));
    for (const b of bonuses ?? []) {
      const target = b.referral_id ? byReferral.get(b.referral_id) : null;
      if (!target) continue;
      target.events.push({
        label: `${bonusLabel(b.kind)} · $${Number(b.amount ?? 0).toFixed(2)}`,
        at: b.created_at,
      });
    }
    for (const r of enriched) r.events.sort((a, b) => a.at.localeCompare(b.at));

    // ── Link analytics ────────────────────────────────────────────────────
    const { data: events } = await supabaseAdmin
      .from("business_card_events")
      .select("kind")
      .eq("card_user_id", me);
    const eventTotals: Record<string, number> = {};
    for (const e of events ?? []) eventTotals[e.kind] = (eventTotals[e.kind] ?? 0) + 1;

    const { data: affiliateLinks } = await supabaseAdmin
      .from("affiliate_links")
      .select("clicks")
      .eq("user_id", me);
    const affiliateClicks = (affiliateLinks ?? []).reduce((n, l) => n + (l.clicks ?? 0), 0);

    const stageCounts: Record<string, number> = {};
    for (const r of enriched) stageCounts[r.stage] = (stageCounts[r.stage] ?? 0) + 1;

    const earned = (bonuses ?? []).reduce((n, b) => n + Number(b.amount ?? 0), 0);
    const paid = (bonuses ?? [])
      .filter((b) => b.status === "paid")
      .reduce((n, b) => n + Number(b.amount ?? 0), 0);

    return {
      referrals: enriched,
      bonuses: bonuses ?? [],
      stageCounts,
      totals: {
        introduced: enriched.length,
        opens: (eventTotals["view"] ?? 0) + (eventTotals["qr_scan"] ?? 0),
        qrScans: eventTotals["qr_scan"] ?? 0,
        cardViews: eventTotals["view"] ?? 0,
        websiteClicks: eventTotals["website_click"] ?? 0,
        marketplaceClicks: eventTotals["marketplace_click"] ?? 0,
        affiliateClicks,
        sales: eventTotals["sale"] ?? 0,
        shares: eventTotals["share"] ?? 0,
        bonusesEarned: Math.round(earned * 100) / 100,
        bonusesPaid: Math.round(paid * 100) / 100,
      },
    };
  });
