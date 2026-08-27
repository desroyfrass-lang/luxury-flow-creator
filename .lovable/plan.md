# Frass Hill — Navigation Foundation Pass (Prompt 1 of 3)

Goal: make the *visible menus* easy for a human being to use, without rebuilding anything, deleting pages, renaming Frass properties, or starting Frassy Studios Build 4.

## What I found in the live app (verified before planning)

- 143 route files under `src/routes` (plus nested folders) — the ~234 declarations recorded in `FRASS_SITE_MAP.md` are still accurate in shape.
- **Two competing visible navigation shells:**
  - `src/components/site-shell.tsx` — used by **106 route files**. Header with 5 fixed nav items (Frass District, Afro Designers, Lookbooks & Capsules, Social Media Virals, Frass Services) plus a hamburger with 5 more (Welcome Hall, Enter Frass Hill, Lookbook, Music & Media, Blog) and an Admin item.
  - `src/components/gateway-nav.tsx` — a second, richer grouped menu with `shop` and `world` modes (`SHOP_NAV`, `HILL_NAV`, `SHOP_PRIMARY`, `HILL_PRIMARY`), used by only 4 files.
  - Result: most of the ecosystem (Kicks, Drip, Plus, Bridal, Luxury House, Kids, Vaults, Founder Hall, Studios) is **not reachable from the header most users see** — it is only reachable by knowing a URL or landing on the few pages that use `GatewayNav`.
- Orientation metadata already exists and is good: `src/lib/navigation/hierarchy.ts` (place → hall → parent → audience) and `src/components/frass-trail.tsx` (breadcrumb, mounted in `__root.tsx`), but the header menus do not use it.
- `src/lib/navigation/core-routes.ts` is a separate small registry used by Frassy's `open_place` tool — a third list of destinations.

So the real problem is not missing routes; it is **three overlapping destination lists and two headers**, with the smaller/richer one on the fewest pages.

## The approach: one menu source, existing shells

No new navigation system, no new Hall, no new header component.

1. **One destination registry.** Extend `src/lib/navigation/hierarchy.ts` into the single source of menu structure: Level 1 (global), Level 2 (area), Level 3 (section), each entry carrying its label, path, parent hall and audience. `core-routes.ts` (Frassy) and the shells all read from it — no duplicate lists.
2. **`SiteShell` header adopts the grouped menu.** The 106-page header gets the grouped structure `GatewayNav` already proves out: Welcome Hall · Frass District · Fashion & Shopping · Kids World · Community · My Space (+ Founder Hall / Frassy Studios only when authorized). Sub-destinations live inside their group, not in the top bar.
3. **`GatewayNav` becomes a thin wrapper** over the same registry so shop/world pages and everything else show the same labels and the same current-area highlight. One menu pattern, two skins at most.
4. **Kids keeps its own navigation.** Child-facing routes keep the large-target, icon-led kids nav; the adult grouped menu is not applied there, and Founder/Admin/Studios/Vault entries never render inside Kids.
5. **Location, Home, Back.** `FrassTrail` is driven by the same registry so every major page shows `Frass Hill → Area → Page`. Home/logo rules and app-level Back use `intentionalParent()` (already implemented) rather than browser history.
6. **Founder Hall + Frassy Studios grouping.** Existing Founder and Studios pages are regrouped into the named buckets (Home, Create & Media, Business, Vaults, Community, Content, Analytics & Money, Site Management, Settings; Studios: Studio Home, Create, My Productions, Review, Publish, Performance, with Library / Series & Characters / Distribution / Tools / Settings as secondary). No pages created, none removed — links only.
7. **Route classification sweep.** Every active route is labelled USER-REACHABLE / ROLE-RESTRICTED / SYSTEM-INTERNAL / INTENTIONAL REDIRECT / DEPRECATED–FOUNDER REVIEW. Anything orphaned is listed for your decision, not deleted.
8. **Real journey testing.** Desktop and phone-size walkthroughs of the journeys you listed (District, Kicks, Drip, Plus, Bridal, Luxury House, Kids age areas, Community, Personal → My Vaults → Vault, Founder Hall → Studios), signed out and signed in, with screenshots. Navigation-specific rendering faults fixed; anything that looks like a *global* typography/rendering fault is documented as GLOBAL RENDERING ISSUE for the later visual pass, not patched page by page.
9. **Documentation.** `FRASS_NAVIGATION_MAP.md` created with all 26 required sections, plus the plain-language "WHEN I WANT TO…" guide using the final on-screen labels. `FRASS_SITE_MAP.md` updated only where hierarchy actually changed.

## Guardrails

- Menu visibility is never treated as security — RLS, role gates and every prior security fix stay exactly as they are.
- No commerce, cart, Try-On, feed, Vault Engine, Studios or Kids-safety behaviour is modified; only how you reach them.
- Frass naming preserved verbatim throughout.
- Work stops at the final report and verdict (PASS / PASS WITH ISSUES / FAIL) with a recommended next action — Build 4 is not started.

## Technical notes

- Files touched: `src/lib/navigation/hierarchy.ts`, `src/lib/navigation/core-routes.ts`, `src/components/site-shell.tsx`, `src/components/gateway-nav.tsx`, `src/components/frass-trail.tsx`, Founder/Studios nav components, Kids nav components, and link corrections in individual routes where a link is dead or points at the wrong Home.
- No route files are deleted; redirects stay as redirects.
- Verification: typecheck, build, plus Playwright desktop (1280px) and mobile (390px) runs against the live preview with screenshots.
