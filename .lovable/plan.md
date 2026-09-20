# FV Studios Frassy Response Options Refinement

## Goal
Keep the normal Studio conversation visually clean while preserving every existing explanation and response-hearing capability behind one compact, accessible control on each Frassy reply. Complete this together with the pending Studio collision, text-under-image, and duplicate-transcript correction.

## Changes
- Add one small per-response “Response options” trigger, visually represented by an ellipsis and clearly labelled for screen readers.
- Keep the menu closed by default. When opened, show Technical version, Guided walkthrough, the four explanation depths, and Hear Frassy.
- Reuse the existing learning-level state, re-explanation request path, and response playback action; do not create another conversation, transcript, voice state, or capability implementation.
- Show selected explanation mode and depth clearly. Disable Hear Frassy with a truthful reason when response playback is unavailable or already busy.
- Keep ordinary Talk to Frassy controls separate from response playback.
- Correct the Studio response layout so Frassy’s image, transcript text, composer, and menu cannot collide or render text beneath the image.
- Ensure one visible copy of each live transcript turn by removing the duplicate rendering path while preserving shared history.
- Preserve the approved seated identity, purple/gold room, current production state, truthful Play/Export/Edit behavior, roles, security, and all existing systems.

## Technical details
- Frontend presentation and focused presentation tests only; no backend, provider, machine, economics, billing, role, security, or image changes.
- Compose the response menu from the existing accessible menu components and existing Frassy callbacks/state.
- Validate keyboard focus, touch targets, selected state, closed-by-default behavior, one-copy transcript rendering, and zero horizontal overflow.
- Run focused tests, full tests, typecheck, changed-file lint, build, and signed-in Studio checks at 1280×900 and 390×844.
- No deployment or publication. Music Engine remains uninstalled.
