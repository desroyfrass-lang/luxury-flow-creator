# Headless Shopify Integration Plan

## Goal
Keep the existing Lovable frontend exactly as designed. Replace the commerce backend with Shopify: products, variants, inventory, cart, checkout, discounts, and customer accounts all flow through Shopify Storefront API. The customer never feels like they leave Frass.

## Current State
- Shopify store is connected: `3hekgw-kr.myshopify.com`
- Storefront token is available.
- **43 products already exist in Shopify**, including all Frass Kicks footwear and the 3 Frass merch items (hoodie, jacket, pants).
- The site currently reads products from Lovable Cloud (Supabase `products` / `product_variants` tables).
- Cart is local-only; checkout page is disabled.

## Scope Decisions (from your answers)
1. **All shoppable products** come from Shopify.
2. **Rewards/coupons** will create real Shopify discount codes and pass them into Shopify checkout.
3. **Checkout** stays on Frass until the final payment step, then redirects to Shopify Checkout (best non-Plus experience).

## Implementation Steps

### 1. Restore Shopify Storefront API layer
- Replace the Supabase-backed `src/lib/shopify.ts` with Storefront API queries.
- Fetch products, collections, product handles, variants, images, prices, and inventory via GraphQL.
- Keep the existing `ShopifyProduct` / `ShopifyVariant` type shapes so every consumer (ProductCard, ProductGrid, product detail, cart) works unchanged.

### 2. Product grid & product cards
- Update `ProductGrid` to call Shopify Storefront API instead of Supabase.
- Keep existing cards, hover effects, typography, spacing, and quick-add button exactly as designed.
- Preserve the Shopify-style query parsing so collection filters (`vendor:`, `product_type:`, `tag:`) still work.

### 3. Product detail page
- Update `src/routes/product.$handle.tsx` to load from Shopify by handle.
- Keep current layout, image gallery, variant selector, add-to-cart UX, and animations.
- Pull meta title/description from Shopify product data for SEO.

### 4. Re-implement Shopify cart
- Rewrite `src/lib/cart-store.ts` to use Shopify Cart API:
  - `cartCreate` on first add
  - `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove` for mutations
  - Persist `cartId`, `checkoutUrl`, and line IDs in Zustand + localStorage
  - Append `channel=online_store` to checkout URL
- Keep `CartDrawer` visuals identical; only the data source and checkout button change.

### 5. Checkout redirect
- Update `src/routes/checkout.tsx` to display the cart summary as today, then redirect to Shopify Checkout when the customer proceeds to payment.
- Remove the disabled "Payments coming soon" state.
- Pass any applied Shopify discount code through to the checkout URL.

### 6. Rewards → Shopify discount codes
- Update `src/lib/rewards.functions.ts` so claiming a reward creates a Shopify price rule + discount code via Admin API.
- The generated code is what the customer enters at checkout; Shopify validates it.

### 7. Collection pages
- Update all collection routes (`/frass-kicks`, `/frass-drip`, `/bare-drip`, etc.) to pull products from Shopify using the existing query mapping.
- Keep every existing layout, animation, and card style.

### 8. SEO / structured data
- Use Shopify product/collection titles and descriptions for `head()` meta.
- Add JSON-LD product schema from Shopify data.
- Preserve existing URL structure.

### 9. Performance & UX guardrails
- Lazy-load product images (already in place).
- Cache Storefront API responses with TanStack Query where possible.
- Show loading states inside the existing luxury UI, never a default Shopify widget.

### 10. Verification
- Test product grid, product detail, add-to-cart, cart drawer, quantity updates, removal, and checkout redirect.
- Confirm checkout URL opens correctly and discount codes apply.

## What Will NOT Change
- Colors, typography, spacing, layouts, navigation, animations, hover effects, hero sections, videos, Afro Designers, Capsules, Frass Hill Media, or any brand styling.
- The homepage and all content pages remain untouched except where commerce data is displayed.

## Note on Checkout Domain
Without Shopify Plus, the final payment page is hosted on `3hekgw-kr.myshopify.com`. We will make the transition seamless (same-tab redirect, branded cart summary on Frass, discount pre-applied). A fully same-domain checkout requires Shopify Plus and is outside this scope.