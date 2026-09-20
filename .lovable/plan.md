# FV Studios Functional Reality Pass

## Goal
Make the existing `/studio` truthful and usable before any further visual work: remove the monitor collision, ensure every visible control has a real outcome or a clear disabled state, and keep one current job with one obvious next action.

## Changes
- Replace the absolutely positioned monitor/transport stack with reserved layout rows so long production names, status, playback, and transport never overlap.
- Audit every visible Studio control against its current handler and capability. Keep controls that perform real navigation or state changes; disable controls when output, media, selection, or an installed machine is missing; remove decorative controls that look actionable.
- Keep the six work-type doors as selectors. Unsupported production types will lead only to the existing Frassy planning path and will not imply media generation.
- Keep the existing Studio tabs only where their content has a real current purpose. Timeline/transport visuals without working media controls will become clearly non-interactive status, not fake buttons.
- Keep one primary next action. Preserve Frassy, approved purple/gold lighting, Enhance Phone Recording, billing truth, and all existing server-side protections.
- Reduce the seated Frassy image to a nearly still entrance/settle presence; retain live lighting and waveform responses for real voice states and reduced-motion support.

## Technical details
- Frontend presentation and interaction changes only in existing Studio files and focused tests.
- No image changes, new machines, providers, backend, economics, roles, or security changes.
- Responsive checks at 1280×900, 1024×768, 768×900, 650×900, and 390×844, including a long production title and collision/overflow measurements.
- Signed-in interaction audit will click or inspect every visible Studio control and record: works, disabled with reason, or hidden.
- Run focused tests, full tests, typecheck, changed-file lint, and confirm the automatic build.
- No deployment or publication.
