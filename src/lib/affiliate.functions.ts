import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_POLICY,
  analyzeProduct,
  type AffiliatePolicy,
  type ProductEconomics,
} from "@/lib/affiliate-intelligence";

type Db = { from: (t: string) => any; rpc: (n: string, a?: unknown) => any };

export type EconomicsRow = ProductEconomics & {
  id: string;
  created_at: string;
  updated_at: string;
};

export type AffiliateCampaign = {
  id: string;
  economics_id: string | null;
  name: string;
  kind: string;
  commission_rate: number;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
};

export const getAffiliatePolicy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AffiliatePolicy> => {
    const sb = context.supabase as unknown as Db;
    const { data } = await sb.from("affiliate_policy").select("*").limit(1).maybeSingle();
    return { ...DEFAULT_POLICY, ...(data ?? {}) } as AffiliatePolicy;
  });

export const updateAffiliatePolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<AffiliatePolicy>) => input)
  .handler(async ({ data, context }): Promise<AffiliatePolicy> => {
    const sb = context.supabase as unknown as Db;
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuper } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuper) throw new Error("Only the Founder can change the affiliate framework.");

    const patch: Record<string, unknown> = {};
    const numeric = [
      "platform_allocation_rate",
      "min_commission_rate",
      "max_commission_rate",
      "default_commission_rate",
      "default_min_margin_pct",
      "promo_max_commission_rate",
    ] as const;
    for (const key of numeric) {
      const v = (data as Record<string, unknown>)[key];
      if (v !== undefined && v !== null && v !== "") patch[key] = Number(v);
    }
    for (const key of ["promo_label", "promo_starts_at", "promo_ends_at"] as const) {
      const v = (data as Record<string, unknown>)[key];
      if (v !== undefined) patch[key] = v === "" ? null : v;
    }
    for (const key of [
      "marketplace_launched",
      "approved_products_available",
      "approved_brand_partners_available",
      "internal_campaigns_ready",
      "affiliate_marketing_activated",
    ] as const) {
      const value = data[key];
      if (typeof value === "boolean") patch[key] = value;
    }

    const { data: row, error } = await sb
      .from("affiliate_policy")
      .update(patch)
      .eq("id", true)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as AffiliatePolicy;
  });

export const listProductEconomics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EconomicsRow[]> => {
    const sb = context.supabase as unknown as Db;
    const { data, error } = await sb
      .from("product_economics")
      .select("*")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as EconomicsRow[];
  });

export const saveProductEconomics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<ProductEconomics> & { id?: string }) => {
    const title = (input.title ?? "").trim();
    if (!title) throw new Error("Give the product a name.");
    const ref = (input.product_ref ?? "").trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { ...input, title, product_ref: ref };
  })
  .handler(async ({ data, context }): Promise<EconomicsRow> => {
    const sb = context.supabase as unknown as Db;
    const { data: policyRow } = await sb.from("affiliate_policy").select("*").limit(1).maybeSingle();
    const policy = { ...DEFAULT_POLICY, ...(policyRow ?? {}) } as AffiliatePolicy;

    const num = (v: unknown, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    const payload: Record<string, unknown> = {
      user_id: context.userId,
      product_ref: data.product_ref,
      title: data.title,
      currency: data.currency ?? "USD",
      selling_price: num(data.selling_price),
      cost_of_goods: num(data.cost_of_goods),
      packaging_cost: num(data.packaging_cost),
      shipping_cost: num(data.shipping_cost),
      other_cost: num(data.other_cost),
      payment_fee_pct: num(data.payment_fee_pct, 2.9),
      payment_fee_fixed: num(data.payment_fee_fixed, 0.3),
      marketplace_fee_pct: num(data.marketplace_fee_pct),
      tax_pct: num(data.tax_pct),
      discount_pct: num(data.discount_pct),
      target_margin_pct: num(data.target_margin_pct, policy.default_min_margin_pct),
      estimated_monthly_units: Math.max(0, Math.round(num(data.estimated_monthly_units))),
      notes: data.notes ?? null,
    };

    // Profit protection is enforced server-side: the stored commission can never
    // exceed the sustainable maximum Frassy calculated for this product.
    const analysis = analyzeProduct(payload as unknown as ProductEconomics, policy);
    const requested = data.commission_rate == null ? null : num(data.commission_rate);
    const enabled = Boolean(data.affiliate_enabled) && analysis.viable;
    payload["affiliate_enabled"] = enabled;
    payload["commission_rate"] =
      enabled && requested != null
        ? Math.min(Math.max(requested, 0), analysis.maxRate)
        : enabled
          ? analysis.recommendedRate
          : null;

    const { data: row, error } = await sb
      .from("product_economics")
      .upsert(payload, { onConflict: "user_id,product_ref" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as EconomicsRow;
  });

export const deleteProductEconomics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { error } = await sb
      .from("product_economics")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAffiliateCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AffiliateCampaign[]> => {
    const sb = context.supabase as unknown as Db;
    const { data, error } = await sb
      .from("affiliate_campaigns")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AffiliateCampaign[];
  });

export const saveAffiliateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string;
      economics_id: string;
      name: string;
      kind?: string;
      commission_rate: number | string;
      starts_at?: string | null;
      ends_at?: string | null;
      status?: string;
    }) => {
      const name = (input.name ?? "").trim();
      if (!name) throw new Error("Name the campaign.");
      if (!input.economics_id) throw new Error("Pick which product this campaign is for.");
      return { ...input, name };
    },
  )
  .handler(async ({ data, context }): Promise<AffiliateCampaign> => {
    const sb = context.supabase as unknown as Db;
    const { data: policyRow } = await sb.from("affiliate_policy").select("*").limit(1).maybeSingle();
    const policy = { ...DEFAULT_POLICY, ...(policyRow ?? {}) } as AffiliatePolicy;

    const { data: econ, error: econErr } = await sb
      .from("product_economics")
      .select("*")
      .eq("id", data.economics_id)
      .eq("user_id", context.userId)
      .single();
    if (econErr || !econ) throw new Error("That product is not in your workspace.");

    const analysis = analyzeProduct(econ as ProductEconomics, policy);
    if (!analysis.viable) {
      throw new Error(
        "This product cannot safely carry an affiliate commission yet. Raise the price or lower costs first.",
      );
    }
    const rate = Math.min(Math.max(Number(data.commission_rate) || 0, 0), analysis.maxRate);

    const payload = {
      id: data.id,
      user_id: context.userId,
      economics_id: data.economics_id,
      name: data.name,
      kind: data.kind ?? "standard",
      commission_rate: rate,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
      status: data.status ?? "active",
    };
    const { data: row, error } = await sb
      .from("affiliate_campaigns")
      .upsert(payload)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as AffiliateCampaign;
  });

export const deleteAffiliateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { error } = await sb
      .from("affiliate_campaigns")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
