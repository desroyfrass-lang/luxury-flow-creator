# Use the uploaded Fashionista Frassy image in the Fashion Studio

You uploaded "Fashionista_Frassy_in_Frass_Studios.png": Frassy in her denim-blue couture coat in a Frass Studios set. This plan treats it as the Founder-approved Fashionista look that the Fashion Studio was flagging as missing.

## What changes
1. Store your exact uploaded picture as a project image. It is not edited, cropped by AI or regenerated, and there's no charge.
2. In the Fashion Studio welcome, show this picture instead of the seated FV Studios stand-in. Its description: "Fashionista Frassy in denim-blue couture, Frass Studios".
3. Remove the gold "Missing image" note.
4. Record it as Frassy's approved Fashion Studio room look, next to her existing FV Studios look. She is the same core Frassy; the stylist role is just how she's presented in this room.

## What stays the same
- Every other Frassy picture: the Daily, FV Studios seated look, Welcome Hall and room outfits.
- The Fashion Studio's sections, the product handoff, access rules, the CJ pilot and Soft Life Chiffon data.
- No database changes, generation, Shopify or publishing.

## Note on the picture
The picture itself contains words and menu panels (Lookbooks, Capsules, Try-ons, Fashion Creation, Media & Content). They are part of the artwork only, not working buttons. The room's real sections stay the honest list underneath, with their "Not connected yet" labels.

## Checks
- A test that the Fashion Studio uses the approved Fashionista look and that no "missing image" note remains.
- Existing tests, type check and build.
- Founder check: open FV Studios → Fashion Studio and confirm the denim-blue picture shows, on desktop and on a phone.

Estimated cost: about 1 credit.

## Technical details
- Upload with `lovable-assets create --file /mnt/user-uploads/Fashionista_Frassy_in_Frass_Studios.png --filename frassy-fashionista-denim.png` and write the result to `src/assets/frassy-fashionista-denim.png.asset.json`.
- `src/lib/frassy/room-looks.ts`: add `FASHION_STUDIO_FRASSY_LOOK` (room "fashion", status "approved", position "standing").
- `src/routes/_authenticated/studios.fashion.tsx`: use that look and drop `FASHIONISTA_LOOK_MISSING`. The constant is removed from `src/lib/studios/fashion-studio.ts`.
- Update `src/lib/studios/fashion-studio.test.ts`.
