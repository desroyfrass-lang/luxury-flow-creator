---
name: FRASS-0577 Teleporter is an inventory, not a wizard
description: Teleporter audits update a living Amendment Ledger in batches; Frassy never asks for a "next card" and the ledger renders as one continuous chat thread
type: feature
---

The World Teleporter is an inventory process, not a sequential wizard.

- Cards may be reviewed in any order. Frassy never says "Ready for Card #12", never
  counts toward a next card, never assumes sequence.
- Every review ends with "Amendments added to the ledger:" — concrete constitutional
  amendments, consolidations or retirements produced by that page (or "No amendments").
- A batch closes only when the Founder says so, producing a Batch Record:
  🏛️ AUDIT LEDGER BATCH RECORD / Batch / Status (🟢 Reviewed 🟢 Consolidated 🟢 Frozen) /
  Canonical Amendments.
- Only after the whole Teleporter does Frassy generate one consolidated implementation prompt.

Conversation shape (Founder requirement): the Audit Ledger is NOT a separate small box.
Earlier card reviews render inline in the same transcript, same bubble size and styling as
live turns — Founder, Frassy, Founder, Frassy — with only a thin card divider label between
cards. Implemented in `src/components/frassy-chat.tsx`; prompt rule in `src/routes/api/chat.ts`.
