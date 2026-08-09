---
name: FRASS-0408/0409 — Vision Network expansion & official logo
description: Watermark system (optional, incentivised), Brand Partnership Marketplace (faceless-first), Frass Radio + FVS Originals, and the official FV Studios gold monogram
type: feature
---

## FRASS-0408 §1 — Watermark
- Watermarking is ALWAYS optional. Never required to export, publish or sell.
- Options: none · "Created in FV Studios" (−10% AI credits) · "Produced with Frass Vision Studios" (−15%) · custom brand mark (paid creator/business, no discount).
- Rewards for carrying it: cheaper AI exports, greater discoverability, showcase eligibility, Radio/spotlight priority.
- Source: `src/lib/studio/watermark.ts`; UI `src/components/studio/export-watermark.tsx` inside `/studio`.

## FRASS-0408 §2 — Brand Partnership Marketplace
- Part of the Marketplace + Affiliate ecosystem, never a separate money system.
- Faceless creators are first-class: a brief requires on-camera only when explicitly labelled.
- Categories: fashion, beauty, fitness, travel, technology, food, automotive, education.
- Compensation models: fixed fee, performance bonus, affiliate commission, revenue share.
- Lifecycle: brand posts → creator applies → brand accepts → create in FV Studios → brand approves → payment to Frass Wallet with itemised receipt.
- Source: `src/lib/brand-partnerships.ts`; page `/brand-partnerships`.

## FRASS-0408 §3 — Frass Radio
- The audio home of Frass: music, podcasts, audio courses, community news, Foundation stories, live DJ sessions, interviews, audiobooks later.
- Also a discovery engine, promotional platform and launchpad for new artists.
- Revenue: platform participation, licensing, sponsorship, optional advertising, premium services — all disclosed to creators before streaming.
- Royalties post to the Music Earnings / Radio Royalties ledger; estimates labelled as estimates.
- Source: `src/lib/radio.ts`; page `/frass-radio`; permanent nav item.

## FRASS-0408 §4 — Frass Vision Studios Originals
- Premium designation for work Frass produced or commissioned only. Members' own work never carries it.

## FRASS-0409 — Official logo
- Gold brushed FV monogram in a thin ring + thin luxury serif "FRASS VISION STUDIOS" wordmark.
- Assets: `src/assets/fv-logo-primary.png.asset.json`, `src/assets/fv-monogram.png.asset.json`.

## Ledgers
`EarningsSourceId` gained `radio` and `brand-partnerships`; earnings are never merged with other sources.
