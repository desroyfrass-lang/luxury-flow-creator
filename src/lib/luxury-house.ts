// Frass Luxury House — the six existing collections (single source of truth).
// The East/West Wing pages and the product taxonomy registry both read this.
// Handles are the live Shopify collection/tag handles; never rename them.

export const LUXURY_COLLECTIONS = {
  men: [
    { handle: "mens-luxury-footwear", title: "Luxury Footwear" },
    { handle: "mens-luxury-tailoring", title: "Tailoring" },
    { handle: "mens-luxury-shirts", title: "Shirts" },
  ],
  women: [
    { handle: "womens-luxury-footwear", title: "Luxury Footwear" },
    { handle: "womens-luxury-dresses", title: "Dresses" },
    { handle: "womens-luxury-tailoring", title: "Tailoring" },
  ],
} as const;
