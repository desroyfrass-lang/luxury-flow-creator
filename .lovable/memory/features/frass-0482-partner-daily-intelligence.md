---
name: FRASS-0482 — Partner Daily Intelligence
description: Frassy Discovery Interview finds the business already inside the person; Daily/Money Moves built from real skills, certifications and hidden assets, never a generic template
type: feature
---

# FRASS-0482 — Partner Daily Intelligence

Founder Principle (locked): **"Frass should discover the business already inside
the person — not force the person into a business."**

Every Partner gets a Daily designed around who they are. Frassy's greatest
talent is finding value a person already carries — decades of knowledge,
certifications, discipline, credibility — that they don't call a business.

## Rules
- Discovery is a **conversation**, never a questionnaire. One question at a
  time, in Frassy's voice, always skippable.
- **Simple first**: opening moves are 2–4 minutes (record a voice note,
  photograph a meal, answer one question). Frassy does the technical part.
- **Adaptive teaching**: plain language by default, one step at a time, no
  jargon, never make the member feel behind.
- Work they say they never want again is never assigned.
- The profile lives on the member's device only (personal life detail),
  visible and erasable in one tap.
- No new onboarding and no second Daily — this feeds the existing Daily,
  Money Moves, Business Builder and Frassy chat context.

## Example (the Mother case)
Wellness + esthetics certification + fitness → Wellness education, skin
education, healthy aging, natural wellness guides, herbal knowledge, wellness
products. Never coding, never technical marketing jargon.

## Implementation
- `src/lib/business/partner-profile.ts` — HIDDEN_ASSETS catalogue, interview
  script, local profile store, `detectAssets` (reads assets out of plain
  speech), `businessFits` (ranks existing accelerator businesses),
  `starterMoves`, `teachingGuidance`, `partnerContext`, `dailyHeadline`.
- `src/components/frassy/discovery-interview.tsx` — conversation UI +
  `PartnerStrengthsCard` (what Frassy found, with "Let's talk again").
- `src/routes/_authenticated/money-moves.tsx` — mounts the interview until
  complete, then the strengths card.
- `src/components/frassy-chat.tsx` → `src/routes/api/chat.ts` — `partnerContext`
  folded into Frassy's context block (Architecture Freeze respected: context
  extension, not a new assistant).

## Also
Business Vault: "Freight & Logistics" renamed **Freight Brokerage & Logistics**
— coordination business that owns the customer experience, not the trucks.
Still shelved; no Daily tasks until activated.
