---
name: FRASS-0547 / FRASS-0548 Founder Success Dashboard & Founder Visibility
description: Founder sees member progress (momentum, blueprint, Money Moves, legacy) and revenue ranges only — never balances; Founder analytics are Founder-only and fail closed
type: feature
---

# FRASS-0547 — Founder Success Dashboard (Measure Progress. Protect Privacy.)

Financial data belongs to the member. Progress data belongs to the platform.

**Founder may see:** overall momentum (🟢 Thriving / 🟡 Growing / 🟠 Needs encouragement /
🔴 Needs support), achievement style, blueprint progress, Business Vault completion,
Daily streak, Money Move completion, projects completed, digital legacy + book progress,
engagement trends, milestones, Frassy coaching recommendations.

**Founder never sees:** bank balances, credit card balances, exact personal income, tax
records, personal financial accounts. Money appears only as a range: Not yet earning ·
First income earned · $100+ · $500+ · $1,000+ · $5,000+ · $10,000+ · $50,000+.
The exact figure never leaves the server handler.

**Founder Coaching opt-in:** a member may explicitly invite deeper visibility; it is
their invitation to extend and withdraw, never a default.

**Founder Radar:** every morning Frassy replaces the roster with an attention list —
who needs encouragement, who is close to a milestone, who launched, who published, who
reached serious recurring income.

**Journey bars** show Explorer → Builder → Momentum → High performer, so the Founder sees
a trajectory rather than a number.

**Founder Principle:** the Founder should have visibility into member progress to better
support the community, but never more than is necessary to fulfil that responsibility.
Member dignity, privacy and trust always come first. The Founder is not the boss —
members must feel "Frass noticed I needed encouragement", never "I'm being watched".

# FRASS-0548 — Founder Visibility (Constitutional Amendment, P0)

Founder analytics are Founder-only. No other member, partner, administrator, moderator,
employee, contractor or AI agent may access them without a future amendment.
Members see only their own data. Public visitors see none of it (public achievements stay
under FRASS-0535). Enforcement is required at database, API, application, Frassy and every
AI channel (ChatGPT, Claude, WhatsApp, future). Unauthorised requests fail closed.

A **Founder Confidential banner** must always appear on the dashboard.

Implementation: `src/lib/founder/success-dashboard.ts`,
`src/lib/founder/success.functions.ts` (server-verified admin role, FRASS-0530),
`src/components/founder/success-dashboard-panel.tsx`, Command Center → Operations.
