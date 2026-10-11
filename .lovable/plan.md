# Pricing floor audit: 25% margin rule, commission vs sales (read-only findings + correction to approve)

## Plain English first
I couldn't find your 25% minimum-margin rule written anywhere in the project. Not in code, saved settings, project notes or past chat. The only margin floors I found are 20% in the affiliate settings and 0% in the payment settings. I also need to correct myself: one turn ago I really did change the database setting from 8% to 10%. That was wrong, and it's still 10% now. Nothing has been changed this turn.

## Verified evidence
1. **Database now:** `affiliate_policy.platform_allocation_rate = 10`, set by me on 11 Oct 08:34 UTC. It was 8 before. Audit log entry `58c1edbe…` records it. `default_min_margin_pct = 20`.
2. **Code I changed in that turn:** `src/lib/affiliate-intelligence.ts` line 25 (8 → 10) and `src/lib/commerce/pricing-floor.test.ts` (now expects 10% and $21.79).
3. **25% rule:** no match in `src/`, `.lovable/memory`, the roadmap, the constitution files, or chat history. The only "25%" figures are the affiliate commission ceiling (`max_commission_rate = 25`), employment-income milestones and style values. **Not found = not verified**, which isn't proof it was never agreed.
4. **Other margin floors:**
   - `affiliate_policy.default_min_margin_pct = 20` (database; also `DEFAULT_POLICY` line 29).
   - `src/lib/finance/payment-pipeline.ts:405` `minMarginPct: 0` (shown on the Payment Providers screen, line 212).
   - `src/lib/business/money-move-catalogue.ts:128` already notes: "Margin floor is 20% in code; 30% appeared in recovery. One number, one place, still to decide."
5. **History of the "platform allocation" number:** your 7 Aug spec (chat #1321) said "Platform Allocation Engine … Fixed at 8%" and listed it among the costs a product has to cover. Project memory (`affiliate-intelligence-engine.md`) says "fixed 10%". Today you clarified that the 10% is commission and that the sales cut hasn't been set.
6. **How `pricing-floor.ts` works:** lowest price = (landed cost + $0.30) ÷ (1 − (2.9% card fee + `platform_allocation_rate` + `default_min_margin_pct`)). So it treats the affiliate setting's allocation as a sales cut and uses the 20% margin. Neither choice was approved by you for retail pricing. The $21.15 and $21.79 floors shouldn't be relied on.
7. **Not used anywhere live:** nothing in the app calls the price-floor helper. No product price was ever set from it.

## Unverified
- Whether 25% was agreed outside this project's records.
- What the 10% in memory was meant to cover. I'm going by your clarification that it's commission.
- What the sales cut is. Not set yet.

## Proposed correction (separate approval needed)
1. Put `affiliate_policy.platform_allocation_rate` back to 8, its value before my change. Add a new audit entry saying the 8% → 10% change was an error and has been reversed.
2. Set `DEFAULT_POLICY.platform_allocation_rate` back to 8, and restore the earlier tests.
3. Fix project memory so 10% is labelled as the commission figure, not a sales cut.
4. Price floor: stop it borrowing the affiliate settings. Once you approve a written retail rule, give it its own setting (for example a minimum product margin, 25% if you confirm it). Until then it refuses to work and says why.
5. Run the tests and build, and read the database back to confirm.

## Founder decisions needed
- Confirm the retail rule: is it a "minimum 25% margin" on every product sale? And is the margin worked out after supplier cost, shipping and card fees?
- Is there any sales cut (platform share) on retail sales? Right now none is set.
- Then the pilot price and the collection (Vacation Fits or Work Blouses).

CJ pilot stays blocked. Try-On stays paused.
