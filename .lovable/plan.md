# Universal Vendor and Product Readiness: Revised Architecture Plan (read-only, v2)

Nothing has been changed: no code, database, settings, products or integrations. This version adds the Founder's 10 corrections. Every claim below is labelled **Verified** (checked in the code or the live database on 9 Oct 2026) or **Unverified**.

## 1. What works today vs what is unverified

| Area | Status | Evidence |
|---|---|---|
| CJ review queue | **Verified, partly working.** There are 20 rows and every one is still `pending`. No code ever sets `imported`. The queue pulls CJ's general catalog search (`/product/list`), not the Founder's own "My Products / Added Products" list. | `src/lib/cj.functions.ts`, `/admin/cj-import`, `cj_import_queue`, policy "Admins manage CJ queue" |
| Shopify | **Verified: read only.** The shop reads products from Shopify. Collections are found by Shopify vendor and tag searches in a fixed list (`STATIC_MAP`). Frassy can look up an order status (Admin API read). No code creates products in Shopify. | `src/lib/shopify.ts`, `src/lib/frassy-tools.server.ts` |
| Shop categories (taxonomy) | **Verified: spread across several files, with no single registry.** `drip-catalog.ts` (Drip, Kicks, Bare), `frass-plus.ts` (Plus+), `shape-catalog.ts`, `frass-kids.ts` / `kids/`, `shopify.ts` STATIC_MAP (collection searches, including `new-arrivals` and `best-sellers`). Luxury House, Marketplace general goods, Social Media Virals and Founder Picks are not in one shared list. | listed files |
| Profit and pricing calculator | **Verified: exists but unused.** The `product_economics` table has 0 rows. Its columns cover cost of goods, packaging, shipping, other costs, payment fee, marketplace fee, tax, discount, target margin, affiliate settings and commission. There are no columns for duties, refund reserve or vendor offers. Owners manage their own rows; admins can read them. | `product_economics`, `src/lib/affiliate.functions.ts` |
| Platform allocation | **Verified (separate logic):** the database function `expected_platform_allocation(_gross)`. | database function list |
| Roles | **Verified:** the live `user_roles` table contains only `admin` and `tester` (the Founder holds admin). The database also defines other roles (super_admin, staff, partner, designer and more) that nobody holds yet. Role checks run on the server through `has_role`. | live query |
| Approval records | **Verified: they exist and are empty.** `release_approvals` has 0 rows (Founder insert and read only). `founder_audit_ledger` has 0 rows (`src/lib/founder/audit-ledger*.ts`). | live query |
| Partner vendor access | **Verified:** the admin gives or removes a partner's access to vendors. This is about access only. It does not verify the vendor or approve products. | `partner-vendors.functions.ts`, `partner_vendors` |
| POD, merch, member products, card storefront, custom orders, manufacturing, IP, private vaults | **Verified to exist** in the files named in v1. Their end-to-end order flow has not been tested. | as in v1 |
| Product image and video generation | **Unverified for products.** Only try-on (`tryon.functions.ts`) shows image AI use. No product image or video generator is proven to be connected, so the plan assumes none is. | search |
| Deposits for custom work | **Unverified.** `payment_requests` exists, but there is no proof of a conditional deposit flow. | table list |

## 2. Source of truth and Shopify (correction 10)

```text
Source records (unchanged)          FRASS canonical product (new, one per real product)        Shopify (publication only)
 cj_import_queue  ─┐                  product + variants + taxonomy placement + overlays           created/updated ONLY after
 artisan intake   ─┼─> adapters ──>   vendor_offers[] (vendor, SKU, cost, stock, fulfillment) ──>  Founder approval; stores
 merch_proposals  ─┘                  status: draft → prepared → founder_review → approved           shopify_product_id back;
                                       → published  (separate from source & vendor status)           storefront keeps reading Shopify
```

- **FRASS is the source of truth** for product identity, vendor offers, cost and approval. **Shopify is the place products are published** and the checkout. The storefront keeps reading from Shopify, so the shop pages don't change.
- **Three separate statuses (correction 1):**
  - Source status stays in the source table.
  - Draft status lives on the canonical product.
  - Published status means Shopify has confirmed the product.
  - CJ's `imported` is set **only** after Shopify confirms the product was created, never when a draft is made.

## 3. Minimal changes

1. **Canonical product plus vendor offers (correction 2).** One product can have many offers. Each offer has its own vendor, SKU, cost, stock, lead time and fulfillment mode (dropship, POD, stocked, made-to-order, made-to-measure). A uniqueness check on the source reference and duplicate detection prevent a second listing for the same product.
2. **Vendor verification separate from product approval (correction 3).** Vendor status goes pending → verified → suspended. A product from an unverified vendor cannot reach Founder review. Vendors read and write only their own offers and drafts. Admin reads. Only the Founder (checked through `has_role(auth.uid(),'admin')`) approves. **No new roles are proposed.** Existing roles are reused.
3. **One taxonomy registry (correction 4).** Create a single read-only registry that **imports** the existing catalog files rather than rewriting them. Primary stores: FRASS Marketplace (general goods), Frass Kicks, Frass Drip, Bare Drip, Kids fashion, Plus+, Luxury House. Overlays that are never primary stores: Social Media Virals, Founder Picks, New Arrivals (Best Sellers too). Luxury House and Marketplace are currently missing from the code lists. **The Founder confirms their categories** before they are added.
4. **Artisan offers (correction 5).** The offer gains these fields: mode (made-to-order, made-to-measure, customizable), custom options, a measurements form, production capacity per week, a lead-time range, an IP permission level (existing `rights/protection.ts`) and a deposit rule. Deposits stay **off** until a separate payments phase is approved.
5. **Pricing (correction 8).** Extend `product_economics` instead of building a new calculator. Add duties, a refund or return reserve, and a link to the offer. A product cannot reach Founder review until its margin is calculated. The affiliate option appears only if the margin is still healthy after commission. The 10% platform allocation stays in its existing separate function.
6. **Media accuracy (correction 9).** Only supplier or artisan photos go in. Any edited or AI image is labelled and needs Founder review. Frassy flags images that don't match the description. No generator is used until one is proven in a separate step.

## 4. Approval gates

- **G1 Vendor verified (Founder).** Then **G2 Product approved (Founder),** recorded in `founder_audit_ledger`. Then **G3 Shopify publish (Founder, one product at a time).** Each gate is enforced on the server and by database row rules. Every gate is separate.
- **Hard stops, each needing separate approval:**
  - A Shopify write credential.
  - A CJ "My Products" connection, if the current CJ login can't read it.
  - Deposits or payouts.
  - Any bulk import.
  - Any image or video generation.
- **Public views** show display details only. No costs, vendor IDs, artisan contacts or notes (FRASS-0536).

## 5. Phases (each stops for Founder review)

| Phase | Scope | Depends on | Estimated credits |
|---|---|---|---|
| 0 | Read-only checks: can the current CJ login read the Founder's Added Products list; full taxonomy inventory for the Founder to confirm (including Luxury House and Marketplace) | none | about 3–6 |
| A | Canonical product, vendor offers, vendor verification status, statuses, row rules, tests | 0 | about 15–25 |
| B | Taxonomy registry (importing existing files) and overlays | 0 plus Founder confirmation | about 6–10 |
| C | CJ adapter for **Added Products only** (draft only, never `imported`), duplicate check | A, B | about 8–12 |
| D | Artisan intake on a phone in their private vault: made-to-order, made-to-measure, capacity, lead time, IP; deposits off | A, B | about 15–25 |
| E | Pricing extension and margin gate; Frassy preparation and media checks; Founder review using the audit ledger | A | about 12–20 |
| F | Publish one approved product to Shopify, save the Shopify ID, then mark the source `imported` | E plus a credential | about 10–15 |
| G (later) | Order routing across several vendors, deposits, payouts | F plus separate approval | about 25–40 |

These estimates allow for verification and fix rounds. Fresh issues can push them higher.

## 6. First test (after Phases 0–E, nothing published)

- **CJ product.** One product the Founder names from his **CJ Added Products** list, checked by its CJ ID, not from the general queue.
  - Pass if: one draft with one offer; source status unchanged (not `imported`); placed in the correct primary store with any overlays kept separate; full pricing breakdown with the margin; costs hidden from a signed-out view and from a tester account; waits at G2.
- **Private artisan.** A test artisan account, or a real one the Founder names, verified at G1 first.
  - On a 390x844 phone screen: photos, a made-to-order offer with a 14–21 day lead time, capacity of 3 a week, one custom option and an IP level.
  - Pass if: another vendor or tester cannot read it; it is blocked from review until the vendor is verified; Frassy flags missing details without inventing any; deposit shows as off.
- **Both tests:** desktop and phone screenshots, entries in the audit ledger, no Shopify calls, no generated media.

## Technical notes

- Existing tables are not changed except for the additions to `product_economics` (Phase E). Source tables link to the canonical product through `source_type` and `source_ref`, with a unique index.
- The vendor-scoped row rule uses `vendor_owner = auth.uid()`. An update trigger stops anyone except the Founder from setting `approved` or `published`.
- The `roadmap.md` entry for this request is added when the build starts, because plan mode allows editing only the plan file.

## 7. Amendment: Shoppable looks across several vendors and split delivery (required)

### What exists today (checked 9 Oct 2026)

| Area | Status |
|---|---|
| Capsules | **Verified.** Each capsule item already points to a Shopify `product_id` and `variant_id`, with a slot and a required flag. There are 0 capsules in the database. It does not point to a vendor or a vendor offer. |
| Lookbook | **Verified: a fixed list of stories in code** (`src/lib/lookbook.ts`). Nothing in it links to products. |
| Try-On | **Verified.** `generateTryOn` saves a try-on look and keeps `cart_items` on it. Whether the AI keeps product images accurate is **unverified** (see section 3, item 6). |
| Cart and checkout | **Verified.** One cart (`cart-store.ts`) and one Shopify checkout (`/checkout`, through Shopify's cart). FRASS `orders` and `order_items` have 0 rows. Order items have no vendor, offer or fulfillment group. |
| Splitting an order by vendor, tracking per vendor, delivery estimates, holding stock, vendor payouts | **Unverified or missing.** Shopify can ship parts of one order separately, but this app has never used that, so it is untested. |

### Rules

- **Looks point to products, never copies.** Every item in a look (capsule, lookbook, try-on or haul) points to a canonical product, its variant and the vendor offer. No inventory is duplicated. If an item becomes unavailable, Frassy suggests a replacement and the shopper must agree before it goes in the cart.
- **One checkout, many vendors.** A shopper can buy the whole look or pick single pieces, each with its own size and variant. Each cart line keeps its product, offer, vendor, IP licence and affiliate link.
- **Delivery estimate per item, shown before payment:**
  - Each item shows a delivery window, where it ships from (when appropriate), the shipping charge, and a clear note: "Pieces may arrive separately."
  - The window comes only from verified facts: the vendor's production lead time, stock, shipping service, destination and order cutoff time.
  - If any of those facts is missing, the item shows **"Estimate unavailable"**. Nothing is invented.
  - The estimate is recalculated at checkout. A single shipment is never implied.
- **After purchase:**
  - One customer order, linked to one fulfillment group per vendor (a sub-order for each seller).
  - Each group has its own status, tracking, and return and cancellation rules.
  - Made-to-order groups show their production stage.
  - The customer sees one order page with separate tracking for each group.
- **Money:**
  - Stock is held per offer during checkout and released if payment fails.
  - Commission is paid once per line item, and the affiliate is credited once per line, never twice.
  - Discounts and bundles that span vendors are shared across lines by a set rule the Founder approves.
  - Vendor payouts are based only on verified paid orders, never on the cart or on what a seller declares.
  - The 10% platform allocation stays separate.
- **Vendor consent:** an item can join a styled look only if its vendor has a verified licence or consent for that use of its images and the product itself is approved (G1 and G2). The look must show the item accurately.

### Prototype vs real fulfillment

- **Prototype (Phase H):**
  - Looks point to canonical items, and each cart line keeps who made it.
  - Delivery estimates are calculated and shown, or show "Estimate unavailable".
  - Fulfillment groups are created only from **test orders**.
  - No real shipping, holds on live stock, or payouts.
- **Real fulfillment (Phase I, separate Founder approval):**
  - Shopify write access and real fulfillment groups.
  - Delivery-rate and cutoff settings for each vendor.
  - Returns, cancellations and payouts.
  - Requires Phase F and Phase G.

### Added phases

| Phase | Scope | Depends on | Estimated credits |
|---|---|---|---|
| H0 | Read-only check of what Shopify can do in practice: splitting orders by location, shipping parts separately, delivery-rate settings; how Capsules and Try-On would link to canonical items | A | about 3–6 |
| H | Prototype: looks point to canonical items; each cart line keeps vendor and offer; delivery estimate service (shows "unavailable" if facts are missing); test-only fulfillment groups; replacing an item needs consent | A–E, H0 | about 25–40 |
| I | Real split fulfillment, holding stock, returns and cancellations, payout and commission records | F, G, H plus approval | about 35–60 |

### Acceptance tests (prototype, test orders only)

1. **One look with 4 vendors:**
   - Items: CJ sneakers (dropship), private-artisan bag (made-to-order, 14–21 days), Afro designer dress (stocked), FRASS Drip accessory (POD).
   - Before payment, each item shows its own delivery window, origin and shipping charge, plus the note that pieces may arrive separately.
   - Remove one fact (for example the artisan's shipping service). That item shows "Estimate unavailable".
2. **Buy the full look:** creates one customer order and 4 linked fulfillment groups, each with its own status and tracking field. Each line credits the vendor and affiliate once. A discount on the whole look splits across the lines exactly as the rule says.
3. **Buy only 2 pieces:** creates only 2 groups, and only those offers have stock held.
4. **Mark the artisan item unavailable:** the look shows a replacement suggestion, and the cart stays unchanged until the shopper agrees.
5. **Item from a vendor without image consent, or an unapproved product:** it cannot be added to the look.
6. **Privacy:** a tester or vendor account sees only its own group. No other vendor's costs or contacts are visible.
7. **No real effects:** no Shopify write call, no payout record and no shipment anywhere in the prototype.
