# Fashion Studio Destination Audit (read-only)

Nothing was changed, generated or charged.

## Short answer
- There is no Fashion Studio room today, and no "Fashionista Frassy" anywhere. A search for "fashionista" across the whole app finds nothing.
- Fashion pieces exist, but they're scattered across separate places. None of them can receive the verified product handoff yet.
- Recommendation: one new private room inside the existing Frassy Studios, called Fashion Studio. It hosts the handoff and reuses the existing engines. Same Frassy, with "stylist" as a role she plays.

## Where the buttons go today
On the saved product card, the three buttons open:
- "Make image/video" → `/studios/create`, the story/episode brief form
- "Send to capsules" → `/admin/capsules`
- "Send to try-ons" → `/try-on`, the shopper version

The product is never carried over, and the card says so.

## What exists today

| Place | Route | What it really is | Fashion-ready? |
|---|---|---|---|
| Frass Vision Studios | `/fv-studios` | Public brochure for the creator company. No tools, no Frassy greeting | No |
| Frassy Studios | `/studios/*`, private | Real production studio: briefs, scenes, characters, assets, animations, publishing, all built for shows and episodes. Has an embedded "Ask Frassy" chat panel | Partly. The engines are real, but organised around episodes |
| Studio Characters | `/studios/characters` | Real. Locks a character's look, voice and wardrobe notes | Yes, for keeping Frassy's look consistent |
| Admin Capsules | `/admin/capsules` | Real builder. Items must be old live-shop products | Not for drafts |
| Try-on | `/try-on` | Real shopper engine with one AI image per try, under the shopper's account | Shopper only |
| Lookbook | `/lookbook`, `/lookbook/$story` | Public lookbook stories with their own image table | Display only, no builder |
| Collection Builder | `/collection` | Real "one piece at a time" flow: photograph a piece, Frassy writes the page, Founder approves | Closest existing "Frassy helps with fashion" flow, but built for a vintage boutique |
| Frassy's room outfits | `frassy-look` and its outfit list | Dresses Frassy per room (hall, daily, workshop, freedom, celebration) and links her outfit to shop pieces | No studio or fashion room yet |

## Why Frassy didn't appear when you arrived
- Frassy's arrival greetings are a fixed list of rooms: Welcome Hall, home, Frass Hill, District, Kicks, Luxury House, Frass Drip, Bare Drip, Afro Designers, Capsules and others.
- `/fv-studios`, `/studios` and `/try-on` are not on that list. A greeting was never built for them.
- `/fv-studios` only mentions Frassy in its text. Inside `/studios` she's only an embedded chat box, not a welcome.
- So nothing broke. The greeting simply never existed on those pages.

## Recommended home
One private Founder room: **Frassy Studios → Fashion Studio** (`/studios/fashion`). It is reached from the existing Studios menu and from the product card. It holds:
1. The verified product and size the handoff brings in, shown read-only.
2. Four tabs, each reusing an existing engine: Looks & Lookbook, Capsules, Try-on/Haul, Product image/video.
3. Frassy greeting you as the stylist. It's the same character and model, with the stylist role added to her greeting and the room's outfit list, and her approved look kept.

No new engines and no shopper changes.

## Gaps to close (later approvals)
- No `/studios/fashion` room or menu link.
- No stylist greeting, and no room outfit for the studio.
- Capsules can't hold drafts (the P2-1 database change).
- No Founder-only try-on wrapper (P2-2).
- Studio assets can't be tagged to a product (P2-3).
- The lookbook has no builder. Possible later reuse of the Collection Builder pattern.

## Phased recommendation
- **F1 Fashion Studio room** (about 2–4 credits): private page inside Frassy Studios, menu link, receives the P2-0 handoff, stylist greeting. Tabs say "Not connected yet" until their phase is done. Product card buttons point here.
- **F2 Capsules tab** = P2-1 (about 3–5 credits).
- **F3 Try-on/Haul tab** = P2-2 (about 3–5 credits, plus each AI image you choose to run).
- **F4 Image/video tab** = P2-3 (about 4–6 credits).
- **F5 Lookbook builder** (optional, about 4–6 credits): reuses the Collection Builder approval pattern.

## Decisions for the Founder
1. Room name: "Fashion Studio", "Frassy's Fitting Room", or something else?
2. Stylist role: a new outfit for Frassy, or her approved look with a stylist greeting only?
3. Should the product card buttons go to the new room once F1 exists? (Recommended: yes.)
4. Should F1 be Founder-only, or also open to brand owners?

## Technical details
- Files for F1: new `src/routes/_authenticated/studios.fashion.tsx`; a menu entry in `src/routes/_authenticated/studios.tsx`; a `/studios` greeting entry in `src/lib/frassy-destinations.ts`; a `studio` room in `src/lib/frassy/wardrobe.ts` if approved; links in `src/components/vendors/cj-pilot-panel.tsx`; reuse `getProductHandoff`.
- Tests: Founder-only access, handoff loads only verified IDs, the greeting keeps the core character, existing studio and shopper routes stay the same.
- Rollback: remove the one room file and menu link. No database changes in F1.
