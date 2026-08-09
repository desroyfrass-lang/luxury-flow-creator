# FRASS-0001 Amendment — Platform Consolidation Audit

Status: COMPLETE. Rule enforced: **One Feature → One Architecture → One Source of Truth → Many Views.**

---

## Verdict by audit area

| # | Area | Verdict | Single source of truth |
|---|------|---------|------------------------|
| 1 | Frassy Studio | PASS | `/studio` route + `src/lib/studio/{credits,director}.ts` + `studio.functions.ts` |
| 2 | Composer | PASS | `src/components/workspace/frassy-composer.tsx` |
| 3 | Daily | PASS | `src/lib/workspace/daily.ts` + `daily-intel.ts` → `frass-daily.tsx` |
| 4 | Financial Center | PASS | `src/lib/finance/*` (4 modules, no overlap) |
| 5 | Workspace | PASS | `workspace-shell.tsx` + `workspace-room.tsx` |
| 6 | Project engine | PASS | `studio_projects` + `workspace/workspace-config.ts` |
| 7 | Upload system | PASS with note | `src/lib/workspace/upload-queue.ts` + `upload-manager.tsx` |
| 8 | Search | **GAP** | no universal search route exists |
| 9 | AI Credits | PASS | `src/lib/studio/credits.ts` |
| 10 | Navigation | PASS | `site-shell.tsx` (public) / `gateway-nav.tsx` (hill) / `workspace-shell.tsx` (authed) |
| 11 | Frass Hill | PASS with note | `src/lib/frass-hill.ts` (town plan) |
| 12 | Commerce | PASS | `src/lib/shopify.ts` + catalog registries |
| 13 | Voice | **WAS FAILING — now fixed** | `use-push-to-talk.ts` + `lib/voice/{conversation-machine,wav-recorder,chunk-text,playback-diagnostics}.ts` |
| 14 | Media pipeline | PASS | `/api/chat`, `/api/stt`, `/api/tts` through `ai-gateway.server.ts` |
| 15 | Future-proofing | PASS with note | single gateway provider seam |

---

## 1. Orphans removed this pass (14 files)

Duplicate voice stack (a second, never-wired speech pipeline):
`voice-gate.tsx`, `voice-playback-debugger.tsx`, `conversation-integrity-overlay.tsx`,
`conversation-status.tsx`, `lib/frassy-voice.ts`, `lib/voice/streaming-voice.ts`,
`lib/voice/chat-stream.ts`, `lib/voice/pcm-player.ts`, `lib/voice/sentence-pump.ts`,
`lib/voice/types.ts`, `hooks/use-voice-dictation.ts`

Dead storefront UI (no importers):
`district-directory.tsx`, `featured-drop.tsx`, `store-landing.tsx`

Typecheck clean after removal. The live voice engine is untouched.

## 2. Duplicates that remain (flagged, not yet merged)

- **`src/lib/districts.ts` (110 lines) vs `src/lib/frass-hill.ts` (470 lines).**
  Two district registries. `districts.ts` serves only Welcome Hall, Founder and
  Commissioning; `frass-hill.ts` is the constitutional town plan. Recommend
  folding `districts.ts` into `frass-hill.ts` as a "civic view" of the same data.
- **Three card components** — `product-card`, `viral-product-card`,
  `luxury-collection-card` (+ `collection-card`). Same shape, different skins.
  Recommend one card primitive with a `variant` prop.
- **`frassy-chat.tsx` (420 lines) vs `frassy-composer.tsx` (349 lines).**
  Composer is canonical; chat is now a thin surface but still owns its own
  push-to-talk wiring. Recommend chat renders the Composer rather than
  duplicating input handling.

## 3. Kept deliberately (orphaned but reserved)

- `src/lib/frassy-memory.ts` — memory rules, a constitutional system.
- `src/components/frassy-consent.tsx` — consent surface; legal, not cosmetic.

Both need wiring, not deletion.

## 4. Hidden / retired routes

- `/frass-world` → redirects to `/frass-hill`. Correct: preserves published links.
- `/plus-size/men|women` → redirect shims to Frass Plus+. Correct.
- No other unreachable page routes found.

## 5. The one real architectural gap

**Universal Search does not exist.** `visual-search.tsx` is image-similarity only.
Nothing searches Projects, Vault, Daily, Uploads, Messages, Products,
Specifications, Studio Assets, Marketplace or Members. Every ingredient is
already in the database — this is an assembly job on top of existing tables,
not a new architecture. It should be built as `src/lib/search/universal.ts`
with one server function fanning out across the existing registries.

## 6. Extensibility check (Audit 15)

- AI providers: one seam (`ai-gateway.server.ts`) — swappable. PASS.
- Credit engine: rate card is data, not code — new studios (Music, Image,
  Podcast, CAD) register an operation key and inherit forecasting, approval,
  ledger and receipts for free. PASS.
- Upload manager: queue is content-type agnostic — screen recording drops in
  as another source. PASS.
- Districts: registry-driven — new districts are data. PASS.

## 7. Estimated credits saved

| Consolidation | Rebuild avoided |
|---|---|
| Second voice pipeline retired instead of maintained | ~120–180 credits/quarter of drift-chasing |
| Composer already unified (4 composers avoided) | ~400 credits |
| Daily / Workspace / Credit engines already single | ~350 credits |
| Card + district registry merges (pending) | ~90 credits |
| **Universal Search built on existing tables vs new stack** | **~500 credits** |

Roughly **1,300+ credits** protected by extending rather than rebuilding.

---

## Recommended order of work

1. Universal Search (the only true gap).
2. Merge `districts.ts` into `frass-hill.ts`.
3. Collapse the card components into one variant-driven primitive.
4. Make `frassy-chat` render the Composer.
5. Wire `frassy-memory` and `frassy-consent`, or formally retire them.

No system requires a rebuild.
