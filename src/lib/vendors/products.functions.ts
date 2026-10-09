// Universal Vendor Phase A — server functions for the canonical product foundation.
// Every rule is ALSO enforced in the database (row rules + guard triggers);
// these functions are a thin, validated door, never the only lock.
// Founder decisions run inside one database function so the status change and
// the founder_audit_ledger entry succeed or fail together.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const VENDOR_KINDS = ["supplier", "artisan", "pod", "frass_brand", "designer"] as const;
export const FULFILLMENT_MODES = ["stocked", "dropship", "pod", "made_to_order", "made_to_measure"] as const;
export const SOURCE_TYPES = ["cj", "artisan", "pod", "manual", "frass_brand"] as const;
/** Vendors may only move their own drafts between these states. */
export const VENDOR_SETTABLE_DRAFT_STATUSES = ["draft", "prepared", "founder_review"] as const;

export const createVendorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ displayName: z.string().trim().min(1).max(160), vendorKind: z.enum(VENDOR_KINDS) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("vendor_profiles")
      .insert({ owner_id: context.userId, display_name: data.displayName, vendor_kind: data.vendorKind })
      .select("id, display_name, vendor_kind, verification_status")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/**
 * The member's own vendor workspace. Identity is the ONE existing member:
 * the same auth account, profile handle/bio and Frass Card — no second
 * onboarding. partner_vendors free-text IDs are never used as authority here.
 */
export const listMyVendorWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [{ data: profile }, { data: card }, { data: vendors, error }] = await Promise.all([
      sb.from("profiles").select("display_name, handle, bio").eq("id", context.userId).maybeSingle(),
      sb.from("business_cards").select("is_published, commerce_enabled").eq("user_id", context.userId).maybeSingle(),
      sb
        .from("vendor_profiles")
        .select("id, display_name, vendor_kind, verification_status, verified_at, created_at")
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: true }),
    ]);
    if (error) throw new Error(error.message);
    const identity = {
      displayName: profile?.display_name ?? null,
      handle: profile?.handle ?? null,
      bio: profile?.bio ?? null,
      cardPublished: card?.is_published ?? false,
      cardCommerceEnabled: card?.commerce_enabled ?? false,
    };
    const ids = (vendors ?? []).map((v) => v.id);
    if (ids.length === 0) return { identity, vendors: [], products: [] };
    const { data: products, error: pErr } = await sb
      .from("canonical_products")
      .select("id, vendor_id, title, primary_store, overlays, draft_status, publication_status, vendor_offers(id, sku, unit_cost, currency, stock_quantity, lead_time_min_days, lead_time_max_days, fulfillment_mode, ip_protection_level, active), product_sources(source_type, source_ref)")
      .in("vendor_id", ids)
      .order("created_at", { ascending: false })
      .limit(200);
    if (pErr) throw new Error(pErr.message);
    return { identity, vendors: vendors ?? [], products: products ?? [] };
  });

/** Founder: vendors waiting for (or holding) a verification decision. */
export const founderListVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isFounder } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isFounder !== true) return [];
    const { data, error } = await context.supabase
      .from("vendor_profiles")
      .select("id, display_name, vendor_kind, verification_status, verified_at, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createProductDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        vendorId: z.string().uuid(),
        title: z.string().trim().min(1).max(200),
        description: z.string().max(5000).default(""),
        source: z.object({ type: z.enum(SOURCE_TYPES), ref: z.string().trim().min(1).max(300) }),
        offer: z
          .object({
            sku: z.string().max(120).optional(),
            unitCost: z.number().min(0).max(1_000_000).optional(),
            currency: z.string().length(3).default("USD"),
            stockQuantity: z.number().int().min(0).optional(),
            leadTimeMinDays: z.number().int().min(0).max(365).optional(),
            leadTimeMaxDays: z.number().int().min(0).max(365).optional(),
            fulfillmentMode: z.enum(FULFILLMENT_MODES),
            ipProtectionLevel: z.string().max(40).default("standard"),
          })
          .optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    // One database transaction (create_product_draft): product, source and
    // offer are saved together or not at all — no orphan drafts.
    const o = data.offer;
    const { data: productId, error } = await context.supabase.rpc("create_product_draft", {
      _vendor_id: data.vendorId,
      _title: data.title,
      _description: data.description,
      _source_type: data.source.type,
      _source_ref: data.source.ref,
      _offer: o
        ? {
            sku: o.sku ?? null,
            unit_cost: o.unitCost ?? null,
            currency: o.currency,
            stock_quantity: o.stockQuantity ?? null,
            lead_time_min_days: o.leadTimeMinDays ?? null,
            lead_time_max_days: o.leadTimeMaxDays ?? null,
            fulfillment_mode: o.fulfillmentMode,
            ip_protection_level: o.ipProtectionLevel,
          }
        : undefined,
    });
    if (error) {
      if (error.code === "23505") throw new Error("This source is already linked to a product.");
      throw new Error(error.message);
    }
    return { id: productId as string, draft_status: "draft" as const, publication_status: "unpublished" as const };
  });

/** Vendor moves its own draft (draft ↔ prepared → founder_review). Never approve/publish. */
export const setMyDraftStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ productId: z.string().uuid(), status: z.enum(VENDOR_SETTABLE_DRAFT_STATUSES) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("canonical_products")
      .update({ draft_status: data.status })
      .eq("id", data.productId)
      .select("id, draft_status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found.");
    return row;
  });

export const founderSetVendorVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({ vendorId: z.string().uuid(), status: z.enum(["verified", "suspended", "pending"]), note: z.string().max(2000).default("") })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: isFounder } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isFounder !== true) throw new Error("Founder access only.");
    const { data: res, error } = await context.supabase.rpc("founder_set_vendor_verification", {
      _vendor_id: data.vendorId,
      _status: data.status,
      _note: data.note,
    });
    if (error) throw new Error(error.message);
    return res;
  });

export const founderDecideProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({ productId: z.string().uuid(), decision: z.enum(["approved", "rejected"]), note: z.string().max(2000).default("") })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: isFounder } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isFounder !== true) throw new Error("Founder access only.");
    const { data: res, error } = await context.supabase.rpc("founder_decide_product", {
      _product_id: data.productId,
      _decision: data.decision,
      _note: data.note,
    });
    if (error) throw new Error(error.message);
    return res;
  });

export const founderListReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isFounder } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isFounder !== true) return [];
    const { data, error } = await context.supabase
      .from("canonical_products")
      .select("id, title, draft_status, publication_status, vendor_profiles(display_name, verification_status), vendor_offers(sku, unit_cost, currency, fulfillment_mode, lead_time_min_days, lead_time_max_days), product_sources(source_type, source_ref)")
      .eq("draft_status", "founder_review")
      .order("updated_at", { ascending: true })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
