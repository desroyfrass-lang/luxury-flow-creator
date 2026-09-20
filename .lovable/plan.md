# FV Studios Cinematic Frassy Bay Repair

## Goal
Turn the existing `/studio` Frassy presentation into a spatial AI Director bay where the approved seated Frassy visibly inhabits the purple-and-gold control room, while keeping production, conversation history, voice, playback truth, billing, roles, and security unchanged.

## Build
- Replace the desktop chat-card composition with a borderless room bay: Frassy occupies a large, transparent set layer; transcript and composer occupy a separate glass conversation console beside her, never beneath or over her body.
- Drive restrained rim light, halo, waveform, and breathing from the existing idle/listening/thinking/speaking states. Respect reduced-motion and do not alter or simulate movement within the approved character image.
- Use the spatial desktop bay only at widths where both production and conversation fit. At narrower desktop/tablet widths, switch fully to a closable bottom sheet with a dedicated upper character scene and lower transcript/composer stack.
- Keep the same shared Frassy conversation, history, context, and voice implementation. Keep attachments behind the compact plus control, Free Try On hidden, and playback truthful.
- Remove hard card framing, excess borders, text glow, and cramped utility styling from the Studio-only presentation.
- Constrain the Studio shell, header, navigation, stage, fixed sheet, menus, and transformed decoration so no element can expand the page width. Keep the Studio primary action clear of the open conversation surface.

## Responsive contract
- **Spatial bay:** begins at `1180px`, with production and Frassy in separate minimum-zero columns.
- **Tablet/split screen:** below `1180px`, use the bottom sheet rather than compressing the desktop bay.
- **Mobile:** full-width sheet with clear close control, character scene first, then a separately bounded transcript and composer; no overlap.

## Validation
- Inspect signed-in screenshots at 1280×900, 1024×768, 768×900, 650×900, and 390×844.
- At every size, verify `document.body.scrollWidth <= document.documentElement.clientWidth`, production remains visible or immediately recoverable, and the composer never covers Studio controls.
- Exercise Ask Frassy, seated Frassy, close, text send, truthful voice state, disabled/no-output play, and Studio-only try-on suppression.
- Run focused tests, full tests, typecheck, changed-file lint, and build. Do not deploy or publish.

## Technical boundaries
- Frontend presentation only: `frassy-chat.tsx`, Studio layout, Studio composer presentation, and Studio CSS as required.
- No image generation, cropping, editing, regeneration, body-part animation, fake lip sync, new provider, backend, economics, role, or security changes.
