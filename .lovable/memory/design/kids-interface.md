---
name: Kids interface rules (FRASS-0486E)
description: All children's pages use bright age-tinted colours, rounded kid-friendly fonts, and never black
type: design
---
Every children's surface (`/kids-world/*`, `/frass-kids/*`, Frass Street) renders inside the `.kids-zone`
theme scope defined in `src/styles.css`.

- **Never black.** Cream/light backgrounds, deep blue-violet text. Adult luxury tokens (ink black, luxe
  linen, gold-on-dark, condensed uppercase tracking) must never reach a children's page.
- **Kid-friendly type.** Fredoka for headings, Nunito for body; sentence case, larger minimum sizes.
- **Rounded and soft.** 1.5rem+ radii, big tap targets.
- **Age-tinted palettes** via `data-age="0-3" | "3-6" | "6-12"` on the `.kids-zone` element:
  0-3 warm coral/sun, 3-6 turquoise/green, 6-12 violet/amber.

Applied in `src/routes/kids-world.tsx` and `src/routes/frass-kids.tsx` — new kids routes inherit it by
living under those layouts, never by re-theming individually.
