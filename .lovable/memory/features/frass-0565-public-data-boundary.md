---
name: FRASS-0565 Public Data Boundary & Zero-Trust Privacy
description: Private by default — public features expose dedicated public views only; never internal IDs, money values or internal metadata
type: constraint
---

**Private by Default. Public by Design.** Everything is private until intentionally made public.

Never returned to anonymous or unauthorized viewers:
- Internal identifiers — user_id, owner_id, host_id, sender_id, author_id, partner_id, builder_id, email, phone, any database identifier.
- Financial values — credits, balances, amounts, gift values, currencies, commission percentages, internal pricing, platform revenue.
- Internal metadata — audit fields, internal/Founder notes, moderation flags, risk scores, security classifications, system references.

Public reads use a dedicated public view or explicit field allow-list (e.g. `public_live_gifts` = display name, gift icon, gift type, timestamp). Never a raw table, never `select *`. Anonymous grants are column-scoped.

Before releasing any public surface, answer: who can see this (Founder / Member / Connections / Partners / Public) and what is the minimum they need? Expose only that.

FRASS-0531 expands: every scan verifies no internal IDs, no financial values, no owner identifiers, no raw public tables, no anonymous access beyond constitutional limits. A regression fails Release Approval (FRASS-0529).

**Why:** the same exposure categories kept recurring; the fix is architectural, not per-finding.

**How to apply:** use `src/lib/security/public-data-boundary.ts` (`assertPublicSafe`, `projectForAudience`, `BOUNDARY_QUESTIONS`) on every public read path; four permanent regression tests live in `src/lib/security/regressions.ts`; checklist in `SECURITY_REVIEW_STANDARD.md` section 10.
