import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type BusinessCard = Database["public"]["Tables"]["business_cards"]["Row"];

const CustomLink = z.object({ label: z.string().max(80), url: z.string().max(600) });

const UpdateCardSchema = z.object({
  headline: z.string().max(200).nullable().optional(),
  job_title: z.string().max(120).nullable().optional(),
  company: z.string().max(160).nullable().optional(),
  hero_media_url: z.string().max(1000).nullable().optional(),
  background_url: z.string().max(1000).nullable().optional(),
  theme: z.enum(["midnight", "chrome", "island", "ivory"]).optional(),
  accent: z.enum(["gold", "chrome", "coral", "emerald", "violet"]).optional(),
  cta_label: z.string().max(60).nullable().optional(),
  cta_url: z.string().max(600).nullable().optional(),
  website: z.string().max(600).nullable().optional(),
  booking_url: z.string().max(600).nullable().optional(),
  calendar_url: z.string().max(600).nullable().optional(),
  business_hours: z.string().max(300).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  languages: z.array(z.string().max(60)).max(20).optional(),
  certifications: z.array(z.string().max(120)).max(20).optional(),
  social_links: z.record(z.string(), z.string().max(600)).optional(),
  custom_links: z.array(CustomLink).max(20).optional(),
  section_order: z.array(z.string().max(40)).max(10).optional(),
  is_published: z.boolean().optional(),
  show_contact: z.boolean().optional(),
});

/**
 * FRASS-0426 — every member automatically has a Living Business Card.
 * There is no "create card" step: the first read provisions it.
 */
export const getMyCard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("business_cards")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) return existing as BusinessCard;

    const { data, error } = await context.supabase
      .from("business_cards")
      .insert({ user_id: context.userId })
      .select()
      .single();
    if (error) throw error;
    return data as BusinessCard;
  });

export const updateMyCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof UpdateCardSchema>) => UpdateCardSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { data: card, error } = await context.supabase
      .from("business_cards")
      .upsert(
        { user_id: context.userId, ...(data as Record<string, unknown>) },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return card as BusinessCard;
  });

/**
 * Public read for a Living Business Card. Served with an explicit safe-column
 * projection — visitors never touch the profiles or cards tables directly.
 */
export const getPublicCard = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) => z.object({ handle: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, handle, bio, avatar_url, builder_stage, primary_district, about")
      .eq("handle", data.handle)
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;

    const { data: card } = await supabaseAdmin
      .from("business_cards")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (card && card.is_published === false) return null;

    const { data: live } = await supabaseAdmin
      .from("live_broadcasts")
      .select("id, title, status")
      .eq("host_id", profile.id)
      .eq("status", "live")
      .limit(1)
      .maybeSingle();

    const { data: affiliate } = await supabaseAdmin
      .from("affiliate_links")
      .select("token, destination_type, destination_handle")
      .eq("user_id", profile.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: products } = await supabaseAdmin
      .from("builder_products")
      .select("id, title, image_url, price")
      .eq("user_id", profile.id)
      .limit(4);

    return {
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        handle: profile.handle,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        builder_stage: profile.builder_stage,
        primary_district: profile.primary_district,
        about: profile.about,
      },
      card: (card ?? null) as BusinessCard | null,
      live: live ?? null,
      affiliate: affiliate ?? [],
      products: products ?? [],
    };
  });

/** Anyone can register a view, share, scan or click. Only the owner can read them. */
export const recordCardEvent = createServerFn({ method: "POST" })
  .inputValidator((d: { handle: string; kind: string; detail?: string }) =>
    z
      .object({
        handle: z.string().max(40),
        kind: z.enum([
          "view",
          "share",
          "qr_scan",
          "website_click",
          "affiliate_click",
          "marketplace_click",
          "message",
          "booking",
          "sale",
        ]),
        detail: z.string().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("handle", data.handle)
      .maybeSingle();
    if (!profile) return { ok: false as const };
    await supabaseAdmin
      .from("business_card_events")
      .insert({ card_user_id: profile.id, kind: data.kind, detail: data.detail ?? null });
    return { ok: true as const };
  });

/** Everything is measurable — the owner's own numbers, last 90 days. */
export const getMyCardAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const { data, error } = await context.supabase
      .from("business_card_events")
      .select("kind, created_at")
      .eq("card_user_id", context.userId)
      .gte("created_at", since);
    if (error) throw error;

    const totals: Record<string, number> = {};
    for (const row of data ?? []) totals[row.kind] = (totals[row.kind] ?? 0) + 1;
    return { totals, sampled: (data ?? []).length };
  });
