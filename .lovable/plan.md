# First Real Money — one earning path, end to end

Audit finding: no Builder can currently go from £0 to money in hand. Money Moves gives advice, payments leave Frass unverified, and commissions/payouts do not exist in code.

Recommendation: do NOT repair all three paths. Pick ONE and make it genuinely complete.

## Recommended first path: Frass Card sale, verified

Why this one: the seller side already exists (listings, payment requests, `/pay/$token`, duplicate protection, allocation maths). Only the "did the money actually arrive?" step is missing.

1. **Money Move → real action.** On `/money-moves`, the first Money Move for a Builder with no income becomes "Create your first paid listing", linking into the existing Frass Card listing flow. No new page.
2. **Verified payment, not a redirect.** Replace the "send the buyer to the seller's own link" step in `approvePaymentRequest` with a platform-managed checkout so Frass receives a provider confirmation. This needs payments enabled on the project (Pro plan) — Founder action required before any code.
3. **Paid is proven, never declared.** Remove the seller's ability to set `paid` on their own order; only a verified provider event may set it.
4. **Earning recognised automatically.** On verified payment, write one immutable `financial_receipts` row with the allocation already applied.
5. **Allocation, as the Founder stated it.** Correct the split to 90% Builder available / 3% Builder protected Vault (Builder's own money, not a Frass fee) / 3% Frass / 2% Foundation / 2% Owners, and persist the ledger entries instead of only computing them.
6. **Payout.** Decide the withdrawal rail. Until one exists, the wallet shows entitlement honestly and says withdrawals are not open yet.

## Deliberately deferred
- Affiliate chain (links, clicks, Shopify order webhook, commissions, approval) — a whole second pipeline; build only after path 1 is proven with one real sale.
- Opportunity Center external feed — currently a notebook; leave it.

## Technical notes
- `src/lib/payment-request.functions.ts` — `approvePaymentRequest` is the verification boundary.
- `src/lib/card-commerce.functions.ts` — `setCardOrderStatus` is the self-declaration hole.
- `src/lib/finance/financial-center.ts` — `PLATFORM_ALLOCATION` is the single split constant (currently 90/3/3/2/1/1).
- `src/lib/finance/payment-pipeline.ts` — `buildLedgerEntries()` already models the fan-out but its output is never written.
- No API webhook routes exist yet; a verified-payment webhook would live at `src/routes/api/public/`.

## Founder decision needed before build
1. Enable payments (Pro plan) so a platform-verified checkout is possible? Or keep seller-owned links and accept that "paid" can only ever be self-declared?
2. Confirm the 3% protected Vault is Builder-owned money (this differs from current code).
