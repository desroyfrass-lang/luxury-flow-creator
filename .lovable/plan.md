# CJ to frasskicks.com: read-only audit and phased import plan

Virtual try-on work is paused. Nothing was changed while preparing this plan.

## Plain-English summary
There are two separate "queues":
- **CJ's own list.** This is your "My Products" list inside your CJ account (about 495 items mentioned earlier; not re-counted today).
- **Frass's internal review list** (`cj_import_queue`). It holds 20 items, all still "pending".

These 20 were not taken from your My Products list. They came from CJ's general public catalogue (`/product/list`). Several are clearly unsuitable for the shop: an adult toy, a tuning fork, a camping cart, thank-you cards and hang tags.

Today, nothing in Frass turns a reviewed item into a real shop product. The review screen can only mark an item "categorized" or "skipped". No code ever marks an item "imported", and nothing creates it in the Shopify store. So the queue can't empty itself on a verified import, because no import exists yet.

Analogy: we have a clipboard of items picked off a wholesaler's shelf, but no loading dock to put anything on the shop floor.

## Verified facts (code and database reads)
| Area | Finding | Evidence |
|---|---|---|
| Internal queue | 20 rows, all `pending`; columns include cj_pid, cj_data, title, image, source/suggested price, brand, gender, category, tags, status, decided_by/at | DB query, `cj_import_queue` |
| Queue source | `importCjPage` pulls CJ `/product/list` (public catalogue, keyword search), not My Products; skips duplicates by cj_pid | `src/lib/cj.functions.ts` 99-143 |
| Statuses used | pending, categorized, skipped. "imported" is counted but never set | `cj.functions.ts` 90, 169, 195 |
| Admin check | CJ queue functions check `admin` only, not `super_admin` (other rooms accept both) | `cj.functions.ts` 63-67 and others |
| Prices | Suggested price = 2.5x CJ price, minimum $9.99. This is a guess, not a confirmed retail price | `cj.functions.ts` 123-124 |
| CJ API calls in use | Read-only: get access token, `/product/list`, `/product/myProduct/query`, `/product/query`. No write or delete call exists | `cj.functions.ts`, `src/lib/vendors/cj-pilot.functions.ts` |
| CJ token | Kept in memory per server instance only; a fresh login per cold start | `cj.functions.ts` 13-42 |
| Shop product creation | No code creates Shopify products. The only Shopify admin use is order lookup | `src/lib/frassy-tools.server.ts` 162-176 |
| Frass's own product records (canonical) | 1 product (Soft Life Chiffon Top), 1 source link; the draft path is wired only to the pilot CJ product | DB query, `cj-pilot.functions.ts` |
| Stock and price sync | None exists, from CJ or anywhere else | code search |
| Restriction checks | Rules exist but enforcement is off; the adult item in the queue would not be blocked automatically | project rules (R1/R2) |

## Not verified (needs proof before any claim)
- **Whether CJ lets us remove items from your My Products list through its API, and which exact action is safe.** No such call exists in the code, and I have not confirmed one in CJ's documentation. Until it's confirmed in writing and tested on one item, Frass will **never claim the CJ-side list was cleared**. Only the internal Frass list can be marked processed.
- How many items are in My Products today. A read-only page count is possible on request.
- How the shop's collections are set up in Shopify, and whether they map to the Frass category list.
- Live stock and shipping times from CJ.

## Blocking defects
1. No import step exists, so nothing reaches the shop or marks an item imported.
2. The internal list is fed from the public catalogue, not from your chosen My Products.
3. Suggested prices are a rule of thumb, not approved prices; selling at them would mean inventing prices.
4. No duplicate guard exists against the Shopify store, only within the internal list.
5. Unsuitable items sit in the list, and restriction checks are off.
6. No stock or price refresh exists, so prices and stock could go stale after import.
7. Errors are thrown to the screen; there is no import record for retries.

## Phased plan (each phase needs your separate approval)
**Phase 0. Read-only counts (no writes).**
- Count your CJ My Products list page by page.
- List the shop's current Shopify collections.
- Confirm in CJ's documentation whether removing an item from My Products is supported, and record the exact action. Report only.

**Phase 1. One product, end to end.**
- Pick one fashion item from My Products. You approve its name, category, collection and **retail price**.
- The server re-reads it from CJ, creates one **draft** in Shopify (variants, all photos, supplier SKU/ID kept privately), and links it to the matching Frass product record.
- It then reads the product back from Shopify and checks: variant count matches CJ, image count matches, collection assigned, supplier ID recorded.
- Only after every check passes is the internal list item marked "imported", with the Shopify product ID and check results stored. If any check fails, it stays pending, with the reason recorded.
- Nothing is published until you press publish.

**Phase 2. Make it safe to repeat.**
- One CJ product can only ever create one shop product, enforced by the database.
- A record per import attempt, safe retries, restriction pre-checks (unsuitable items blocked), and super_admin accepted alongside admin.

**Phase 3. Small batches.**
- Batches of 10 from My Products that you've reviewed. The same per-item verification runs, and a summary report is produced.

**Phase 4. Price and stock refresh.**
- A scheduled read of CJ cost and stock. Changes are flagged for your approval; nothing is repriced automatically.

**Phase 5 (only if Phase 0 proves it is supported).**
- Remove an item from the CJ-side My Products list only after it is verified imported. Test it once on one item, with proof shown to you.

## What you must approve before any writes
1. Which list is the source: My Products (recommended) or the current 20-item list.
2. What to do with the 20 current items: keep, skip, or review.
3. The pricing rule, or approval of each price.
4. Whether imported products start as Shopify drafts (recommended).
5. Collection mapping for the first product.
6. Any CJ-side removal, only after Phase 0 proves the exact safe action.

## Parked: "Mark Try-On Ready" seems not to respond (read-only, not fixed)
- Evidence: your audit ledger shows two successful "Start review" clicks (Sky Blue S and M, 20:05–20:06 UTC). It shows no Ready decision, and the database logs show no rejected Ready attempt.
- Likely cause (unconfirmed): Ready needs a review note of at least 10 characters. Any refusal message shows only as small grey text under the buttons, so it's easy to miss.
- A second possibility: the request didn't reach the database at all. That needs a browser check to confirm.
- Parked until try-on work resumes.

## Tested vs untested
- Tested: database reads (queue counts and contents, product and source counts, audit ledger), plus code inspection.
- Untested: any CJ API call today, Shopify collection reads, CJ removal support, and the Ready button in a browser.
