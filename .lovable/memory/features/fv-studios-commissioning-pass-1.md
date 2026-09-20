---
name: FV Studios commissioning pass 1 — engine truth & canonical identity
description: Frass-native engine registry under the Generation Router, verified-output credit truth, canonical studio_productions identity bridge
type: feature
---

Frass Vision Studios (FV Studios) commissioning foundation. No media engines exist yet.

## Canonical production identity
`studio_productions` is canonical — briefs, scripts, scenes, characters, masters and
distribution already hang off it. `studio_projects` keeps working and gains a nullable
`production_id` bridge. `src/lib/studios/production-identity.ts` resolves either shape;
`ensureCanonicalProduction` server fn creates and links on demand. Nothing is converted
or destroyed; unlinked projects are "legacy_project" and still open normally.

## Frass-native engine registry
`src/lib/studios/native-engines.ts` sits UNDER the existing provider-agnostic Generation
Router (`generation-layer.ts`, preserved). Nine slots: image, video, animation, voice,
music, sound, audioRestoration, finishing, text. `studio_providers.engine_type` is
`frass_native` or `external_fallback` (default external). Routing is native-first;
external engines are used only when `allowExternalFallback` is explicitly passed.
Missing engines report NOT INSTALLED — never "working". No vendor is hard-coded.

## Credit truth (constitutional)
Approving a forecast NEVER charges. Lifecycle:
forecast → approval → job → real processing → verified output → charge → complete.
`src/lib/studio/job-truth.ts` `decideCharge()` is the only place money is decided;
it charges only on a `VerifiedOutput` (file url + engine + timestamp).
`runStudioOperation` now creates a `studio_generation_jobs` row (queued or
awaiting_engine) and charges nothing. `settleStudioJob` charges once, guarded by the
unique `idempotency_key` index plus a `charge_state = 'unbilled'` conditional update.
Free/manual work stays free. Phone Content Mode may analyse and forecast, but must never
say "Enhanced" or charge until verified media returns. A1 checks only accept verified
evidence — never auto-approved.

Tests: `src/lib/studio/engine-truth.test.ts`.
