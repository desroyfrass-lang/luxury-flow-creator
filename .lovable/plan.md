# Shopify reconnected — resume the CJ one-product pilot

## Plain English first
Your Shopify store (3hekgw-kr.myshopify.com) is connected to Lovable again — the expired temporary pass is replaced and new access is stored securely. The blocker that stopped the CJ import is gone. What's next: verify the connection with a harmless read, confirm the pilot product's details, then create ONE unpublished draft from the real CJ My Products record using the existing agreed pricing logic.

## Current state (verified earlier, to re-confirm)
- CJ pilot product: CJQB2922537 — Soft Life Chiffon Top, already saved privately as an unpublished draft in /workspace/vendors. CJ cost $6.97, lowest US shipping $7.35 → landed cost $14.32.
- Pricing floor logic exists: src/lib/commerce/pricing-floor.ts (minimum guardrail only, not a final price).
- Conflicting platform-allocation values: database setting says 8%, project memory says 10%. Must be settled before any price is written.

## Step 1 — Harmless read-only verification (no writes)
- Read 1 product through the app's existing Shopify admin path to confirm authorization works.
- Confirm the pilot CJQB2922537 record in CJ My Products and its variants/images are reachable.
- Re-read the saved pricing allocation value and the target collection; if the 8%/10% conflict or the collection is still unresolved, STOP and report — no product is created.

## Step 2 — One unpublished Shopify draft (only if Step 1 fully passes)
- Use the real CJ My Products record: accurate variants, images, stable CJ supplier references, canonical link to the saved draft.
- Apply the existing pricing engine's floor/guardrails; no invented prices.
- Save the per-product editable Frassy hashtag list with the product.
- Verify by reading the draft back from Shopify: product, variants, images, collection match.
- Only after a successful readback, mark the corresponding INTERNAL queue record imported. Never touch CJ's own My Products list.

## Hard rules (unchanged)
- Never publish the draft, never bulk import the other 494 products, never delete or clear CJ My Products, never deploy to production, no AI image generation.
- Try-On work stays paused.
- If any dependency fails verification, STOP and report instead of inventing data.

## Founder decisions still needed before Step 2
1. Platform allocation: 8% (database) or 10% (memory)?
2. Target Shopify collection for the pilot product.
