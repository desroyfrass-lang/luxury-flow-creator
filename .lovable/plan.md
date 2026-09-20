# FV Studios Luxury Control Room Redesign

## Goal
Replace the flat brown dashboard appearance with one immersive black-and-charcoal studio console illuminated by restrained champagne-gold light, while preserving the current one-job workflow and all existing behavior.

## Build
- Recompose the current screen around one large studio monitor, an integrated Frassy director console, and one visually dominant next action.
- Restyle navigation as a slim illuminated studio rail; convert supporting tools into floating glass modules and drawers rather than bordered card stacks.
- Redesign creation choices as spacious studio doors with light, depth, and tactile movement.
- Add a practical-light entrance transition: ceiling light, monitor backlight, console edge, and floor reflection come up after entry.
- Use premium display hierarchy for the current production and calmer readable text for controls.
- Keep all results, approvals, processing states, blockers, and outputs in the existing immediate dialogs and preview area.
- Preserve Enhance Phone Recording wording and keep mastering separate and unavailable.

## Technical details
- Scope changes to `/studio` presentation styles and studio-facing presentation components only.
- Keep server calls, data structures, billing logic, security checks, machine routing, evidence, and role gates unchanged.
- Add semantic, studio-scoped visual classes and animations in the global design system.
- Remove whole-page horizontal overflow while retaining an internally scrollable navigation rail.
- Respect reduced-motion preferences.

## Validation
- Run focused studio tests, type checking, and the automatic build check.
- Capture signed-in screenshots at 1280×900 and 390×844.
- Confirm the page is charcoal plus luminous champagne-gold, not stacked brown cards or enterprise software.
- Confirm the primary next action is immediately dominant, no scroll hunt is needed, and no page-level horizontal scrollbar exists.
- Do not deploy or publish.
