---
name: FRASS-0427 Frass Card Commerce
description: Every Frass Card is identity plus mobile point of sale — Quick Sell listings, member-owned payout accounts, recorded orders, 8% constitutional allocation
type: feature
---

Constitutional principle: **The Frass Card is both a digital identity and a mobile
commerce platform.** Every card is capable of becoming a secure point of sale.

## Laws
- Payments are processed through the **member's own connected payment account**
  (Stripe, PayPal, Square, or any secure page they control). Frass never takes
  custody of Frass Card money — it is the market stall and the receipt book, not
  the till.
- Every card sale still writes a record: income, the 8% constitutional allocation
  (3% infrastructure / 3% reserve / 2% Foundation), an estimated processing fee
  and the net to the seller. Estimates are always labelled as estimates.
- **Quick Sell** is the whole flow: photo → price → quantity → live. When the last
  one sells, the listing marks itself sold out. Cancel or refund returns the stock.
- Sellable kinds: product, digital, service, ticket, donation, tip, membership,
  booking, consultation, music, course, artwork. Donations/tips/digital/membership
  are unlimited by nature.
- A seller's payout URL is never exposed on the public card; it is only returned
  when a checkout is actually started.
- Zeros stay honest — no simulated sales.

## Where it lives
- `src/lib/card-commerce.ts` — kinds, payout providers, settlement math, principle.
- `src/lib/card-commerce.functions.ts` — listings CRUD, order status, public checkout.
- `src/components/card/quick-sell.tsx` — Quick Sell + listings + card sales (workspace).
- `src/components/card/card-storefront.tsx` — public "Buy from me" section.
- `/workspace/card` (now titled **Frass Card**) and `/card/$handle`.
- Tables: `card_listings`, `card_orders`; commerce columns on `business_cards`.

## Open commissioning items (extend, never duplicate)
Live provider connect flows (OAuth Stripe Connect), automatic paid-status webhooks,
digital file delivery, and pushing card orders into the persisted Financial Center ledgers.
