// Server-side tools for Frassy conversational commerce (Spec 035).
// Kept small and compact — each tool returns serializable data the model
// can quote back to the shopper, and (for products) the chat UI renders
// as inline cards.
import { tool } from "ai";
import { z } from "zod";
import { fetchProducts, storefrontApiRequest } from "@/lib/shopify";

// ------- Product search / discovery -------

type ShopifyFilters = {
  vendor?: string;
  productType?: string;
  tag?: string;
  priceMax?: number;
  priceMin?: number;
  available?: boolean;
};

function buildStorefrontQuery(f: ShopifyFilters, freeText?: string): string {
  const parts: string[] = [];
  if (f.vendor) parts.push(`vendor:"${f.vendor}"`);
  if (f.productType) parts.push(`product_type:"${f.productType}"`);
  if (f.tag) parts.push(`tag:"${f.tag}"`);
  if (typeof f.priceMax === "number") parts.push(`variants.price:<=${f.priceMax}`);
  if (typeof f.priceMin === "number") parts.push(`variants.price:>=${f.priceMin}`);
  if (f.available !== false) parts.push("available_for_sale:true");
  if (freeText) parts.push(freeText);
  return parts.join(" ");
}

export const searchProducts = tool({
  description:
    "Search the Frass Hill catalog (Frass Kicks, Frass Drip, Bare Drip) using natural language plus optional filters. Returns up to 6 products with title, price, image, handle. Use for 'find me…', 'show me…', 'something for…', 'under $X' requests.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Free-text keywords describing what the shopper wants (color, occasion, mood, item type)."),
    vendor: z
      .enum(["FRASS KICKS"])
      .optional()
      .describe("Set to 'FRASS KICKS' when the shopper is asking about footwear specifically."),
    tag: z
      .string()
      .optional()
      .describe("Optional Shopify tag, e.g. 'frass-drip', 'bare-drip', 'men', 'women', 'vacay-drip'."),
    priceMax: z.number().optional().describe("Max price in USD."),
    priceMin: z.number().optional().describe("Min price in USD."),
    limit: z.number().int().min(1).max(6).default(4),
  }),
  execute: async ({ query, vendor, tag, priceMax, priceMin, limit }) => {
    const q = buildStorefrontQuery({ vendor, tag, priceMax, priceMin }, query);
    try {
      const edges = await fetchProducts({ first: limit, query: q });
      const results = edges.slice(0, limit).map((e) => ({
        handle: e.node.handle,
        title: e.node.title,
        vendor: e.node.vendor,
        price: e.node.priceRange.minVariantPrice.amount,
        currency: e.node.priceRange.minVariantPrice.currencyCode,
        image: e.node.images.edges[0]?.node.url ?? null,
        url: `/product/${e.node.handle}`,
      }));
      return { count: results.length, filters: { vendor, tag, priceMax, priceMin }, results };
    } catch (err) {
      return { count: 0, results: [], error: (err as Error).message };
    }
  },
});

// ------- Trending / new arrivals -------

export const listTrending = tool({
  description:
    "List currently trending Frass Hill products (best sellers / new arrivals). Use for 'what's new', 'what's trending', 'popular this week'.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(6).default(4),
  }),
  execute: async ({ limit }) => {
    try {
      const edges = await fetchProducts({ first: limit, query: 'available_for_sale:true' });
      const results = edges.slice(0, limit).map((e) => ({
        handle: e.node.handle,
        title: e.node.title,
        price: e.node.priceRange.minVariantPrice.amount,
        currency: e.node.priceRange.minVariantPrice.currencyCode,
        image: e.node.images.edges[0]?.node.url ?? null,
        url: `/product/${e.node.handle}`,
      }));
      return { count: results.length, results };
    } catch (err) {
      return { count: 0, results: [], error: (err as Error).message };
    }
  },
});

// ------- Welcome journey status (unauthenticated, informational) -------

export const welcomeJourneyInfo = tool({
  description:
    "Explain the 4-tier Welcome Journey (up to 40% off first purchase) — steps, eligibility, exclusions. Use when the shopper asks about discounts or the reward.",
  inputSchema: z.object({}),
  execute: async () => ({
    reward: "Up to 40% off first purchase",
    steps: [
      { id: "profile", label: "Complete your profile", value: 10 },
      { id: "newsletter", label: "Subscribe to the newsletter", value: 10 },
      { id: "verify", label: "Verify your email", value: 10 },
      { id: "social", label: "Follow Frass on TikTok, Instagram & Facebook", value: 10 },
    ],
    coupon_pattern: "FRASS40-XXXXXXXX",
    unlock_url: "/rewards",
    rules: [
      "One-time use, first purchase only, one per email.",
      "Full-price items only — sale items excluded.",
      "Does not stack with other promotions.",
      "Applied at checkout in the 'Reward coupon' field.",
    ],
  }),
});

// ------- Order lookup (order # + email verification) -------

const ORDER_LOOKUP_QUERY = `
  query orderLookup($first: Int!, $q: String!) {
    orders(first: $first, query: $q) {
      edges {
        node {
          id
          name
          email
          displayFinancialStatus
          displayFulfillmentStatus
          createdAt
          totalPriceSet { presentmentMoney { amount currencyCode } }
          lineItems(first: 10) { edges { node { title quantity } } }
          fulfillments(first: 5) {
            trackingInfo { number url company }
            estimatedDeliveryAt
          }
        }
      }
    }
  }
`;

export const lookupOrder = tool({
  description:
    "Look up an order status. REQUIRES both the order number AND the email on the order. Never guess or invent order details. Returns status, items, and tracking if available.",
  inputSchema: z.object({
    orderNumber: z
      .string()
      .describe("Shopify order name/number, e.g. '#1042' or '1042'."),
    email: z.string().describe("Email address used at checkout."),
  }),
  execute: async ({ orderNumber, email }) => {
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!token) return { found: false, error: "Order lookup is temporarily unavailable." };
    const normalized = orderNumber.trim().replace(/^#/, "");
    const q = `name:#${normalized} AND email:${email.trim().toLowerCase()}`;
    try {
      const res = await fetch(
        `https://3hekgw-kr.myshopify.com/admin/api/2025-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query: ORDER_LOOKUP_QUERY, variables: { first: 1, q } }),
        },
      );
      if (!res.ok) return { found: false, error: `Lookup failed (${res.status}).` };
      type OrderNode = {
        name: string;
        email: string;
        displayFinancialStatus: string;
        displayFulfillmentStatus: string;
        createdAt: string;
        totalPriceSet: { presentmentMoney: { amount: string; currencyCode: string } };
        lineItems: { edges: Array<{ node: { title: string; quantity: number } }> };
        fulfillments: Array<{
          trackingInfo: Array<{ number: string; url: string; company: string }>;
          estimatedDeliveryAt: string | null;
        }>;
      };
      const data = (await res.json()) as { data?: { orders?: { edges: Array<{ node: OrderNode }> } } };
      const node = data.data?.orders?.edges?.[0]?.node;
      if (!node) return { found: false, message: "No order matches that order number and email." };
      // Verify email match server-side too — do not trust the query alone.
      if (node.email?.toLowerCase() !== email.trim().toLowerCase()) {
        return { found: false, message: "No order matches that order number and email." };
      }
      return {
        found: true,
        order: {
          name: node.name,
          created_at: node.createdAt,
          financial_status: node.displayFinancialStatus,
          fulfillment_status: node.displayFulfillmentStatus,
          total: node.totalPriceSet.presentmentMoney.amount,
          currency: node.totalPriceSet.presentmentMoney.currencyCode,
          items: node.lineItems.edges.map((e) => ({
            title: e.node.title,
            quantity: e.node.quantity,
          })),
          tracking: node.fulfillments.flatMap((f) =>
            f.trackingInfo.map((t) => ({ ...t, eta: f.estimatedDeliveryAt })),
          ),
        },
      };
    } catch (err) {
      return { found: false, error: (err as Error).message };
    }
  },
});

// ------- Registry -------

export function buildFrassyTools() {
  return {
    search_products: searchProducts,
    list_trending: listTrending,
    welcome_journey_info: welcomeJourneyInfo,
    lookup_order: lookupOrder,
  };
}

// Silence unused-import warning for storefrontApiRequest (kept for future tools).
void storefrontApiRequest;
