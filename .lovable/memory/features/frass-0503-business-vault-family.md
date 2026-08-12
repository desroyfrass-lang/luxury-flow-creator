---
name: FRASS-0503 Family of Business Vaults (incl. Seamstress Vault)
description: Every trade/craft gets a complete Discover→Build→Monetize Vault pathway; Seamstress Vault is the flagship; no duplicate commerce systems
type: feature
---
A **Business Vault** is a complete entrepreneurial pathway for one trade — not a feature.
Every Vault runs the same constitution: **Discover → Build → Monetize**, and inherits:
- FRASS-0480 — the pathway must end at a real monetization outcome (listing, bookable service, live collection).
- FRASS-0469 — a shelved Vault produces no Daily tasks, Money Moves or readiness until the member activates it.
- No duplicate commerce: selling always flows through the existing Marketplace, Frass Card and Money Moves.

Family (in `src/lib/business/vault-family.ts`, surfaced on `/business-vaults`):
👗 Seamstress · 🎨 Visual Creator · 🎵 Music Creator · 🚛 Freight Brokerage · 🌿 Wellness · 🍽️ Culinary · 📸 Photography · 💄 Beauty · 🪚 Woodworking · 💻 Software & Technology.

**Seamstress Vault (flagship, FRASS-0503A)** — for anyone who makes or alters clothing, from first hem to full brand.
Moves: niche → brand name → logo/identity → production path → mood board & fabrics → first designs → sew → photograph → catalog → pricing → Marketplace listing → Frass Card → social content → next collection.
Production paths: handmade, made-to-order, alterations, custom tailoring, children's, formal, streetwear, cultural, sustainable, print-on-demand.
Design support: sketches, digital design, mood boards, fabric ideas, pattern tracking, seasonal collections — Frassy organises, the vision stays the member's.

Founder principle: *Every skilled craft deserves the opportunity to become a business.*

Adding a new trade = adding one entry to `BUSINESS_VAULTS`. Never a new route or parallel system.
