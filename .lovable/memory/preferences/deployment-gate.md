---
name: Production Deployment Gate
description: FRASS-0502-D/0503-D — deployment checklist must pass in production before any deploy is complete, plus archived deployment reports
type: preference
---
Before any production publish, `DEPLOYMENT_CHECKLIST.md` must pass in **production** (not preview).

Gate categories (FRASS-0502-D, P0): Build Integrity · Worker Integrity · SSR Integrity ·
Authentication · Critical Navigation (Home / Welcome Hall / Workspace / Daily) ·
Security Verification · Console Verification · Server Verification ·
Founder Security Center Verification · Post-Deployment Monitoring · Rollback Procedure.

FRASS-0503-D "Never Ship Blind": every deployment produces a report from
`deployments/REPORT_TEMPLATE.md` (deployment ID, build, commit, time, smoke tests,
security + SSR verification, rollback status, production URL, approval), archived in
`deployments/` and visible in Founder Mode.

**How to apply:** never report a fix as resolved from preview alone — publish, then verify
the live site with a clean incognito smoke test and production logs.

Routing rule: `/daily` is a redirect to `/room?daily=1`. Never build a second Daily page.
