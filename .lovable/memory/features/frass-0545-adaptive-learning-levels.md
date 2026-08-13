---
name: FRASS-0545 — Adaptive Learning Levels
description: Four learning depths (One Sentence, Explain Like I'm New, Detailed, Expert) with a remembered default and instant per-answer switching
type: feature
---

# FRASS-0545 — Adaptive Learning Levels

Constitutional: education adapts to the learner. The information never changes — only the
depth of the explanation changes.

Levels: 🟢 One Sentence · 🔵 Explain Like I'm New · 🟣 Detailed · ⚫ Expert.

Rules:
- Every member has a default level (Settings → Learning Preferences, Builder Hall), applied
  platform-wide: Daily, Workshop, Welcome Hall, Business Vaults, Money Moves, Knowledge Vault,
  Command Center, Control Room, security/financial/analytics/AI reports, Blueprints.
- Any answer can be re-explained at another level instantly; that switch is temporary.
- Frassy may *recommend* a different level; she never switches on her own.
- Never make a member feel small for choosing a simpler level.

Implementation: `src/lib/frassy/learning-levels.ts`, `src/hooks/use-learning-level.ts`,
`src/components/frassy/learning-level-picker.tsx`,
`src/components/frassy/learning-preferences-card.tsx`,
level buttons inside `src/components/frassy/plain-english-toggle.tsx`,
`learningLevelContext` sent from `frassy-chat.tsx` into `src/routes/api/chat.ts`.
Registered in `src/lib/constitution/registry.ts`. Extends FRASS-0544.
