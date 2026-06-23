## Frass Try-On — Virtual Fitting Room

A "Try It On" mode tied to the cart. Anything in the cart can be tried on a photo of the customer using AI image generation. No camera AR — that needs native apps and a much heavier build. This is image-based and works on every device.

### User flow

1. Customer adds products to cart as normal.
2. In the cart drawer, a new **"Try it on"** button opens a full-screen Fitting Room.
3. First time: customer uploads or snaps a full-body photo (front-facing, plain background works best). Photo is saved to their account so they don't have to redo it.
4. Fitting Room shows their photo on the left, cart items on the right.
5. They pick one or more items → tap **Generate look** → AI composites the garments onto their photo.
6. Result shows side-by-side with the original. They can save the look, share it, swap items, or go straight to checkout.

### What gets built

**Frontend**
- `/try-on` route (auth-required, lives under `_authenticated/`).
- "Try it on" entry point inside the cart drawer.
- Photo capture/upload component (webcam + file upload, with guidelines: full body, good light, plain background).
- Item picker pulling from the live cart.
- Generated-look gallery with save / share / delete.

**Backend (Lovable Cloud)**
- `customer_photos` table — one or more reference photos per signed-in customer.
- `tryon_looks` table — each generated image with the cart items used, prompt, and a link to the source photo.
- `tryon-photos` private storage bucket for both source photos and generated looks (signed URLs).
- `generateTryOn` server function — gathers the source photo + selected cart item images (already fetched from Shopify), calls the Lovable AI Gateway image-edit model (Gemini 2.5 Flash Image / "nano-banana"), saves the result.

**AI**
- Lovable AI Gateway, image edit model. No external API key required.
- Prompt template: "Compose a realistic photo of the person in image 1 wearing the garments shown in the following images. Keep their face, body shape, pose, and the background unchanged." Tunable per garment category (kicks vs full fit).

### What it does NOT do (on purpose, for scope)

- No live AR / camera overlay — that's a native-app project.
- No size recommendation engine. We can add a size guide later.
- No video, no 360°. Single still image per look.

### Honest limitations

AI try-on is a preview, not a mirror. Results are best for tops, jackets, hoodies, and overall vibe. Shoes and tight-fit garments will sometimes warp. We'll set expectations in the UI ("AI preview — actual fit may vary"). The Lovable AI Gateway has usage limits; once exceeded, the button gracefully disables with a message.

### Cost / credits

Each generated look uses one image-edit call against the Lovable AI Gateway (covered by Cloud credits, no extra setup). We can throttle to e.g. 5 looks per session and cache results so repeat views are free.

### Rollout

I'd ship this in two passes:

1. **MVP (this build):** auth, photo upload, single-item try-on, save to looks.
2. **Polish (next build):** multi-item outfits in one image, share-to-IG, "compare with original" slider, public lookbook of customer-approved looks.

### Technical notes

- Auth-gated route under `src/routes/_authenticated/try-on.tsx` so the photo + looks stay tied to a user.
- New tables `customer_photos` and `tryon_looks` with RLS scoping rows to `auth.uid()`.
- Private `tryon-photos` bucket; we hand out long-lived signed URLs the same way `site-media` already works.
- `generateTryOn` is a `createServerFn` with `requireSupabaseAuth`; it reads the photo + Shopify image URLs, calls the AI Gateway, stores the result, returns the new look row.
- Cart items already carry product image URLs from Shopify, so no extra fetch is needed for the garment side.

### Confirm before I build

1. Ship the MVP scope above? (auth required, single source photo, one generated look at a time)
2. OK with AI try-on being a styled preview rather than a true-to-fit simulation? I'll word the UI accordingly.
