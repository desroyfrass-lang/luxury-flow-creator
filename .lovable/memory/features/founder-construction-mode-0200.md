---
name: FRASS-0200 — Founder Construction Mode & Blueprint Architecture System
description: Founder-only mode where Frassy becomes Chief Systems Architect; Blueprint Layer overlay, Architectural Intelligence Panel, live simulation, quality governance, living decision log
type: feature
---
**Constitutional principle:** the platform belongs to its community, but its architecture belongs to the Founder. Only the Founder may redesign Frass OS.

## Access control (no exceptions)
Construction Mode is permanently restricted to the authenticated Founder. Builders, Partners, Marketplace Vendors, Members, Affiliates and Administrators may never activate it. Refusal line, verbatim: "Construction Mode is reserved for the Founder. I can help improve your own workspace or projects, but I cannot modify the Frass Operating System."

## Activation
- ⌘/Ctrl + Shift + B anywhere in Frass OS, the `frass:construction-mode` event (`openConstructionMode()`), or the Construction Mode button on the Founder Dashboard.
- Frassy switches from Business Advisor to Systems Architect automatically on "enter construction mode", "blueprint mode", "let's redesign/rebuild this", "let's change the interface", "let's improve the software".

## Blueprint Layer
Every tagged component (`data-blueprint="<id>"`) becomes selectable. Selecting one opens the **Architectural Intelligence Panel**: Purpose · Registry references · Connected systems · Dependencies · Users affected · Last approved by · Last modified · Implementation status · Specification — then grouped actions (Placement, Size, State, Restyle, Behavior, Connections, Inspect).

## Governance
- **Architectural protection, always:** Audit → Duplicate detection → Dependency analysis → Impact review → Recommendation → Specification → Founder approval → Implementation brief. Never redesign blindly.
- **Live simulation** before implementation; the Founder approves first.
- **Quality standard:** elegance, clarity, professionalism, luxury, accessibility, performance, consistency, visual harmony. Never reduce perceived quality.
- **Quality governance:** every image, video, graphic, icon, illustration, animation, typeface, layout and editorial asset is evaluated against the existing Frass standard. Nothing inferior may be added — equal or higher, never lower. Proactively recommend upgrades.
- **Founder standards:** every decision reinforces luxury, professionalism, confidence, warmth, elegance, accessibility, innovation, humanity, community.
- **Living architecture:** every approved decision is recorded (`frass.construction.decisions`) and referenced in future discussions rather than recreated. Nothing is forgotten.

Files: `src/lib/construction/blueprint-registry.ts` (component registry, actions, simulation, decision log), `src/components/construction/blueprint-mode.tsx` (overlay, mounted in `__root.tsx`), Construction Mode governance block in `src/routes/api/chat.ts`.

## Amendment — Blueprint-first & Development Credit Intelligence
**Final constitutional principle:** *The Founder never edits production directly. The Founder edits the Blueprint.* Lifecycle: Vision → Blueprint → Approval → Implementation → Verification.

- **Preview** — `Preview on screen` applies a temporary visual preview of the selected action to the live component; nothing is saved.
- **Sandbox** — banner toggle (`frass.construction.sandbox`); exploration without consequence.
- **Versioning** — every approval saves a restorable Blueprint version (`frass.construction.versions`), restorable from the panel.
- **Relationship mapping** — Depends on / Depended on by / Shares systems with, derived from the registry.
- **Credit Intelligence** — `src/lib/construction/credit-intelligence.ts`: complexity tiers (Micro/Small/Medium/Large/Major), conservative credit forecast, risk, drivers, value, and a cheaper alternative for Large/Major. Batch estimation saves ~20%.
- **Budget** — Founder records balance + monthly budget (`frass.construction.budget`); spend ledger (`frass.construction.spend`). Frassy warns at low balance / over budget and NEVER invents a balance.
- **Frassy response format** (in `src/routes/api/chat.ts`): "Estimated Development Impact" — Complexity · Forecast · Risk · Why · Value · Lighter alternative → then ask approval.

Files: `src/lib/construction/credit-intelligence.ts`, `src/components/construction/development-credits.tsx`, extended `blueprint-registry.ts` and `blueprint-mode.tsx`, Development Credits panel on `/founder`.

## Principle 12 — Impact Forecast (Architectural Impact Report)
`src/lib/construction/impact-forecast.ts` answers "What else changes because of this?" before any Blueprint approval: components affected (via the relationship map), pages affected (per-component page map), roles affected, plus graded mobile / accessibility / performance lines, an explicit "untouched" list (public shopping, checkout, Kids World, marketplace storefronts) when nothing public is in the ripple, testing recommendations with a count, future-maintenance note, and a sequencing recommendation ("implement together with X to avoid duplicate work").
- Rendered in `blueprint-mode.tsx` between the live simulation and the credit forecast; **approval is blocked until the Founder ticks "I have read the impact report"**, and `impactSummary()` is written into the recorded decision.
- Lifecycle constant is now: Vision → Blueprint → Simulation → Impact Report → Credit Forecast → Founder Approval → Implementation → Verification → Version Archive. `IMPACT_PRINCIPLE` added to the registry; Frassy's prompt carries the same duty.
