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
