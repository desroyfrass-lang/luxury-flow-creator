# FRASS HILL — Navigation Recovery Plan

## Objective

Pause feature development and make the existing Frass ecosystem understandable without rebuilding it. Preserve every working route, Hall, production system, commerce function, security gate, Onboarding flow, Teleporter record, and approved Frassy identity.

## Verified baseline

- The application currently declares **234 file-based routes**: 89 under the authenticated layout and 145 outside it.
- **20 route files contain redirect behavior**. Authentication also redirects through the Welcome Hall, and the globally mounted Daily can move a signed-in user to My Workspace.
- Two broad navigation shells currently coexist: `GatewayNav` and `SiteShell`. They use different menus while both serve major parts of the ecosystem.
- The global `FrassTrail` currently sends **Back through browser history first** and sends **Home to `/`**. It derives parents from URL segments, so a URL parent is not always the intended Hall parent.
- Welcome Hall is deliberately excluded from `FrassTrail`, has its own arrival controls, and currently lists destinations without a complete role-aware Hall directory.
- Founder Control Room currently exposes **11 peer tabs** from `COMMAND_SECTIONS`.
- Frassy Studios currently exposes **26 peer navigation items** from `STUDIO_NAV`.
- The existing `FRASS_SITE_MAP.md` says 143 route files and is therefore no longer a reliable current inventory.
- Static route-link comparison found no missing literal route targets, but dynamic destinations, redirects, role visibility, and actual rendered journeys still require browser verification.

## What this means in plain English

The rooms are still there and the locks still work, but the signs were installed at different times. We will inventory every door, create one trustworthy town map, then make the existing signs follow that map.

## Phase 1 — Complete read-only inventory

Create a developer-facing navigation audit covering every declared page and system endpoint. For each route record:

- URL and page name
- Hall, section, and intentional parent
- audience classification: PUBLIC, CUSTOMER, MEMBER, KIDS, CREATOR, ADMIN, FOUNDER, or SYSTEM
- verified authentication and role enforcement
- known entry points and navigation component(s)
- current Back, Home, and logo behavior
- redirects and reason
- reachability, duplicate/legacy status, and confusion notes

The audit will also inventory headers, sidebars, drawers, mobile menus, footer links, breadcrumbs, back/home controls, logo links, auth/onboarding/daily redirects, and automatic navigation. Access will be recorded from actual route layouts, gates, and server checks—not guessed from page names.

Deliverables:

- refreshed `FRASS_SITE_MAP.md` as the full current developer route map
- a navigation findings section with totals for Halls, components, duplicate systems, redirects/chains, dead links, and orphan candidates
- explicit `FROM → TO → WHY` redirect table

## Phase 2 — One canonical hierarchy and navigation registry

Extend the existing navigation source-of-truth approach rather than add another navigation layer. Define intentional hierarchy metadata for user-facing routes:

```text
FRASS HILL
└── WELCOME HALL
    └── DESTINATION / HALL
        └── SECTION
            └── PAGE
```

The registry will hold the display name, Hall, section, intentional parent, audience, and canonical Home destination used by existing navigation components. Dynamic routes will use route-family rules so product, production, and activity pages receive correct parents without exposing private IDs.

System/API routes remain in the audit but never appear in user navigation.

## Phase 3 — Consolidate the existing global navigation

Refactor the existing `GatewayNav`, `SiteShell`, and `FrassTrail` around the same canonical registry and shared role-aware controls.

- Preserve genuine visual modes for District, Hill, Kids, Workspace, Founder Hall, and Studios.
- Give every major user-facing page a quiet orientation line: Hall → section → page.
- Provide consistent access to **Site Home (`/`)** and **Welcome Hall (`/welcome-hall`)** where appropriate.
- Define one logo rule: the primary Frass brand logo always returns to Site Home; Hall-specific controls are visibly labelled and return to that Hall.
- Replace history-first application Back with the route registry’s intentional parent: Page → Section → Hall → Welcome Hall.
- Keep browser Back available as browser behavior, but do not use it as the app’s orientation rule.
- Preserve immersive/security exceptions only where verified and give each exception an explicit exit.
- Reuse the existing approved face-only Frassy; no new character asset or full-body treatment.

## Phase 4 — Welcome Hall and role-aware doors

Make Welcome Hall the clear Frass Hill arrival/orientation point without changing the root three-door entrance.

- Lead with “Welcome to Frass Hill.”
- Show only destinations the resolved role can enter.
- Keep Founder/Admin destinations absent for guests, customers, members, and creators.
- Give authorized Founder/Admin users a clear Founder Hall door.
- Keep backend route authorization and database policies authoritative; link visibility is only the presentation layer.
- Preserve required first-arrival, daily welcome, and onboarding ceremonies, while preventing unrelated multi-hop bouncing.
- Document any mandatory redirect whose behavior must remain.

## Phase 5 — Founder Hall consolidation

Keep `/control-room` as the one Founder headquarters and preserve `/command` and `/founder` as one-hop legacy redirects.

Reorganize existing tools into these eight visible groups:

1. Home
2. Create & Media
3. Business
4. Community
5. Content
6. Analytics & Money
7. Site Management
8. Settings

Existing technical tools—including audits, repair, security, AI operations, simulator, Teleporter, and release controls—will remain available inside the appropriate group rather than appearing as equal top-level destinations. Add permanent, clearly labelled routes to Founder Hall Home and Welcome Hall. No Founder capability will be removed.

## Phase 6 — Frassy Studios consolidation

Keep all current Studio routes and systems, but divide the existing registry into primary and secondary navigation.

Primary:

- Studio Home
- Create
- My Productions
- Review
- Publish
- Performance

Secondary:

- Library
- Series & Characters
- Studio Tools
- Settings

Generation jobs, providers, connections, platform capabilities, usage, calendar, distribution, analytics, and monetization remain reachable under the appropriate secondary/primary group. The Studio shell will always show:

```text
Frass Hill → Founder Hall → Frassy Studios → Current page
```

It will include intentional links to Studio Home, Founder Hall, and Welcome Hall.

## Phase 7 — Hall-level navigation and safe deduplication

For each verified Hall or district:

- identify the existing shell that owns it
- show Hall identity and current section
- use the canonical parent map for Back/Home
- consolidate duplicate header/menu logic only after every consumer is listed
- retain unique Kids, Workspace, commerce, and immersive behavior where it serves a real audience need

No component will be removed until all importing routes are accounted for. No route or capability will be deleted merely because it is confusing.

## Phase 8 — Redirect and dead-end repair

- Resolve unnecessary redirect chains to one hop while preserving old public URLs.
- Keep authentication, authorization, required onboarding, and daily-welcome gates.
- Preserve the original requested destination through sign-in/welcome when policy permits; when a ceremony must override it, return predictably afterward.
- Correct orphaned pages, misleading parent links, unexpected logo destinations, and pages with no obvious exit.
- Do not modify generated route-tree files.

## Phase 9 — Verification

### Automated checks

- Validate every literal navigation target against the generated route set.
- Validate every user-facing route has hierarchy metadata or an explicit documented exception.
- Validate parent chains terminate at Welcome Hall or Site Home without cycles.
- Validate Founder/Admin links never render to unauthorized roles.
- Validate legacy redirects terminate in one intentional destination.
- Run targeted tests, type check, build, and inspect fresh build/runtime logs.

### Founder journeys — desktop and mobile

- Entry → Welcome Hall
- Welcome Hall → Founder Hall
- Founder Hall → Frassy Studios
- Frassy Studios → Create
- Create → Studio Home
- Studio Home → Founder Hall
- Founder Hall → Welcome Hall
- Welcome Hall → customer-facing destination → Welcome Hall

At every step verify location, available action, intentional Back, Home/Welcome Hall access, current state, menu open/close behavior, touch targets, clipping, overlap, and redirects.

### Non-Founder journeys — desktop and mobile

Use a normal non-Founder account and verify Founder Hall is absent from navigation, manually entered Founder routes remain protected, no dead Founder links appear, Welcome Hall is understandable, customer/member destinations work, and return to Welcome Hall is simple.

## Completion report

Stop after navigation recovery and report:

- total routes audited
- Halls identified
- navigation systems/components discovered
- duplicates found and safely consolidated
- redirect chains found and corrected
- dead links found/fixed
- orphan pages found/resolved or retained with reasons
- final global, Founder Hall, and Frassy Studios structures
- Welcome Hall, logo, Back, mobile, and role-aware behavior
- remaining confusing or unsafe-to-change routes
- files changed
- confirmation that no major functionality was removed
- desktop/mobile evidence for Founder and non-Founder journeys
- a Founder-facing **FRASS HILL NAVIGATION MAP** written as: “When I want to ___, I go to ___.”

No Build 4 or unrelated feature work begins after this report.
