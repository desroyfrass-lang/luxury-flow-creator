---
name: FRASS-0433 Financial Integrity & Audit Constitution
description: Every money movement produces an immutable receipt with plain-English explanation; balances reconcile to receipts; corrections are adjustments, never rewrites
type: feature
---

# FRASS-0433 — Financial Integrity & Audit Constitution

Status: Founder Approved · Constitutional · Applies to the entire Frass ecosystem.

## Principles
1. **Every transaction receives a receipt.** Sales, Quick Sell, gifts in/out, tips, direct payments, affiliate commission, recruitment bonuses, brand partnerships, radio royalties, FV Studios revenue, course sales, refunds, chargebacks, withdrawals, deposits, founder allocation, business distribution, adjustments. Nothing happens silently.
2. **Every dollar is explained.** Gross → platform allocation (10%, includes Founder 1% + Co-Founder 1%) → processing fee → net, each line in plain English.
3. **Balances reconcile to receipts.** No stored loose totals; available/pending/lifetime are receipts added up.
4. **Immutable audit trail.** Settled, refunded and withdrawn receipts cannot be updated or deleted (DB trigger `protect_settled_receipts`). Corrections are `financial_adjustments` rows.
5. **Frassy can explain any movement** using the transaction history.

## Implementation
- Tables: `financial_receipts`, `financial_adjustments`.
- `src/lib/finance/receipts.ts` — kinds, statuses, breakdown, explanation, reconciliation, filters, CSV.
- `src/lib/finance/receipts.functions.ts` — merges stored receipts with derived rows from `card_orders`, `commissions`, `recruitment_bonuses` (one source of truth per event).
- `src/components/finance/financial-timeline.tsx` — timeline, receipt detail, Frassy financial assistant.
- Surfaces: Wallet → Payment history, Financial Center → Receipts & Audit tab.
