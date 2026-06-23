import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "3hekgw-kr.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "6ee86780a35c2ce25a4c9e8878ba3d99";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

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

const PRODUCT_FRAGMENT = `
  id
  title
  description
  handle
  productType
  vendor
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 8) { edges { node { url altText } } }
  variants(first: 50) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) {
      edges { node { ${PRODUCT_FRAGMENT} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) { ${PRODUCT_FRAGMENT} }
  }
`;

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: T } | undefined> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active billing plan. Upgrade at https://admin.shopify.com",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`Shopify HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Shopify error: ${data.errors.map((e: any) => e.message).join(", ")}`);
  }
  return data;
}

export async function fetchProducts(opts: { first?: number; query?: string } = {}): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(PRODUCTS_QUERY, {
    first: opts.first ?? 24,
    query: opts.query ?? null,
  });
  return data?.data?.products?.edges ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  const data = await storefrontApiRequest<{ productByHandle: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return data?.data?.productByHandle ?? null;
}

/**
 * Maps URL collection handles to Shopify Storefront API search queries.
 * Easy to extend as the catalog grows.
 */
export const COLLECTION_MAP: Record<string, { title: string; query: string; description?: string }> = {
  // Frass Kicks (footwear)
  "frass-kicks": { title: "Frass Kicks", query: 'vendor:"FRASS KICKS"', description: "The complete footwear collection." },
  "frass-kicks-men": { title: "Men's Footwear", query: 'vendor:"FRASS KICKS"' },
  "frass-kicks-women": { title: "Women's Footwear", query: 'vendor:"FRASS KICKS"' },
  "frass-kicks-casual": { title: "Casual Kicks", query: 'product_type:"Casual Kicks"' },
  "frass-kicks-street": { title: "Street Kicks", query: 'product_type:"Street Kicks"' },
  "frass-kicks-classic": { title: "Classic Kicks", query: 'product_type:"Classic Kicks"' },
  "frass-kicks-men-casual": { title: "Men's Casual Kicks", query: 'product_type:"Casual Kicks"' },
  "frass-kicks-men-street": { title: "Men's Street Kicks", query: 'product_type:"Street Kicks"' },
  "frass-kicks-men-classic": { title: "Men's Classic Kicks", query: 'product_type:"Classic Kicks"' },
  "frass-kicks-women-casual": { title: "Women's Casual Kicks", query: 'product_type:"Casual Kicks"' },
  "frass-kicks-women-street": { title: "Women's Street Kicks", query: 'product_type:"Street Kicks"' },
  "frass-kicks-women-classic": { title: "Women's Classic Kicks", query: 'product_type:"Classic Kicks"' },
  // Frass Drip (apparel) — placeholders until you stock these
  "frass-drip": { title: "Frass Drip", query: 'tag:"frass-drip"' },
  "frass-drip-men": { title: "Men's Drip", query: 'tag:"frass-drip" tag:"men"' },
  "frass-drip-women": { title: "Women's Drip", query: 'tag:"frass-drip" tag:"women"' },
  // Bare Drip (swim + intimates)
  "bare-drip": { title: "Bare Drip", query: 'tag:"bare-drip"' },
  "bare-drip-men": { title: "Men's Bare Drip", query: 'tag:"bare-drip" tag:"men"' },
  "bare-drip-women": { title: "Women's Bare Drip", query: 'tag:"bare-drip" tag:"women"' },
  // Sports Drip — nested under Frass Drip men & women
  "frass-drip-men-sports-drip-training-gear": { title: "Men's Training Gear", query: 'tag:"sports-drip" tag:"men" tag:"training"' },
  "frass-drip-men-sports-drip-activewear-sets": { title: "Men's Activewear Sets", query: 'tag:"sports-drip" tag:"men" tag:"sets"' },
  "frass-drip-men-sports-drip-running-performance": { title: "Men's Running & Performance", query: 'tag:"sports-drip" tag:"men" tag:"running"' },
  "frass-drip-men-sports-drip-basketball-court": { title: "Men's Basketball & Court Style", query: 'tag:"sports-drip" tag:"men" tag:"basketball"' },
  "frass-drip-men-sports-drip-gym-fits": { title: "Men's Gym Fits", query: 'tag:"sports-drip" tag:"men" tag:"gym"' },
  "frass-drip-women-sports-drip-training-essentials": { title: "Women's Training Essentials", query: 'tag:"sports-drip" tag:"women" tag:"training"' },
  "frass-drip-women-sports-drip-activewear-sets": { title: "Women's Activewear Sets", query: 'tag:"sports-drip" tag:"women" tag:"sets"' },
  "frass-drip-women-sports-drip-running-performance": { title: "Women's Running & Performance", query: 'tag:"sports-drip" tag:"women" tag:"running"' },
  "frass-drip-women-sports-drip-studio-yoga": { title: "Women's Studio & Yoga", query: 'tag:"sports-drip" tag:"women" tag:"yoga"' },
  "frass-drip-women-sports-drip-active-shapewear": { title: "Women's Active Shapewear", query: 'tag:"sports-drip" tag:"women" tag:"shapewear"' },
  // featured
  "new-arrivals": { title: "New Arrivals", query: '' },
  "best-sellers": { title: "Best Sellers", query: '' },
};
