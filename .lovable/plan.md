# Frass Try-On Preparation Studio: staged plan (no building yet)

## Plain English summary
Customers keep shopping where they shop today. There is no "Try-On Mall". On any product that's ready, and in the cart, a customer presses "Try it on". That uses one private photo of themselves, which they can replace at any time.

Behind the scenes, a Founder/admin-only **Try-On Preparation Studio** checks each fashion product once: photos, sizes and suitability. Once checked, the product gets a **Try-On Ready** tag. It stays in its own collection and is never listed twice. The tag is removed only if the product's photos or sizes really change. Soft Life Chiffon Top is the pilot.

Analogy: a fitting-room attendant checks each garment once before it goes on the shop floor. Customers never visit the back room.

## What exists today (checked in code and database)
- **Try-On page** `/try-on`, signed-in members only.
  - The engine is `generateTryOn` (`src/lib/tryon.functions.ts`). It runs only when the customer presses the button, uses Lovable AI image generation and saves results to `tryon_looks`.
  - The cart drawer links to it (`cart-drawer.tsx` line 128). Product pages have no try-on button.
- **Customer photos** live in the `customer_photos` table and the private `tryon-photos` storage. Customers can add and delete their own. **Admins can also view all customer photos and looks** (policies "Admins view all photos/looks"). That conflicts with "private photo" and is flagged below.
- **Approved image sources** for try-on: Supabase, Shopify, Unsplash and Lovable only. **CJ photo servers are not allowed**, so the pilot can't be tried on yet.
- **Size data:**
  - New supplier sizes (`canonical_product_variants`) have size label, SKU, weight and photo, but no measurements.
  - Live-shop sizes (`product_variants`) have options, price and availability, but no measurements.
- **Founder/admin checks:** `has_role` checked on the server (`checkIsAdmin`, `requireFounderRoute`). Role changes go only through `founder_set_role`.
- **R1 handoff, R2 design brief and the Step 1 map wording** all stay as they are.

## What I propose (new)
### Data model (additive only)
- `tryon_readiness` holds one record per product variant, covering both the live shop and new supplier products.
  - Status: queued, in review, ready, needs re-review, or not supported.
  - It also stores the try-on method, the approved garment photo, who approved it and when, and a short **fingerprint** of the photo and size details.
- `variant_fit_measurements` (optional) holds measurements in cm/in per size (bust, waist, hip, length, foot length) and where each figure came from: supplier, measured or unknown.
- **Automatic re-review:** if a variant's photo or size details change, the database moves it back to "needs re-review". Price or stock changes never do.
- **Who can do what:** only Founder/admin can write readiness records. Shoppers can read only "ready" tags, with no internal notes. The approval itself happens through one audited database function, written to `founder_audit_ledger`.

### Which method fits which category
| Category | Method | At first |
|---|---|---|
| Tops, dresses, bottoms, plus size, luxury | Full-body garment try-on (existing engine) | Supported |
| Bridal gowns | Full-body, with an extra Founder review | Supported after testing |
| Shoes / Kicks | Feet-and-legs photo method | Later; needs separate testing |
| Shapewear / swim / intimates | Careful-content policy needed first | Paused |
| Wigs / hair | Head-and-shoulders method | Later |
| Kids | Not supported (child photo safety) | Excluded |

### Safeguards against false fit claims
- Results are labelled **"Style preview, not a fit guarantee"**. No "perfect fit" or "your size" claims unless real measurements exist, and even then they're shown as guidance.
- Frassy and the page copy must never claim exact fit. A test enforces that wording.
- Nothing is generated until the customer presses "Try it on". Each press shows that it uses AI.
- Customers can replace or delete their photo at any time. Photos are never used for anything else.

## Stages (each needs your separate approval)
1. **Privacy first.** Remove admins' ability to view customer photos and looks, or limit it to a logged support request. Your decision. No new features in this stage.
2. **Readiness records and the Preparation Studio** (Founder/admin only, inside the existing Studios area):
   - the queue fills automatically from fashion products;
   - review of photo, sizes and method;
   - an audited "Mark Try-On Ready" step.

   No generation. Pilot: Soft Life Chiffon Top.
3. **Pilot test try-on (Founder only).**
   - Allow CJ photo servers, for approved ready photos only.
   - Run one Founder-pressed test with your own photo, using the existing engine. It costs AI usage per press.
   - You approve the result before the Ready tag is shown to anyone.
4. **Customer launch points.**
   - A "Try it on" button on product pages, and per item in the cart, shown only when the item is Ready.
   - One saved try-on photo, with Replace and Delete.
   - Ready items stay in their collections; no new shop page.

   This can only go live for items that are published to the shop, and the pilot draft isn't published.
5. **Measurements and more categories** (shoes, bridal, wigs), each tested and approved separately.

## Costs
- Stages 1–2: none beyond building.
- Stage 3 onward: one Lovable AI image request per press. Each one is shown, never automatic, and nothing runs in bulk.

## Testing per stage
- Database tests:
  - only Founder/admin can mark items Ready;
  - shoppers can read only "ready" tags, with no internal notes;
  - a photo or size change resets the tag;
  - a price change doesn't.
- Images are refused unless they are approved ready photos from allowed sources.
- Wording check: no fit-guarantee claims.
- A walkthrough by you on desktop and phone.

## Open decisions for you
1. Should admins keep any access to customer try-on photos (for example support only, logged), or none?
2. Is full-body clothing the only method for the pilot? (Recommended.)
3. Keep the name "Frass Try-On Preparation Studio"?

## Verified vs not
- **Checked:** storage is private; who can see customer photos; which size details exist; the cart link; that CJ photo servers are refused; the role checks.
- **Not tested:** any live try-on, result quality, the CJ photo server setup, cost per use.
