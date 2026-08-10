---
name: FRASS-0448 Financial Authority Constitution
description: Members initiate financial actions; only the trusted backend authorizes state changes. Clients can never set amounts, allocations, settlement, balances or audit records.
type: feature
---

# FRASS-0448 — Financial Authority Constitution

Status: Founder Approved · Constitutional · Applies to Wallet, Frass Card, Marketplace,
Quick Sell, gifts, tips, affiliate, brand partnerships — all commerce.

**Founder principle: if a browser, phone, or user can change the money, the architecture
is wrong. Money moves only after trusted verification.**

## Laws
1. Members *initiate*. The trusted backend *authorizes*. No member, seller, partner,
   affiliate or admin may directly set: payment amounts, platform allocations, creator
   earnings, settlement status, wallet balances, processing fees, founder allocations,
   or audit records.
2. Only the backend may confirm payments, mark settlement, release funds, calculate
   allocations, update balances, and trigger payouts.
3. Final states (settled, refunded, withdrawn) are immutable. Corrections are adjustment
   entries in `financial_adjustments` / `commission_adjustments` — never rewrites.
4. Single source of truth: every balance is derived by summing immutable receipts and
   adjustments. No parallel editable totals anywhere.

## Enforcement in the database
- `enforce_receipt_creation_authority` (BEFORE INSERT on `financial_receipts`) — forces
  `user_id = auth.uid()`, `status = 'pending'`, null `settled_at`/`external_id`, rejects
  negative amounts, and **recomputes `net`** from gross − allocation − fee − deductions.
- `enforce_payment_request_creation_authority` (BEFORE INSERT on `payment_requests`) —
  forces `seller_id = auth.uid()`, status to `preparing`/`awaiting_approval`, clears every
  outcome timestamp and `order_id`, resets `attempts`, requires a positive amount.
- `protect_settled_receipts`, `protect_receipt_member_fields`, `protect_payment_request_fields`,
  `protect_card_order_fields` guard UPDATE.
- `payment_requests` blanket ALL policy replaced with SELECT/INSERT/UPDATE only.
- DELETE revoked from `authenticated` on `payment_requests`, `financial_receipts`, `card_orders`.

## Merge checklist for any future financial feature
- Clients cannot modify protected financial fields.
- Settlement authority stays backend-only (`supabaseAdmin`, after verifying the caller).
- Every financial state transition is auditable.
- Wallet balances reconcile exclusively from immutable records.
