# FRASSKICKS.COM — CURRENT SITE & NAVIGATION MAP

**Audit status:** Navigation recovery complete against the current source tree.  
**Verified inventory:** 234 declared file-based routes: 138 public, 37 signed-in Builder, 52 Founder/Admin, and 7 system/API routes.  
**Naming rule:** FRASS is intentional and must never be autocorrected.

## What changed

The website was not rebuilt and no working page was deleted. Existing navigation was consolidated around one hierarchy source so every ordinary page can answer: where am I, which Hall owns this page, and where does Back go?

```text
SITE HOME
└── WELCOME HALL
    └── HALL / DISTRICT
        └── SECTION
            └── PAGE
```

- The primary Frass logo returns to Site Home (`/`).
- Welcome Hall is a direct, labelled destination in the existing global menus.
- The on-page Back control now follows the intentional parent above rather than browser history.
- Founder Hall and Frassy Studios use grouped menus instead of long lists of equal-weight tabs.
- Founder/Admin doors are shown only after the role check resolves; backend authorization remains authoritative.
- The Daily may open over the current page, but it no longer sends someone to `/room` merely because it opened or was dismissed. Only an explicit project-opening action goes to My Workspace.
- First Arrival now carries the intended `next` destination into Welcome Hall.

## The nine navigational places

1. **Welcome Hall** — the orientation point after Site Home.
2. **Frass Hill** — the town and its public places.
3. **Town Square / Community Hall** — public gathering and For Us.
4. **Builders Village / My Builder Hall** — private Builder work, Daily, Academy, Opportunity, Vault and money.
5. **Founder Hall** — the single Founder/Admin headquarters at `/control-room`.
6. **Frassy Studios** — Founder/Admin production wing inside Founder Hall.
7. **Studio District** — FV Studios, Frass Vision Studios and Frass Radio.
8. **Frass District** — shopping, stores, products and checkout.
9. **Children's Village** — Kids Valley and Kids World.

“Performance Hall” and “Apprenticeship Hall” remain concepts described inside existing town content; they are not separate global navigation shells.

## Existing navigation systems

| Existing system | Responsibility after consolidation |
|---|---|
| `GatewayNav` | Main District/Hill navigation and mode switcher. |
| `SiteShell` | Alternate page-family shell; now follows the same Site Home and Welcome Hall rules. |
| `FrassTrail` | Fixed orientation chip with deterministic parent Back and Site Home. |
| Welcome Hall directory | Role-aware doors into the ecosystem. |
| Founder Control Room navigation | Eight grouped Founder areas; capabilities retained. |
| Frassy Studios navigation | Six primary destinations plus grouped secondary tools. |
| Kids World navigation | Age-safe, child-specific navigation retained. |
| Workspace navigation | Builder work and identity destinations retained. |

The two broad visual shells remain because they serve different page families; a third shell was not added. Their conflicting Home/Welcome rules were aligned instead.

## Redirect record — FROM → TO → WHY

| From | To | Why |
|---|---|---|
| `/welcome` | `/welcome-hall?arrival=first` | Legacy arrival address; preserves a valid local next destination. |
| `/gateway` | `/welcome-hall` | Legacy gateway address. |
| `/frass-world` | `/frass-hill` | Legacy world address. |
| `/kicks-district` | `/frass-district` | Legacy District address. |
| `/shop-frass` | `/frass-district` | Legacy District address. |
| `/frass-kicks` | `/frass-district` | Store layout index returns to the District. |
| `/frass-drip` | `/frass-district` | Store layout index returns to the District. |
| `/bare-drip` | `/frass-district` | Store layout index returns to the District. |
| `/frass-kids/boys` | `/frass-kids` | Legacy segment address. |
| `/frass-kids/girls` | `/frass-kids` | Legacy segment address. |
| `/plus-size/men` | `/frass-plus/men` | Legacy brand address. |
| `/plus-size/women` | `/frass-plus/women` | Legacy brand address. |
| `/builder/$handle` | `/card/$handle` | Legacy public Builder-card address. |
| `/daily` | `/room?daily=true` | The Daily remains one experience, opened from My Workspace. |
| `/admin` | `/control-room` | Founder administration enters through Founder Hall. |
| `/command` | `/control-room` | Legacy Founder headquarters address. |
| `/founder` | `/control-room` | Legacy Founder headquarters address. |
| `/workspace/journal` | `/journal` | Legacy Workspace Journal address. |
| `Protected route without a session` | `/auth?next=<requested page>` | Authentication gate; requested page is preserved. |
| `Signed-in first arrival` | `/welcome-hall?arrival=first&next=<requested page>` | Required arrival ceremony; requested page is preserved. |

### Redirect findings

- Canonical legacy redirects now terminate in one hop; the old `/kicks-district → /shop-frass → /frass-district` chain is gone.
- The Core Route Registry now matches the live `/daily → /room?daily=true` behavior.
- The authentication and First Arrival sequence intentionally uses more than one step because it verifies identity and performs the required welcome; it now preserves the requested destination.
- A theoretical `/auth` ↔ First Arrival bounce can still occur if browser session hydration repeatedly fails. This was retained because changing authentication behavior without a reproducible failure would be unsafe.
- The platform-managed OAuth consent route can redirect to the provider-approved callback returned by the backend. It is a system route, not a menu destination, and remains unchanged.

## Founder-facing FRASS HILL NAVIGATION MAP

- When I want to **enter the ecosystem**, I go to **Site Home**, then **Welcome Hall**.
- When I want to **see the whole town**, I go to **Frass Hill**.
- When I want to **shop**, I go to **Frass District**.
- When I want to **see community stories**, I go to **For Us in Community Hall**.
- When I want to **work on my day**, I go to **My Workspace**.
- When I want to **continue my Builder journey**, I go to **My Builder Hall**.
- When I want to **learn**, I go to **Academy in Builders Village**.
- When I want to **find the next practical opportunity**, I go to **Opportunity Centre**.
- When I want to **work with files and assets**, I go to **Builder Vault**.
- When I want to **manage money**, I go to **Financial Center**.
- When I want to **manage the whole platform**, I go to **Founder Hall**.
- When I want to **create, review or publish media**, I go to **Frassy Studios inside Founder Hall**.
- When I want to **return to the Studio entrance**, I go to **Studio Home**.
- When I want to **return from Studios to platform management**, I go to **Founder Hall**.
- When I want to **start orientation again**, I go to **Welcome Hall**.
- When I want to **return to the three-door entrance**, I use the **Frass logo or Home**.

## Founder Hall structure

1. Home
2. Create & Media
3. Business
4. Community
5. Content
6. Analytics & Money
7. Site Management
8. Settings

Audits, repair, security, AI operations, simulation, Teleporter and release controls remain available within these groups. No Founder capability was removed.

## Frassy Studios structure

**Primary:** Studio Home · Create · My Productions · Review · Publish · Performance  
**Secondary:** Library · Series & Characters · Studio Tools · Settings

The Studio shell identifies the current location as:

```text
Frass Hill → Founder Hall → Frassy Studios → Current page
```

## Verification evidence

- Direct source audit: 234 route declarations across the current route tree.
- Literal link audit: no missing static route target was identified.
- Redirect audit: 20 route files contain redirect behavior; global auth/arrival/Daily gates were audited separately.
- Desktop and mobile public checks: Welcome Hall and Frass District rendered without observed overlap.
- Desktop and mobile Founder checks: `/control-room`, `/studios/create`, and `/studios` remained on the requested URLs and rendered the expected Founder/Studio headings after role resolution; no page errors were observed.
- Non-Founder check: Founder Hall was absent from the normal member interface. Direct access stayed behind authentication/role systems, although the mandatory arrival ceremony can appear before the denial state and should receive final Founder acceptance testing.
- Type check passed after navigation changes. Build status is recorded by the preview build log.

## Known retained boundaries

- Global ceremonies and first-use Frassy preference prompts can temporarily cover a page. They no longer replace an intentionally opened Studio/Founder URL, but they remain by design.
- Dynamic destinations and external provider callback URLs cannot all be validated as literal static links.
- Existing conceptual Halls named in editorial content were not promoted into new navigation destinations.
- No route was deleted solely because it was old or confusing.

## Complete route inventory

The declared route ID is included because pathless authenticated layouts are part of the code hierarchy even though `_authenticated` is not visible in the public URL.

### Frass Hill and public routes (49)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/arrival` | PUBLIC | `/arrival` | `src/routes/arrival.tsx` |
| `/auth` | PUBLIC | `/auth` | `src/routes/auth.tsx` |
| `/blog/$slug` | PUBLIC | `/blog/$slug` | `src/routes/blog.$slug.tsx` |
| `/blog/` | PUBLIC | `/blog/` | `src/routes/blog.index.tsx` |
| `/blog` | PUBLIC | `/blog` | `src/routes/blog.tsx` |
| `/brand-partnerships/brands/$brand` | PUBLIC | `/brand-partnerships/brands/$brand` | `src/routes/brand-partnerships.brands.$brand.tsx` |
| `/brand-partnerships/campaigns/$campaign` | PUBLIC | `/brand-partnerships/campaigns/$campaign` | `src/routes/brand-partnerships.campaigns.$campaign.tsx` |
| `/brand-partnerships/creators/$creator` | PUBLIC | `/brand-partnerships/creators/$creator` | `src/routes/brand-partnerships.creators.$creator.tsx` |
| `/brand-partnerships/` | PUBLIC | `/brand-partnerships/` | `src/routes/brand-partnerships.index.tsx` |
| `/brand-partnerships` | PUBLIC | `/brand-partnerships` | `src/routes/brand-partnerships.tsx` |
| `/builder/$handle` | PUBLIC | `/builder/$handle` | `src/routes/builder.$handle.tsx` |
| `/card/$handle` | PUBLIC | `/card/$handle` | `src/routes/card.$handle.tsx` |
| `/collection/$handle` | PUBLIC | `/collection/$handle` | `src/routes/collection.$handle.tsx` |
| `/daily` | PUBLIC | `/daily` | `src/routes/daily.tsx` |
| `/for-me` | PUBLIC | `/for-me` | `src/routes/for-me.tsx` |
| `/for-us` | PUBLIC | `/for-us` | `src/routes/for-us.tsx` |
| `/frass-hill-journey` | PUBLIC | `/frass-hill-journey` | `src/routes/frass-hill-journey.tsx` |
| `/frass-hill` | PUBLIC | `/frass-hill` | `src/routes/frass-hill.tsx` |
| `/frass-hosting` | PUBLIC | `/frass-hosting` | `src/routes/frass-hosting.tsx` |
| `/frass-radio` | PUBLIC | `/frass-radio` | `src/routes/frass-radio.tsx` |
| `/frass-world` | PUBLIC | `/frass-world` | `src/routes/frass-world.tsx` |
| `/fresh-start` | PUBLIC | `/fresh-start` | `src/routes/fresh-start.tsx` |
| `/fv-studios` | PUBLIC | `/fv-studios` | `src/routes/fv-studios.tsx` |
| `/gallery/studio` | PUBLIC | `/gallery/studio` | `src/routes/gallery.studio.tsx` |
| `/gateway` | PUBLIC | `/gateway` | `src/routes/gateway.tsx` |
| `/health-wellness` | PUBLIC | `/health-wellness` | `src/routes/health-wellness.tsx` |
| `/` | PUBLIC | `/` | `src/routes/index.tsx` |
| `/join/frass-hill` | PUBLIC | `/join/frass-hill` | `src/routes/join.frass-hill.tsx` |
| `/join/frasskicks` | PUBLIC | `/join/frasskicks` | `src/routes/join.frasskicks.tsx` |
| `/join/` | PUBLIC | `/join/` | `src/routes/join.index.tsx` |
| `/legal/$level` | PUBLIC | `/legal/$level` | `src/routes/legal.$level.tsx` |
| `/legal/` | PUBLIC | `/legal/` | `src/routes/legal.index.tsx` |
| `/link/$handle` | PUBLIC | `/link/$handle` | `src/routes/link.$handle.tsx` |
| `/live/$broadcastId` | PUBLIC | `/live/$broadcastId` | `src/routes/live.$broadcastId.tsx` |
| `/live/go` | PUBLIC | `/live/go` | `src/routes/live.go.tsx` |
| `/live/` | PUBLIC | `/live/` | `src/routes/live.index.tsx` |
| `/live` | PUBLIC | `/live` | `src/routes/live.tsx` |
| `/lovable/email/auth/preview` | PUBLIC | `/lovable/email/auth/preview` | `src/routes/lovable/email/auth/preview.ts` |
| `/lovable/email/auth/webhook` | PUBLIC | `/lovable/email/auth/webhook` | `src/routes/lovable/email/auth/webhook.ts` |
| `/lovable/email/queue/process` | PUBLIC | `/lovable/email/queue/process` | `src/routes/lovable/email/queue/process.ts` |
| `/mcp` | PUBLIC | `/mcp` | `src/routes/mcp.ts` |
| `/music-media` | PUBLIC | `/music-media` | `src/routes/music-media.tsx` |
| `/pay/$token` | PUBLIC | `/pay/$token` | `src/routes/pay.$token.tsx` |
| `/reset-password` | PUBLIC | `/reset-password` | `src/routes/reset-password.tsx` |
| `/services` | PUBLIC | `/services` | `src/routes/services.tsx` |
| `/signed-out` | PUBLIC | `/signed-out` | `src/routes/signed-out.tsx` |
| `/town-square` | PUBLIC | `/town-square` | `src/routes/town-square.tsx` |
| `/welcome-hall` | PUBLIC | `/welcome-hall` | `src/routes/welcome-hall.tsx` |
| `/welcome` | PUBLIC | `/welcome` | `src/routes/welcome.tsx` |

### Frass District and commerce (80)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/afro-designers/collections/$slug` | PUBLIC | `/afro-designers/collections/$slug` | `src/routes/afro-designers.collections.$slug.tsx` |
| `/afro-designers/designers/$slug` | PUBLIC | `/afro-designers/designers/$slug` | `src/routes/afro-designers.designers.$slug.tsx` |
| `/afro-designers/designers` | PUBLIC | `/afro-designers/designers` | `src/routes/afro-designers.designers.tsx` |
| `/afro-designers/` | PUBLIC | `/afro-designers/` | `src/routes/afro-designers.index.tsx` |
| `/afro-designers/join` | PUBLIC | `/afro-designers/join` | `src/routes/afro-designers.join.tsx` |
| `/afro-designers` | PUBLIC | `/afro-designers` | `src/routes/afro-designers.tsx` |
| `/bare-drip/` | PUBLIC | `/bare-drip/` | `src/routes/bare-drip.index.tsx` |
| `/bare-drip/men/$category` | PUBLIC | `/bare-drip/men/$category` | `src/routes/bare-drip.men.$category.tsx` |
| `/bare-drip/men/` | PUBLIC | `/bare-drip/men/` | `src/routes/bare-drip.men.index.tsx` |
| `/bare-drip/men` | PUBLIC | `/bare-drip/men` | `src/routes/bare-drip.men.tsx` |
| `/bare-drip` | PUBLIC | `/bare-drip` | `src/routes/bare-drip.tsx` |
| `/bare-drip/women/$category` | PUBLIC | `/bare-drip/women/$category` | `src/routes/bare-drip.women.$category.tsx` |
| `/bare-drip/women/` | PUBLIC | `/bare-drip/women/` | `src/routes/bare-drip.women.index.tsx` |
| `/bare-drip/women` | PUBLIC | `/bare-drip/women` | `src/routes/bare-drip.women.tsx` |
| `/bridal-boutique` | PUBLIC | `/bridal-boutique` | `src/routes/bridal-boutique.tsx` |
| `/bridal/collections` | PUBLIC | `/bridal/collections` | `src/routes/bridal.collections.tsx` |
| `/bridal/` | PUBLIC | `/bridal/` | `src/routes/bridal.index.tsx` |
| `/bridal/journey` | PUBLIC | `/bridal/journey` | `src/routes/bridal.journey.tsx` |
| `/bridal/marketplace` | PUBLIC | `/bridal/marketplace` | `src/routes/bridal.marketplace.tsx` |
| `/bridal/sourcing` | PUBLIC | `/bridal/sourcing` | `src/routes/bridal.sourcing.tsx` |
| `/bridal` | PUBLIC | `/bridal` | `src/routes/bridal.tsx` |
| `/bridal/vault` | PUBLIC | `/bridal/vault` | `src/routes/bridal.vault.tsx` |
| `/bridal/walk` | PUBLIC | `/bridal/walk` | `src/routes/bridal.walk.tsx` |
| `/capsules/$handle` | PUBLIC | `/capsules/$handle` | `src/routes/capsules.$handle.tsx` |
| `/capsules/` | PUBLIC | `/capsules/` | `src/routes/capsules.index.tsx` |
| `/capsules` | PUBLIC | `/capsules` | `src/routes/capsules.tsx` |
| `/checkout` | PUBLIC | `/checkout` | `src/routes/checkout.tsx` |
| `/frass-district` | PUBLIC | `/frass-district` | `src/routes/frass-district.tsx` |
| `/frass-drip/` | PUBLIC | `/frass-drip/` | `src/routes/frass-drip.index.tsx` |
| `/frass-drip/men/$category` | PUBLIC | `/frass-drip/men/$category` | `src/routes/frass-drip.men.$category.tsx` |
| `/frass-drip/men/` | PUBLIC | `/frass-drip/men/` | `src/routes/frass-drip.men.index.tsx` |
| `/frass-drip/men` | PUBLIC | `/frass-drip/men` | `src/routes/frass-drip.men.tsx` |
| `/frass-drip` | PUBLIC | `/frass-drip` | `src/routes/frass-drip.tsx` |
| `/frass-drip/women/$category` | PUBLIC | `/frass-drip/women/$category` | `src/routes/frass-drip.women.$category.tsx` |
| `/frass-drip/women/` | PUBLIC | `/frass-drip/women/` | `src/routes/frass-drip.women.index.tsx` |
| `/frass-drip/women` | PUBLIC | `/frass-drip/women` | `src/routes/frass-drip.women.tsx` |
| `/frass-kicks/` | PUBLIC | `/frass-kicks/` | `src/routes/frass-kicks.index.tsx` |
| `/frass-kicks/men` | PUBLIC | `/frass-kicks/men` | `src/routes/frass-kicks.men.tsx` |
| `/frass-kicks` | PUBLIC | `/frass-kicks` | `src/routes/frass-kicks.tsx` |
| `/frass-kicks/women` | PUBLIC | `/frass-kicks/women` | `src/routes/frass-kicks.women.tsx` |
| `/frass-kids/$segment/$collection` | PUBLIC | `/frass-kids/$segment/$collection` | `src/routes/frass-kids.$segment.$collection.tsx` |
| `/frass-kids/$segment/` | PUBLIC | `/frass-kids/$segment/` | `src/routes/frass-kids.$segment.index.tsx` |
| `/frass-kids/$segment/kicks` | PUBLIC | `/frass-kids/$segment/kicks` | `src/routes/frass-kids.$segment.kicks.tsx` |
| `/frass-kids/boys` | PUBLIC | `/frass-kids/boys` | `src/routes/frass-kids.boys.tsx` |
| `/frass-kids/girls` | PUBLIC | `/frass-kids/girls` | `src/routes/frass-kids.girls.tsx` |
| `/frass-kids/` | PUBLIC | `/frass-kids/` | `src/routes/frass-kids.index.tsx` |
| `/frass-kids` | PUBLIC | `/frass-kids` | `src/routes/frass-kids.tsx` |
| `/frass-luxury-house/` | PUBLIC | `/frass-luxury-house/` | `src/routes/frass-luxury-house.index.tsx` |
| `/frass-luxury-house/men` | PUBLIC | `/frass-luxury-house/men` | `src/routes/frass-luxury-house.men.tsx` |
| `/frass-luxury-house` | PUBLIC | `/frass-luxury-house` | `src/routes/frass-luxury-house.tsx` |
| `/frass-luxury-house/women` | PUBLIC | `/frass-luxury-house/women` | `src/routes/frass-luxury-house.women.tsx` |
| `/frass-plus/$gender/$category` | PUBLIC | `/frass-plus/$gender/$category` | `src/routes/frass-plus.$gender.$category.tsx` |
| `/frass-plus/$gender/bare` | PUBLIC | `/frass-plus/$gender/bare` | `src/routes/frass-plus.$gender.bare.tsx` |
| `/frass-plus/$gender/` | PUBLIC | `/frass-plus/$gender/` | `src/routes/frass-plus.$gender.index.tsx` |
| `/frass-plus/$gender/kicks` | PUBLIC | `/frass-plus/$gender/kicks` | `src/routes/frass-plus.$gender.kicks.tsx` |
| `/frass-plus/` | PUBLIC | `/frass-plus/` | `src/routes/frass-plus.index.tsx` |
| `/frass-plus/sales` | PUBLIC | `/frass-plus/sales` | `src/routes/frass-plus.sales.tsx` |
| `/frass-plus` | PUBLIC | `/frass-plus` | `src/routes/frass-plus.tsx` |
| `/frass-shape/$gender/$category` | PUBLIC | `/frass-shape/$gender/$category` | `src/routes/frass-shape.$gender.$category.tsx` |
| `/frass-shape/$gender/goals/$goal` | PUBLIC | `/frass-shape/$gender/goals/$goal` | `src/routes/frass-shape.$gender.goals.$goal.tsx` |
| `/frass-shape/$gender/` | PUBLIC | `/frass-shape/$gender/` | `src/routes/frass-shape.$gender.index.tsx` |
| `/frass-shape/$gender` | PUBLIC | `/frass-shape/$gender` | `src/routes/frass-shape.$gender.tsx` |
| `/frass-shape/` | PUBLIC | `/frass-shape/` | `src/routes/frass-shape.index.tsx` |
| `/frass-shape` | PUBLIC | `/frass-shape` | `src/routes/frass-shape.tsx` |
| `/kicks-district` | PUBLIC | `/kicks-district` | `src/routes/kicks-district.tsx` |
| `/lookbook/$story` | PUBLIC | `/lookbook/$story` | `src/routes/lookbook.$story.tsx` |
| `/lookbook/` | PUBLIC | `/lookbook/` | `src/routes/lookbook.index.tsx` |
| `/lookbook` | PUBLIC | `/lookbook` | `src/routes/lookbook.tsx` |
| `/plus-size/men` | PUBLIC | `/plus-size/men` | `src/routes/plus-size.men.tsx` |
| `/plus-size/women` | PUBLIC | `/plus-size/women` | `src/routes/plus-size.women.tsx` |
| `/product/$handle` | PUBLIC | `/product/$handle` | `src/routes/product.$handle.tsx` |
| `/rewards` | PUBLIC | `/rewards` | `src/routes/rewards.tsx` |
| `/sales-clearance` | PUBLIC | `/sales-clearance` | `src/routes/sales-clearance.tsx` |
| `/shop-frass` | PUBLIC | `/shop-frass` | `src/routes/shop-frass.tsx` |
| `/social-media-virals/$category/$sub/$product` | PUBLIC | `/social-media-virals/$category/$sub/$product` | `src/routes/social-media-virals.$category.$sub.$product.tsx` |
| `/social-media-virals/$category/$sub` | PUBLIC | `/social-media-virals/$category/$sub` | `src/routes/social-media-virals.$category.$sub.tsx` |
| `/social-media-virals/$category` | PUBLIC | `/social-media-virals/$category` | `src/routes/social-media-virals.$category.tsx` |
| `/social-media-virals/` | PUBLIC | `/social-media-virals/` | `src/routes/social-media-virals.index.tsx` |
| `/social-media-virals` | PUBLIC | `/social-media-virals` | `src/routes/social-media-virals.tsx` |
| `/visual-search` | PUBLIC | `/visual-search` | `src/routes/visual-search.tsx` |

### Kids World (9)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/kids-valley` | PUBLIC | `/kids-valley` | `src/routes/kids-valley.tsx` |
| `/kids-world/$age/$place` | PUBLIC | `/kids-world/$age/$place` | `src/routes/kids-world.$age.$place.tsx` |
| `/kids-world/$age/` | PUBLIC | `/kids-world/$age/` | `src/routes/kids-world.$age.index.tsx` |
| `/kids-world/activity/$slug` | PUBLIC | `/kids-world/activity/$slug` | `src/routes/kids-world.activity.$slug.tsx` |
| `/kids-world/discover` | PUBLIC | `/kids-world/discover` | `src/routes/kids-world.discover.tsx` |
| `/kids-world/` | PUBLIC | `/kids-world/` | `src/routes/kids-world.index.tsx` |
| `/kids-world/parents` | PUBLIC | `/kids-world/parents` | `src/routes/kids-world.parents.tsx` |
| `/kids-world/street` | PUBLIC | `/kids-world/street` | `src/routes/kids-world.street.tsx` |
| `/kids-world` | PUBLIC | `/kids-world` | `src/routes/kids-world.tsx` |

### Signed-in Builder routes (37)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/academy` | MEMBER | `/_authenticated/academy` | `src/routes/_authenticated/academy.tsx` |
| `/blueprints` | MEMBER | `/_authenticated/blueprints` | `src/routes/_authenticated/blueprints.tsx` |
| `/builder-hall` | MEMBER | `/_authenticated/builder-hall` | `src/routes/_authenticated/builder-hall.tsx` |
| `/business-builder` | MEMBER | `/_authenticated/business-builder` | `src/routes/_authenticated/business-builder.tsx` |
| `/business-vaults` | MEMBER | `/_authenticated/business-vaults` | `src/routes/_authenticated/business-vaults.tsx` |
| `/collection` | MEMBER | `/_authenticated/collection` | `src/routes/_authenticated/collection.tsx` |
| `/commerce-simulation` | MEMBER | `/_authenticated/commerce-simulation` | `src/routes/_authenticated/commerce-simulation.tsx` |
| `/creation` | MEMBER | `/_authenticated/creation` | `src/routes/_authenticated/creation.tsx` |
| `/financial-center` | MEMBER | `/_authenticated/financial-center` | `src/routes/_authenticated/financial-center.tsx` |
| `/first-30-days` | MEMBER | `/_authenticated/first-30-days` | `src/routes/_authenticated/first-30-days.tsx` |
| `/frassy` | MEMBER | `/_authenticated/frassy` | `src/routes/_authenticated/frassy.tsx` |
| `/global-operations` | MEMBER | `/_authenticated/global-operations` | `src/routes/_authenticated/global-operations.tsx` |
| `/journal` | MEMBER | `/_authenticated/journal` | `src/routes/_authenticated/journal.tsx` |
| `/launch-accelerator` | MEMBER | `/_authenticated/launch-accelerator` | `src/routes/_authenticated/launch-accelerator.tsx` |
| `/manufacturing` | MEMBER | `/_authenticated/manufacturing` | `src/routes/_authenticated/manufacturing.tsx` |
| `/money-moves` | MEMBER | `/_authenticated/money-moves` | `src/routes/_authenticated/money-moves.tsx` |
| `/notifications` | MEMBER | `/_authenticated/notifications` | `src/routes/_authenticated/notifications.tsx` |
| `/onboarding` | MEMBER | `/_authenticated/onboarding` | `src/routes/_authenticated/onboarding.tsx` |
| `/opportunity` | MEMBER | `/_authenticated/opportunity` | `src/routes/_authenticated/opportunity.tsx` |
| `/payment-providers` | MEMBER | `/_authenticated/payment-providers` | `src/routes/_authenticated/payment-providers.tsx` |
| `/room` | MEMBER | `/_authenticated/room` | `src/routes/_authenticated/room.tsx` |
| `(authenticated layout)` | MEMBER | `/_authenticated` | `src/routes/_authenticated/route.tsx` |
| `/studio` | MEMBER | `/_authenticated/studio` | `src/routes/_authenticated/studio.tsx` |
| `/try-on` | MEMBER | `/_authenticated/try-on` | `src/routes/_authenticated/try-on.tsx` |
| `/vault` | MEMBER | `/_authenticated/vault` | `src/routes/_authenticated/vault.tsx` |
| `/visual-review` | MEMBER | `/_authenticated/visual-review` | `src/routes/_authenticated/visual-review.tsx` |
| `/workspace/affiliate` | MEMBER | `/_authenticated/workspace/affiliate` | `src/routes/_authenticated/workspace.affiliate.tsx` |
| `/workspace/card` | MEMBER | `/_authenticated/workspace/card` | `src/routes/_authenticated/workspace.card.tsx` |
| `/workspace/daily-design` | MEMBER | `/_authenticated/workspace/daily-design` | `src/routes/_authenticated/workspace.daily-design.tsx` |
| `/workspace/first-venture` | MEMBER | `/_authenticated/workspace/first-venture` | `src/routes/_authenticated/workspace.first-venture.tsx` |
| `/workspace/insights` | MEMBER | `/_authenticated/workspace/insights` | `src/routes/_authenticated/workspace.insights.tsx` |
| `/workspace/journal` | MEMBER | `/_authenticated/workspace/journal` | `src/routes/_authenticated/workspace.journal.tsx` |
| `/workspace/link` | MEMBER | `/_authenticated/workspace/link` | `src/routes/_authenticated/workspace.link.tsx` |
| `/workspace/merch` | MEMBER | `/_authenticated/workspace/merch` | `src/routes/_authenticated/workspace.merch.tsx` |
| `/workspace/profile` | MEMBER | `/_authenticated/workspace/profile` | `src/routes/_authenticated/workspace.profile.tsx` |
| `/workspace` | MEMBER | `/_authenticated/workspace` | `src/routes/_authenticated/workspace.tsx` |
| `/workspace/wallet` | MEMBER | `/_authenticated/workspace/wallet` | `src/routes/_authenticated/workspace.wallet.tsx` |

### Founder and administration (52)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/admin/activities` | ADMIN | `/_authenticated/admin/activities` | `src/routes/_authenticated/admin.activities.tsx` |
| `/admin/affiliate-policy` | ADMIN | `/_authenticated/admin/affiliate-policy` | `src/routes/_authenticated/admin.affiliate-policy.tsx` |
| `/admin/ai-credits` | ADMIN | `/_authenticated/admin/ai-credits` | `src/routes/_authenticated/admin.ai-credits.tsx` |
| `/admin/approvals` | ADMIN | `/_authenticated/admin/approvals` | `src/routes/_authenticated/admin.approvals.tsx` |
| `/admin/audit` | ADMIN | `/_authenticated/admin/audit` | `src/routes/_authenticated/admin.audit.tsx` |
| `/admin/blog` | ADMIN | `/_authenticated/admin/blog` | `src/routes/_authenticated/admin.blog.tsx` |
| `/admin/capsules` | ADMIN | `/_authenticated/admin/capsules` | `src/routes/_authenticated/admin.capsules.tsx` |
| `/admin/cj-import` | ADMIN | `/_authenticated/admin/cj-import` | `src/routes/_authenticated/admin.cj-import.tsx` |
| `/admin/feedback` | ADMIN | `/_authenticated/admin/feedback` | `src/routes/_authenticated/admin.feedback.tsx` |
| `/admin/financial-audit` | ADMIN | `/_authenticated/admin/financial-audit` | `src/routes/_authenticated/admin.financial-audit.tsx` |
| `/admin/images` | ADMIN | `/_authenticated/admin/images` | `src/routes/_authenticated/admin.images.tsx` |
| `/admin/` | ADMIN | `/_authenticated/admin/` | `src/routes/_authenticated/admin.index.tsx` |
| `/admin/launch-feedback` | ADMIN | `/_authenticated/admin/launch-feedback` | `src/routes/_authenticated/admin.launch-feedback.tsx` |
| `/admin/launch-partners` | ADMIN | `/_authenticated/admin/launch-partners` | `src/routes/_authenticated/admin.launch-partners.tsx` |
| `/admin/link-check` | ADMIN | `/_authenticated/admin/link-check` | `src/routes/_authenticated/admin.link-check.tsx` |
| `/admin/media` | ADMIN | `/_authenticated/admin/media` | `src/routes/_authenticated/admin.media.tsx` |
| `/admin/newsroom` | ADMIN | `/_authenticated/admin/newsroom` | `src/routes/_authenticated/admin.newsroom.tsx` |
| `/admin/partner-vendors` | ADMIN | `/_authenticated/admin/partner-vendors` | `src/routes/_authenticated/admin.partner-vendors.tsx` |
| `/admin/partners` | ADMIN | `/_authenticated/admin/partners` | `src/routes/_authenticated/admin.partners.tsx` |
| `/admin/roles` | ADMIN | `/_authenticated/admin/roles` | `src/routes/_authenticated/admin.roles.tsx` |
| `/admin/text` | ADMIN | `/_authenticated/admin/text` | `src/routes/_authenticated/admin.text.tsx` |
| `/admin` | ADMIN | `/_authenticated/admin` | `src/routes/_authenticated/admin.tsx` |
| `/admin/virals` | ADMIN | `/_authenticated/admin/virals` | `src/routes/_authenticated/admin.virals.tsx` |
| `/admin/visual-index` | ADMIN | `/_authenticated/admin/visual-index` | `src/routes/_authenticated/admin.visual-index.tsx` |
| `/admin/voice` | ADMIN | `/_authenticated/admin/voice` | `src/routes/_authenticated/admin.voice.tsx` |
| `/command` | FOUNDER / ADMIN | `/_authenticated/command` | `src/routes/_authenticated/command.tsx` |
| `/control-room` | FOUNDER / ADMIN | `/_authenticated/control-room` | `src/routes/_authenticated/control-room.tsx` |
| `/founder` | FOUNDER / ADMIN | `/_authenticated/founder` | `src/routes/_authenticated/founder.tsx` |
| `/studios/analytics` | FOUNDER / ADMIN | `/_authenticated/studios/analytics` | `src/routes/_authenticated/studios.analytics.tsx` |
| `/studios/animations` | FOUNDER / ADMIN | `/_authenticated/studios/animations` | `src/routes/_authenticated/studios.animations.tsx` |
| `/studios/assets` | FOUNDER / ADMIN | `/_authenticated/studios/assets` | `src/routes/_authenticated/studios.assets.tsx` |
| `/studios/calendar` | FOUNDER / ADMIN | `/_authenticated/studios/calendar` | `src/routes/_authenticated/studios.calendar.tsx` |
| `/studios/characters` | FOUNDER / ADMIN | `/_authenticated/studios/characters` | `src/routes/_authenticated/studios.characters.tsx` |
| `/studios/connections` | FOUNDER / ADMIN | `/_authenticated/studios/connections` | `src/routes/_authenticated/studios.connections.tsx` |
| `/studios/create` | FOUNDER / ADMIN | `/_authenticated/studios/create` | `src/routes/_authenticated/studios.create.tsx` |
| `/studios/distribution/$id` | FOUNDER / ADMIN | `/_authenticated/studios/distribution/$id` | `src/routes/_authenticated/studios.distribution.$id.tsx` |
| `/studios/distribution/` | FOUNDER / ADMIN | `/_authenticated/studios/distribution/` | `src/routes/_authenticated/studios.distribution.index.tsx` |
| `/studios/engine/$id` | FOUNDER / ADMIN | `/_authenticated/studios/engine/$id` | `src/routes/_authenticated/studios.engine.$id.tsx` |
| `/studios/` | FOUNDER / ADMIN | `/_authenticated/studios/` | `src/routes/_authenticated/studios.index.tsx` |
| `/studios/jobs` | FOUNDER / ADMIN | `/_authenticated/studios/jobs` | `src/routes/_authenticated/studios.jobs.tsx` |
| `/studios/monetization` | FOUNDER / ADMIN | `/_authenticated/studios/monetization` | `src/routes/_authenticated/studios.monetization.tsx` |
| `/studios/performance` | FOUNDER / ADMIN | `/_authenticated/studios/performance` | `src/routes/_authenticated/studios.performance.tsx` |
| `/studios/production/$id` | FOUNDER / ADMIN | `/_authenticated/studios/production/$id` | `src/routes/_authenticated/studios.production.$id.tsx` |
| `/studios/productions` | FOUNDER / ADMIN | `/_authenticated/studios/productions` | `src/routes/_authenticated/studios.productions.tsx` |
| `/studios/providers` | FOUNDER / ADMIN | `/_authenticated/studios/providers` | `src/routes/_authenticated/studios.providers.tsx` |
| `/studios/publishing` | FOUNDER / ADMIN | `/_authenticated/studios/publishing` | `src/routes/_authenticated/studios.publishing.tsx` |
| `/studios/review` | FOUNDER / ADMIN | `/_authenticated/studios/review` | `src/routes/_authenticated/studios.review.tsx` |
| `/studios/series` | FOUNDER / ADMIN | `/_authenticated/studios/series` | `src/routes/_authenticated/studios.series.tsx` |
| `/studios/settings` | FOUNDER / ADMIN | `/_authenticated/studios/settings` | `src/routes/_authenticated/studios.settings.tsx` |
| `/studios` | FOUNDER / ADMIN | `/_authenticated/studios` | `src/routes/_authenticated/studios.tsx` |
| `/studios/usage` | FOUNDER / ADMIN | `/_authenticated/studios/usage` | `src/routes/_authenticated/studios.usage.tsx` |
| `/studios/voices` | FOUNDER / ADMIN | `/_authenticated/studios/voices` | `src/routes/_authenticated/studios.voices.tsx` |

### System and API routes (7)

| URL | Audience | Declared route ID | Source |
|---|---|---|---|
| `/.lovable/oauth/consent` | SYSTEM | `/.lovable/oauth/consent` | `src/routes/[.]lovable.oauth.consent.tsx` |
| `/.mcp/invoke-tool/$tool` | SYSTEM | `/.mcp/invoke-tool/$tool` | `src/routes/[.mcp]/invoke-tool/$tool.ts` |
| `/.mcp/list-tools` | SYSTEM | `/.mcp/list-tools` | `src/routes/[.mcp]/list-tools.ts` |
| `/.well-known/oauth-protected-resource` | SYSTEM | `/.well-known/oauth-protected-resource` | `src/routes/[.well-known]/oauth-protected-resource.ts` |
| `/api/chat` | SYSTEM | `/api/chat` | `src/routes/api/chat.ts` |
| `/api/stt` | SYSTEM | `/api/stt` | `src/routes/api/stt.ts` |
| `/api/tts` | SYSTEM | `/api/tts` | `src/routes/api/tts.ts` |

## Completion statement

Navigation recovery stopped at consolidation and verification. No new Hall, feature platform, router, or duplicate navigation layer was created. No major functionality was removed. Further Frassy Studios feature development remains paused pending Founder review of this map and the verified desktop/mobile journeys.
