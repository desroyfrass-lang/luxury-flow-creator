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

---

## Decisions locked in

- Staying on Lovable storefront; Shopify remains backend (catalog, orders, fulfillment, dropshipping apps)
- Brand spelling: **Frass** (two s's) — never "Fras"
- Visual direction: dark streetwear, block letters, chrome/gold cues
- Lookbook sits under the "Choose Your Lane" block on the home page
- All cards/buttons/tiles glow brighter on hover

---

## Done

- Mapped all Frass Kicks sub-collections to Shopify Storefront queries in `src/lib/shopify.ts`
- Lookbook moved under Choose Your Lane on home
- Hover glow applied to cards/buttons/tiles
