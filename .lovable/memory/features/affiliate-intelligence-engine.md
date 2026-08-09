---
name: Affiliate Intelligence Engine & Profit Protection System
description: Constitutional affiliate architecture — AI-calculated sustainable commission ranges, Commission Simulator, Founder governance framework, separate from the fixed 10% Platform Allocation
type: feature
---

The Frass Affiliate Engine is an AI-assisted commission system, not a traditional
affiliate program. Frassy calculates sustainable commission ranges; Builders never
pick arbitrary percentages.

**Constitutional principle:** Growth should never come at the expense of sustainability.

**Financial separation (never merge):**
- System One — Platform Allocation Engine: mandatory, constitutional, fixed 10%, governance controlled.
- System Two — Affiliate Intelligence Engine: marketing tool, product specific, Builder configurable, AI protected.

**Coverage:** every sellable product across the ecosystem (Kicks, Luxury House, Kids,
Frass Drip, Bare Drip, marketplace/partner products, digital, courses, music, services).
Participation is optional.

**Engine outputs per product:** minimum meaningful, recommended, and maximum sustainable
commission, derived from price, discount, cost of goods, packaging, shipping, other costs,
payment + marketplace fees, tax, the 10% allocation, and the Builder's target margin.
If headroom is negative → "No affiliate program for this item" / raise price first.

**Frassy behaviour:** explains, never merely rejects. Business advisor, not validator.
Recalculates whenever any input changes.

**Commission Simulator:** slider from 0% upward showing live expected profit, platform
allocation, affiliate payout, Builder payout, break-even commission, monthly projection.

**Privacy:** affiliates see only rate, sales, pending/approved/paid commissions and
performance — never Builder accounting or profitability.

**Payment protection:** Pending → return period → Approved → Scheduled → Paid; refunds
adjust or cancel automatically.

**Implementation:**
- `src/lib/affiliate-intelligence.ts` — pure engine (analyzeProduct, simulate, policy types).
- `src/lib/affiliate.functions.ts` — server fns; commission is clamped to the sustainable
  max server-side, so the UI can never publish an unsafe rate.
- `src/routes/_authenticated/workspace.affiliate.tsx` — Builder analysis + Commission Simulator + campaigns.
- `src/routes/_authenticated/admin.affiliate-policy.tsx` — Founder governance (floors, ceilings,
  default margin, promotional windows).
- Tables: `affiliate_policy` (singleton), `product_economics`, `affiliate_campaigns`.
