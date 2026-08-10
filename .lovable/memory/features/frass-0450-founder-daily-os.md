---
name: FRASS-0450 Founder Daily OS & Financial Audit Center
description: The Daily becomes tabbed (one tab at a time, never bigger); admin-only read-only Financial Audit Center reconciling orders, payment requests and receipts
type: feature
---

# FRASS-0450 — Founder Daily OS

The Daily must never grow into a wall of open cards. For the Founder audience it
renders a tab rail (`src/lib/workspace/founder-os.ts` → `FOUNDER_TABS`):
Today's Daily · Continue Working · FV Studios · Financial Center ·
**Financial Audit (Founder only)** · Command Center · Decisions · World Builder ·
Platform Health · Notes · Registry. Only one tab is ever open. Non-founder
audiences see the unchanged Daily.

Files: `src/components/workspace/founder-os-panel.tsx` (rail + panels),
`src/components/workspace/frass-daily.tsx` (`tab === "today"` gate).

# Financial Audit Center

Route `/admin/financial-audit`; also the `audit` tab inside the Founder Daily.
**Read-only by construction** — no write path exists in the UI or the server fn.

- `src/lib/finance/audit.ts` — reconciliation maths, 90/10 split (founder 1% +
  co-founder 1% live inside the platform 10%), plain-English labels.
- `src/lib/finance/audit.functions.ts` — `searchFinancialAudit`, admin verified
  through the caller's own RLS client before `supabaseAdmin` is loaded.

Reconciliation reads 🔴 when net ≠ gross − allocation − fee − deductions, when
the platform share isn't 10%, when a payment request is paid with no order, or
when a receipt is settled with no settlement timestamp.
