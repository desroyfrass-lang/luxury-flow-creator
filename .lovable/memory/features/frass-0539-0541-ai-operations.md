---
name: FRASS-0539/0540/0541 — AI Approval Rule & Founder AI Operations
description: Frassy read-auto/write-approve/delete-confirm rule, plus the Command Center AI Operations dashboard measuring cost and member outcomes
type: feature
---

## FRASS-0539 — AI Approval Rule (P0)
Read actions: Frassy acts automatically. Write actions: she prepares and previews the change, and it is applied only on Founder approval. Delete actions: Founder approval plus a second confirmation. Single source of truth: `src/lib/founder/ai-approval.ts` (`approvalPolicy`, `assertAiActionAllowed`, `AiProposal`, `proposalQuestion`). Never let another surface grant Frassy broader authority.

## FRASS-0540 — Founder AI Operations Dashboard (P0)
Command Center section `ai` ("AI Operations"). Panel: `src/components/founder/ai-operations-panel.tsx`; data: `src/lib/founder/ai-operations.functions.ts` (Founder-only via `has_role`) with maths in `src/lib/founder/ai-operations.ts`. Reads `ai_credit_ledger` / `ai_credit_wallets` for credits, requests by feature, success rate, response times, 14-day trend, alerts and optimisation suggestions.

## FRASS-0541 — Return on Intelligence (P0)
The same dashboard reports outcomes, not just cost: businesses started (builder_journeys), books published/in progress (legacy_publications), products created (builder_products), Money Moves completed (builder_opportunities), active blueprints (member_success_blueprints) and member revenue influenced (orders + completed opportunity value). Principle: AI is an investment in member outcomes, never just an expense line.
