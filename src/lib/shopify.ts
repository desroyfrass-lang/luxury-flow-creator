// Headless Shopify integration — Storefront API.
// Lovable owns the frontend; Shopify owns products, inventory, cart, and checkout.

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "3hekgw-kr.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "6ee86780a35c2ce25a4c9e8878ba3d99";

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

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  products: { edges: ShopifyProduct[] };
}

// ------------------------------------------------------------------
// Storefront API request helper
// ------------------------------------------------------------------
export async function storefrontApiRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    throw new Error("Shopify: Payment required — store needs an active Shopify plan.");
  }

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { errors?: Array<{ message: string }>; data?: T };

  if (data.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${data.errors.map((e) => e.message).join(", ")}`);
  }

  return data.data as T;
}

// ------------------------------------------------------------------
// GraphQL ID helpers
// ------------------------------------------------------------------
export function toVariantGid(numericId: string | number) {
  return `gid://shopify/ProductVariant/${numericId}`;
}

export function fromVariantGid(gid: string) {
  const m = gid.match(/ProductVariant\/(\d+)$/);
  return m?.[1] ?? gid;
}

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------
const PRODUCT_FRAGMENT = `
  id
  title
  description
  handle
  vendor
  productType
  tags
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 5) {
    edges {
      node {
        url
        altText
      }
    }
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        price {
          amount
          currencyCode
        }
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
  }
  options {
    name
    values
  }
`;

const STOREFRONT_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          ${PRODUCT_FRAGMENT}
        }
      }
    }
  }
`;

const STOREFRONT_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FRAGMENT}
    }
  }
`;

// ------------------------------------------------------------------
// Fetch products
// ------------------------------------------------------------------
export async function fetchProducts(
  opts: { first?: number; query?: string } = {},
): Promise<ShopifyProduct[]> {
  const { first = 24, query } = opts;
  const data = await storefrontApiRequest<{
    products: { edges: ShopifyProduct[] };
  }>(STOREFRONT_PRODUCTS_QUERY, { first, query: query || null });

  return data?.products?.edges ?? [];
}

// ------------------------------------------------------------------
// Fetch single product by handle
// ------------------------------------------------------------------
export async function fetchProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  const data = await storefrontApiRequest<{
    product: ShopifyProductNode | null;
  }>(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });

  return data?.product ?? null;
}

// ============================================================
// Collection metadata (kept for route compatibility)
// The "query" string uses Shopify Storefront search syntax:
//   vendor:"..."   product_type:"..."   tag:"..."
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
  "frass-kicks": {
    title: "Frass Kicks",
    query: 'vendor:"FRASS KICKS"',
    description: "The complete footwear collection.",
  },
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
