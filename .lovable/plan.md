# Root Arrival — One Logo, One Set of Doors

Scope: the root arrival page (`src/routes/index.tsx`) + one image edit only. No routes, permissions, other pages, or platform architecture are touched. The 201-card Teleporter audit, Legacy Route Consolidation, Welcome Hall, and all district architecture stay frozen.

## What's wrong now
- **Two FrassKicks signs.** The artwork has a baked-in sign above the central arch (it reads "KICKS" with an extra K and a distorted central symbol), and the code *also* overlays a separate logo floating above the building → a double logo.
- **Two sets of ENTER buttons.** Three glowing gold ENTER buttons are already baked into the bottom of the artwork (one per door), and the code renders a *second* set of three transparent gold buttons beneath the image → redundant buttons saying the same thing.
- **Warm-brown outer background** (`#0b0a08` + a brown-tinted blurred backdrop). You said white/cream is fine and definitely not brown.

## Changes

### 1. Fix the building sign — image edit, not a code overlay
Use `imagegen--edit_image` on the approved artwork (`/mnt/user-uploads/ChatGPT_Image_Aug_25_2026_10_15_24_AM.png`) together with the exact approved logo asset (`frass-logo-full` at `https://luxury-flow-creator.lovable.app/__l5e/assets-v1/60badf1c-0e15-4380-9caa-f644348207a9/frass-logo-full.png`) to **replace the central upper sign** so the exact logo reads as architectural signage embedded into the façade:
- The exact approved mark (backwards FRASS treatment, central symbol, ICKS on the right — no extra K), used as the source of truth, not redrawn or AI-regenerated.
- Visually fabricated into the stone: matching perspective, scale, depth, recessing, contact shadows, highlights, and the building's warm gold daylight so it belongs to the architecture — not floating, pasted, or a rectangular image layer.
- Completely conceals the incorrect baked-in lettering/symbol underneath: no ghost letters, no visible original sign, no duplicate, no floating boundary.
- Preserve the people, doors, destinations, building, sky, and overall scene exactly — only the sign is replaced.
Save as a new CDN asset `frass-three-doors-arrival-v2.png` and point the hero `<img>` at it.

### 2. Remove the code logo overlay
Delete the overlaid `frassLogo` block (current `index.tsx` lines 98–111) and the `frassLogo` import. The single correct sign now lives in the image itself — one sign, not two.

### 3. Remove the redundant transparent button row
Delete the three `DoorButton` components and the bottom button grid (lines 122–178). No second set of ENTER buttons remains.

### 4. Make the in-image ENTER buttons the clickable doors
Overlay three transparent, keyboard-focusable hotspot `<button>`s on the image, each covering one door's archway opening **plus** its baked-in ENTER button (coordinates from the artwork):
- Frass District — left 8.4%, top 39.3%, width 21.4%, height ~56%
- Frass Hill — left 37.1%, top 39.3%, width 25.0%, height ~56%
- Frass Kids — left 69.9%, top 39.3%, width 20.6%, height ~56%

On hover/focus, a thin gold ring + soft warm gold glow appears over that door's ENTER-button sub-region only (reinforces the button already in the art — it is **not** a new visible button). Subtle lift, optional light sweep, smooth transition; `prefers-reduced-motion` respected. Each hotspot is `aria-label`ed ("Enter Frass District", "Enter Frass Hill", "Enter Frass Kids") and keyboard-focusable with the same glow treatment.

The existing navigation handlers stay byte-identical:
- District → `goShop` (signed-in: `/frass-district`; else `/join/frasskicks`)
- Hill → `goHill` (signed-in: `/welcome-hall?arrival=first`; else `/join/frass-hill`)
- Kids → `goKids` (`/kids-world`)

### 5. White/cream backdrop
Replace the warm-brown background and brown-tinted blur with a clean white/cream frame (e.g. `#faf7f0` surface, no brown tint). The daylight archway becomes the bright focal point.

### 6. Responsive behavior
Hotspots are percentage-positioned over the `object-contain` image, so they scale identically on desktop, tablet, and mobile. All three doors stay visible and tappable; nothing is cropped or centered away on narrow screens.

## Verification
1. Root `/` is still the canonical three-door arrival — no redirect.
2. Exactly **one** FrassKicks sign: correct logo, no extra K, embedded into the façade, no overlay, no ghost letters.
3. Exactly **one** set of ENTER buttons (the artwork's), all clickable with the gold hover/focus glow.
4. White/cream backdrop, no brown.
5. Desktop + mobile: all three doors visible and enterable; hotspots align with the in-image buttons.
6. No unrelated routes, pages, permissions, or platform architecture changed.
