# Legacy Route Consolidation — Phase 2, Step 1

Implementation of the frozen 201-card World Teleporter audit. No new pages, no redesigns, no reopened audit. Every old address keeps working; each one now lands directly on its canonical home in one hop.

## The 21 red cards and their canonical homes

| Old route | Canonical destination | Action |
| --- | --- | --- |
| /shop-frass | /frass-district | Already redirects — keep, permanent |
| /kicks-district | /frass-district | Retarget (today it hops via /shop-frass) |
| /frass-kicks | /frass-district | Retarget; /frass-kicks/men, /women and deeper untouched |
| /frass-drip | /frass-district | Retarget; deeper men/women collections untouched |
| /bare-drip | /frass-district | Retarget; deeper men/women untouched |
| /plus-size/men | /frass-plus/men | Already correct — keep |
| /plus-size/women | /frass-plus/women | Already correct — keep |
| /frass-kids/boys | /frass-kids | Already correct; age routes 0-3, 3-6, 6-12, 12+ untouched |
| /frass-kids/girls | /frass-kids | Already correct |
| /frass-world | /frass-hill | Already correct — make permanent |
| /command | /control-room | Already correct, stays behind Founder authorisation |
| /founder | /control-room | Already correct, stays behind Founder authorisation |
| /gateway | /welcome-hall | Retarget (currently points at the root) |
| /welcome | /welcome-hall | New redirect after the first-arrival ceremony is moved into the Hall |
| /workspace/journal | /journal | Already correct; Journal gets its link inside the Daily/Workspace nav |
| /daily | /room?daily=1 | Already correct — keep, query preserved |
| /builder-hall | /room | New redirect; unique content check below |
| /builder/$handle | /card/$handle | Already correct; graceful "card not found" verified |
| /admin | /control-room | Retarget (today it lands on /admin/images); all /admin/* tools untouched |
| / | unchanged (canonical) | Three-door cinematic arrival restored; doors point at canonical routes |
| /welcome-hall | unchanged | Registry marks it red, your directive locks it as canonical — flagged, not touched |

## Root arrival — three doors (correction, locked)

The root stays canonical and never redirects to Welcome Hall. It presents the approved three-door cinematic arrival, restored from the existing arch concept and refreshed against the supplied reference imagery rather than redesigned:

- **Door 1 — Frass District**: shopping and the FrassKicks retail ecosystem. Goes to `/frass-district`. Identity: luxury, shopping, elegance.
- **Door 2 — Frass Hill**: community, Builders, opportunity, the wider ecosystem. Goes through the approved Frass Hill welcome experience. Identity: purpose, building, community.
- **Door 3 — Frass Kids**: the children's and parent journey. Goes through the approved Frass Kids / Kids Valley welcome experience. Identity: wonder, animation, adventure, storybook.

Three equal entrances. Frass Kids is never nested under the Frass Hill door, and the root is never returned to a two-door Shop-vs-Hill gateway. No new gateway page is created; the existing root arrival is updated in place, and each door keeps its own visual character.

## Content that must survive

**/welcome (First Arrival ceremony)** — the spoken personal greeting, the arrival-state lookup and the walk into the Hall move into Welcome Hall as a *first-arrival state* (`/welcome-hall?arrival=first`). Nothing is deleted; the ceremony becomes one of the Hall's arrival states, exactly as the Welcome Architecture lock requires. Only after it renders inside the Hall does /welcome become a redirect that preserves any `next` parameter.

**/builder-hall** — before redirecting, its distinct pieces (working style, learning preferences, momentum, journey stage strip) are checked against My Workspace. Anything present only on Builder Hall is carried into the Workspace; if something cannot be placed unambiguously, the route is left alone and flagged for you instead of being removed.

**/workspace/journal** — the Journal keeps private-by-default entries, mood/state selection, optional Founder sharing and the First Week Promise at /journal. The only change is that the Daily/Workspace navigation links to it directly, so there is one Journal, one door.

## Navigation and internal links

Every internal button, menu item, Frassy destination and site-map entry that currently points at an old address is repointed at the canonical one, so members never bounce through a redirect. Button wording such as "Shop Frass" stays; only the destination changes. Sitemap and canonical tags list canonical routes only. Duplicate menu entries for consolidated routes are removed from navigation, while the URL itself keeps working for bookmarks and QR codes.

## Verification before I report back

- Every red route resolves in exactly one hop, with no loops and no A→B→C chains.
- Query strings, auth return paths (`?next=`), payment tokens and dynamic parameters survive the redirect.
- Dynamic routes ($handle, $category, $sub, $product, $token) are untouched.
- 201-card registry intact; 174 Live & Linked cards unchanged apart from receiving links; 6 Built-but-Unlinked still accounted for.
- Welcome Hall, Frass District, Founder Control Room and Frass Plus+ remain the canonical names; Kids architecture intact.
- Founder/admin access stays server-authorised; no admin content renders during a redirect.

Then a Legacy Route Verification report covering all 21 cards: old route, final route, status, content migrated, links updated, chains, anything left unchanged, and anything needing your review.

## Technical notes

- Redirects use `beforeLoad` + `throw redirect({ to, replace: true })` in the existing route files. No new route files are created unless an audited legacy URL cannot be preserved without one; modifying existing route definitions or router aliases comes first.
- Chain removal: `kicks-district.tsx`, `frass-kicks.index.tsx`, `frass-drip.index.tsx`, `bare-drip.index.tsx` change their target from `/shop-frass` to `/frass-district`.
- `/admin` (`admin.index.tsx`) redirects to `/control-room`; the `_authenticated` gate and Founder server-side role check remain the only permission source.
- The registry file `src/lib/founder/world-teleporter.ts` is data, not logic; red cards keep their card numbers and stay marked legacy so future audits do not count them as destinations.
- The Teleporter audit tables and card numbering are not modified.
