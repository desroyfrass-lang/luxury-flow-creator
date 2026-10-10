# Fashion Studio recovery audit and approval plan

## Audit result

No files, routes, styles, records, images, permissions, integrations, or deployments were changed. No AI or provider credits were used.

### Current saved product truth

The live database contains one canonical product:

- **Saved name:** Soft Life Chiffon Top
- **Status:** private draft, unpublished
- **Category:** Frass Drip → Women → Vacay Drip → Vacation Fits
- **Source:** CJ product `2606050313341622800`
- **Authentic media:** 5 saved supplier photos
- **Variants:** 6 saved Sky Blue sizes, S through 3XL; every variant has the same authentic CJ variant photo
- **Vendor:** CJ Dropshipping, currently verified
- **Owner:** the same account that currently holds both `admin` and `super_admin`

The earlier audit query for the exact old title “Soft Life Chiffon” returned no row because the saved title is now **Soft Life Chiffon Top**. No data was changed during this audit.

## Failure 1 — Fashion Studio inherits the dark Studios room

**Severity: Medium — visual requirement failure, not a data or security failure.**

### Evidence

- The global palette is dark by default in `src/styles.css:77-127`.
- The `/studios` parent renders its own unthemed shell in `src/routes/_authenticated/studios.tsx:44-112`.
- `/studios/fashion` renders inside that shell using inherited semantic colours such as `bg-card`, `border-border`, and `text-muted-foreground` in `src/routes/_authenticated/studios.fashion.tsx:37-86`.
- Daily becomes luminous only because `SiteShell` adds `working-room-light` for `/daily` and `/workshop`, then scoped light tokens override the dark defaults. Fashion Studio does not use `SiteShell` and receives no light scope.

### Safest recovery

Add a **Fashion Studio-only white-and-gold token scope** on the Fashion route root. Do not change the global palette, the `/studios` parent, or any sibling Studio room. The scope must include a darker accessible gold for text and focus rings on white.

**Risk:** if the light tokens are placed on the parent Studios shell, every Studio room changes. If only cards receive white backgrounds without token remapping, inherited light text becomes unreadable.

## Failure 2 — two Frassy presentations, only one of them works

**Severity: High — the room visually promises Fashionista Frassy but the working assistant is a separate generic box.**

### Evidence

- The Fashion route creates a static Fashionista greeting card in `src/routes/_authenticated/studios.fashion.tsx:41-48`. It has no conversation or actions.
- The parent `/studios` shell then unconditionally adds another “Ask Frassy” section below every child route in `src/routes/_authenticated/studios.tsx:95-108`.
- That second section mounts the real shared `FrassyChat`, but passes only `embedded tone="dark"`; it does not pass Studio presentation, Fashionista look, or product context.
- The root floating Frassy is correctly suppressed on `/studios/*` by `src/lib/frassy/surfaces.ts:22-37,72-76`; the root is not creating the duplicate.
- Fashionista Frassy is already an approved room look in `src/lib/frassy/room-looks.ts:34-42`.
- The real assistant uses the single `/api/chat` pipeline, shared transcript, shared voice controls, authorization layer, and route-aware context. `/studios/fashion` currently resolves only to the generic **FV Studios creative producer** context in `src/lib/frassy/context.ts:58-64`.
- The verified product shown on the page is never passed through the existing sanitized `workspaceContext` channel in `FrassyChat`; therefore the assistant cannot truthfully know Soft Life Chiffon Top, its selected variant, or its category from the room.
- The shared tool registry has no fashion-product write tool. Chat can converse and navigate, but cannot honestly claim to save a fashion brief, create media, attach a capsule, or run a try-on.

### Safest recovery

Use **one shared Frassy engine and one visible Fashionista presentation**:

1. Suppress the parent’s generic assistant section only when the active child is `/studios/fashion`.
2. Mount the existing shared `FrassyChat` once inside the Fashion room presentation.
3. Resolve the approved Fashionista look from the existing room-look registry rather than hardcoding the generic FV Studios look.
4. Add a `/studios/fashion` context entry describing her responsibility as Fashion Studio creative director, without changing personality, transcript, voice, permissions, or backend.
5. Pass only the server-verified handoff facts as sanitized background context. Product data remains read-only.
6. Fashion actions must be visible buttons backed by real saved operations; until then they remain explicitly “Not connected yet.”

**Risk:** mounting a new chat would violate One Frassy. Passing browser-supplied product names as authority would weaken P2-0. Giving conversational buttons unsaved or chargeable behaviour would create fake interactivity.

## Failure 3 — product handoff splits into one real path and three context-free paths

**Severity: Critical for the promised P2-0 journey; the saved product is safe.**

### Confirmed real handoff path

1. In Vendor Brands, choose Sky Blue and one size.
2. `Prepare verified handoff` calls `getProductHandoff` from `src/components/vendors/supplier-variant-picker.tsx:17-23,69`.
3. The authenticated server function accepts only product and variant UUIDs, re-reads saved product/vendor/variant rows, verifies Founder-or-owner access, private/unpublished status, category, and variant ownership in `src/lib/vendors/product-handoff.functions.ts:7-22` and `product-handoff.ts:22-41`.
4. Only after success, the typed link in `supplier-variant-picker.tsx:77` opens `/studios/fashion` with both `productId` and `variantId` search values.
5. `parseFashionSearch` accepts only a complete pair of valid UUIDs in `src/lib/studios/fashion-studio.ts:31-36`; the destination re-runs the server verification.

That serialization and server contract are correctly designed.

### Reproducible failure path A — “No product brought in”

The three saved-card actions in `src/components/vendors/cj-pilot-panel.tsx:267-340` all open `/studios/fashion` **without search values** and explicitly say the product will not be carried over. The Fashion route then correctly sees no UUID pair and displays “No product brought in.” These are honest unconnected shortcuts, but their placement and wording make them look like product actions.

### Reproducible failure path B — returned to the front page

The `/studios` parent runs `requireFounderRoute` before the Fashion route mounts. `src/lib/founder/route-guard.ts:12-21` catches any failed/errored admin check and redirects to `/` with `replace: true`. This drops the handoff search values and gives no reason. A non-admin product owner can successfully prepare a handoff because P2-0 allows the owner, but is then rejected by the Founder/admin-only Studio door. A transient role/session failure produces the same silent front-page result.

The current product owner is also admin and super_admin, so a healthy Founder session should pass. The available runtime/console/network telemetry contained no captured failure, so the exact recording path cannot be named beyond these two code-proven routes without a live authenticated reproduction.

### Minimal recovery

- Keep the P2-0 server contract and UUID-only search contract unchanged.
- Make the verified variant handoff the single primary “Open in Fashion Studio” path.
- Relabel or demote the three context-free creative shortcuts so they cannot be mistaken for a handoff; keep their “Not connected yet” blockers.
- At the Studio door, distinguish **signed out**, **signed in but not Founder/admin**, and **temporary verification failure**. Preserve the intended Fashion URL and its UUID search values through sign-in; never send a verified Founder silently to `/`.
- Show a truthful in-room error if destination re-verification fails. Never fall back to unverified browser state.

## Expected unconnected areas versus bugs

| Area | Current truth | Classification |
|---|---|---|
| Verified product + selected variant display | Implemented through P2-0 | Broken journey when wrong shortcut or silent guard redirect is used |
| Specs | No persisted fashion spec record | Expected unconnected |
| Mockups | Existing assets are not linked to canonical products | Expected unconnected |
| Physical samples | No sample log | Expected unconnected |
| Capsules | Current capsule model references the old live-shop product/variant tables | Expected unconnected |
| Try-on | Shopper/cart pipeline; canonical private drafts are unsupported | Expected unconnected |
| Image/video creation | Studio engines exist, but no canonical-product fashion task contract exists | Expected unconnected |
| Merchandise slogans/logo treatments | Real, persisted, role-protected, reviewable | Reusable now with a narrow adapter |

## Phased recovery requiring separate Founder approval

### Phase R1 — room and handoff recovery

**Estimate: 3–5 Lovable credits. No AI/provider generation credits. No schema change.**

- Apply Fashion-only luminous white-and-gold tokens and accessibility contrast.
- Replace the duplicate static-plus-beige presentation with one Fashionista Frassy surface using the existing shared chat/voice/transcript engine.
- Add Fashion Studio context and pass the server-verified handoff as read-only sanitized context.
- Repair the handoff navigation and access-failure messaging while preserving UUID-only server re-verification.
- Keep every currently unconnected feature visibly unconnected.

### Phase R2 — first real persisted fashion task

**Estimate: 6–9 Lovable credits. No image/video generation or publishing. Requires separate Founder approval after R1 browser verification.**

The smallest useful task is **Create a design brief for this selected product variant**:

- Reuse the verified canonical product + selected variant from P2-0.
- Let the Founder select an existing approved/draft slogan or logo treatment from Merchandise Studio, or write design notes.
- Persist one narrow fashion design-brief record linking product, variant, existing Merchandise Studio records, notes, actor, status, and timestamps.
- Reuse the existing Merchandise Studio review decisions or the existing FV Studios review pattern for explicit Founder approval; never auto-approve.
- Keep supplier photos, variants, provenance, canonical name/category, and publication state immutable.
- Do not generate a mockup, image, video, capsule, or try-on result. Those remain later approvals.

A direct reuse of `merch_proposals` is not sufficient as-is because its current schema has no canonical product or canonical variant reference. R2 therefore needs a small explicit persisted link rather than hiding IDs in free-text notes.

## Acceptance tests

### Automated

- Fashion light scope exists only on `/studios/fashion`; sibling Studio rooms retain computed dark tokens.
- White background, body text, muted text, gold text, borders, focus rings, and error text meet contrast requirements.
- Exactly one working Frassy conversation renders in Fashion Studio; root beacon and parent duplicate are absent there.
- The Fashionista approved asset is the assistant presentation; other rooms retain their own approved looks.
- Fashion context reaches the existing `/api/chat` pipeline as sanitized data, never as authorization or an instruction.
- Product and variant UUIDs survive Vendor Brands → sign-in/identity check → Fashion Studio.
- Missing/partial/invalid UUID pairs fail visibly; no product data is shown.
- Wrong owner, wrong variant, rejected, reviewed/locked, or published product is rejected server-side.
- The three unconnected shortcuts never claim product context or working integration.
- P1/P2a/P2-0 regression suite remains green: 5 supplier photos, 6 variants, naming, classification, edit locks, provenance, history, and no data mutation.
- R2, if later approved: actor/owner/Founder permissions, immutable source records, atomic brief creation, explicit approval, audit visibility, and no generation/publishing side effects.

### Founder browser verification after R1

1. Open Soft Life Chiffon Top in Vendor Brands, choose Sky Blue and size M, and prepare the verified handoff.
2. Open Fashion Studio and confirm the URL retains both IDs and the room shows the saved name, full category, Sky Blue / M, SKU, variant ID, and authentic supplier variant photo.
3. Reload and use Back/Forward; product context must remain.
4. Confirm one recognizable Fashionista Frassy works by text and approved voice controls and knows only the verified product facts shown in the room.
5. Confirm the room is luminous white and gold on desktop and phone, with no dark beige duplicate and no overlap.
6. Open another Studio room and confirm it remains dark and unchanged.
7. Confirm Specs, Mockups, Samples, Capsules, Try-on, and generation remain honestly labelled unavailable.

## What this means in plain English

The blouse is safely stored. The room currently has three disconnected problems: it borrows the dark walls from the larger Studios area, it displays one Frassy while a different-looking box does the real talking, and only one specific button carries the blouse into the room. R1 reconnects those pieces without making or publishing anything. R2 would later give the blouse one real, saved creative job: attach an existing Frass slogan/logo and send that brief for your approval.

## Approval boundary

Stop here. No recovery work starts until the Founder approves **R1**. R2 remains separately blocked even if R1 is approved.

**Implementation:** ⏳ Read-only audit only  
**Type Check:** ⏳ Not run; no implementation  
**Build:** ⏳ Not run; no implementation  
**Preview:** ⚠️ Code and database inspected; authenticated browser journey not reproduced  
**Production:** ✅ Unchanged  
**Constitution Updated:** ⏳ Not updated  
**Project Memory Updated:** ⏳ Not updated  
**Requires Founder Testing:** ⚠️ Required only after an approved R1 build
