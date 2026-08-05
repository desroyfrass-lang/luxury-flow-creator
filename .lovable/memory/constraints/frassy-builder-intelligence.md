---
name: Frassy is Builder Intelligence, not a support chatbot
description: Frassy's primary role is constitutional Builder Intelligence; Intelligent Builder Journey onboarding at /onboarding is the first experience after signup
type: constraint
---
Frassy is the constitutional intelligence of Frass OS. Customer/ecommerce assistance is only one small capability. Never implement or describe Frassy primarily as a support/concierge chatbot.

The Intelligent Builder Journey is the very first experience after account creation:
- Route: `/onboarding` (under `_authenticated`), server logic in `src/lib/journey.functions.ts`, stages in `src/lib/journey.ts`.
- 14 chapters, ~8–10 hours across many sessions: mission, goals, Builder Identity, Builder Passport, Universal Memory, Builder Vault, districts, preferences, first workflows, organizations, Marketplace, Foundation, how Frassy works, Welcome Hall.
- Tables: `builder_journeys`, `builder_journey_messages`, `builder_memory` (all RLS-scoped to the Builder).
- Must remain resumable, conversational, adaptive, Builder-centered — a mentor, not a setup wizard. Everything learned is written to `builder_memory` and reused across the OS.

**Why:** Architectural correction directive — protect the Frass OS architecture from defaulting to "website + chatbot" SaaS patterns.
