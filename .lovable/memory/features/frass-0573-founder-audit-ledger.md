---
name: FRASS-0573 Persistent Founder Conversation Log
description: Every Frassy audit reply is permanently committed to the Founder Audit Ledger — no transient overlays, no disappearing responses
type: feature
---

Constitutional rule: every message Frassy generates during a Teleporter review must become a
permanent conversation message. Streaming may continue for responsiveness, but the completed
response is committed exactly as generated — timestamped, attached to its card, searchable, never
replaced by a later turn and never existing only as a popup or overlay.

Each recorded audit turn carries: card number, card title, route reviewed, speaker (Founder or
Frassy), the full text, and the timestamp.

The conversation is the official Founder Audit Ledger. The Founder can scroll from Card #001 to the
newest card as one continuous journal. Nothing leaves the ledger except by explicit Founder deletion.

Implementation:
- `public.founder_audit_ledger` (Founder-only read/insert/delete, admin role verified server-side)
- `src/lib/founder/audit-ledger.ts` — local mirror, grouping, search
- `src/lib/founder/audit-ledger.functions.ts` — server functions (Zero Trust role check)
- `src/lib/founder/audit-ledger-commit.ts` — single commit path (local first, then database)
- `src/components/founder/audit-ledger-panel.tsx` — journal view in the World Teleporter tab
- `src/components/frassy-chat.tsx` — commits both sides of every audit turn and shows earlier cards
  above the live thread
