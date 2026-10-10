# R1 handoff defect: what I found (read-only) and the proposed fix

## Plain English first
The saved Soft Life Chiffon Top is in the database and correct: it's a private, unpublished draft with 6 Sky Blue sizes (S–3XL). The colour and size picker shows up in **two** places on Vendor Brands, and they look the same:

1. **The CJ reading screen** (the "Read it from CJ" step, before or while you name and sort the product). Here the picker has **no saved product attached**, so the "Prepare verified handoff" button never appears. Nothing can go to Fashion Studio from this screen.
2. **The saved product card** for Soft Life Chiffon Top. Only this picker shows "Prepare verified handoff" and then "Open in Fashion Studio".

So if you picked a colour on the CJ screen, Fashion Studio would correctly say "No product brought in". The R1 summary said "only the picker's verified handoff carries the product" but didn't say which picker. That gap is the main mismatch between what R1 claimed and what you see.

Analogy: two identical doors, and only one of them has a key in the lock.

## Evidence (current code, not changed)
- `src/components/vendors/cj-pilot-panel.tsx` line 166: `<SupplierVariantPicker variants={d.variants} />` has no `productId`, so the handoff controls stay hidden (picker line 67 needs `productId && selected.id`).
- Same file, line 292: the saved-card picker passes `productId={draft.id}` plus variant IDs. This is the only path that carries IDs.
- Picker line 77: the link carries only `productId` + `variantId`. `parseFashionSearch` keeps them only as a valid pair of IDs.
- Fashion route line 79 passes the two IDs to FrassyChat. `frassy-chat.tsx` line 529 sends them along with `districtPath`.
- `api/chat.ts` lines 777–823: the server re-reads the product and variant using your signed-in session, but only when the page is exactly `/studios/fashion`, the session is valid and both IDs are well-formed. **Every failure is silent** (the `catch` sets the context to empty). When that happens Frassy gets no product and nobody is told.
- `frassy-chat.tsx` line 527: the screen's own product summary also goes to Frassy as general background (`memoryContext`). That text claims "verified again on the server", but the server treats it as unchecked browser text. That's misleading wording and a second copy of the product facts.
- Database: product `a9162b4b…` has 6 variant IDs, all in the right format, so the ID format check passes.

## What is still uncertain (not tested live while signed in)
- I don't know which screen you used. The recording or your answer will settle it.
- If you did use the saved card and Frassy still didn't know the product, the most likely cause is one of the silent server failures above. Without logging I can't tell which one.
- The protected identity check blocks automated sign-in testing, so I'm not claiming any live verification.

## Proposed minimal repair (needs your approval)
1. On the CJ reading screen, replace the handoff area with a clear note: "Save this product first. The handoff to Fashion Studio is on the saved product card." This adds no new paths.
2. In the chat server check, replace silent failures with a short reason that is safe to show (signed out, not allowed, product not found or wrong variant, temporary error). Frassy then says honestly that she can't see the product. The Fashion page shows a small "Frassy sees this product: yes / no (reason)" line.
3. Stop sending the screen's product summary as background, and send only neutral room text instead. Product facts reach Frassy only through the server-checked block.
4. No changes to styling, Frassy's look, data, the database, auth rules, the CJ queue or R2.

## Acceptance tests
- The CJ reading screen picker shows no handoff button and does show the "save first" note.
- The saved-card picker shows the handoff button, and its link contains exactly the product ID and the chosen variant ID.
- Chat server: valid owner or Founder → the product block is included. Signed out, a non-owner, a published or rejected product, a variant from a different product, or bad IDs → no product block, and a reason is returned.
- The screen summary text no longer reaches Frassy as background.
- Existing tests, type check and build all pass.

## Founder check after the fix
On Vendor Brands, go to the **saved** Soft Life Chiffon Top card → pick Sky Blue / M → Prepare verified handoff → Open in Fashion Studio → ask Frassy "What product are we working on?" She should name Soft Life Chiffon Top, Sky Blue / M.
