---
name: Production Deployment Gate
description: FRASS-0502-D/0503-D/0504/0505 — deployment checklist, rollback verification, security review cycle and pre-publish soak must pass in production before any deploy is complete
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

FRASS-0504 "Rollback Verification" (P0): a deploy is safe only if it can be safely undone.
Verify production snapshot exists · migrations reversible (or forward-only recorded) ·
static assets restorable · worker version revertible · env vars unchanged or versioned ·
rollback procedure previously tested. If rollback isn't safe, the deployment does not proceed.

FRASS-0505 "Security Review Cycle" (P0, major releases): automatically review Authentication ·
Authorization · Financial Center · Founder permissions · Marketplace · File uploads ·
Business Vaults · Frassy permissions. Not because something broke — security is part of release.

Pre-publish soak: never publish immediately. Let the preview sit, walk it as a real user
(Welcome Hall, Register, Login, Daily, Workspace, Money Moves, Marketplace, Financial Center,
Builder Vault, Frassy), publish only if nothing breaks.

**How to apply:** never report a fix as resolved from preview alone — publish, then verify
the live site with a clean incognito smoke test and production logs.

Routing rule: `/daily` is a redirect to `/room?daily=1`. Never build a second Daily page.
