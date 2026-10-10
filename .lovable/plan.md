# Read-only integration audit: Fashion Studio as one creative desk

Nothing was changed. Every finding comes from the current code and read-only database queries. I did no live, signed-in testing, so anything not marked "verified" is unproven.

## Plain-English summary
- **Image and video making in FV Studios is not connected.** The image and video engine slots exist but are switched off ("not configured"). There is nothing to reuse yet. Turning one on means choosing a provider and accepting its costs.
- **Virtual try-on exists in one real place**, the member Try-On page (`/try-on`). It uses Lovable AI, charges against AI usage, and only takes shop-cart items with photos from approved image sources. **CJ photos are not on that approved list**, so the Soft Life Chiffon Top cannot be tried on today.
- **Frass Shape is not a try-on engine.** It is the shapewear department. Its "Fit Assistant" is a text card telling people to ask Frassy.
- **Frassy sends try-on to Frass Shape because of her written map, not a technical rule.** Her platform map describes Frass Shape as having an "AI Fit Assistant" and doesn't list the real Try-On page at all, so she guesses.
- **Capsules and lookbooks** are a public storefront for live-shop products: 1 capsule, 0 items. They cannot hold the new draft products.
- **Frassy sees product text, not photos.** In Fashion Studio she receives server-checked words only. She can look at images only when you attach one in the chat yourself.

Analogy: the Fashion Studio desk is built and the product arrives on it, but the camera, the fitting mirror and the capsule rail are in other rooms. Two of them can't accept this kind of product yet, and the camera has no power.

## Findings with evidence
| Area | Status | Evidence |
|---|---|---|
| FV Studios image generation | Not connected (slot only) | `studio_providers`: `image_provider_slot` and `video_provider_slot` are `not_configured` and disabled. `native-engines.ts` line 139 reports "NOT INSTALLED". |
| FV Studios text and Motion Rig animation | Working engines (shown by records, not tested here) | `lovable_text`, `frass_motion_rig_v1`: available and enabled |
| Virtual try-on | Real, member-scoped, AI-charged | `src/lib/tryon.functions.ts`: `generateTryOn` requires sign-in, takes up to 4 items, sends them to Lovable AI image generation and writes to `tryon_looks` (0 rows). Used only by `routes/_authenticated/try-on.tsx`. |
| Try-on photo sources | Blocks CJ | Approved image sources (lines 22–31): Supabase, Shopify, Unsplash and Lovable only. The saved product's photos are on `cf.cjdropshipping.com` / `oss-cf.cjdropshipping.com`, so they would be refused. |
| Frass Shape | Department, no engine | `routes/frass-shape.$gender.index.tsx` lines 138–148 show a static "Fit Assistant" card |
| Capsules and lookbooks | Storefront for live-shop products only | `src/lib/capsules.ts` links to live-shop products. The database has 1 capsule and 0 items. Public routes `/capsules`, `/lookbook`. |
| Fashion Studio | Working (from code; not tested signed in) | Server-verified handoff, design brief (R2) and the shared Frassy, as built and tested in code |
| Frassy try-on routing | Prompt/knowledge cause | `platform-atlas.ts` line 53: Frass Shape described as having an "AI Fit Assistant"; no `/try-on` entry. FV Studios is listed as `/studio` with "AI video", which overstates it. |
| Frassy and photos | Text only | The handoff block in `api/chat.ts` (lines ~806–823) passes name, size, SKU and status. The photo link is fetched but never shown to her. Images reach her only as chat attachments (lines 1264–1272). |

## Smallest reuse-first plan (each step needs separate approval)
1. **Correct Frassy's map (copy only, no cost).**
   - Add the real Try-On page.
   - Describe Frass Shape as the shapewear department.
   - Describe FV Studios' image and video as "not connected yet".
   - Fashion Studio becomes the place for Founder creative work.
2. **Let Frassy see the verified variant photo (small AI cost per message).** After the server check, attach that single CJ photo to her message. The server fetches it, only from the CJ image servers, with the same size and type checks try-on already uses.
3. **Founder try-on from Fashion Studio (reuse `generateTryOn`; AI cost per try-on).**
   - Allow the two CJ image servers for verified saved drafts only.
   - Add a "Try on" button in Fashion Studio that passes the verified variant photo and one of your own saved photos to the existing engine. Results stay private.
   - Needs your decision on cost and on which photos may be used.
4. **Capsules and lookbooks:** a private "Fashion capsule" list attached to briefs, separate from public capsules. Public capsules stay unchanged until drafts are linked to the live shop.
5. **Model photography and video:** blocked until a provider is chosen for the image or video slot. That's an outside service, its cost and its terms. It's a separate Founder decision.

## Security, permissions and cost
- Adding CJ image servers must be limited to verified, saved draft photos so the server can't be tricked into fetching other addresses.
- Try-on and image viewing spend Lovable AI usage. Each button needs a clear cost label, and nothing should run automatically.
- Personal photos for try-on stay owner-only, as they are today.
- Public capsules must never show unpublished drafts.

## Verified vs untested
- **Verified from code and database:** engine slot status, try-on's approved image sources, CJ photo hosts, capsule counts, Frassy's map wording, and that the handoff sends text only.
- **Untested:** any live try-on run, image quality, live Fashion Studio behaviour while signed in, and actual AI cost per use.

## Awaiting approval
I'll make no changes until you approve one specific step above.
