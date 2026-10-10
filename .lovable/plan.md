# Fashion Creator Workspace: Reconciliation Audit (read-only)

Nothing was changed, connected, generated, charged or published. The CJ pilot (Soft Life Chiffon) and the secure product handoff (P2-0) are frozen.

## 1. What already exists (checked in code and data)

| System | Route | Status | Data it owns | Reusable for fashion? |
|---|---|---|---|---|
| Merchandise Studio | `/workspace/merch` | REAL review layer, no publishing | `slogans` (257), `logo_treatments` (0), `merch_proposals` (0), `merch_blanks` (0), `pod_providers` (3), with role checks on the server | Yes: slogans, logo placement, proposal approval |
| POD providers | inside Merch Studio | LISTED ONLY. Printful, Printify and Gelato appear as "available", with no live connection or API calls | `pod_providers` | Yes, as adapter slots |
| Tapstitch | none | NOT BUILT. It appears nowhere in code or data | none | Would be one optional adapter |
| CJ Dropshipping | `/admin/cj-import`, `/workspace/vendors` | REAL, read-only. Old queue holds 20 general items; the pilot has 1 private draft | `cj_import_queue`, canonical product tables | Yes: supplier adapter (pattern proven) |
| Shopify | storefront and checkout | REAL for the live shop. Nothing writes drafts to it | external | Publication channel only, later |
| Canonical products | `/workspace/vendors` | REAL: owner-only drafts, locked supplier records, change history, P2-0 handoff | `canonical_products`, media, variants, offers, sources | Yes: the master product record |
| FV Studios (member) | `/studio` | REAL. Projects, AI credit wallet and ledger, studio operations | `studio_projects` (1), credit tables | Yes: charge-before-work credit rule |
| Founder production studio | `/studios/*` | REAL engines (briefs, scenes, characters, assets, animations, review queue, providers), organised around shows and episodes | `studio_*` tables (2 assets) | Yes: asset library, review queue, characters, provider slots |
| Studio Review Queue | `/studios/review` | REAL. Nothing publishes just because it was generated | `studio_reviews` | Yes: approval history |
| Visual Review | `/visual-review` | REAL Founder page (server-checked) | `visual_uploads` (0) | Partly |
| Founder Review Center / approvals | `/admin/approvals`, Control Room | REAL | `release_approvals` (0), `founder_audit_ledger` | Yes: final sign-off |
| Creative / Frass Card | `/workspace/card`, `/card/$handle` | REAL: member card, profile, analytics | `business_cards` | Brand identity for designers |
| Business Vaults | `/vaults/*`, `/business-vaults` | REAL. The Seamstress Vault is the engine behind Afro Designers ("one catalog, one inventory") | `vaults`, `vault_*`, `future_business_vaults` | Yes: designer business home |
| Money Moves | `/money-moves` | REAL income planner | work items, launch state | Yes: links products to income |
| Margins | `product_economics` table | TABLE ONLY. Exists with 0 rows; no screen fills it | `product_economics` | Yes: cost, fees and 10% platform share later |
| Lookbook | `/lookbook/*` | Public display only, no builder | `lookbook_story_images` | Display layer |
| Capsules | `/capsules`, `/admin/capsules` | REAL. Items must be old shop products (1 capsule exists) | `capsules`, `capsule_items` | Needs the draft link (P2-1) |
| Try-on | `/try-on` | REAL shopper engine, paid AI image per try | `tryon_looks` (0) | Needs a Founder wrapper (P2-2) |
| Afro Designers | `/afro-designers/*`, `/join` | REAL public showcase plus sign-up | designer data | Public face for designers |
| Fashionista Frassy | none | NOT BUILT. No "fashionista" anywhere; no denim-blue couture look stored in code | none | Must be provided as an approved reference image |

## 2. Gaps and conflicts found
- Designs, artwork and garment specifications have no home of their own. Slogans and logos live in Merch, products in the vendor tables, and assets in Studios.
- Supplier and printer adapters are listed but none is connected. Tapstitch doesn't exist.
- Margins have a table but no way to fill it.
- Naming conflict: project memory says the old name "Frassy Studio" is retired, but the private `/studios` area still calls itself "Frassy Studios". This needs your ruling before any new room is named.
- Designers have no workspace with brand isolation. Product drafts are owner-only, but Merch and Studios are Founder/staff-only.

## 3. Recommendation: one private Fashion Studio at `/studios/fashion`
One room, run by Fashionista Frassy, with sections chosen by role. It reuses what exists rather than building new engines.

```text
Fashion Studio (private)
 ├─ Designs & Artwork  -> Merch slogans/logos + Studio assets (FRASS-owned)
 ├─ Garment Specs      -> new spec record linked to canonical product
 ├─ Mockups            -> Studio assets, labelled "MOCKUP - not a sample"
 ├─ Samples            -> real physical samples, logged separately
 ├─ Products           -> canonical products + P2-0 handoff (CJ pilot intact)
 ├─ Looks/Capsules/Try-on -> P2-1 / P2-2 (later)
 ├─ Approvals          -> Studio Review Queue + Founder audit ledger
 └─ Makers & Fulfilment -> adapter slots: CJ, Printful, Printify, Gelato,
                           Tapstitch (optional), local makers, Seamstress Vault
```

- **Ownership:** Frass keeps the master copy of every design, artwork file, spec, mockup and approval. Providers only receive copies to produce.
- **Who sees what:** the Founder and admins see everything. Each designer, brand or stylist sees only their own brand. This uses the same owner check the vendor tables already use.
- **Portability limits:** a design file and spec can move between providers. Provider-specific items cannot: blank catalogue IDs, print-area templates, colour profiles, provider mockups, prices and delivery times. Each adapter keeps those fields separately and they must be re-checked when switching.
- **Mockups vs samples:** a mockup is a picture; a sample is a physical item someone received and checked. Only a logged sample can mark a design "production-verified".
- **Nothing automatic:** no AI images, no provider orders, no costs, no Shopify and no publishing without an explicit Founder click and its own approval step.
- **Fashionista Frassy:** her approved denim-blue couture look is a design requirement, kept as her studio room look. Same core Frassy, with stylist as a role. Nothing is generated now; the approved image must be supplied or chosen from your existing files.

## 4. Phases (each needs your separate approval)

| Phase | What | Credits (approx.) |
|---|---|---|
| F0 | Your decisions below and the naming ruling | 0 |
| F1 | Private Fashion Studio shell: role-based sections, Fashionista Frassy greeting using the approved image, P2-0 handoff shown read-only, all other sections "Not connected yet" | 2-4 |
| F2 | Design & spec record (Frass-owned), reusing Merch slogans/logos; brand isolation | 4-6 |
| F3 | Mockup vs sample tracking and approval history through the Review Queue | 3-5 |
| F4 | Margin calculator filling `product_economics` (cost, shipping, duties, fees, refunds, affiliate, 10% platform share); no live prices | 3-5 |
| F5 | Provider adapter contract, plus ONE read-only adapter of your choice (no orders) | 4-8 |
| F6 | Capsules, try-on and image/video tabs (P2-1, P2-2, P2-3) | 10-16 |
| F7 | Designer and stylist onboarding (own brand, own uploads) | 6-10 |

Suggested order to save credits: F0 → F1 → F2 → F4 → F3 → F5 → F6 → F7.

## 5. Founder decisions
1. Name: keep "Frassy Studios" for `/studios`, or rename it under "FV Studios" (memory says "Frassy Studio" is retired)?
2. Fashionista Frassy image: which existing approved file is the denim-blue couture look? None is stored in code today.
3. Who joins first after admins: designers, stylists or brands?
4. Which provider gets the first read-only adapter: CJ (already proven), Printful, Printify, Gelato, or Tapstitch?
5. Should physical samples be required before any made-to-order design can be published?

## Technical details
- Evidence: `src/routes/_authenticated/workspace.merch.tsx` (724 lines, `merch.functions.ts` with server role checks); `pod_providers` rows Printful/Printify/Gelato "available"; no "tapstitch" match in `src`; `product_economics` and `release_approvals` hold 0 rows; `src/routes/_authenticated/studios.tsx` uses `requireFounderRoute` and an admin gate; `/studio` uses credit wallet and ledger functions; `src/lib/frassy/room-looks.ts` holds only the approved seated FV Studios look; `wardrobe.ts` rooms are hall, daily, workshop, freedom and celebration.
- Likely F1 files: new `src/routes/_authenticated/studios.fashion.tsx`; `src/lib/studios/studios.ts` (menu); `src/lib/frassy/room-looks.ts` (add a fashion room look once the image is approved); reuse `getProductHandoff`.
- Rollback for each phase: its own route or section and additive tables only; existing shopper, Merch, CJ and Studios flows stay as they are.
