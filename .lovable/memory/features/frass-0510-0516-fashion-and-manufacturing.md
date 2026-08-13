---
name: FRASS-0510/0511-A/0512/0516 Fashion ecosystem + Creator Manufacturing Network
description: Seamstress Vault is the engine behind Afro Designers; adaptive skill levels in every Vault; one shared manufacturing network for all categories
type: feature
---
**FRASS-0510 — Afro Designers + Seamstress Vault are one fashion ecosystem.**
The Vault is the *business engine* (imagine → design → blueprint → create → brand → monetize → grow);
Afro Designers is the *showcase* where the finished work is published. One catalog, one inventory,
one source of truth. No duplicate products, no second storefront. Bridge lives on
`/afro-designers/join` and in `BusinessVault.showcase`.

**FRASS-0511-A — Adaptive Learning Engine** (`src/lib/business/skill-levels.ts`).
A Vault must never assume experience. Frassy discovers level through ordinary conversation
(`FASHION_SKILL_QUESTIONS` / `skillQuestionsFor`), then changes only the *depth* of guidance —
never the destination and never her personality. Beginner / Intermediate / Advanced each carry
their own teaching set and their own FRASS-0480 Money Move. Hidden never means deleted: an
advanced member can open the full professional toolkit on day one.

**FRASS-0512 / FRASS-0516 — Frass Creator Manufacturing Network**
(`src/lib/manufacturing/network.ts`, route `/manufacturing`).
ONE shared network for every Business Vault — never a fashion-only system.
Pipeline: 💡 Idea → ✏️ Concept → 📐 Design → 🧪 Prototype → 📦 Sample → ✅ Approval →
🏭 Manufacturing → 🛍 Marketplace → 🚚 Shipping → 💰 First Sale → 📈 Growth.
Categories: Fashion · Footwear · Bags & Leather · Jewelry · Home · Beauty · Art & Collectibles ·
Lifestyle · Children's Products (children's + beauty carry compliance gates).
Rules: Frass is **not** the manufacturer — it connects creators to approved partners. Nothing is
produced without member approval. No inventory ownership required; on-demand production is the
default. Members own their designs. Adding a category or partner = one array entry, never a new
route or parallel system. New Vaults declare `manufacturing: [categoryKey]` and optional
`showcase`; new physical-product Vaults added: Footwear, Bags & Leather, Jewelry.
