# Roadmap

A prioritized task list for the next phase of Frass. Starting with the Lookbook since it best showcases the mood-based merchandising the site is already built around.

---

## 1. Lookbook (this task)

Build an editorial Lookbook section that turns the Drip categories into visual stories instead of product grids.

**Routes**
- `/lookbook` — index. Hero + grid of "stories," one per mood (Work, Party, Casual, Street, Vacay, Sports + Bare).
- `/lookbook/$story` — single story page. Full-bleed cinematic layout: oversized imagery, sparse gold typography, scroll-driven pacing, and a "Shop the Look" rail at the bottom linking to the relevant `/collection/...` handles.

**Nav**
- Add `Lookbook` to the primary nav in `src/components/site-shell.tsx`, positioned between `Frass Drip` and `Bare Drip` (or wherever reads best).
- Add `head()` metadata on both routes (distinct title, description, og:title, og:description; og:image on the leaf story page only).

**Visual direction**
- Dark, gallery-feel layout — not another card grid. Asymmetric image blocks, generous negative space, script + block-letter type pairing already used on the site.
- Each story carries: kicker, title, short script tagline, 4–6 images, 3–6 product links via `CollectionCard` or a slimmer "shop the look" tile.
- Reuse existing `card-*.jpg` placeholders for now; flag for real photography later.

**Data**
- Static config in `src/lib/lookbook.ts`: `LOOKBOOK_STORIES: Record<slug, { title, kicker, tagline, images[], shop[] }>`. No CMS, no Shopify metaobjects yet — keep it editable in code.

---

## 2. Follow-on tasks (in suggested order)

1. **Homepage drop campaign** — replace the static category cards on `/` with a rotating featured-drop hero (image + tagline + CTA into the matching Lookbook story or collection).
2. **Real product photography pipeline** — define image specs (1:1 product, 4:5 lifestyle, 16:9 hero) and swap placeholders division-by-division.
3. **Collection page polish** — filter bar (size, color, price), sort, and a sticky sub-nav showing sibling sub-collections.
4. **Product detail upgrade** — gallery with thumbnails, size guide drawer, "Complete the Fit" recommendations pulling from the same parent category.
5. **Search** — global search across products + collections, opened from the nav.
6. **Account area** — order history, saved addresses, wishlist (requires Lovable Cloud auth — flag before starting).
7. **Editorial / Journal** — long-form drops, behind-the-scenes, music + media tie-ins to `/music-media`.
8. **SEO + sharing pass** — verify every route has unique meta, og:image on leaf pages, sitemap, robots.

---

## Technical notes

- File-based routing: `src/routes/lookbook.tsx` (layout w/ `<Outlet />`), `src/routes/lookbook.index.tsx`, `src/routes/lookbook.$story.tsx` with `beforeLoad` `notFound()` guard.
- New component `src/components/lookbook-story-card.tsx` for the index grid; reuse `CollectionCard` for the "Shop the Look" rail.
- Nav link added once in `site-shell.tsx`; uses `<Link to="/lookbook">` with `activeProps`.
- No Shopify changes required for task 1.
