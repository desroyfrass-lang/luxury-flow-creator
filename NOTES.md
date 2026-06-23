# Frass Build Notes

Running record of pending work, Shopify setup prompts, and decisions.
Keep this updated every turn so prompts for Shopify duplication stay easy.

---

## Pending — Shopify (do in Shopify admin)

### Frass Kicks (footwear) — already partially stocked
Required per product:
- **Vendor:** `FRASS KICKS`
- **Product type:** one of `Casual Kicks`, `Street Kicks`, `Classic Kicks`
- **Tags:** `Men's` or `Women's` (gender), plus `sale` if discounted

### Frass Drip (apparel) — not yet stocked
Required tags per product:
- `frass-drip`
- `men` or `women`
- category tag (e.g. `tops`, `bottoms`, `outerwear`)
- sub tag matching the storefront sub-collection slug

### Bare Drip (swim + intimates) — not yet stocked
Required tags per product:
- `bare-drip`
- `men` or `women`
- category + sub tags matching storefront slugs

### Sports Drip (nested under Frass Drip) — not yet stocked
Required tags per product:
- `sports-drip`
- `men` or `women`
- activity tag: `training`, `running`, `basketball`, `gym`, `sets`, `yoga`, `shapewear`

---

## Pending — from user

- [ ] Google Search Console verification `content="..."` value (to paste into `<head>`)
- [ ] Decide whether to publish on Lovable subdomain or custom domain before verifying GSC
- [ ] New hero headline copy (currently still "Original street luxury." — editable in `/admin/text`)
- [ ] Tagline under cinematic logo title-card (currently "A cinematic streetwear experience.")

---

## Decisions locked in

- Staying on Lovable storefront; Shopify remains backend (catalog, orders, fulfillment, dropshipping apps)
- Brand spelling: **Frass** (two s's) — never "Fras"
- Visual direction: dark streetwear, block letters, chrome/gold cues, cinematic
- Lookbook sits under the "Choose Your Lane" block on the home page
- All cards/buttons/tiles glow brighter on hover
- Homepage opens with a "Frass Hill Presents → logo → tagline" title-card sitting ABOVE the nav for a cinematic feel
- Text content is managed via the admin editor at `/admin/text` — never hard-code copy you want the client to control

---

## How the Text CMS works (for future edits)

- DB table: `public.site_text` (slot_key, value). Public read, admin-only writes.
- Registry of editable slots: `src/lib/text-slots.ts` — add a slot here whenever you want a new piece of copy editable.
- In a component: `const headline = useSiteText("home-hero-headline")` (from `src/hooks/use-site-text.ts`).
- Admin UI: `/admin/text` — grouped by section, save/reset per slot.
- When adding new sections to the site, wire every visible string through `useSiteText` and add a matching slot in `text-slots.ts`.

---

## Done

- Mapped all Frass Kicks sub-collections to Shopify Storefront queries in `src/lib/shopify.ts`
- Lookbook moved under Choose Your Lane on home
- Hover glow applied to cards/buttons/tiles
- Built site-wide text CMS (`site_text` table, `useSiteText` hook, `/admin/text` editor)
- Wired every visible piece of homepage copy + nav labels + footer copy through the CMS
- Added cinematic "Frass Hill Presents" title-card above the navigation on the homepage
