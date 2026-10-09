# Product Population Restart: Read-only Verification and Next Steps (Phases B and C)

Nothing was changed. This plan is waiting for Founder approval.

## 1. What is proven (checked 9 Oct 2026)

| Item | Evidence |
|---|---|
| CJ review queue | 20 rows, **all `pending`**. No brand or category has been assigned yet. Supplier prices run from 0.30 to 51.24. These rows came from CJ's **general catalog search** (`/product/list` in `src/lib/cj.functions.ts`). They are **not** your personally chosen products. |
| CJ connection | The CJ login details exist. The code can log in and search CJ's general catalog. **No code reads your "My Products / Added Products" list.** |
| New product foundation | `canonical_products` 0, `product_sources` 0, `vendor_offers` 0, `vendor_profiles` 0. Saving a draft is all-or-nothing (`create_product_draft`), and each source can only be linked once. |
| Shop categories in the code | **Frass Drip, Frass Kicks and Bare Drip**: `src/lib/drip-catalog.ts` (184 sub-categories for men and women, Kicks sections, Bare rooms). **Plus+**: `src/lib/frass-plus.ts`, a copy of the standard stores with handles ending `-plus`. **Kids**: `src/lib/frass-kids.ts` (KIDS_SEGMENTS, KIDS_COLLECTIONS). **Shopify collection searches**: `src/lib/shopify.ts` (a fixed list matched by vendor and tag). |
| Not in the code | **Luxury House** has only its page (East and West Wings) with no category list. There is **no Frass Marketplace general-goods category list.** **Founder Picks** does not exist. New Arrivals and Best Sellers are currently fixed Shopify searches, not overlays. |

## 2. What needs a credential, an export or your answer

1. **Your CJ "Added Products" list.** This can't be done without new code. The options:
   - **(a)** Approve one temporary, admin-only, read-only call to CJ's "My Products" list using the existing login. Whether CJ allows that call with this login is still **unproven**.
   - **(b)** Give me the CJ product IDs or SKUs by hand, or a CSV export from CJ.
2. **Shopify.** The Shopify account connection needs re-authorising, because the tool reported "authentication required". This is only needed later, for publishing (Phase F). It is **not** needed for Phases B and C.
3. **Your decisions:** the Luxury House categories, the Marketplace general-goods categories, and whether Founder Picks is an overlay.

## 3. Smallest safe next work

**Phase B: shop category map, read-only in code** (about 6–10 credits)
- One file, `src/lib/taxonomy/registry.ts`. It **imports** the existing category files and does not copy or rename anything. It lists:
  - The primary stores: Marketplace, Frass Kicks, Frass Drip, Bare Drip, Kids, Plus+ and Luxury House. Luxury House and Marketplace stay marked "awaiting Founder confirmation" until you supply them.
  - The overlays: Social Media Virals, Founder Picks, New Arrivals and Best Sellers. These are never primary stores.
- One function checks that a draft's chosen store and category exist in that map.
- **No changes to the database, the shop pages or Shopify.**
- **Tests:**
  - Every existing collection handle in `shopify.ts` maps to exactly one primary store.
  - Overlays can never be used as a primary store.
  - Plus+ handles map back to their standard store.
  - Store names are unchanged.

**Phase C: private draft intake** (about 8–14 credits; needs Phase B and the CJ answer above)
- **Founder-only server action.** "Create draft from CJ product". It takes **one** product chosen by its CJ ID, from the Added Products list or from the IDs you give me. It calls the existing `create_product_draft` with:
  - Source `cj` plus the CJ product ID. The existing unique-source rule blocks duplicates.
  - One private offer holding the supplier cost and dropship mode.
  - The category you choose, checked against the Phase B map.
- **Supplier vendor.** It uses one "CJ Dropshipping" supplier vendor that you create and verify through the existing review step.
- **What stays the same:**
  - It **never changes `cj_import_queue`**. Its status stays `pending`, so the queue's original sorting is preserved.
  - It **never publishes.** Each draft still needs your per-product approval.
  - **No bulk actions:** one product per click.
- **Database:** one optional additive change, nullable `primary_store` and `category_handle` columns on `canonical_products`. Today there is only `primary_store`, so this would add `category_handle` only.
- **Tests:**
  - A duplicate CJ ID is rejected and leaves nothing half-saved.
  - A category that isn't in the map is rejected.
  - The queue's statuses are unchanged.
  - A tester can't call the action.
  - The draft lands in "With the Founder for review" only after the supplier vendor is verified.

## 4. Go / no-go

| Step | Go when | Otherwise |
|---|---|---|
| B | You approve | Nothing changes |
| C | B is done and you choose option 1(a) or 1(b) | Stop. I will not draft from the general-catalog queue unless you tell me to |
| First real draft | You name 1 CJ product, and the CJ supplier vendor is verified | Stop |
| Publish | Separate approval, plus Shopify re-authorisation (Phase F) | No Shopify calls |

## Technical notes

- Option 1(a) would be a temporary server function, protected by the existing `has_role` admin check, that calls CJ's product-list endpoint for the account's own products and returns only IDs, names and prices. It would be removed after use.
- The registry derives handles through the existing `getCollectionMeta` and `toPlusHandle` helpers, so nothing is duplicated.
