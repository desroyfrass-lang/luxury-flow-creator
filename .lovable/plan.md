# Universal Vendor and Product Readiness: Architecture Plan (read-only)

Nothing has been changed. This is a plan for the Founder to review. Each phase needs its own approval.

## 1. What already works (found in the code)

| Area | What it does | Where it lives |
|---|---|---|
| CJ import queue | An admin pulls CJ product pages into a review queue (no duplicates), suggests a 2.5x price, then sorts each product by brand, gender, category and tags, or skips it | `src/lib/cj.functions.ts`, `/admin/cj-import`, table `cj_import_queue` |
| Storefront catalog | Reads products and collections from Shopify for the shop pages; Frassy can look up an order status | `src/lib/shopify.ts`, `src/lib/frassy-tools.server.ts` (order lookup) |
| Partner vendor access | The Founder or admin can give a partner access to selected vendors, or take it away | `src/lib/partner-vendors.functions.ts`, `/admin/partner-vendors`, table `partner_vendors` |
| Print-on-demand and merch | Slogans, logo placements, quality tiers, POD providers and merch proposals, each with a review status | `src/lib/merch.functions.ts`, `/workspace/merch`, tables `pod_providers`, `merch_blanks`, `merch_proposals` |
| Member products | Members create their own products, collections and drops | `src/lib/creation.functions.ts`, `builder_products`, `builder_collections`, `builder_drops` |
| Card storefront | Members sell listings through their Frass Card and receive orders | `src/lib/card-commerce.functions.ts`, `src/lib/collection-builder.functions.ts`, `card_listings`, `card_orders` |
| Custom orders | Commission requests, protected by an insert rule and a validation check | table `commission_requests` (see `src/lib/security/regressions.ts`) |
| Making products | A shared manufacturing pipeline for every category, with compliance checks for kids and beauty | `src/lib/manufacturing/network.ts`, `/manufacturing` |
| Design ownership (IP) | Protection levels, licences and rules about who owns a design | `src/lib/rights/protection.ts` |
| Private workspaces | Member vaults with member lists and an activity log | `vaults`, `vault_members`, `vault_items`, `/vaults/*` |
| Catalog checks | Tools that audit the catalog | `src/lib/mcp/tools/audit-catalog.ts` |

## 2. Gaps

1. **CJ stops after sorting.** The queue has an "imported" status, but no code ever moves a product into it. Nothing reaches the shop yet.
2. **No shared product shape.** CJ items, member products, card listings and merch proposals each store products their own way. There is no single "ready for the shop" record.
3. **CJ is the only supplier connection.** Other suppliers would each need their own code.
4. **No way to add products by hand from a phone.** Artisans who don't use supplier connections can't send in photos, materials, sizes, made-to-order lead times and custom options in one guided step.
5. **No product-level fulfillment fields.** There is nowhere to record made-to-order, lead time, who ships, or a split between several vendors.
6. **No step that adds products to Shopify.** Shopify is only read today.
7. **Design ownership (IP) isn't attached to products.** Artisan designs have no protection level attached.

## 3. Smallest reusable plan (no rebuilding)

```text
Supplier source ──> Adapter ──> Normalized Product Draft ──> Frassy prep ──> Founder approval ──> (later) Shopify
 CJ (existing queue)    cj        one shared shape         category, copy,     approve, edit,      publish, one
 Artisan (manual/phone) manual    + source reference       checks, flags       reject             product at a time
 POD (existing)         pod
```

- **Adapter:** a small code contract with one job, `toDraft(sourceRecord) -> ProductDraft`. Three adapters to start: CJ (reads the existing `cj_import_queue`), manual artisan, and POD (reads `merch_proposals`). Adding a supplier later means adding one adapter file, never a new page.
- **One new draft table.** It holds the source, a source reference, the vendor, the existing shop categories, the variants, the price and cost, the fulfillment mode (stocked, dropship, POD, made-to-order), the lead time in days, custom options, the IP protection level, the status (draft, prepared, founder_review, approved, rejected, published) and notes from Frassy's checks. Existing tables stay where they are, and the new table points back to them.
- **Artisan intake** reuses the existing private vault, the protected uploads (`src/lib/uploads.ts`) and the rights levels. It adds one guided form that works well on a phone. The artisan sees only their own drafts.
- **Frassy's preparation** reuses the AI gateway and the approved shop structure in `mem://features/frass-product-population-brief`. She suggests where a product goes and checks for missing details. She never invents prices, materials or claims.
- **Shopify publishing** is a later, separate phase. It needs a Shopify Admin credential with write access, and the Founder approves each product.

## 4. Safety, permission and Founder approval gates

- Every action is checked on the server with the existing role check (Zero Trust). Artisans can see and change only their own vault and drafts.
- **Nothing reaches the public shop** without Founder approval, recorded in the existing approval and audit ledgers.
- **Money rules:** cost and price come only from the supplier's data or the Founder. Seller declarations and forecasts are never treated as verified. No affiliate option appears before a profitability check, and the 10% platform allocation stays separate.
- **Public data:** the public shop shows display details only. No vendor IDs, costs, private notes or artisan contact details (FRASS-0536).
- **IP:** artisan designs stay private by default. The artisan chooses the protection level, and the existing rights rules apply.
- **Kids and beauty products** must pass the existing compliance checks before review.
- **Hard stops:** adding a new supplier login, Shopify write access, payment payouts to vendors, or any bulk import each need separate Founder approval.

## 5. Phases (each stops for Founder review)

| Phase | Scope | Estimated credits |
|---|---|---|
| A | Draft table with permissions and audit, adapter contract, CJ adapter (existing queue becomes a draft), tests | about 8–15 |
| B | Manual artisan intake from a phone inside their private vault, lead times and custom options, IP level | about 12–20 |
| C | Frassy preparation checks, a Founder review screen reusing the admin approvals, approve or reject | about 10–15 |
| D | Publish one approved draft to Shopify (needs a write credential, approval per product) | about 8–12 |
| E | Fulfillment routing per vendor and order splitting; payouts stay out of scope | about 15–25, planned later |

These are rough estimates. Actual use depends on fixes and verification rounds.

## 6. Proposed first test (after Phases A–C only, nothing published)

1. **One CJ product.** The Founder picks one product that is already sorted in the queue. It becomes a draft, Frassy prepares it, and it waits for Founder review. Check that the cost stays hidden from public views and the shop structure is correct. Then the Founder approves or rejects it.
2. **One private artisan.** The Founder invites one artisan, for example a bag maker. The test uses a test account, not a real member, unless the Founder names one. On a phone, the artisan uploads photos, materials, a 14-day lead time and one custom option, and chooses an IP level. Check that no other account can see the draft, Frassy flags any missing details, and the draft waits for Founder review.
3. Nothing goes to Shopify or the public shop. Both tests are checked in the browser on desktop and on a 390x844 phone screen, and a test record is kept.

## Technical details

- The CJ adapter reads `cj_import_queue` rows with status `categorized`. Moving a row to `imported` happens only when the draft insert succeeds.
- The draft table uses row rules: the owner reads and writes their own drafts; staff and admin read; only the Founder (checked through `has_role`) sets `approved` or `published`. A trigger stops anyone from changing their own status to approved or published.
- Existing tables are not changed. The draft's `source_ref` points to the existing records.
