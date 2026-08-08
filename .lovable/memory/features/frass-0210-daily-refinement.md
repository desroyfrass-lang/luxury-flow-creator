---
name: FRASS-0210 — Daily, Workspace & Construction refinement
description: Constitutional refinement of The Frass Daily — honest data, provenance, drill-downs, My Day, welcome ritual, natural-language navigation, workspace memory bar, and greet-once Frassy
type: feature
---

# FRASS-0210 — Version 1.1 refinement (approved scope)

## Truth over polish
- The Daily never shows simulated numbers by default. If live records do not exist, it shows real zeros with an "Awaiting" badge and the line: "No live business records exist yet, so every number reads zero. Nothing here is simulated."
- Demonstration data is opt-in via a toggle in the Daily legend (`frass.daily.demo` in localStorage), never the default.
- Implemented in `src/lib/workspace/daily-intel.ts` (`honestDaily`).

## Money explains itself
- Financial metrics carry `sources[]` (provenance rows) and `records[]` (the records behind the number).
- "Where did this come from?" opens the full revenue breakdown: product, marketplace, affiliate, builder share, Luxury House, Bridal, Kids, subscriptions, Foundation, Vault, fees, refunds, pending payouts, available balance.
- "View details" drills down inside the Daily first; only then does it offer "Open in my workspace". No dead cards.

## My Day
- Single summary card at the top of the Daily: percent complete, time remaining, tasks, delegated, waiting approval, completed.

## Daily welcome ritual
- One short rotating moment (founder insight, business principle, community milestone, motivation, foundation story, builder success, quote). Rotates by calendar day, never repetitive, and can be turned off/on by the Builder (`frass.daily.ritual`).

## Navigable by conversation
- Command bar in the Daily understands intent, not syntax: "let's do the second one", "show me the orders", "what are those 18 orders", "continue yesterday's work", "open Marketplace", "take me to vendors".
- `resolveDailyCommand` resolves ordinals, resume points, metrics, approvals, goals and destinations.

## Workspace continuity
- The workspace memory bar shows exact position: My Workspace → Mode → Project → Focus, every segment clickable.
- Focus is the last active section of the active project, so returning resumes the precise task, not just the project.

## Frassy greets once
- The cinematic introduction belongs to the entrance only (`home`, `frass-world`), once per session. Everywhere else Frassy is already present and continues; she never re-introduces herself and no "Welcome back" interruption is shown.
