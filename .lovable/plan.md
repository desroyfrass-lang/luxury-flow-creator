# Read-only audit: product intake, sorting and placement (one CJ pilot item)

Nothing was changed. Database checks were read-only lookups.

## What exists today (verified)
| Piece | Where | State |
|---|---|---|
| Category map: 9 departments (Marketplace, Kicks, Drip, Bare Drip, Kids, Plus+, Luxury House, Bridal, Shape) plus promotional overlays | `src/lib/taxonomy/registry.ts` (`validateClassification`) | Works, as code only. Nothing saves a category yet |
| Pilot category exists | `src/lib/drip-catalog.ts` -> Women -> Work Drip -> `work-blouses` | Confirmed |
| CJ connection | `src/lib/cj.functions.ts` | Login works. It only reads CJ's general catalog (`/product/list`). There is **no saved function** for your selected My Products list (`/product/myProduct/query`) or for single-product details. The earlier check of your 495 items was a one-time test |
| Old CJ queue screen | `/admin/cj-import` (`admin.cj-import.tsx`, table `cj_import_queue`) | Works, but holds 20 general-catalog items, not your picks. Its brand/gender text fields don't connect to the new category map. Not used for the pilot |
| New product foundation | tables `vendor_profiles`, `canonical_products`, `vendor_offers`, `product_sources`; atomic `create_product_draft` | Works. All four tables are empty (0 rows) |
| Product/vendor screen | `/workspace/vendors` (`workspace.vendors.tsx`) | Works for creating a brand and a basic draft, owner-only. Founder verify/review buttons exist |
| Access rules | Owner-only row rules; Founder checks use `has_role(admin)` | Sound. Approve/verify lives in database functions and writes the audit ledger |

## Confirmed blockers for the one-item pilot
1. **No CJ vendor brand.** You would need a "CJ Dropshipping" supplier brand owned by your account. It starts as *pending* (unverified). Drafts are allowed, but sending to Founder review needs a verified vendor. That is correct and stays.
2. **Nowhere to save the category.** `canonical_products` has `primary_store` and `overlays` columns but no category field, and `create_product_draft` doesn't accept a store or category.
3. **Nowhere to save photos or sizes/colours for new products.** The existing `product_images` and `product_variants` tables belong to the old `products` table, not the new one. The pilot has 5 photos and 6 variants.
4. **No saved CJ detail fetch.** The real name, photos, variants and price must be pulled by a small, admin-only, read-only server function, fetching one product ID, not the list.
5. **Delivery time and stock are unknown.** CJ shipping needs a destination country, and stock wasn't returned. Per your rules these stay blank ("estimate unavailable"), never invented.
6. **No sorting screen.** Nothing on `/workspace/vendors` lets you pick a department or category yet.

## What works end-to-end today
Create a vendor brand, then a text-only draft (title, source, one offer), visible only to you. There is no category, photos, variants or CJ data pull.

## Proposed next step (needs separate Founder approval)
"Pilot P1: one CJ draft, sorted, private"
1. Small additive migration:
   - add `category_key` to `canonical_products`, checked against the category map on the server;
   - add `canonical_product_media` (image URL, position) and `canonical_product_variants` (CJ variant id, option labels, supplier cost, weight), owner-only rules like the offers table;
   - extend `create_product_draft` to accept store, category, media and variants in the same single transaction.
2. One admin-only read-only server function that fetches details for one CJ product ID and refuses anything not in your My Products list.
3. On `/workspace/vendors`, add a "Sort this draft" picker: department -> category, overlays as optional tags, using `validateClassification`. No new page.
4. You create the pending "CJ Dropshipping" supplier brand yourself on that screen. It is not auto-verified.
5. Create exactly one draft for pid 2606050313341622800: Frass Drip -> Women -> Work Drip -> Work Blouses. Supplier cost $6.97, delivery and stock left blank, draft status only, unpublished.
6. Tests:
   - one-item limit;
   - the same source can't be used twice;
   - only real categories are accepted;
   - other vendors and testers can't read it;
   - no publish path.

Nothing else is imported: the other 494 stay untouched, and there are no queue writes, Shopify, publishing, pricing or restriction rules.

Estimate: 4–7 credits.
