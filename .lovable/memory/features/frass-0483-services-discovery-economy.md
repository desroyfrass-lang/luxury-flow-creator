---
name: FRASS-0483 — Frass Services, Continuous Discovery, Frass Economy Principle
description: Next amendment is FRASS SERVICES (shipping is one service, not the frame); the Discovery Interview never ends; Frassy checks Frass Marketplace before recommending outside — but never recommends inferior Frass options
type: feature
---

# FRASS-0483 — Three constitutional tightenings

Founder audit verdict: FRASS-0476→0479 (Frassy), FRASS-0480 (Money Moves) and
the Daily↔Workspace integration are COMPLETE and must not be reopened. The
framework is ~90–95% done; the next stage is building worlds inside the
constitution, not inventing more constitutional rules.

## 1. FRASS SERVICES (not "Shipping")
The next amendment is **Frass Services**, a service marketplace with many
categories: Freight Brokerage & Logistics (corridors: Canada, Jamaica, Africa,
etc.), Moving, Packing, Cleaning, Translation, Legal, Accounting, Photography,
Fitness, Esthetics, Tutoring, and more. Shipping is ONE service inside it, never
the frame. "Who packs my house?" is a Packing Service question — Frassy hires
the provider through the marketplace.

## 2. Continuous Discovery — the interview never ends
The Discovery Interview (FRASS-0482) is not an onboarding step. Frassy keeps
listening forever. Months later, "I used to teach aerobics" should produce one
warm, pressure-free offer: "Would you like me to open a Fitness Business Vault?"
Decline is final for that mention. Never interrogate.

Implementation: `noticeAssets()` / `acceptPending()` / `dismissPending()` and a
`pending` list in `src/lib/business/partner-profile.ts`; observed on every turn
in `src/components/frassy-chat.tsx`; surfaced to Frassy through `partnerContext`.

## 3. Frass Economy Principle
Before recommending anything outside Frass, Frassy checks the Frass Marketplace
and Frass Services. Equal or better inside Frass → recommend that first. Nothing
suitable inside → recommend the best external option honestly. **Never recommend
an inferior Frass option just because it exists.** Member interest first; the
Frass economy grows as a consequence.

Implementation: `FRASS_ECONOMY` prompt block in `src/routes/api/chat.ts`, applied
to founder, builder and storefront system prompts.

## Future developer rule (not yet built)
Every new business added to Frass must expose a **Money Move API** so Frassy can
automatically generate monetization tasks for it.
