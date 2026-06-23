## Vision

A bright luxury fashion destination — white environments, chrome reflections, gold light streaks, soft drifting smoke, floating particles, and oversized cinematic image cards as the primary navigation. No traditional "Shopify clone" feel. Cards lift, scale, and glow on hover. Backgrounds remain alive across pages so the journey feels continuous (Home → Division → Category → Collection → Product).

## Scope of this build

Because the full spec covers ~25+ category pages, I'll build it in two passes so the foundation is rock-solid before scaling up. **This plan covers Pass 1.** Pass 2 fills in remaining sub-category pages once we confirm the look.

### Pass 1 — Foundation + primary journey (this build)

1. **Design system** — white luxury palette, chrome/gold tokens, gold-glow shadows, oversized type, smooth easing tokens, large radius. Typography: display serif (e.g. Cormorant/Instrument Serif) paired with refined sans (Inter Tight). All semantic tokens in `src/styles.css`.
2. **Signature background system** — reusable `<LuxuryBackground />` component layering: chrome light trails, gold laser streaks, drifting smoke, floating particles. GPU-accelerated CSS animations, reduced intensity on mobile. Lives behind every major page.
3. **Luxury card component** — oversized `<CollectionCard />` with rounded corners, layered depth, gold-glow hover (translate -8px, scale 1.02, gold shadow, 400ms luxury easing). The single reusable building block for all navigation.
4. **Shared shell** — sticky translucent chrome header with logo, minimal nav (Frass Kicks / Frass Drip / Bare Drip), cart drawer trigger. Footer with sections + newsletter.
5. **Home page** — full-bleed hero with cinematic background + 3 CTAs, then 3 massive division cards (Frass Kicks / Frass Drip / Bare Drip), featured collections strip, new arrivals (live Shopify products), promo banner, newsletter.
6. **Division landing pages** — `/frass-kicks`, `/frass-drip`, `/bare-drip`, each showing the two large Men/Women cards.
7. **Gender landing pages** — `/frass-kicks/men`, `/frass-kicks/women`, etc. Show the sub-category cards (Casual / Street / Classic for footwear; the full lists for Drip and Bare Drip).
8. **Collection page** — `/collection/$handle`. Live Shopify products via Storefront API (tag/handle-based filtering), sticky luxury background, sort bar, luxury product grid with hover.
9. **Product page** — `/product/$handle`. Large gallery, variant/size selector, Add to Cart, trust row, related products.
10. **Cart + checkout** — Zustand store, Storefront API cartCreate/cartLinesAdd/Update/Remove, slide-in cart drawer, checkout opens in new tab with `channel=online_store`.
11. **Shopify wiring** — `storefrontApiRequest` helper with 2025-07 API, product fetch/by-handle queries, collection-by-handle query. Real products only — empty state if none exist.

### Pass 2 (after you approve Pass 1's look)

- All remaining sub-category routes (Vacay Drip, Hoodie Drip, Resort Dresses, Lingerie Sets, etc.) — each is a thin route that filters the Shopify catalog by handle/tag.
- Sticky video background support in the theme.
- Wishlist, advanced filters (size/color/price/availability), pagination polish.

## Technical notes

- TanStack Start routes under `src/routes/` using flat dot-naming (`frass-kicks.men.tsx`, `collection.$handle.tsx`, `product.$handle.tsx`).
- Storefront token + domain pulled from connected Shopify env vars; `SHOPIFY_API_VERSION = '2025-07'`.
- Cart state in Zustand with `persist`; cart drawer syncs on open and on tab focus via `useCartSync`.
- Category-to-Shopify mapping uses Shopify collection handles (e.g. `frass-kicks-men-casual`). I'll wire the routes to those handles; you can later rename collections in Shopify admin and we'll adjust the map in one place.
- All hover/motion uses CSS + Tailwind tokens (no heavy JS animation libs for Pass 1).
- No fake products, no fake reviews — empty states everywhere data is missing.

## What you'll need to do

Nothing right now — I'll build against your connected store. After Pass 1 you'll tell me which sub-categories to wire up to which Shopify collection handles, and I'll knock out Pass 2.

Approve and I'll start with the design system + background system + home page, then move through the journey.