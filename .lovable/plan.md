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

## Conditions of approval (accepted)

1. **Delivery set** — `locales/frassy-en.json`, `src/lib/frassy/voice-copy.ts` (`t`, `tForTier`, `validateTokens`), `FRASSY_HARD_RULES` in `src/lib/frassy/personality.ts`, `src/lib/i18n.ts`, the copy-lint and token-validation tests, and `docs/frassy-voice.md`. Everything lands in preview first.
2. **Nothing goes to the live site until your QA passes in preview** — you review `/frassy` in Beginner mode and confirm Frassy's voice on the hero, approvals, confirmations, empty states and receipts; permission checks confirm a collaborator cannot approve or launch while Founder and partner owner can; Teleporter receipts for the demo runs carry the correct fields.
3. **Checks block bad copy** — the copy lint runs on every build; banned wording in partner-facing screens fails it. Founder-only Control Room and admin paths are allowlisted.
4. **Legal and financial wording keeps its exact substance** — tone only. Any change of meaning waits for your sign-off.
5. **Staged rollout with an instant undo** — the new copy layer sits behind a switch that can be turned off in one step, returning every screen to its current wording without a redeploy.

Note on the platform: work is delivered as a preview deployment you approve and publish, not as a GitHub pull request — the review gate is the same, the mechanism is Lovable's publish step.

## What does not change

No new page, no new district, no new chat engine, no visual redesign. Wording and the prompt only. Security, legal and financial notices keep their exact meaning — warmer delivery, identical substance.

## Technical notes

- **Source of copy:** `locales/frassy-en.json` — one developer- and translator-friendly file, nested keys (`global.headerGreeting`, `hero.heroFinishedTitle`, `hero.heroFrassyNote_Beginner`, `accessibility.audioPlayTooltip`, `ariaLiveAnnouncement_Launch`). The JSON you supplied is the literal seed.
- **Loader:** `src/lib/i18n.ts` exposes `t(key, vars)`. The JSON is imported once (bundled at build time, so it works identically in the browser and during server rendering — no fetch, no per-request load cost). Placeholders use `{name}`, `{moveName}`, `{tierLabel}`; a missing key returns the key itself and logs once in development, never a blank screen.
- **Component usage:** exactly your examples — `t('global.headerGreeting', { name })` in the Desk header, `t('hero.heroFinishedTitle', { moveName })` plus the tier-specific note and `hero.heroButtonLaunch` in the Money Move hero/queue card.
- **Accessibility:** launch, approval and error announcements render inside `aria-live="polite"` regions using `ariaLiveAnnouncement_*` keys; each major message gets an icon button labelled `accessibility.audioPlayTooltip`, wired to the existing Frassy speech engine.
- **Placeholder QA test:** a unit test loads the JSON, walks every string, and asserts (a) every `{token}` is in the allowed token list, (b) no `{missing}`/empty tokens, (c) every key referenced by a `t(...)` call in the source exists. Fails the build on drift.
- **Minification (option B): deferred, not built now.** Short-key minification saves a few kilobytes but makes every log line and copy hotfix unreadable. The build script (`bun run build-i18n` producing `frassy-en.min.json` + `frassy-en.map.json`) is designed for and documented, and can be switched on later without touching a single component, since everything goes through `t()`.
- **Copy hotfix process:** edit `locales/frassy-en.json`, deploy. No component changes, no rebuild step while minification stays off.
- `src/lib/frassy/personality.ts` gains a `FRASSY_HARD_RULES` block, appended in `src/routes/api/chat.ts` alongside the existing constitution sections, so spoken Frassy obeys the same law as the wording on screen.
- Autonomy tier presentation reads existing `frassy_autonomy_settings`; no schema change.
- Regression guard: a copy lint over `src/components/**` and `src/routes/**` for banned generic wording, with an allowlist for Founder-only diagnostic paths.

