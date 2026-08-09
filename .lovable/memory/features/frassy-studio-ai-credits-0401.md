---
name: FRASS-0401/0402 Frassy Studio & Frass AI Credits
description: Frassy Studio AI production suite (Frassy creates, user directs) and the platform-wide Frass AI Credit economy — forecast, approve, receipt
type: feature
---
FRASS-0401 Frassy Studio — Constitutional Platform Component.

Philosophy: **Frassy creates. The user directs.** Frassy does 90–95% of the work;
manual editing is always available and never hidden. Never build a clone of
Premiere/Resolve/Runway — build a modular production environment with the AI
Director as the primary interface and a professional timeline underneath.

Implementation:
- `src/lib/studio/credits.ts` — operation rate card + forecast builder.
  Anchor: 1,000 Frass AI Credits ≈ US$1.00 of member-facing AI compute; rates are
  derived from real provider costs, never arbitrary.
- `src/lib/studio/director.ts` — natural-language direction → operations, plus
  Learning Mode reasoning ("Why?") in plain language.
- `src/lib/studio.functions.ts` — wallet, ledger, projects, approve-and-run,
  Founder overview and grants.
- `src/routes/_authenticated/studio.tsx` — Media Library, Preview Monitor,
  AI Director, Timeline, Inspector, Mixer, receipts, live credit meter.
- `src/routes/_authenticated/admin.ai-credits.tsx` — Founder AI Credit Center.
- Entry point: the 🎬 Frassy Studio chip in `frassy-composer.tsx` (`studio` prop).

FRASS-0402 Frass AI Credits — never call them points. Constitutional rules:
- Opening the Studio, uploading, organising, manual timeline editing, previews,
  drafts and the brand library are ALWAYS free.
- Credits are consumed only by AI compute.
- Every AI job is forecast before it runs, requires explicit approval, and writes
  a receipt to `ai_credit_ledger` after completion.
- Credit Intelligence always offers the cheaper honest alternative; the user chooses.
- One credit economy serves every AI service on the platform — never create a
  second credits/points system.

Tables: `ai_credit_wallets`, `ai_credit_ledger`, `studio_projects`, `studio_operations`.
