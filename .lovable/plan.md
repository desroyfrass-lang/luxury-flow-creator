# Frassy's Voice — One Copy Layer for the Whole Platform

Your directive: every piece of default interface wording must sound like Frassy, not like generic software. Today her voice lives in the chat prompt only; buttons, empty states, errors, confirmations and loading messages are still written in plain product English. This plan closes that gap.

## One thing to decide first

Your new rules say Caribbean English is mandatory, with warm words like "darling" and "love". The existing voice law (FRASS-0522) says Caribbean warmth is seasoning — a phrase, then back to clear international English. These can conflict.

Proposed resolution, unless you say otherwise: warmth and Caribbean rhythm are mandatory everywhere; endearments ("darling", "love") appear in personal moments (greetings, encouragement, completions) and never in errors about money, security or legal notices, where she stays warm but precise. Nothing regional is ever used with a first-time visitor who hasn't chosen a language style.

## What gets built

### 1. A single voice copy source
A new module holds every piece of Frassy-spoken interface wording, grouped by moment:
- Greetings and welcomes
- Work finished / launched / approved
- Something went wrong (soft, never technical)
- Empty states ("Nothing here yet, and that's fine — here's where we start.")
- Loading and waiting
- Confirmations and gentle warnings
- Presentation of finished Money Moves, per autonomy tier (Beginner / Learner / Intermediate / Advanced), using your example lines verbatim as the seeds

Every screen pulls its words from here. No screen writes its own error or empty-state text again.

### 2. Her rules become enforceable, not aspirational
The voice constitution gains the hard rules as explicit law: banned phrasing (system/error/AI/task completed successfully/generic SaaS confirmations), required tone, and the four autonomy presentation modes. This is appended to her prompt on every surface, so spoken and typed Frassy match the interface wording.

### 3. Rewrite the wording on the surfaces you see most
In priority order, replacing default copy with the new source:
1. Money Moves Desk (`/frassy`) — build queue, approvals, pulse log, empty states
2. Welcome Hall and Daily Welcome ceremony
3. The Daily and Workshop
4. Builder Hall, Vault, Onboarding
5. Global toasts, error boundary, and loading states

### 4. A guard so it doesn't drift back
A permanent test scans partner-facing components for banned wording ("Error:", "Task completed successfully", "Submit", "AI", "system") and fails the build if new generic copy appears. Founder-only Control Room diagnostics are exempt — that surface is allowed to be technical.

## What does not change

No new page, no new district, no new chat engine, no visual redesign. Wording and the prompt only. Security, legal and financial notices keep their exact meaning — warmer delivery, identical substance.

## Technical notes

- New `src/lib/frassy/voice-copy.ts`: typed catalogue of copy keys with tier variants and `{name}` interpolation; the JSON config you supplied becomes its literal seed data.
- `src/lib/frassy/personality.ts` gains a `FRASSY_HARD_RULES` block, appended in `src/routes/api/chat.ts` alongside the existing constitution sections.
- Autonomy tier presentation reads existing `frassy_autonomy_settings`; no schema change.
- Regression guard added to the existing test suite as a copy lint over `src/components/**` and `src/routes/**`, with an allowlist for Founder-only paths.
