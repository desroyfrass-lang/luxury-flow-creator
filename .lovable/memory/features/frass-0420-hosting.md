---
name: FRASS-0420 Frass Hosting & Infrastructure Philosophy
description: Frass sells hosting as its own paid service (Model 2); free landing page for every member; cloud infrastructure underneath, never named to the customer
type: feature
---
FRASS-0420 (Founder approved, supersedes the hosting clause in FRASS-0419A).

## Laws
- Frass **may** provide hosting as a paid platform service. Hosting cost is
  covered by the customer buying the plan. Frass prices sustainably: infra cost
  covered plus a reasonable operating margin. Frass never gives hosting away and
  never silently absorbs it.
- From the customer's point of view **Frass is the hosting provider**. Never name
  or expose the underlying cloud provider in customer-facing copy or quotes.
- Publish always offers three doors: 🏝 Host with Frass (recommended), 🌍 Connect
  your own hosting, 📦 Export the website. No lock-in, ever.
- Every Frass member keeps a **free landing page forever** (profile, portfolio,
  links, contact, For Us, Marketplace, Wallet, Live, FV Studios).
- Paid plans are for a *business*, not a page: custom domain, unlimited pages,
  blog, store, bookings, memberships, CRM, email marketing, analytics, AI
  chatbot, SEO, inventory/invoicing.
- Optional third-party services **outside** the hosting plan (SMS, premium AI,
  domain registration) are still itemised at cost before being switched on —
  FRASS-0419A still governs those.
- Infrastructure Philosophy: Frass builds experiences, not commodity
  infrastructure. Phase 1 use established cloud; Phase 2 optimise/negotiate;
  Phase 3 own more only when the maths demands it. Never a distraction from
  innovation.
- No special hosting licence is required, but Frass must operate properly:
  registered entity, ToS, Privacy Policy, Acceptable Use Policy, DMCA/copyright
  policy, GDPR/PIPEDA compliance, tax registration, payment-provider compliance,
  insurance, stated SLA/backup commitments.

## Where it lives
- `src/lib/hosting.ts` — publish options, `FRASS_HOSTING_PLANS` (Free / Starter
  $8 / Business $19 / Commerce $39), `hostingMargin()` (Founder-only maths),
  free-vs-paid comparison, infrastructure phases, legal readiness, constitution.
- `src/routes/frass-hosting.tsx` — public Frass Hosting page.
- `src/lib/business-builder.ts` + `src/routes/_authenticated/business-builder.tsx`
  — publish step now shows the three doors and Frass-priced plans.

Never build a second hosting model or a parallel pricing table — extend these.
