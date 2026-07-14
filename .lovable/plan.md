# Afro Designers — Caribbean Luxury Marketplace

A new destination inside the Frass Kicks site (not a separate Shopify store — one connected Shopify account is the limit, and you asked for a *store experience*, so this ships as a themed section with its own routes, palette, and Frassy variant).

## Visual direction

- **Palette:** bright white base, crystal aqua (#7DD3E8), ocean deep (#0E7C9E), sandy beige (#EBD9B4), champagne gold (#D4AF37) + glitter gold accents, polished chrome trim.
- **Type:** display serif for headlines (resort-boutique feel), refined sans for body — distinct from the dark Frass Kicks streetwear direction so entering the section feels like a new world.
- **Effects:** soft wave gradients, shimmering gold particle overlay, chrome-bordered cards with gold-glow hover, subtle floating animation on hero elements.
- **Frassy emblem:** same SVG shape, recolored to polished gold (gradient + inner highlight) — used as the section's signature mark.

The dark Frass Kicks theme stays intact everywhere else; the Afro Designers routes wrap in a scoped `.afro-theme` class so light tokens only apply inside this section.

## Routes

```text
/afro-designers                       hero + featured designers + spotlight
/afro-designers/designers             all designers grid, filter by region
/afro-designers/designers/$slug       designer profile (story, gallery, products)
/afro-designers/collections/$slug     regional/category collection page
```

Each route sets its own head() (title, description, og:*). No hash anchors.

## Sections on the landing page

1. **Cinematic hero** — full-bleed Caribbean scene (AI-generated image: ocean, sand, palms, editorial fashion), gold Frassy emblem floating above title "AFRO DESIGNERS / Where Culture Meets Luxury", two CTAs (Explore Designers, Shop Collections), shimmering particle layer.
2. **Regional pillars** — 5 cards: African, African American, Caribbean, Jamaican, Global Diaspora — each links to `/afro-designers/collections/$slug`.
3. **Featured Designers** — carousel/grid of designer cards (image, name, country w/ flag, brand tagline, Shop button).
4. **Island Collections** — resort wear, linen, swim, sandals, jewelry tiles.
5. **Designer Spotlight** — weekly feature block (large editorial layout: portrait + story + collection thumbnails).
6. **Caribbean Marketplace strip** — artisan/handmade highlights.
7. **Footer band** — brand statement "Culture. Creativity. Heritage. Luxury."

## Data

Designers and collections start as a typed seed file (`src/data/afro-designers.ts`) so the visual build can ship immediately. Placeholder designer imagery is AI-generated. Once you're ready to sell real products, we'll wire each designer to Shopify products via tag/vendor (e.g. `vendor:"Afro — <designer>"`) — that hookup is a follow-up, not this turn.

No fabricated reviews, testimonials, or fake bios attributed to real names — designer placeholders use generic studio names until you supply real ones.

## Navigation

- Header gets a new "Afro Designers" link with a small gold Frassy mark.
- A subtle gold ribbon on the Frass Kicks homepage teases the section.

## Technical notes

- New files:
  - `src/routes/afro-designers.tsx` (layout w/ `<Outlet />` + scoped theme wrapper)
  - `src/routes/afro-designers.index.tsx` (landing)
  - `src/routes/afro-designers.designers.tsx`
  - `src/routes/afro-designers.designers.$slug.tsx`
  - `src/routes/afro-designers.collections.$slug.tsx`
  - `src/components/afro/FrassyGold.tsx` (recolored SVG variant)
  - `src/components/afro/DesignerCard.tsx`, `RegionPillar.tsx`, `Shimmer.tsx`, `WaveBg.tsx`
  - `src/data/afro-designers.ts`
- `src/styles.css`: add `.afro-theme` scope with light ocean tokens, gold gradient token, chrome token, shimmer keyframes.
- Hero image generated via imagegen (premium quality for the leaf og:image).
- Motion via CSS keyframes + existing animation utilities; no new heavy libs.

## Out of scope this turn

- Real Shopify product linkage per designer (structure ready, wired next turn once you have vendor tags).
- Designer onboarding form / auth.
- Weekly spotlight CMS (hardcoded for now).

Approve and I'll build it.
