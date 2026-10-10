# P2 Integration Audit (read-only) and proposed phases

Nothing was changed. No code, data, media, credits, Shopify or deploys were touched. P1/P2a stays frozen.

## What the product looks like today
- Soft Life Chiffon: a private draft in the new product tables, with 5 CJ photos and 6 sizes. Colour is Sky Blue, S–3XL, and one real CJ photo is linked to all six.
- The colour/size picker keeps your choice only on screen. Nothing saves it, and nothing passes it on yet.

## The three tools, as they really are

| Tool | Works today? | Can it take Soft Life Chiffon? | Why not |
|---|---|---|---|
| FV Studios (`/studios/*`) | Yes, for shows and episodes. It has an Assets library (2 items) with approve and reuse switches | No | Studios starts from a story idea. Its assets are linked to shows and scenes, not to products |
| Admin Capsules (`/admin/capsules`) | Yes. 1 capsule exists. You can publish or unpublish, and upload a cover image | No | Capsule items must point at the old live-shop product list, enforced by the database. A draft can't be added |
| Try-on (`/try-on`) | Yes, but it's the shopper version | Only with retyping | It needs a customer photo plus garment images and names. It saves each attempt under the person's account (0 saved so far). Each try uses an AI image request on your workspace balance, and members' Frass credit wallets are not charged |

Today, the "Make image/video", "Send to capsules" and "Send to try-ons" buttons only open these pages. They honestly say "Not connected yet."

## Does size matter for try-on?
No. The try-on only looks at the photo and garment name. Size makes no visible difference. Colour matters, and it is the Sky Blue photo. Size would only matter later for a capsule or cart line.

## Proposed phases (each needs its own approval)

**P2-0 Shared product context (about 2–3 credits)**
- A small, read-only "product handoff" bundle: product ID, saved name, category path, chosen variant (colour, size, SKU) and the authentic photo for that variant.
- It is built on the server from saved records only, and only for the Founder or the brand's owner. Nothing in the browser is trusted.
- No database changes.

**P2-1 Capsules (about 3–5 credits)**
- Let a capsule item point at either an old shop product or a new draft and its variant. This is one small, additive database change.
- A draft in a capsule stays hidden from shoppers until the product is approved and published.
- The "Send to capsules" button opens the admin capsule builder with this product already chosen. You still click Add.

**P2-2 Admin try-on preview (about 3–5 build credits; each try is also a paid AI image request)**
- A Founder-only preview that reuses the existing try-on engine. It fills in the variant's authentic photo and name, so nothing is retyped.
- Every try needs an explicit "Generate (uses AI)" click. Nothing runs automatically.
- Results are saved privately and are visible to you only. The shopper try-on is left as it is.

**P2-3 FV Studios (about 4–6 credits)**
- "Make image/video" opens Studios with this product's handoff attached as a reference.
- Results are saved as private studio assets, tagged with the product ID and not approved.
- You choose "Attach to product". That adds a new product photo that can't come from a supplier and is marked as yours. The CJ photos are never replaced.

Total: about 12–19 build credits, plus whatever AI image requests you choose to run.

## Safety rules for every phase
- CJ name, photos, sizes, cost and source link never change. The existing database locks stay.
- Nothing publishes, charges or generates without your click. Shopify is untouched.
- Shopper pages behave exactly as they do now.

## Tests and rollback
- Tests: only the owner or Founder can build a handoff; a draft in a capsule never shows publicly; try-on can't run without the explicit click; attaching a result never changes the CJ records; the P1/P2a regression list still passes.
- Rollback: each phase sits behind its own button. The P2-1 database change only adds things and can be reversed by removing the new link column.

## Decisions for the Founder
1. Should a draft in a capsule stay hidden until the product is approved? (Recommended: yes.)
2. Should try-on results be visible to you only, or to brand owners too?
3. Should Studios results stay in Studios until you click "Attach", or attach automatically? (Recommended: stay until you click.)
4. Which phase goes first? (Recommended: P2-0, then capsules.)

## Technical details
- Likely files: `src/lib/vendors/product-handoff.functions.ts` (new), `src/components/vendors/cj-pilot-panel.tsx` (wire the 3 buttons), `src/routes/_authenticated/admin.capsules.tsx`, a new migration adding a nullable `canonical_product_id`/`canonical_variant_id` to `capsule_items` with a check that exactly one product link is set, `src/lib/tryon.functions.ts` (reuse `generateTryOn`; admin wrapper), `src/routes/_authenticated/studios.create.tsx` and `studios.assets.tsx` (reference context, product tag).
- Evidence: `capsule_items.product_id` has a foreign key to `products` (1 capsule exists). `tryon_looks` holds `user_id`, `source_photo_url` and `cart_items` jsonb (0 rows). `generateTryOn` calls `google/gemini-3.1-flash-image` through the gateway with no ledger debit. `studio_assets` holds `series_id`, `approved` and `reuse_allowed`, with usage linked to productions and scenes (2 rows).
