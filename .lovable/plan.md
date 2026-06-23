# Admin Image Manager

A protected `/admin/images` page where you log in once and swap any image on the site without going through chat. Built on Lovable Cloud (auth + storage + a small mapping table).

## What you get

- A single owner login at `/auth` (email + password — your email, password you set on first sign-in).
- `/admin/images` — one page, grouped sections, every slot shows the current image with a "Replace" button. Upload → preview updates → live site updates within seconds (no rebuild).
- A "Reset to default" button per slot to fall back to the original art shipped in code.
- All images served from Lovable Cloud Storage (public bucket, CDN-cached).

## Slots covered

**Brand**
- Homepage hero
- Header/footer logo (full + symbol)

**Division cards** (homepage "Three Worlds")
- Frass Kicks, Frass Drip, Bare Drip
- Men card, Women card (reused inside sub-pages)

**Lookbook covers** (7)
- Work, Party, Street, Casual, Vacay, Sports, Bare

**Lookbook story spreads**
- Each volume has 4–5 editorial images — managed as a gallery per story (add / remove / reorder / replace).

**Product imagery overrides**
- Per Shopify product, set up to 4 override images that replace the Shopify gallery on the product page and collection cards.
- Searchable product picker inside the admin.

## How it works (technical)

```text
Lovable Cloud
├─ Auth: email/password, single allowed admin email seeded via user_roles
├─ Storage bucket: site-images (public read, authenticated write)
└─ Tables:
   ├─ user_roles            (id, user_id, role)  ← admin gate
   ├─ site_images           (slot_key PK, url, alt, updated_at)        ← single-image slots
   ├─ lookbook_story_images (id, story_slug, position, url, alt)       ← per-story galleries
   └─ product_image_overrides (id, product_id, position, url, alt)     ← Shopify per-product overrides
```

- `useSiteImage(slot, fallback)` hook reads `site_images` via TanStack Query, falls back to the default static asset when no override exists.
- `useLookbookImages(slug, fallback)` and `useProductOverrides(productId)` for the gallery cases.
- RLS: public SELECT on all three image tables (so the live site reads without auth). INSERT/UPDATE/DELETE restricted to `has_role(auth.uid(), 'admin')`.
- File uploads go through a `createServerFn` that verifies admin role, uploads to storage, and writes the URL to the table in one transaction.

## Build order

1. Enable Lovable Cloud.
2. Migration: `user_roles` (admin enum + `has_role` function), `site_images`, `lookbook_story_images`, `product_image_overrides`, RLS + grants. Seed slot keys with `null` URLs.
3. Create `site-images` storage bucket (public).
4. Build `/auth` (email + password) and `/admin` layout under `_authenticated/` gated by `has_role` admin check.
5. Build `/admin/images` with three tabs: **Site**, **Lookbook**, **Products**.
6. Add `useSiteImage` / `useLookbookImages` / `useProductOverrides` hooks.
7. Wire hooks into: homepage hero, division cards, men/women cards, lookbook index covers, lookbook story spreads, product page gallery, collection-card thumbnails.
8. Seed your admin role: I'll ask for your email after Cloud is enabled, then run an insert.

## What I need from you

- The email you want to use as the owner login.
- (Optional) Any images you want pre-loaded now — drop them in chat and I'll upload them as the initial values so the live site reflects them immediately.
