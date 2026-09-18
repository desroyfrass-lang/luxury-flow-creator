# Money Moves Universe — Recovery Report (read-only)

No code, data or settings were changed. This is a recovery record of what already exists.

## A. UCI — exact finding

Searched the entire project (code, routes, markdown specs, memory files) for `UCI` / `UCIs`. **Zero matches.** The only hits were the word "lucide" (the icon library) and unrelated words containing those letters. There is no definition, no table, no component, no spec file, and no memory entry for UCI anywhere in this project. I will not guess a meaning. If UCI came from a conversation or document outside this project, it needs to be supplied before it can be recovered.

## B. Earning / funding routes actually present

Status key: 🟢 executable path · 🟡 partial · 🔵 blueprint (constants/pages only) · 🔴 missing

| Route (exact name found) | What the Builder does | Tool that executes it | Status | Evidence | Real money verifiable? | Daily fit |
|---|---|---|---|---|---|---|
| Hidden Assets | Photograph and sell things already owned | /workspace/first-venture, /marketplace | 🟡 | `business/hidden-assets.*`, INCOME_STREAMS `hidden-assets` | No — listing only | 2-hour Daily |
| Frass Card / direct sales | List an item, buyer pays on card page | Quick Sell, `/card/$handle`, `/pay/$token` | 🟡 | `card-commerce.functions.ts`, `payment-request.functions.ts` | Buyer acts, but "paid" is seller-declared | 2-hour Daily |
| Coco Vintage (collections resale) | Inventory → shoot → list → drop | /collection, /marketplace | 🟡 | accelerator business `coco-vintage` | Manual log only | Both |
| Wellness Brand | Products, trust content, sales | /marketplace, /workspace/card | 🟡 | accelerator `wellness`, MONETIZATION_OUTCOMES.wellness | Manual log only | Both |
| Faceless Content | Daily publishing, traffic, earning link | /studio (FV Studios), /workspace/link | 🟡 | INCOME_STREAMS `faceless`, `brand-partnerships.ts` FACELESS_FORMATS | No | Both |
| Affiliate Marketing | Pick products, publish links, earn commission | /affiliate, /workspace/link, /financial-center | 🟡 chain broken | `affiliate.functions.ts`, `affiliate-intelligence.ts`, tables `affiliate_links/clicks/commissions` | No — no link/click writes, no order webhook | Both |
| Podcast | Authority, audience, later sponsorship | /frass-radio, /studio | 🔵 | INCOME_STREAMS `podcast` | No | Longer-term |
| Brand Deals / Partnerships | Apply to campaigns, deliver, get paid fee | /brand-partnerships | 🔵 | `brand-partnerships.ts` (BRANDS, BRAND_CAMPAIGNS with budgetUsd, COMPENSATION_MODELS fixed/performance/affiliate/revenue-share) — static constants, no tables | No | Longer-term |
| Services (bookable work) | Quote, book, deliver a service | /services, service-enabled Frass Card | 🟡 | `services/marketplace.ts` (SERVICE_CATEGORIES, SERVICE_LAUNCH_ROADMAP, ORCHESTRATIONS) | No booking/payment write | Both |
| Frass Gallery / Art | Originals, prints, digital, commissions, NFT | /gallery, /gallery/studio, /workspace/gallery | 🟡 | `gallery/gallery.ts` MONETIZATION paths + `gallery_artworks`, `commission_requests` tables | Commission requests persist; no payment | Both |
| Music / FV Studios | Produce, master, release, rotation | /fv-studios, /frass-radio, /studios/monetization | 🟡 | `studios/*`, `studio_monetization` table (reported/estimated/unavailable) | Only reported figures from platforms | Longer-term |
| Creator / media revenue | Publish productions, platform revenue | /studios/publishing, /studios/monetization | 🟡 | `studio_publish_jobs`, `studio_platform_analytics` | Reported-only, none recorded | Longer-term |
| Licensing / rights | Rights clearance before publishing | /studios (rights) | 🔵 | `studio_rights`, RIGHTS_STATUSES | No | Longer-term |
| Merch / brand commerce (Frass Kicks, Drip, Plus, Capsules) | Designs → blanks → proposals → products | /workspace/merch, Shopify catalogue | 🟡 | `merch.ts`, `merch_proposals`, `merch_blanks`, Shopify store | Shopify checkout is real money, but it is Frass's store, not Builder income | Longer-term |
| Manufacturing-backed product lines (footwear, bags, jewelry, seamstress) | Design → production package → sample → list | /manufacturing, /afro-designers | 🟡 | `vault-family.ts` vault moves | No | Longer-term |
| Tips & Gifts | Receive tips/gifts on card or live | /workspace/wallet (tips, gifts), /live | 🟡 | `card-wallet.ts` gift/tip kinds, `live_gifts`, `live_gift_catalog` | Records exist, no payout rail | 2-hour Daily |
| Referrals / Recruitment bonuses | Invite people via Frass Link, hit stages | /workspace/link | 🟡 | `link.functions.ts` inserts `recruitment_bonuses` at pending | Written but never approved or paid | Both |
| Courses / Academy | Learn, and teach-priced products | /academy | 🔵 | `academy.ts` outcomes mention price, no course sales code | No | Longer-term |
| Grants / Funding | Log and pursue a grant | /opportunity | 🔵 | `opportunity.ts` OPPORTUNITY_KINDS includes `grant` | No — notebook only | Longer-term |
| Jobs / Employment / Global Mobility | Career path treated as funding step | inside Money Moves | 🔵 | `money-moves.ts` OPPORTUNITY_TIERS, `mobilityRoadmap()` | No | Both |
| Hosting (Frass earns, Builder pays) | Builder buys hosting | /frass-hosting | 🔵 platform-side | `hosting.ts` FRASS_HOSTING_PLANS | Platform revenue, not Builder income | n/a |
| Earnings ledger families (designed) | 16 named sources | /financial-center | 🔵 | `finance/earnings-ledgers.ts`: marketplace, creator, gifts, affiliate, courses, services, podcast, music, radio royalties, brand-partnerships, builder, farm, founder/co-founder compensation and distribution | Balances all derive, none credited | n/a |

## C. What the recommendation engine can currently generate

`moneyPlan()` in `src/lib/business/money-moves.ts` only draws from `accelerator.ts` `LAUNCH_BUSINESSES`: **affiliate, wellness, coco-vintage, faceless, podcast** (plus a hidden-assets stream in the list with no accelerator moves). Affiliate items are filtered out entirely until the Founder's readiness flags are on.

Not connected to the engine at all, despite having real tools: Frass Card direct sale, Gallery/art, Services, Tradesperson, all ten-plus Business Vaults (`vault-family.ts`), Studios/music/media, merch/manufacturing, tips and gifts, referrals, opportunities and grants, employment/mobility.

Two parallel engines exist: `business/money-moves.ts` (accelerator-driven, the page) and `builder-os/money-move-lifecycle.ts` (Vault-driven, the Daily stack). They do not share a model.

## D. Routing map (family → Daily → Workshop → tool → truth source)

```text
Direct sale     -> Daily card -> work item -> Quick Sell/Frass Card -> card_orders (seller-declared)
Affiliate       -> Daily card -> work item -> /affiliate, /workspace/link -> commissions (never written)
Services        -> Daily card -> work item -> /services + Card -> none
Art/Gallery     -> artist pool -> /gallery/studio -> gallery_artworks, commission_requests
Music/Media     -> not scheduled -> /studios -> studio_monetization (reported only)
Brand deals     -> not scheduled -> /brand-partnerships -> none (constants)
Referrals       -> not scheduled -> /workspace/link -> recruitment_bonuses (pending forever)
Tips/Gifts      -> not scheduled -> /workspace/wallet -> card_orders / live_gifts
Grants/Jobs     -> not scheduled -> /opportunity -> manual notes
```

## E. Gaps where a tool exists but Money Moves cannot hand off

Gallery, Services, Vault family, Studios, Merch/Manufacturing, Tips/Gifts, Referrals, Opportunity/Grants. Each has a working page; none can be produced as a recommended move, and only the Frass Card path currently creates a work item.

## F. Paper-only (spec, no executable earning)

Brand deals, podcast, courses, licensing/rights income, radio royalties, farm, all compensation/distribution ledgers, grants, employment tier, and the whole retention/holdback lifecycle.

## G. Contradictions with the simple model

1. The page shows one highest move, but `moneyPlan()` already picks up to five within the time budget — plural scheduling exists in code and is being hidden.
2. Default time is `n = 1` hour (`partner-profile.ts`), not two; `scanOpportunities` forces a minimum 3-hour scan. Nothing anywhere encodes a 2-hour default.
3. There is no "continue and scale" path — once the budget is spent the plan stops; scaling is not represented.
4. Completion is still self-reported through the manual income log (`MoneyState.log`), which drives momentum and forecast — so the engine "learns" from unverified numbers.
5. Two competing Money Move models (accelerator streams vs Vault lifecycle) with different vocabularies.
