# Frass Pre-Launch Checklist

Single source of truth before we populate the store. Check items off as we go.
Cross-references: `NOTES.md` (running notes) and `.lovable/plan.md` (Cloud migration plan).

---

## 1. Brand & Content (client-supplied)

- [ ] Final hero headline copy (currently "Original Luxury Streetwear" — editable at `/admin/text`)
- [ ] Tagline under cinematic "Frass Hill Presents" title-card
- [ ] Confirm brand spelling everywhere = **Frass** (two s's)
- [ ] Approve current dark streetwear + chrome/gold direction (locked, but re-confirm)
- [ ] Provide any additional hero / lookbook / capsule imagery client wants featured
- [ ] Decide: publish on Lovable subdomain vs custom domain (`frasskicks.com`) before SEO verify

## 2. SEO & Analytics

- [ ] Google Search Console verification `content="..."` value → paste into `<head>` in `src/routes/__root.tsx`
- [ ] Verify every route has unique `title` / `meta description` / `og:title` / `og:description`
- [ ] Add `og:image` on hero routes (home, capsules, lookbook, product) — leaf routes only
- [ ] JSON-LD Product schema on `/product/$handle`
- [ ] Sitemap + robots.txt

## 3. Catalog Migration (from `.lovable/plan.md`)

Currently the store still reads from Shopify Storefront API. Plan is to move fully onto Lovable Cloud.

- [ ] **Phase 1** — Native catalog schema in Cloud (products, images, options, variants, collections)
- [ ] **Phase 1** — Rewrite `src/lib/shopify.ts` → `src/lib/catalog.ts` (keep same field shapes)
- [ ] **Phase 2** — Rewrite `src/lib/cart-store.ts` to local Zustand + Cloud orders; drop Shopify GraphQL
- [ ] **Phase 2** — `/checkout` placeholder page (payments deferred)
- [ ] **Phase 3** — Admin `/admin/products` + `/admin/collections` CRUD
- [ ] **Phase 4** — One-time "Import from Shopify" utility, then delete Shopify code + secrets
- [ ] **Phase 5** — Curated Capsules schema, admin, public pages, customize flow
- [ ] **Later** — Wire Stripe or Paddle for real checkout

## 4. Shopify Product Tagging (only if we keep Shopify as backend)

### Frass Kicks (footwear) — partially stocked
- [ ] Vendor: `FRASS KICKS` on every product
- [ ] Product type: `Casual Kicks` | `Street Kicks` | `Classic Kicks`
- [ ] Tags: `Men's` or `Women's` (+ `sale` if discounted)

### Frass Drip (apparel) — not stocked
- [ ] Tag: `frass-drip`
- [ ] Tag: `men` or `women`
- [ ] Category tag (`tops`, `bottoms`, `outerwear`, …)
- [ ] Sub tag matching storefront sub-collection slug

### Bare Drip (swim + intimates) — not stocked
- [ ] Tag: `bare-drip`
- [ ] Tag: `men` or `women`
- [ ] Category + sub tags matching storefront slugs

### Sports Drip (nested under Frass Drip) — not stocked
- [ ] Tag: `sports-drip`
- [ ] Tag: `men` or `women`
- [ ] Activity tag: `training` | `running` | `basketball` | `gym` | `sets` | `yoga` | `shapewear`

## 5. CMS content to fill via `/admin/*`

- [ ] `/admin/text` — review every slot in `src/lib/text-slots.ts`, replace placeholder copy
- [ ] `/admin/images` — upload real photography for every slot in `src/lib/image-slots.ts`
- [ ] `/admin/media` — add tracks + visuals for Music & Media page
- [ ] `/admin/blog` — at least 2-3 launch posts
- [ ] `/admin/capsules` — build first wave of curated capsules (after Phase 5 ships)
- [ ] `/admin/text` — footer copy, nav labels, legal blurb

## 6. Legal & compliance

- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Cookie / tracking notice (if analytics added)
- [ ] Shipping & returns policy page
- [ ] Contact email / form

## 7. Auth & admin ownership

- [ ] Client signs in once so their account can claim the initial admin role via `claimInitialAdmin`
- [ ] Confirm Google sign-in provider is configured
- [ ] Verify admin-only routes (`/admin/*`) redirect anonymous users to `/auth`

## 8. Pre-launch QA

- [ ] All routes render on mobile (test 375px, 680px, 1280px)
- [ ] Cart add / update / remove / persist across reloads
- [ ] Checkout flow reaches placeholder (or real gateway once wired)
- [ ] No console errors on any route
- [ ] Lighthouse ≥ 90 on Performance / Accessibility / SEO
- [ ] Favicon + `apple-touch-icon` set
- [ ] Social share preview looks correct (Twitter card validator, LinkedIn inspector)

## 9. Post-launch

- [ ] Submit sitemap to Google Search Console
- [ ] Publish first Instagram / TikTok drop announcement
- [ ] Enable payments (Stripe or Paddle)
- [ ] Turn on order confirmation emails

---

_Last swept: 2026-07-14. Update this file as items ship — do not let it drift._
