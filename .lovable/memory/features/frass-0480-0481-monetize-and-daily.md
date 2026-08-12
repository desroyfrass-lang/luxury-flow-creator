---
name: FRASS-0480 Build It Monetize It & FRASS-0481 Daily ↔ Workspace
description: Every Money Move ends at a monetization outcome (Learn→Build→Monetize, Preparation Mode when externally blocked); Daily loads over the Workspace; navigation consolidated
type: feature
---
## FRASS-0480 — Build it. Monetize it.

- Rule (locked): "Every Money Move ends with the highest practical level of monetization available at that stage." Learning never ends a journey.
- Loop: Learn → Build → Monetize. Phase derived from existing moves — no move catalogue rewrite.
- Each business has a monetization outcome: store active, collection live, content with earning link, affiliate campaign active, podcast with sponsorship, gallery for sale, bookable service.
- When an external dependency blocks earning (Marketplace not live, payments off, inventory not landed), Frassy switches to **Preparation Mode** — productive launch-asset work, never idle waiting.
- Implementation: `src/lib/business/monetization.ts` (layer on top of `money-moves.ts` / `accelerator.ts`), surfaced on `/money-moves`.

## FRASS-0481 — One Workspace. Two Views.

- Golden rule: the Workspace loads BEHIND the Daily; closing the Daily reveals the Workspace already there (`daily-gate.tsx` navigates to `/room` on auto-open and on dismiss).
- Navigation order (desktop + mobile identical): The Frass Daily · My Workspace · FV Studios · Welcome Hall · Builder Vault · Creation District · Opportunity Center · Academy District · My Frass Card · Founder Mode · Admin.
- Duplicate header Workspace key icon removed — one way in, through the account menu.
- "Builder Profile" renamed **My Frass Card** → `/workspace/card`.
- Control Room chat uses the shared `FrassyChat` with no page-specific wrapper (no borders/max-width) — that wrapper caused the distorted box.
