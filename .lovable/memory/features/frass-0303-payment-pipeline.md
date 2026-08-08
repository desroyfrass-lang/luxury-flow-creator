---
name: FRASS-0303 Commerce Payment & Financial Pipeline
description: Constitutional payment pipeline — 10 steps from Buy Now to every ledger, configurable Payment Provider Center, refund engine, Available vs Pending law
type: feature
---

Constitutional volume: Commerce & Finance. Priority: critical.

## Laws
- ONE pipeline for every sale (Kicks, Luxury House, Bridal, Marketplace, Kids
  Shop, digital, services, courses, gifts). Never a second payment path.
- No payment provider is hard-coded. The Founder configures providers per
  market and per product kind in the Payment Provider Center.
- Constitutional allocation stays 3% infrastructure / 3% reserve / 2% Foundation,
  completely independent of affiliate commission.
- Available Balance = immediately withdrawable, no settlement notice ever.
  Settlement language belongs to Pending Balance alone.
- Profit Protection blocks bad margins at pricing/publication time. A completed
  customer order is NEVER retroactively blocked.
- Owner compensation is allocated only after every obligation is satisfied;
  remaining profit stays in Business Cash, tracked separately from personal money.
- Nothing exists without an accounting record: transaction ID, audit trail, tax
  record, wallet, business, platform, owner, marketplace and Foundation entries.
- Refunds add reversing entries against the original transaction ID; history is
  never rewritten. Withdrawn owner compensation records an adjustment instead.
- Taxes are recorded separately from platform fees. A fee is not a tax.
- Every monetary number anywhere is clickable and traceable, and Frassy always
  closes with "What that means is…".

## Where it lives
- `src/lib/finance/payment-pipeline.ts` — 10 steps, `buildLedgerEntries()`
  fan-out, refund rules, provider registry + Founder config, pipeline audit.
- `src/routes/_authenticated/payment-providers.tsx` — Payment Provider Center
  (Founder only), linked from the Founder Dashboard and Financial Center.
- `src/lib/finance/financial-center.ts` — FRASS-0302 Financial Center (one
  role-aware Center, all tabs from V1).

## Open commissioning items (never duplicate — extend these)
Live provider connection, persisted ledger tables, credit purchasing, direct
gifting, withdrawal rails, per-country tax rules.
