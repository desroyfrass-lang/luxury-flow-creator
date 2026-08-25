# Step 2 — Revive the Frassy Presence That Already Exists

Nothing new is generated. No new artwork, no new voice provider, no route changes, no Teleporter or Onboarding Room changes. This step switches on three finished pieces of Frassy that are already built and currently dormant, and makes sure they behave as one host rather than three separate things.

Her look stays exactly as it is today: the existing realistic illustrated portraits. No cartoon restyling, no new face, no proportion or skin-tone changes.

## What gets turned back on

**1. The cinematic entrance (already built, currently switched off)**
The full-screen welcome — she rises, speaks the destination welcome, then glides aside — exists and works, but its destination list is empty, so it never fires. It gets a small, deliberate list of major destinations only: the Welcome Hall, Frass Hill, Frass District and Frass Kids. Sub-pages, product pages and grids never trigger it. Once per destination per session, and a click, Escape or "Start exploring" sends her aside immediately.

**2. The conversation dock (already built, mounted nowhere)**
The floating voice transport — live waveform, mic, pause, stop, and her current state — is finished but never rendered. It gets mounted once, globally, and only appears where the existing surface rules already say she belongs. It sits alongside the chat panel, never duplicating it.

**3. The consent moment (already built, mounted nowhere)**
The consent modal is complete but unused. It gets shown once, before her first spoken words in a session, so the visitor chooses whether she speaks. Choice is remembered; declining leaves her fully usable in text.

## Keeping her one character

While these three come online, her visual definition is pulled into one place so the corner host and the workspace avatar stop describing her separately. Same image, same states, same motion rules — one definition, used in both places. This is a consolidation only; nothing about her appearance changes.

## Guardrails

- Only one Frassy visible at any moment. The existing surface rules and pipeline registry stay in charge; the entrance and dock defer to them.
- Voice stays on the current in-stack engine. No ElevenLabs, no paid third-party service, no provider swap.
- Reduced-motion preferences continue to be respected everywhere.
- She never blocks. Every appearance is dismissible.

## Technical notes

- `src/components/frassy-host.tsx` — populate `ENTRANCE_IDS` with the major destination ids from `src/lib/frassy-destinations.ts`; leave the phase machine, timings and skip behaviour untouched.
- `src/components/voice/frassy-conversation-dock.tsx` — mount once in `src/routes/__root.tsx`; it already self-gates through `frassySurface()`.
- `src/components/frassy-consent.tsx` — mount once in `__root.tsx`, gated ahead of the first `speakWithGuarantee()` call; persist the answer in existing local preference storage.
- Shared character definition: a single module holding the portrait source and the mood/state class map, consumed by both `frassy-host.tsx` and `src/components/workspace/frassy-avatar.tsx`. Existing CSS keyframes in `src/styles.css` are reused as-is.
- No database, migration, route, navigation or Teleporter changes.

## Verification

Desktop and mobile passes on the entrance destinations plus one sub-page, confirming: entrance fires once per destination, dock appears only where allowed, consent appears before first speech, exactly one Frassy on screen, and reduced-motion honoured. Screenshots returned before anything else is proposed.
