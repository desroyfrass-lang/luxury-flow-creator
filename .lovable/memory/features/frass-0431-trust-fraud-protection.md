---
name: FRASS-0431 Trust & Fraud Protection Constitution
description: Privacy by Default, Security by Design — payment privacy, fraud detection, trust signals on every Frass Card, Trust Center inside the Financial Center, fraud reporting
type: feature
---

Founder-approved constitutional record. **Frass never promises fraud is impossible.**
The honest wording, and the only wording to use: *"We design Frass so fraud is
extremely difficult to commit, quick to detect, and fast to resolve."*

Constitutional principle: **Privacy by Default. Security by Design.**

## Payment privacy (absolute)
One member never sees another member's card number, expiry, CVV, bank account,
routing number, wallet credentials, security tokens, billing credentials or
banking logins — **not even the last four digits**. The Frass Card is a payment
destination, never a window into anyone's financial accounts. Sellers only ever
receive: customer display name, order number, items, amount, payment status,
shipping only when fulfilment needs it, contact only per the buyer's choices.

## Where it lives
- `src/lib/trust.ts` — the constitution: principle, fraud posture, never-exposed
  list, seller-sees list, fraud signals, account protections, transaction record,
  trust badges, report kinds.
- `src/lib/trust.functions.ts` — `getMemberStatus` (mini-card live/radio/studio/selling
  signals), `getCardTrust` (public trust facts), `getMyTrustCenter`, `reportFraud`.
- `src/components/card/card-trust.tsx` — Trust section on `/card/$handle`.
- `src/components/trust/trust-center.tsx` — Trust Center tab in `/financial-center`.
- Tables: `fraud_reports` (member-filed, admin-investigated), `trust_verifications`
  (badges granted by Frass only, never self-claimed; publicly readable).

## Laws
- Trust badges are granted by Frass, never claimed by the member.
- Zeros stay honest: no invented ratings, no simulated orders, no implied verification.
- Security is shown, not hidden — the Trust Center is a visible product surface.
- Run a security review after every major financial or identity feature.

## Version 1 is constitutionally complete
The Frass Card ecosystem is locked for V1. Next phase is polish and refinement,
not new capability. **Do not build the Reputation Score yet** — it is an approved
future idea only (orders completed, response time, verified identity, reviews,
on-time delivery, community contributions), and its purpose is informed decisions,
never ranking people.
