## Goal
Migrate the entire storefront off Shopify onto Lovable Cloud (Supabase), then build the Curated Capsules page on top. Payments deferred.

## Phase 1 — Catalog on Lovable Cloud

Replace Shopify Storefront API with a native catalog stored in Supabase.

**Schema (migration):**
- `products` — handle, title, description, vendor, product_type, tags[], gender, status, min_price, currency, hero_image, created_at, updated_at
- `product_images` — product_id, url, alt, position
- `product_options` — product_id, name, values[]
- `product_variants` — product_id, title, price, compare_at_price, sku, available, selected_options (jsonb), position
- `collections` — handle, title, description, hero_image, parent_handle, sort_order
- `collection_products` — collection_id, product_id, position (curated ordering)

All public-readable (`anon` SELECT on active rows), admin-writable via `has_role(admin)`.

**Code:**
- Rewrite `src/lib/shopify.ts` → `src/lib/catalog.ts` with the same `ShopifyProduct`-shaped types (keep field names to minimize churn) but backed by `supabase.from('products')...`.
- `fetchProducts({ query, first })` — parse the existing tag/vendor query strings (`tag:"frass-drip" tag:"men"`) into Postgres filters against `tags`/`vendor`/`product_type`. Keep `getCollectionMeta` unchanged so all routes keep working.
- `fetchProductByHandle(handle)` → Supabase query.
- Delete `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_STORE_PERMANENT_DOMAIN` constants and the `.env` Shopify vars from client code.

## Phase 2 — Cart & Checkout

- Rewrite `src/lib/cart-store.ts`: remove all `cartCreate`/`cartLinesAdd`/`cartLinesUpdate`/`cartLinesRemove` GraphQL. Keep it as a local Zustand cart persisted to localStorage, plus a Supabase `orders` + `order_items` table for saved carts / order history once the user is logged in.
- `src/components/cart-drawer.tsx`: swap "Checkout with Shopify" for a "Checkout" button that opens a placeholder checkout page (`/checkout`) explaining payments will be enabled later. The cart still works end-to-end (add / update / remove / persist).
- Remove `useCartSync` visibility-based Shopify sync.

## Phase 3 — Admin product management

- New admin route `/admin/products` (under existing `_authenticated/admin`) — list, create, edit, delete products, images, variants; assign to collections.
- New admin route `/admin/collections` — CRUD collections + curate product ordering per collection.
- Image uploads to existing `site-media` bucket (or a new `product-images` bucket).

## Phase 4 — Data migration path (one-time)

- Admin utility button "Import from Shopify (one-time)" that calls a server function which uses the current Shopify Storefront token to pull all products/variants/images and upsert them into the new tables. After the user confirms everything imported, we delete the Shopify code and secrets entirely.

## Phase 5 — Curated Capsules

Only after Phase 1 is live and stable.

**Schema:**
- `capsules` — handle, name, description, style, gender, occasion, season, hero_image, bundle_discount_pct, published, position
- `capsule_items` — capsule_id, product_id, slot (hat/sunglasses/shirt/…/shoes/fragrance/accessory), variant_id (optional default), position, required
- `capsule_collections` — grouping (Street Luxury, Executive Drip, Date Night, Vacation Ready, Airport Looks, Summer, Winter, Festival, Luxury Essentials, Monochrome, Couples, New Arrivals, Trending)

**Routes:**
- `/capsules` — landing: filter bar (Gender · Style · Occasion · Season · Color · Budget · Collection · New · Trending), sectioned by capsule_collection, capsule cards (hero image, name, item chips, total price w/ optional strike-through savings, buttons: View · Buy Complete · Customize).
- `/capsules/$handle` — detail: hero, breakdown of every item (image, name, price, color/size selectors, individual add, remove-from-capsule), "Buy Entire Capsule" (adds all selected variants to cart in one click), Complete-the-Look strip, Similar Capsules.
- `/capsules/$handle/customize` — swap panel per slot, showing same-slot alternatives from catalog matching the capsule's style tags; live total updates.

**Explicit non-scope:** no Virtual Try-On integration on this page — keep it separate as you asked. Try-On stays on its existing route.

**Admin:**
- `/admin/capsules` CRUD: pick products per slot, tag with style/occasion/season, upload hero image, publish toggle, drag-to-reorder within a collection.

## Visual language
Keep current brand system (dark streetwear, chrome/gold, block letters). Capsule cards use glassmorphism panels with gold-glow hover and floating product thumbnails — inside the existing dark theme rather than switching to the "bright white luxury background" the spec mentions. Confirm if you want a bright-white theme override just for Capsules.

## Suggested execution order
1. **This turn** — approve plan, then run Phase 1 migration + rewrite `catalog.ts` + `cart-store.ts` + admin product/collection screens. Site will show "No products found" until you import.
2. **Next turn** — Shopify import utility, then run it, verify catalog.
3. **After** — delete all Shopify code, connectors, secrets.
4. **Then** — Capsules schema, admin, and public pages.
5. **Later** — wire Stripe or Paddle checkout.

## Confirm before I start
- OK to ship Phase 1 in one turn (empty catalog + admin CRUD + placeholder checkout), then handle Shopify import in the next turn?
- Keep the current dark aesthetic for Capsules, or force a bright-white "Louis Vuitton / Dior" theme just on that page?
