# Correction: undo the 8% → 10% change and separate commission from sales pricing

## Plain English first
The change was made. One turn ago I really did switch the database setting from 8% to 10%. I wrote a note about it in your audit log and changed two code files. You've now told me the 10% is the commission, not a cut of product sales, and that the sales cut hasn't been set yet. So the change was wrong and needs to be undone. Nothing has been undone yet, because this turn is read-only.

## Verified current state (read just now)
- Database `affiliate_policy.platform_allocation_rate` = **10** (changed 11 Oct 2026, 08:34 UTC. It was 8 before.)
- Audit log entry `58c1edbe-9854-4205-80d8-1cba4e5f8c17` records the wrong "8% → 10%" decision.
- Code: `DEFAULT_POLICY.platform_allocation_rate` in `src/lib/affiliate-intelligence.ts` = 10 (was 8).
- Test: `src/lib/commerce/pricing-floor.test.ts` now expects 10% and a $21.79 floor.
- No products, prices, collections, imports or publishing were touched.

## How commission and sales pricing are separated today
- `affiliate_policy` and `affiliate-intelligence.ts` belong to the **affiliate commission** system. They decide how much commission a product can afford. The `platform_allocation_rate` field is one of that system's inputs.
- `src/lib/finance/allocation.ts` holds the separate universal 90/10 earnings split for payouts. It does not set retail prices.
- **No approved retail-price rule or sales cut exists anywhere.**
- `src/lib/commerce/pricing-floor.ts` (built earlier for the pilot) borrows the affiliate setting's `platform_allocation_rate` as if it were a sales cut. That quietly applies 8% (now 10%) to retail sales. It's an assumption you never approved. The $21.15 and $21.79 floors both depend on it and shouldn't be relied on.

## Proposed fix (after your approval)
1. Put the database setting back to 8, its value before my change. Add a new audit entry that says the 8% → 10% change was made in error and has been reversed. The original entry stays as history.
2. Set `DEFAULT_POLICY.platform_allocation_rate` back to 8.
3. Stop the price-floor helper from using any platform cut by default. It will refuse to work unless a sales cut is passed in on purpose, and will say plainly that no sales cut has been set. Update its tests to match. No new number gets invented.
4. Run the tests and build, and read the database back to confirm.

Not touched: commission rates, margins, fees, products, prices, collections, CJ, Try-On, deployment.

## Still blocked
The CJ pilot draft stays blocked until you decide the sales cut and the retail pricing policy, then the price and the collection.
