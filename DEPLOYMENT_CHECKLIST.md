# FRASS Production Deployment Checklist

Every production publish must pass this checklist. No exceptions.
Owner: Founder / Frass OS. Ties into the Founder Security Center (FRASS-0474/0475/0476).

## 1. Build integrity
- [ ] TypeScript build passes (no type errors).
- [ ] Worker/SSR build passes (production build, not dev).
- [ ] No CommonJS/UMD interop shims bundled into the worker entry
      (regression guard for the `tslib` UMD crash — worker must use `tslib.es6.mjs`).
- [ ] No new Node-only dependencies added (no native addons, no `child_process`).

## 2. Runtime integrity
- [ ] Cloudflare Worker starts successfully (no boot-time exception).
- [ ] SSR renders HTML for `/` (status 200, non-empty document).
- [ ] No server errors in production logs for the first requests after deploy.

## 3. Critical path smoke test (clean incognito: no cache, no cookies, no login)
- [ ] `https://frasskicks.com` loads.
- [ ] Welcome Hall loads.
- [ ] Authentication works (sign-in and sign-out).
- [ ] Workspace loads.
- [ ] The Daily loads.
- [ ] No console errors on any of the above.

## 4. Security gate
- [ ] Security scan is current for the deployed commit.
- [ ] No critical findings unresolved.
- [ ] Platform Protection Mode is not unintentionally frozen.

## 5. Post-deploy verification
- [ ] At least one successful production request confirmed in logs after deploy.
- [ ] Issue is only marked complete after verifying **production**, not preview.

## Rollback rule
If any item in sections 1–3 fails in production, roll back or republish the last
known-good commit immediately, then diagnose. Production is never left broken
while a fix is being investigated.

---

## Constitutional status

This checklist is enforced by **FRASS-0502-D Production Deployment Gate** (P0).
Every deployment must also produce a report per **FRASS-0503-D Never Ship Blind**,
using `deployments/REPORT_TEMPLATE.md`, archived in `deployments/` and surfaced in
Founder Mode alongside the Founder Security Center.

Gate categories (all must pass, in production, not preview):
Build Integrity · Worker Integrity · SSR Integrity · Authentication ·
Critical Navigation · Security Verification · Console Verification ·
Server Verification · Founder Security Center Verification ·
Post-Deployment Monitoring · Rollback Procedure.

---

## 6. Rollback verification (FRASS-0504, P0)
- [ ] Current production snapshot exists (last known-good commit + build recorded).
- [ ] Database migrations reversible where applicable, or forward-only decision recorded.
- [ ] Static assets can be restored from the previous build.
- [ ] Worker version can be reverted.
- [ ] Environment variables unchanged, or the change is versioned and documented.
- [ ] Rollback procedure has been tested previously.

If rollback cannot be completed safely, the deployment does not proceed.

## 7. Security review cycle (FRASS-0505, P0 — major releases)
- [ ] Authentication review
- [ ] Authorization review
- [ ] Financial Center review
- [ ] Founder permission review
- [ ] Marketplace review
- [ ] File upload review
- [ ] Business Vault review
- [ ] Frassy permission review

## 8. Pre-publish soak walk (real-user paths)
- [ ] Welcome Hall  - [ ] Register  - [ ] Login  - [ ] Daily  - [ ] Workspace
- [ ] Money Moves  - [ ] Marketplace  - [ ] Financial Center  - [ ] Builder Vault  - [ ] Frassy
- [ ] Preview soaked (used as a real user) before publishing.

## 9. Post-launch observation window (FRASS-0506, P0)
- [ ] Release class chosen (critical 72h / standard 24h / minor 6h) and recorded.
- [ ] `src/lib/deploy/current.ts` updated with deployment ID, time and class.
- [ ] Observation Window panel shows the new release in the Founder Security Center.
- [ ] Founder Daily shows 🟢 / 🟡 / 🔴 for the release.
- [ ] Monitored throughout: application health, authentication, financial transactions,
      worker stability, API errors, console errors, performance, database health.
- [ ] No critical issues raised during the window (otherwise escalate + consider rollback, section 6).
- [ ] Window closed clean → deployment accepted and archived in the Deployment Report.

---

## Lifecycle status: FROZEN
Build → Validate → Security Review → Rollback Verification → Publish → Observe → Archive → Learn.
This checklist is the only deployment process. Extend it; never duplicate it.

## 10. Independent penetration testing (FRASS-0530, P0 — before public launch)
- [ ] Third-party penetration test scheduled and completed against preview + production.
- [ ] Scope includes: authentication, Founder/Admin privilege escalation (Zero Trust,
      FRASS-0530), payment and Financial Center flows, file uploads, Frassy tool access,
      marketplace and business vault data boundaries.
- [ ] All critical and high findings resolved; medium findings triaged with owners.
- [ ] Re-test confirms fixes.
- [ ] Result recorded in the Founder Security Center before broad public invitations.

Automated scanning finds common issues only; it is not a substitute for this step.
