# FV Studios Frassy Station Repair

## Goal
Replace the generic overlay with a room-integrated Frassy station that keeps the Studio work visible, presents the approved seated Frassy at useful scale, simplifies conversation controls, and removes Studio-only obstructions without changing shared Frassy behavior or protected systems.

## Build
- Keep the existing shared Frassy conversation, history, context, text, and voice system; change only its `studio` presentation.
- On desktop, dock the open station into the Studio grid so the production monitor and controls remain visible and compress rather than being covered.
- On mobile, use a full-width bottom sheet with a clear close/minimize path and room for critical Studio navigation.
- Present the approved seated Studio Frassy at useful scale beside the transcript, with status that plainly shows listening, thinking, speaking, or unavailable.
- Simplify the Studio composer to text, Talk to Frassy, send, and one compact Attach control; remove the primary voice-feedback strip and generic action-chip wall in Studio only.
- Keep portrait tap, Ask Frassy, Open conversation, and Plan with Frassy connected to this one shared station.
- Hide the universal Free Try On launcher on `/studio` only and remove the Studio header’s voice-feedback shortcut.
- Fix page-wide overflow and keep text crisp without changing the established purple/gold room direction.
- Preserve truthful playback: only verified media plays; otherwise the control remains disabled as “No playable output yet.”

## Technical details
- Pass the Studio open state into the route layout so the desktop grid allocates a dedicated Frassy column only while summoned.
- Keep Studio-specific markup and classes conditional on `presentation="studio"`; default and embedded Frassy surfaces retain their current controls and layout.
- Use the existing approved seated PNG through `FV_STUDIOS_FRASSY_LOOK`; no image editing or generation.

## Validation
- Add or update focused regression coverage for Studio presentation and route-specific launcher visibility where practical.
- Run tests, type checking, lint, and verify the automatic build result.
- Test authenticated 1280×900 and 390×844: seated Frassy scale, both summoning paths, text send/reply, microphone state or truthful unavailable state, production visibility, disabled playback truth, close/minimize, crisp text, and zero page overflow.
- Do not deploy or publish.
