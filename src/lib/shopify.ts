// Catalog module — backed by Lovable Cloud (Supabase).
// The type shape mirrors the old Shopify Storefront responses so every
// existing consumer (ProductCard, ProductGrid, product detail, cart) keeps
// working unchanged while we migrate off Shopify.
import { supabase } from "@/integrations/supabase/client";

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  priceRange: { minVariantPrice: ShopifyMoney };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
}

export interface ShopifyProduct {
  node: ShopifyProductNode;
}

// ---------------------------------------------------------------
// Query-string parser (kept for compatibility with getCollectionMeta,
// which historically returns Shopify Storefront search syntax).
// Supports: vendor:"..."   product_type:"..."   tag:"..."
// ---------------------------------------------------------------
function parseCatalogQuery(q?: string | null): {
  vendor?: string;
  productType?: string;
  tags: string[];
} {
  if (!q) return { tags: [] };
  const tags: string[] = [];
  let vendor: string | undefined;
  let productType: string | undefined;
  const re = /(vendor|product_type|tag):"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(q)) !== null) {
    const key = m[1];
    const val = m[2];
    if (key === "vendor") vendor = val;
    else if (key === "product_type") productType = val;
    else tags.push(val);
  }
  return { vendor, productType, tags };
}

interface DbProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string | null;
  product_type: string | null;
  tags: string[];
  min_price: number;
  currency: string;
  hero_image: string | null;
}

interface DbImage { id: string; url: string; alt: string | null; position: number }
interface DbOption { id: string; name: string; values: string[]; position: number }
interface DbVariant {
  id: string;
  title: string;
  price: number;
  currency: string;
  available: boolean;
  selected_options: Array<{ name: string; value: string }>;
  position: number;
}

function mapProduct(
  p: DbProduct,
  images: DbImage[],
  options: DbOption[],
  variants: DbVariant[],
): ShopifyProduct {
  const sortedImgs = [...images].sort((a, b) => a.position - b.position);
  const sortedVars = [...variants].sort((a, b) => a.position - b.position);
  const sortedOpts = [...options].sort((a, b) => a.position - b.position);
  return {
    node: {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description ?? "",
      vendor: p.vendor ?? undefined,
      productType: p.product_type ?? undefined,
      tags: p.tags ?? [],
      priceRange: {
        minVariantPrice: {
          amount: String(p.min_price ?? 0),
          currencyCode: p.currency || "USD",
        },
      },
      images: {
        edges: sortedImgs.map((i) => ({ node: { url: i.url, altText: i.alt } })),
      },
      variants: {
        edges: sortedVars.map((v) => ({
          node: {
            id: v.id,
            title: v.title,
            price: { amount: String(v.price), currencyCode: v.currency || p.currency || "USD" },
            availableForSale: v.available,
            selectedOptions: v.selected_options ?? [],
          },
        })),
      },
      options: sortedOpts.map((o) => ({ name: o.name, values: o.values ?? [] })),
    },
  };
}

async function loadRelated(productIds: string[]) {
  if (productIds.length === 0) {
    return { imgs: [], opts: [], vars: [] };
  }
  const [imgsRes, optsRes, varsRes] = await Promise.all([
    supabase.from("product_images").select("*").in("product_id", productIds),
    supabase.from("product_options").select("*").in("product_id", productIds),
    supabase.from("product_variants").select("*").in("product_id", productIds),
  ]);
  return {
    imgs: (imgsRes.data ?? []) as Array<DbImage & { product_id: string }>,
    opts: (optsRes.data ?? []) as Array<DbOption & { product_id: string }>,
    vars: (varsRes.data ?? []) as Array<DbVariant & { product_id: string }>,
  };
}

export async function fetchProducts(
  opts: { first?: number; query?: string } = {},
): Promise<ShopifyProduct[]> {
  const { first = 24, query } = opts;
  const parsed = parseCatalogQuery(query);

  let req = supabase
    .from("products")
    .select("id, handle, title, description, vendor, product_type, tags, min_price, currency, hero_image")
    .eq("status", "active")
    .order("position", { ascending: true })
    .limit(first);

  if (parsed.vendor) req = req.eq("vendor", parsed.vendor);
  if (parsed.productType) req = req.eq("product_type", parsed.productType);
  if (parsed.tags.length > 0) req = req.contains("tags", parsed.tags);

  const { data, error } = await req;
  if (error) {
    console.error("fetchProducts error", error);
    return [];
  }
  const products = (data ?? []) as DbProduct[];
  const ids = products.map((p) => p.id);
  const { imgs, opts: allOpts, vars } = await loadRelated(ids);

  return products.map((p) =>
    mapProduct(
      p,
      imgs.filter((i) => i.product_id === p.id),
      allOpts.filter((o) => o.product_id === p.id),
      vars.filter((v) => v.product_id === p.id),
    ),
  );
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, handle, title, description, vendor, product_type, tags, min_price, currency, hero_image")
    .eq("handle", handle)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  const p = data as DbProduct;
  const { imgs, opts, vars } = await loadRelated([p.id]);
  return mapProduct(p, imgs, opts, vars).node;
}

// ============================================================
// Collection metadata (unchanged public API — routes keep working)
// The "query" string uses Shopify-style tokens which we now parse
// into Supabase filters in fetchProducts.
// ============================================================
export type CollectionMeta = { title: string; query: string; description?: string };

const KICKS_TYPE: Record<string, string> = {
  street: "Street Kicks",
  classic: "Classic Kicks",
  casual: "Casual Kicks",
};

const DRIP_CATEGORY_LABEL: Record<string, string> = {
  work: "Work Drip",
  party: "Party Drip",
  casual: "Casual Drip",
  street: "Street Drip",
  vacay: "Vacay Drip",
  sport: "Sport Drip",
  crown: "Crown Drip",
  extra: "Extra Drip",
};

const BARE_CATEGORY_LABEL: Record<string, string> = {
  swimwear: "Swimwear",
  underwear: "Underwear",
  lingerie: "Lingerie",
};

function titleize(slug: string) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}

const STATIC_MAP: Record<string, CollectionMeta> = {
  "frass-kicks": { title: "Frass Kicks", query: 'vendor:"FRASS KICKS"', description: "The complete footwear collection." },
  "frass-kicks-men": { title: "Men's Footwear", query: 'vendor:"FRASS KICKS" tag:"Men\'s"' },
  "frass-kicks-women": { title: "Women's Footwear", query: 'vendor:"FRASS KICKS" tag:"Women\'s"' },
  "frass-drip": { title: "Frass Drip", query: 'tag:"frass-drip"', description: "Fashion-forward apparel." },
  "frass-drip-men": { title: "Men's Frass Drip", query: 'tag:"frass-drip" tag:"men"' },
  "frass-drip-women": { title: "Women's Frass Drip", query: 'tag:"frass-drip" tag:"women"' },
  "bare-drip": { title: "Bare Drip", query: 'tag:"bare-drip"', description: "Swim, underwear & lingerie." },
  "mens-bare-drip": { title: "Men's Bare Drip", query: 'tag:"bare-drip" tag:"men"' },
  "womens-bare-drip": { title: "Women's Bare Drip", query: 'tag:"bare-drip" tag:"women"' },
  "new-arrivals": { title: "New Arrivals", query: 'vendor:"FRASS KICKS"' },
  "best-sellers": { title: "Best Sellers", query: 'vendor:"FRASS KICKS"' },
};

export function getCollectionMeta(handle: string): CollectionMeta {
  const exact = STATIC_MAP[handle];
  if (exact) return exact;

  const kicks = handle.match(/^(street|classic|casual)-kicks-(men|women)$/);
  if (kicks) {
    const [, type, gender] = kicks;
    const genderTitle = gender === "men" ? "Men's" : "Women's";
    const genderTag = gender === "men" ? `tag:"Men's"` : `tag:"Women's"`;
    return {
      title: `${genderTitle} ${KICKS_TYPE[type]}`,
      query: `vendor:"FRASS KICKS" ${genderTag} product_type:"${KICKS_TYPE[type]}"`,
    };
  }

  const dripCat = handle.match(/^(mens|womens)-(work|party|casual|street|vacay|sport|crown|extra)-drip$/);
  if (dripCat) {
    const [, gender, cat] = dripCat;
    const genderKey = gender === "mens" ? "men" : "women";
    const genderTitle = gender === "mens" ? "Men's" : "Women's";
    return {
      title: `${genderTitle} ${DRIP_CATEGORY_LABEL[cat]}`,
      query: `tag:"frass-drip" tag:"${genderKey}" tag:"${cat}-drip"`,
    };
  }

  const dripSub = handle.match(/^(mens|womens)-(work|party|casual|street|vacay|sport|crown|extra)-drip-(.+)$/);
  if (dripSub) {
    const [, gender, cat, sub] = dripSub;
    const genderKey = gender === "mens" ? "men" : "women";
    const genderTitle = gender === "mens" ? "Men's" : "Women's";
    return {
      title: `${genderTitle} ${titleize(sub)}`,
      query: `tag:"frass-drip" tag:"${genderKey}" tag:"${cat}-drip" tag:"${sub}"`,
      description: `Part of ${genderTitle} ${DRIP_CATEGORY_LABEL[cat]}.`,
    };
  }

  const bareCat = handle.match(/^(mens|womens)-bare-drip-(swimwear|underwear|lingerie)$/);
  if (bareCat) {
    const [, gender, cat] = bareCat;
    const genderKey = gender === "mens" ? "men" : "women";
    const genderTitle = gender === "mens" ? "Men's" : "Women's";
    return {
      title: `${genderTitle} ${BARE_CATEGORY_LABEL[cat]}`,
      query: `tag:"bare-drip" tag:"${genderKey}" tag:"${cat}"`,
    };
  }

  const bareSub = handle.match(/^(mens|womens)-bare-drip-(swimwear|underwear|lingerie)-(.+)$/);
  if (bareSub) {
    const [, gender, cat, sub] = bareSub;
    const genderKey = gender === "mens" ? "men" : "women";
    const genderTitle = gender === "mens" ? "Men's" : "Women's";
    return {
      title: `${genderTitle} ${titleize(sub)}`,
      query: `tag:"bare-drip" tag:"${genderKey}" tag:"${cat}" tag:"${sub}"`,
      description: `Part of ${genderTitle} Bare Drip ${BARE_CATEGORY_LABEL[cat]}.`,
    };
  }

  return { title: titleize(handle), query: `tag:"${handle}"` };
}
