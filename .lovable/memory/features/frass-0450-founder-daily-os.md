---
name: FRASS-0450 Founder Daily OS & Financial Audit Center
description: The Daily becomes tabbed (one tab at a time, never bigger); admin-only read-only Financial Audit Center reconciling orders, payment requests and receipts
type: feature
---

# FRASS-0450 — Founder Daily OS (Founder-amended)

The Daily must never grow into a wall of open cards. For the Founder audience it
renders a tab rail (`src/lib/workspace/founder-os.ts` → `FOUNDER_TABS`). Only one
tab is ever open. Non-founder audiences see the unchanged Daily.

Locked order (Amendment 1 — administrative tabs at the END, Financial Audit
always last): Today's Daily · Continue Working · Goals & Vision · Founder Command
Center · Pending Approvals · Opportunities · Launch Feedback · FV Studios ·
Financial Center · Recruitment · World Builder · Decisions · Notes · Registry ·
🏛 Platform Audit · 🔍 Financial Audit (Founder only, last).

Principle: the Daily answers "What do I need to do today?"; the tabs answer
"What do I need to know?"

Files: `src/components/workspace/founder-os-panel.tsx`,
`src/components/workspace/frass-daily.tsx` (`tab === "today"` gate).

# Financial Audit Center

Route `/admin/financial-audit`; also the last tab of the Founder Daily.
**Amendment 2 — an observation room, never a control room.** No Edit, Delete,
Approve, Reject, Override, change-balance or modify-receipt affordance may ever
exist here, and no write server fn may back it.

- `src/lib/finance/audit.ts` — reconciliation maths, 90/10 split (founder 1% +
  co-founder 1% live inside the platform 10%), plain-English labels.
- `src/lib/finance/audit.server.ts` — privileged read + `ledgerBriefing`.
- `src/lib/finance/audit.functions.ts` — `searchFinancialAudit` and
  `askFinancialAudit` (Amendment 3, AI Audit Assistant: explains, never acts;
  admin verified through the caller's own RLS client first).

Reconciliation reads 🔴 when net ≠ gross − allocation − fee − deductions, when
the platform share isn't 10%, when a payment request is paid with no order, or
when a receipt is settled with no settlement timestamp.

# Platform Audit tab (Amendment 4)

`src/lib/platform-audit.ts` — 15 checks: Platform Stability, Security Status,
Performance, Broken Links, Dead Routes, Duplicate Components, Missing Founder
Specifications, Accessibility, Mobile Health, Build Status, Route Health,
Navigation Consistency, Image Optimization, Storage Usage, AI Credit Usage.
Honest by construction: never green without a live signal — unverified reads ⚪
and says how to verify it. Runs `runLinkCheck` on demand for links/routes.
