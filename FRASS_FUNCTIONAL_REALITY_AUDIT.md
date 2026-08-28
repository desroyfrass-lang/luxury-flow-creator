# FRASS FUNCTIONAL REALITY AUDIT

Generated: 2026-08-28 · Method: static evidence scan of every page under `src/routes`, following its imports two levels deep.

## What the words mean (plain English)

- **REAL** — the page saves or changes something in the database through a real server call. Close the browser, come back, it is still there.
- **SHELL** — the page renders, looks finished and may be interactive, but nothing it does is stored. Refresh and it is gone.
- **REDIRECT** — the page is only a signpost to another page. Correct behaviour, no feature of its own.
- **Protected** — a signed-out stranger cannot reach it.

## The headline

| Classification | Pages |
| --- | --- |
| REAL (end-to-end functional) | 95 |
| SHELL (presentation only today) | 116 |
| REDIRECT (signpost) | 18 |
| **Total pages audited** | **229** |

Here's what that means: roughly 45% of the working pages of Frass are genuinely wired to the backend. The rest look right but do not yet keep what a member puts into them.

## REAL — built end to end

These persist data through server functions and are safe to demonstrate.

| Page | Protected |
| --- | --- |
| `/_authenticated/academy` | yes |
| `/_authenticated/admin/affiliate-policy` | yes |
| `/_authenticated/admin/ai-credits` | yes |
| `/_authenticated/admin/approvals` | yes |
| `/_authenticated/admin/audit` | yes |
| `/_authenticated/admin/cj-import` | yes |
| `/_authenticated/admin/feedback` | yes |
| `/_authenticated/admin/financial-audit` | yes |
| `/_authenticated/admin/launch-feedback` | yes |
| `/_authenticated/admin/launch-partners` | yes |
| `/_authenticated/admin/link-check` | yes |
| `/_authenticated/admin/partner-vendors` | yes |
| `/_authenticated/admin/partners` | yes |
| `/_authenticated/admin/roles` | yes |
| `/_authenticated/admin` | yes |
| `/_authenticated/admin/visual-index` | yes |
| `/_authenticated/admin/voice` | yes |
| `/_authenticated/blueprints` | yes |
| `/_authenticated/builder-hall` | yes |
| `/_authenticated/business-vaults` | yes |
| `/_authenticated/collection` | yes |
| `/_authenticated/control-room` | yes |
| `/_authenticated/creation` | yes |
| `/_authenticated/financial-center` | yes |
| `/_authenticated/first-30-days` | yes |
| `/_authenticated/frassy` | yes |
| `/_authenticated/journal` | yes |
| `/_authenticated/launch-accelerator` | yes |
| `/_authenticated/money-moves` | yes |
| `/_authenticated/onboarding` | yes |
| `/_authenticated/opportunity` | yes |
| `/_authenticated/studio` | yes |
| `/_authenticated/studios/connections` | yes |
| `/_authenticated/studios/create` | yes |
| `/_authenticated/studios/distribution/$id` | yes |
| `/_authenticated/studios/engine/$id` | yes |
| `/_authenticated/studios/publishing` | yes |
| `/_authenticated/studios` | yes |
| `/_authenticated/try-on` | yes |
| `/_authenticated/vault` | yes |
| `/_authenticated/vaults/$vaultId/customize` | yes |
| `/_authenticated/vaults/$vaultId/index` | yes |
| `/_authenticated/vaults/$vaultId/m/$moduleId` | yes |
| `/_authenticated/vaults/$vaultId` | yes |
| `/_authenticated/vaults/index` | yes |
| `/_authenticated/vaults/new` | yes |
| `/_authenticated/workspace/affiliate` | yes |
| `/_authenticated/workspace/card` | yes |
| `/_authenticated/workspace/daily-design` | yes |
| `/_authenticated/workspace/first-venture` | yes |
| `/_authenticated/workspace/insights` | yes |
| `/_authenticated/workspace/link` | yes |
| `/_authenticated/workspace/merch` | yes |
| `/_authenticated/workspace/profile` | yes |
| `/_authenticated/workspace` | yes |
| `/_authenticated/workspace/wallet` | yes |
| `/afro-designers/index` | no |
| `/afro-designers/join` | no |
| `/auth` | yes |
| `/blog/index` | no |
| `/capsules/index` | no |
| `/card/$handle` | yes |
| `/checkout` | yes |
| `/for-me` | yes |
| `/for-us` | no |
| `/frass-kicks/men` | no |
| `/frass-kicks/women` | no |
| `/frass-kids/$segment/$collection` | no |
| `/frass-kids/$segment/index` | no |
| `/frass-kids/$segment/kicks` | no |
| `/frass-kids/index` | no |
| `/frass-plus/$gender/$category` | no |
| `/frass-plus/$gender/index` | no |
| `/frass-plus/$gender/kicks` | no |
| `/frass-plus/index` | no |
| `/frass-plus/sales` | yes |
| `/join/frass-hill` | yes |
| `/kids-world/$age/$place` | no |
| `/kids-world/$age/index` | no |
| `/kids-world/activity/$slug` | no |
| `/kids-world/discover` | no |
| `/kids-world/index` | no |
| `/link/$handle` | yes |
| `/live/$broadcastId` | yes |
| `/live/go` | yes |
| `/live/index` | no |
| `/lookbook/index` | no |
| `/music-media` | no |
| `/pay/$token` | yes |
| `/product/$handle` | no |
| `/rewards` | yes |
| `/sales-clearance` | yes |
| `/social-media-virals/index` | no |
| `/visual-search` | yes |
| `/welcome-hall` | yes |

## SHELL — presentation only

These need a persistence pass before they can be called built.

| Page | Protected |
| --- | --- |
| `/[/]lovable/oauth/consent` | no |
| `/_authenticated/admin/activities` | yes |
| `/_authenticated/admin/blog` | yes |
| `/_authenticated/admin/capsules` | yes |
| `/_authenticated/admin/images` | yes |
| `/_authenticated/admin/media` | yes |
| `/_authenticated/admin/newsroom` | yes |
| `/_authenticated/admin/text` | yes |
| `/_authenticated/admin/virals` | yes |
| `/_authenticated/business-builder` | yes |
| `/_authenticated/commerce-simulation` | yes |
| `/_authenticated/global-operations` | yes |
| `/_authenticated/manufacturing` | yes |
| `/_authenticated/notifications` | yes |
| `/_authenticated/payment-providers` | yes |
| `/_authenticated/room` | yes |
| `/_authenticated/studios/analytics` | yes |
| `/_authenticated/studios/animations` | yes |
| `/_authenticated/studios/assets` | yes |
| `/_authenticated/studios/calendar` | yes |
| `/_authenticated/studios/characters` | yes |
| `/_authenticated/studios/distribution/index` | yes |
| `/_authenticated/studios/index` | yes |
| `/_authenticated/studios/jobs` | yes |
| `/_authenticated/studios/monetization` | yes |
| `/_authenticated/studios/performance` | yes |
| `/_authenticated/studios/production/$id` | yes |
| `/_authenticated/studios/productions` | yes |
| `/_authenticated/studios/providers` | yes |
| `/_authenticated/studios/review` | yes |
| `/_authenticated/studios/series` | yes |
| `/_authenticated/studios/settings` | yes |
| `/_authenticated/studios/usage` | yes |
| `/_authenticated/studios/voices` | yes |
| `/_authenticated/visual-review` | yes |
| `/afro-designers/collections/$slug` | no |
| `/afro-designers/designers/$slug` | no |
| `/afro-designers/designers` | no |
| `/afro-designers` | no |
| `/arrival` | no |
| `/bare-drip/men/$category` | no |
| `/bare-drip/men/index` | no |
| `/bare-drip/men` | no |
| `/bare-drip` | no |
| `/bare-drip/women/$category` | no |
| `/bare-drip/women/index` | no |
| `/bare-drip/women` | no |
| `/blog/$slug` | no |
| `/blog` | no |
| `/brand-partnerships/brands/$brand` | no |
| `/brand-partnerships/campaigns/$campaign` | no |
| `/brand-partnerships/creators/$creator` | no |
| `/brand-partnerships/index` | no |
| `/brand-partnerships` | no |
| `/bridal-boutique` | no |
| `/bridal/collections` | no |
| `/bridal/index` | no |
| `/bridal/journey` | no |
| `/bridal/marketplace` | no |
| `/bridal/sourcing` | no |
| `/bridal` | no |
| `/bridal/vault` | no |
| `/bridal/walk` | no |
| `/capsules/$handle` | no |
| `/capsules` | no |
| `/collection/$handle` | no |
| `/frass-district` | no |
| `/frass-drip/men/$category` | no |
| `/frass-drip/men/index` | no |
| `/frass-drip/men` | no |
| `/frass-drip` | no |
| `/frass-drip/women/$category` | no |
| `/frass-drip/women/index` | no |
| `/frass-drip/women` | no |
| `/frass-hill-journey` | no |
| `/frass-hill` | no |
| `/frass-hosting` | no |
| `/frass-kicks` | no |
| `/frass-kids` | no |
| `/frass-luxury-house/index` | no |
| `/frass-luxury-house/men` | no |
| `/frass-luxury-house` | no |
| `/frass-luxury-house/women` | no |
| `/frass-plus/$gender/bare` | no |
| `/frass-plus` | no |
| `/frass-radio` | no |
| `/frass-shape/$gender/$category` | no |
| `/frass-shape/$gender/goals/$goal` | no |
| `/frass-shape/$gender/index` | no |
| `/frass-shape/$gender` | no |
| `/frass-shape/index` | no |
| `/frass-shape` | no |
| `/fresh-start` | no |
| `/fv-studios` | no |
| `/gallery/studio` | no |
| `/health-wellness` | no |
| `/index` | no |
| `/join/frasskicks` | no |
| `/join/index` | no |
| `/kids-valley` | no |
| `/kids-world/parents` | no |
| `/kids-world/street` | no |
| `/kids-world` | no |
| `/legal/$level` | no |
| `/legal/index` | no |
| `/live` | no |
| `/lookbook/$story` | no |
| `/lookbook` | no |
| `/reset-password` | no |
| `/services` | no |
| `/signed-out` | no |
| `/social-media-virals/$category/$sub/$product` | no |
| `/social-media-virals/$category/$sub` | no |
| `/social-media-virals/$category` | no |
| `/social-media-virals` | no |
| `/town-square` | no |

## REDIRECT — signposts

Nothing to build here; they exist so old doors still open.

| Page | Protected |
| --- | --- |
| `/_authenticated/admin/index` | yes |
| `/_authenticated/command` | yes |
| `/_authenticated/founder` | yes |
| `/_authenticated/workspace/journal` | yes |
| `/bare-drip/index` | no |
| `/builder/$handle` | no |
| `/daily` | no |
| `/frass-drip/index` | no |
| `/frass-kicks/index` | no |
| `/frass-kids/boys` | no |
| `/frass-kids/girls` | no |
| `/frass-world` | no |
| `/gateway` | no |
| `/kicks-district` | no |
| `/plus-size/men` | no |
| `/plus-size/women` | no |
| `/shop-frass` | no |
| `/welcome` | no |

## How to read this as the Founder

Think of Frass as a street of shops. REAL shops have staff, tills and stock rooms — a customer can walk in and buy. SHELL shops have the window display finished and the lights on, but no till behind the counter yet. Nothing is broken; the work remaining is to fit tills, shop by shop, in the order that earns first.

Recommended order: any SHELL page that sits on a money path (marketplace, vaults, money moves, wallet) is fitted first. Storytelling and gallery pages can stay SHELL for launch without harming a member.

---

## ATLAS PHASE 2 — REAL USER VERIFICATION (2026-08-28)

Verified by driving the live app in a real browser as the approved normal member
(porositybalance@gmail.com). Full results: `FRASS_CORE_JOURNEY_SCORECARD.md`.

Status upgrades (previously "REAL" by code inspection, now proven by use):
- `/vaults`, `/vaults/new`, `/vaults/:id/m/*` — **END-TO-END VERIFIED**
  (created a vault, added a record, reloaded, data persisted and stayed private).

Status corrections:
- `/room`, `/daily` — REDIRECT ONLY (both land on `/onboarding`).
- `/workspace`, `/workspace/wallet` — gated by Identity Check; not machine-verifiable.
- `/academy`, `/services` — remain UI SHELL (no member progress or listings saved).
- `/card`, `/builder-identity`, `/shop`, `/kids`, `/community`, `/wallet` — **404**.

Defects found (not fixed, per instruction):
1. `/admin/roles` exposes "CLAIM SITE OWNERSHIP" to a normal member when no owner is detected.
2. The Frass Daily is labelled "🟡 Sample Data".
3. Welcome Hall `next` parameter can become circular (`next=%2Fwelcome-hall`).
4. React "state update before mount" warning on `/first-30-days` and `/workspace`.
