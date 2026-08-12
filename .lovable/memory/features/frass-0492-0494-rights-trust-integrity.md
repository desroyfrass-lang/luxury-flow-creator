---
name: FRASS-0492/0493/0494 Rights, Trust & Architectural Integrity
description: Digital rights layered protection + share cards, Trust as verified profile never a score, and the audit-before-build architecture law
type: feature
---

# FRASS-0492 — Digital Rights & Content Protection

- Member-created content is protected by default across Gallery, FOR ME, Marketplace, FV Studios, Collections, Media Library, Frass Card.
- Layered protection only: no direct download, no drag-save, no right-click save, watermarking, display-resolution delivery, time-limited access for protected assets.
- **Never claim screenshots are blocked** — browsers/OS control that. Be honest; rely on layers.
- Licence vocabulary: display only, personal download, commercial licence, NFT ownership, original physical artwork. Copyright stays with the creator unless explicitly transferred. Every listing states plainly what the buyer receives.
- **Frassy makes the screenshot**: approved branded share cards (Frass Card preview, milestone, product preview, watermarked artwork preview, certificate, QR, promo image) instead of members screenshotting.
- Protection must never make the platform hard to use.

Implementation: `src/lib/rights/protection.ts`, `src/lib/rights/share-card.ts`, `src/components/rights/*`. `gallery_artworks` extended with `license_grant`, `protection_level`, `watermark_enabled`.

# FRASS-0493 — Trust & Reputation Engine

- Trust is a **profile of verified accomplishments, never a score**. No X/100, no stars, no leaderboards, no ranking members against each other.
- Counts: completed services/transactions/deliveries/projects, businesses launched, verified partnerships, long-term reliability, community contributions, education, certifications, Founder recognition, verified customer feedback.
- **Followers, likes, views, popularity, viral reach never affect trust** — directly or indirectly.
- Feedback only from a genuinely completed transaction, once per transaction, never rewritten. (`card_orders` matches buyers by `buyer_email`, not id.)
- Stages: 🌱 New Builder → 🌿 Growing Builder → 🏆 Trusted Builder → ⭐ Established Builder.
- No hidden scoring — always explain why trust changed and what would improve it. Trust recovers from honest mistakes; repeated misconduct is lasting.
- FOR ME = your story. Trust = your reliability. Never merge them.

Implementation: `src/lib/trust.ts`, `src/lib/trust.functions.ts`, `verified_feedback` table with `enforce_verified_feedback` trigger, `<TrustProfilePanel />`, `<MyTrustSummary />`, Reputation section in FOR ME, panel on public Frass Card.

# FRASS-0494 — Architectural Integrity Engine

**Build once. Extend forever.** Applies to every future feature.

- Audit before building; extend before creating; one system per responsibility.
- Mandatory audit list: Daily, Workspace, Welcome Hall, Money Moves, Frassy, Builder Vault, Business Builder, FOR ME, Frass Card, Marketplace, Financial Center, Founder Mode, Services Marketplace, existing APIs/databases/navigation/permissions/UI components.
- Single sources of truth: one Frassy, one Wallet, one Financial Center, one Daily, one Workspace, one Money Moves, one notification system, one auth system, one profile architecture, one Trust engine.
- Extend tables via configuration before creating new ones. Reuse existing UI components and permissions.
- Founder review questions: Does this already exist? Can an existing system be extended? Will this confuse members? Duplicate navigation? Duplicate data? Strengthens or weakens architecture?

Implementation: `src/lib/architecture-integrity.ts` (machine-readable law + `redirectToExisting`), constitution amendment, injected into Frassy's system prompt.
