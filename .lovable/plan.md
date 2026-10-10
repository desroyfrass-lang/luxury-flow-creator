# Three failures after the R1 correction: diagnosis and proposed restoration

## Plain English summary
- **Creative cards went quiet on purpose, but with no replacement.** Before R1, "Make image / video", "Send to capsules" and "Send to try-ons" each opened Fashion Studio (an earlier build sent them to Studio Create, Capsules and Fitting Room). R1 removed those links because they arrived with no product. Nothing was put in their place, so they now look like dead picture cards.
- **"Save" only appears after an edit, by design, and that's confusing.** The blouse is already saved. The edit form's Save button stays off until something changes, so the only way to see a working Save is to change the name.
- **The working handoff is hidden.** The real "Prepare verified handoff → Open in Fashion Studio" controls do exist on the saved card. They only appear after you tap a colour, and then they sit below a large photo preview, under the photos. That's out of view in your recording. Right after a fresh save they don't appear at all until the page reloads.

Analogy: the door to Fashion Studio exists, but it's behind a curtain you have to pull first, and the three signs that used to point at it were taken down.

## Evidence (current code)
1. **Creative cards.** `src/components/vendors/cj-pilot-panel.tsx` lines 266–283 define the three steps with only a title and a blocker. There is no link anymore. History:
   - Commit `b614170d` had all three set to `/studios/fashion`.
   - Before that they went to `/studios/create`, `/admin/capsules` and `/try-on`.
   - R1 removed the links, per the approved instruction to "repair misleading context-free shortcuts".

   The exact wording you used ("Create in Fashion Studio", "Create a Lookbook", "Create a Try-On Haul") does not exist anywhere in the current or past code. Those labels may be text inside a picture, or a paraphrase. **Uncertain until you confirm which cards you mean.**

   Generation (images, lookbooks, hauls) has never been connected for this product. Only navigation existed.
2. **Save after edit.** In `PilotSaved`, the edit form has `unchanged = name === saved title && category === saved category`, and its checklist includes "change the name or category". That keeps Save off on an untouched record. The record itself is persisted (database: `Soft Life Chiffon Top`, private draft, 6 sizes). The first-save button ("Create one private draft") is hidden once a draft exists, which is correct, because the database's duplicate guard would block a second copy anyway.
3. **Handoff.**
   - The saved-card picker (line 292) receives the product ID and all 6 size IDs, loaded with the product (`products.functions.ts` line 61). So the IDs are present.
   - The handoff box is drawn only after a colour is picked (`supplier-variant-picker.tsx` lines 51 and 67). It sits below a full-width square preview.
   - Just-created path: line 138 builds the saved draft without its sizes, so the picker renders nothing until the page reloads.
   - The CJ reading-screen picker (line 166) intentionally carries no handoff (R1 correction).

   Not verified live while signed in: the identity check blocks automated sign-in.

## Proposed minimal restoration (needs your approval)
1. **Creative cards become real buttons again**, each opening Fashion Studio:
   - With the chosen colour and size, once a verified handoff is prepared on the card: button reads "Open in Fashion Studio with Sky Blue / M".
   - Without it: button reads "Choose a colour and size first". It jumps down to the picker and is not a dead end.

   Each card keeps its honest note that image/video, capsule and try-on making are not connected yet. No generation.
2. **Untouched saved record.** Show "Already saved, nothing to change" with a Done button instead of a greyed-out Save. Rename "Edit name and category" to make clear it's optional. Save rules for real edits are unchanged.
3. **Handoff visible without hunting:**
   - Pre-select the first colour and size on the saved card, so the "Prepare verified handoff" button shows immediately.
   - Move the handoff box directly under the colour cards, above the large preview.
   - After a fresh save, reload the saved product so its sizes and IDs appear without a page refresh.

   The server re-check, the ID-only link and the Frassy verification line all stay as they are.
4. **Not touched:** white-and-gold styling, Frassy, saved CJ records, the database, permissions and R2.

## Regression tests
- Saved card: each of the three creative cards links to `/studios/fashion` carrying only the verified product ID and size ID, or points to the picker when none is chosen. No card triggers generation.
- Untouched edit: shows "nothing to change" and makes no server call. A changed name or category still requires the confirmation tick.
- Picker on the saved card: a default size is chosen, the handoff button renders, and the CJ preview picker still has no handoff.
- Fresh-save path refetches the product so size IDs exist.
- Existing handoff, security and full suites, type check and build all pass.

## Founder steps after the fix
On Vendor Brands, go to the saved Soft Life Chiffon Top card, where "Prepare verified handoff" is visible right under the colour cards. Press it, then "Open in Fashion Studio" (or one of the three cards). Ask Frassy "What product are we working on?" The line under her should say "Verified on the server".
