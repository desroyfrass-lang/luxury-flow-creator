---
name: FRASS-0559/0560/0561 Founder Experience Simulator
description: Command Center persona simulator reusing the FRASS-0519 session engine, front-door preview reset on every build, and Founder Seed Vaults (no mock data ever)
type: feature
---

# FRASS-0559 — Founder Experience Simulator

- Lives in the Founder Command Center as the 🧪 Experience Simulator section
  (`src/components/founder/experience-simulator.tsx`, `src/lib/founder/simulator.ts`).
- Reuses the FRASS-0519 engine (`founder_sessions` / `founder_observations`).
  A simulation is a walkthrough labelled `Simulation — <Persona>`. Never build a
  second engine, a mock account, or a separate table.
- Ten personas: First-Time Visitor, Beginner, Tradesperson, Business Builder,
  Fashion Designer, Musician, Author, Parent/Kids World, First Partner, Founder.
  Each has behaviour rules (Beginner = slow + Simplified View; Business Builder =
  fast + advanced; Tradesperson = digital-first Money Moves + legacy).
- Observation lenses map onto existing kinds: 🐞 Bug, 💡 Improvement, ❤️ Loved
  this, 🤔 Confusing, ⚠ Needs simplification. Each becomes a Founder Review item.
- Five closing questions are stored as the session checklist and produce a
  **Founder Experience Score** (Welcome, Clarity, Conversation, Navigation,
  Confidence) plus a one-sentence biggest opportunity.
- Release checklist: First-Time Visitor, Beginner, Tradesperson, Founder must
  each have a completed simulation.

# FRASS-0560 — Founder Preview Reset

- Official sequence: `/` → Welcome Hall → first Frassy conversation → district
  choice → destination. Simulations always start at Step 1.
- `__FRASS_BUILD_ID__` (defined in `vite.config.ts`) changes per build;
  `FounderPreviewReset` in `__root.tsx` navigates the Founder to `/` once per new
  build. Founder-only, and switchable from the simulator.

# FRASS-0561 — Founder Seed Vaults

- Never say "mock", "fake" or "test data" for anything a Founder creates.
- Reset clears visitor-shaped local state only; Vaults, notes and sessions are
  preserved. Every Founder Vault is a 🌱 Seed Vault the Founder owns and may turn
  into a course, book, Builder Path, Blueprint, manufacturing offer or business.

# FRASS-0562 — Simulation Mode (state, not just interface)

- Constitutional clarification: **the Founder is never *unintentionally* gated,
  but may voluntarily enter the complete onboarding journey through the
  Experience Simulator.** A gate met on purpose keeps testing honest.
- The simulator simulates the **state of a member**, not only the interface.
  "Pretend I have never been here before" is on by default; while it is on the
  Founder meets every new-member gate (`WelcomeGate` ignores admin bypass).
- One controlled environment: no second email, no second account, no fake data.
  `SimulationModeBar` (mounted in `__root.tsx`) shows the active persona on every
  page and exits in one tap back to full Founder privileges.
- Daily development and UX testing use Simulation Mode. **One real test account
  is still kept for release validation only** — signup, email verification,
  password reset, login/logout must be proven on the real path.
