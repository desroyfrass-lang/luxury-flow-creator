import { supabase } from "@/integrations/supabase/client";

export interface CapsuleRow {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  style: string | null;
  gender: string | null;
  occasion: string | null;
  season: string | null;
  hero_image: string | null;
  collection: string | null;
  bundle_discount_pct: number;
  published: boolean;
  position: number;
}

export interface CapsuleItemProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  product_type: string | null;
  min_price: number;
  currency: string;
  hero_image: string | null;
  description: string;
}

export interface CapsuleItemVariant {
  id: string;
  title: string;
  price: number;
  currency: string;
  available: boolean;
  selected_options: Array<{ name: string; value: string }>;
}

export interface CapsuleItem {
  id: string;
  slot: string;
  position: number;
  required: boolean;
  variant_id: string | null;
  product: CapsuleItemProduct;
  default_variant: CapsuleItemVariant | null;
  primary_image: string | null;
}

export interface CapsuleDetail extends CapsuleRow {
  items: CapsuleItem[];
  total_price: number;
  discounted_price: number;
  currency: string;
}

export async function fetchPublishedCapsules(): Promise<CapsuleRow[]> {
  const { data, error } = await supabase
    .from("capsules")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) {
    console.error("fetchPublishedCapsules", error);
    return [];
  }
  return data as CapsuleRow[];
}

export async function fetchCapsuleByHandle(handle: string): Promise<CapsuleDetail | null> {
  const { data: cap, error } = await supabase
    .from("capsules")
    .select("*")
    .eq("handle", handle)
    .eq("published", true)
    .maybeSingle();
  if (error || !cap) return null;

  const { data: items } = await supabase
    .from("capsule_items")
    .select("*")
    .eq("capsule_id", cap.id)
    .order("position", { ascending: true });

  if (!items || items.length === 0) {
    return { ...(cap as CapsuleRow), items: [], total_price: 0, discounted_price: 0, currency: "USD" };
  }

  const productIds = [...new Set(items.map((i) => i.product_id))];
  const variantIds = items.map((i) => i.variant_id).filter((v): v is string => !!v);

  const [prodRes, imgRes, varRes] = await Promise.all([
    supabase.from("products").select("id, handle, title, vendor, product_type, min_price, currency, hero_image, description").in("id", productIds),
    supabase.from("product_images").select("product_id, url, position").in("product_id", productIds).order("position", { ascending: true }),
    variantIds.length
      ? supabase.from("product_variants").select("id, title, price, currency, available, selected_options").in("id", variantIds)
      : Promise.resolve({ data: [] as never[], error: null }),
  ]);

  const prodMap = new Map<string, CapsuleItemProduct>();
  (prodRes.data ?? []).forEach((p) => prodMap.set(p.id, p as CapsuleItemProduct));

  const firstImage = new Map<string, string>();
  (imgRes.data ?? []).forEach((im) => {
    if (!firstImage.has(im.product_id)) firstImage.set(im.product_id, im.url);
  });

  const varMap = new Map<string, CapsuleItemVariant>();
  (varRes.data ?? []).forEach((v) => varMap.set(v.id, v as unknown as CapsuleItemVariant));

  const enriched: CapsuleItem[] = items
    .map((i) => {
      const product = prodMap.get(i.product_id);
      if (!product) return null;
      return {
        id: i.id,
        slot: i.slot,
        position: i.position,
        required: i.required,
        variant_id: i.variant_id,
        product,
        default_variant: i.variant_id ? varMap.get(i.variant_id) ?? null : null,
        primary_image: firstImage.get(i.product_id) ?? product.hero_image ?? null,
      } as CapsuleItem;
    })
    .filter((x): x is CapsuleItem => x !== null);

  const currency = enriched[0]?.product.currency ?? "USD";
  const total = enriched.reduce((s, it) => s + (it.default_variant?.price ?? it.product.min_price ?? 0), 0);
  const discount = Number(cap.bundle_discount_pct ?? 0) / 100;
  const discounted = Math.round((total * (1 - discount)) * 100) / 100;

  return {
    ...(cap as CapsuleRow),
    items: enriched,
    total_price: total,
    discounted_price: discounted,
    currency,
  };
}
