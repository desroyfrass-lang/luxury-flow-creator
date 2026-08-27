# Frass Hill — Master Navigation Foundation Pass (Prompt 1 of 3)

Goal: make the *visible menus* usable for a human being, expose the whole ecosystem coherently, and give each world back its own character — without rebuilding anything, deleting pages, renaming Frass properties, or starting Frassy Studios Build 4.

## What is actually there right now (re-verified)

- 143 route files under `src/routes` plus nested folders; the ~234 declarations in `FRASS_SITE_MAP.md` still hold.
- **Two competing visible shells.** `src/components/site-shell.tsx` is used by **106 route files** and shows only 5 header items plus 5 hamburger items — most of the ecosystem is invisible from it. `src/components/gateway-nav.tsx` holds the richer grouped `shop`/`world` menus but is used by only a handful of routes.
- **Three destination lists.** `hierarchy.ts` (place → hall → parent → audience, already good), `core-routes.ts` (Frassy's `open_place`), and the hard-coded arrays inside both shells.
- `frass-trail.tsx` breadcrumb is mounted globally in `__root.tsx` but the headers ignore it.
- Kids World currently renders inside the adult `SiteShell` with a text-link age bar — an adult chrome wrapping a children's world.

So the problem is not missing routes. It is three competing lists, two headers, and one generic template flattening distinct worlds.

## The approach

### A. One navigation truth — not one visual menu

1. Extend `src/lib/navigation/hierarchy.ts` into the single authoritative registry: label, path, parent, hall/world, audience, navigation level (Global / Area / Section), role visibility, intentional parent, highlight rules. No second registry is created.
2. `core-routes.ts` derives from it, so Frassy's `open_place` can never contradict the menus, and never offers a destination the current user is not authorized for.
3. `SiteShell` and `GatewayNav` both consume it. `GatewayNav` becomes a presentation skin, not a second source of truth.

### B. Correct master hierarchy (Founder correction applied)

**Frass District IS the fashion/shopping district.** No separate "Fashion & Shopping" destination is created.

```text
FRASS HILL
├── Welcome Hall
├── Frass District  (fashion / shopping)
│   ├── Frass Kicks · Frass Drip · Plus Size · Bridal · Luxury House
│   └── other existing District/commerce destinations from the route map
├── Kids World / Frass Kids
├── Socials / Community
├── My Space (member personal)
├── My Vaults
└── Authorized internal — Founder Hall · Frassy Studios
```

Three levels are kept distinct: Global menu → Area menu → Section menu. No single giant menu.

### C. Distinctive worlds, shared architecture

Same registry underneath, deliberately different presentation on top:

- **Frass District** — obviously the shopping district; District Home, District-local navigation, consistent return-to-District and return-to-Frass-Hill.
- **Bridal** — elegant, occasion-led. Bridal Home identity, Bride / Groom / Wedding Party distinctions where routes already exist, bridal imagery, generous spacing. No new bridal commerce invented.
- **Luxury House** — premium and quiet. Luxury Home identity, restrained type, editorial category navigation. Never a plain District category page.
- **Kids World** — child-first (below).
- **My Space / My Vaults / Founder Hall / Frassy Studios** — personal, owned-workspace, control-centre and production presentations respectively.

### D. Kids World — child-first, age-banded

Kids stops rendering as an adult shell with kids content inside it. Age bands 0–3, 3–6, 6–9, 9–12, 12–15, 15–18 are preserved and each gets navigation matched to the child:

- **0–3** — no reading required: colour, big pictures, characters, very few enormous buttons, visual Home and Back.
- **3–6** — picture/icon-led with very short words, large colourful category buttons.
- **6–9** — strong visuals with short readable labels, slightly more choice, still plainly playful.
- **9–12** — more independence and category depth, still visibly a kids environment.
- **12–15** — more text and structure, youth-styled, never a business workspace.
- **15–18** — the most mature youth interface, denser but still continuous with Kids World.

Kids World Home becomes large visual age entrances rather than a list of text links. No adult grouped menu, no Founder Hall / Studios / Admin / Vault / adult Socials links inside child routes. Kids retail keeps Frass Kicks Kids and Frass Drip Kids with its existing taxonomy including School Drip. Kids feeds, infinite scroll and safety boundaries are untouched. For young bands, breadcrumbs become visual Home/Back cues, not text trails.

### E. Founder Hall & Frassy Studios — grouping only

Existing Founder pages regrouped under Home, Create & Media, Business, Vaults, Community, Content, Analytics & Money, Site Management, Settings. Studios everyday navigation surfaces Studio Home, Create, My Productions, Review, Publish, Performance, with Library, Series & Characters, Distribution, Studio Tools and Settings as secondary. Distribution Network, Content Calendar, Media Performance, Frass Media Revenue and Publishing Center all remain — access improves, functionality does not change. Builds 1–3 preserved, Build 4 not started.

### F. Home, Back, location

Home is per-area and predictable (Welcome Hall, District Home, Kids Home, Bridal Home, Luxury Home, My Space, My Vaults, Founder Hall, Studio Home). App-level Back uses the existing `intentionalParent()` hierarchy rather than raw browser history. `FrassTrail` derives from the same registry, and renders age-appropriate cues in Kids.

### G. Audit, test, document

- Classify every active route: USER-REACHABLE / ROLE-RESTRICTED / SYSTEM-INTERNAL / INTENTIONAL REDIRECT / DEPRECATED–FOUNDER REVIEW. Nothing deleted; orphans reported for your decision.
- Real Playwright journeys A–J at 1280px and 390px, signed out and signed in, interacting with menus rather than reading CSS — including each Kids age band judged on whether it *feels* made for that child.
- Fix navigation-specific rendering faults; document anything that looks like a **global** typography/rendering fault for the later consolidated visual pass instead of patching pages one by one.
- Create `FRASS_NAVIGATION_MAP.md` with all 34 required sections including the World/Area Experience Rules that stop future work flattening these worlds back into one template, plus the plain-language "WHEN I WANT TO…" guide using the labels actually on screen. Update `FRASS_SITE_MAP.md` only where hierarchy genuinely changed.

## Guardrails

- Menu visibility is never treated as authorization — RLS, role gates and every prior security fix stay exactly as they are. A genuine unsafe path, if found, is stopped and reported, not quietly patched around.
- No route files deleted; redirects stay redirects.
- Commerce, cart, Try-On, profiles, saved items, feeds, the Self-Service Vault Engine and Vault isolation are untouched.
- Frass naming preserved verbatim.
- Work stops at the final report, the 53-point results list, the verdict and the six yes/no answers. Prompt 2 and Build 4 are not started.

## Technical notes

Files expected to change: `src/lib/navigation/hierarchy.ts`, `src/lib/navigation/core-routes.ts`, `src/components/site-shell.tsx`, `src/components/gateway-nav.tsx`, `src/components/frass-trail.tsx`, the Kids navigation components under `src/components/kids*`, Founder and Studios navigation components, plus individual link corrections where a link is dead or points at the wrong Home. Verification: `tsgo` typecheck, build, and Playwright desktop/mobile runs with a small set of representative screenshots.
