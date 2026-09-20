# FV Studios creator-room revamp

## Goal
Rework the existing `/studio` screen into one cinematic, eye-level production room where creating and directing work is immediately obvious, while preserving every current production, commissioning, credit-safety, and quality-truth behavior.

## What will change
- Add an immersive studio arrival that naturally gives way to the working console without becoming a separate splash screen.
- Make “What are we making today?” the front door, with six purposeful creation choices that open the existing production-creation flow with the correct production type.
- Recompose the existing tools around a large central preview, production selector, one Frassy director surface, contextual controls, and a timeline below.
- Apply real progressive disclosure: Directed stays minimal; Creator reveals manual edit tools; Producer adds inspector/mixer controls; Pro exposes the full console. The same production remains active throughout.
- Move Library, Phone Content/A1 Clean, A1 quality detail, export/watermark, credits/receipts, and Business Builder into clear contextual locations without deleting functionality.
- Add a private Founder Originals room entrance for authorized Founder/Admin users, linking into the existing protected `/studios` production system and its Series Bibles, canon, characters, locations, voices, scenes, assets, and production memory. Keep FRASS Chronicles, Frass Street, Frassy Street, and I Am Not My Hair distinct; never create parallel production records.
- Replace dead-looking controls with working actions, real navigation, or truthful unavailable states.
- Keep tablet/mobile controls large and ordered around the current task.

## Technical details
- Frontend-only changes to the existing `/studio` route and focused studio presentation components/styles.
- Reuse the current create-project action, production selector, Director forecast/approval, Phone Content flow, control-depth persistence, A1 evaluator, timeline, watermark options, receipts, and links.
- Reuse the existing server-protected Founder/Admin studio routes and gate the new entrance from server-verified role status; do not duplicate their backend or weaken access control.
- No changes to database schema, server functions, engine routing, job verification, credit charging, canonical production identity, payments, security, or provider connections.
- Verify all six creation doors create through the existing production path, depth-based visibility behaves correctly, and commissioning tests remain green.

## Validation
- Run focused studio tests, TypeScript checks, and the application build.
- Verify authenticated desktop and mobile `/studio` views and exercise creation/depth controls in preview without publishing.
