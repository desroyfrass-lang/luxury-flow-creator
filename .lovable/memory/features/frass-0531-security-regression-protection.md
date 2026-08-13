---
name: FRASS-0531 Security Regression Protection
description: Every fixed vulnerability becomes a permanent, append-only regression test verified before every release
type: feature
---
A security issue that has already been solved must never quietly return.

Every fix permanently records: root cause · resolution · test case · affected
systems · security classification. The registry lives in
`src/lib/security/regressions.ts` and is **append-only** — never delete an entry,
because that deletes the memory of how it was solved. Adding a new fix = adding
one entry.

Before every deployment the Security Center sweeps the registry
(`src/components/founder/regression-panel.tsx`). Release Approval (FRASS-0529)
refuses an "Approve" decision while the sweep is incomplete.

Permanent regression areas: Founder authorization · hidden admin routes ·
payment authorization · uploads and server-side fetches (SSRF) · role
permissions · Frassy tool access · financial withdrawals and receipt
immutability · Knowledge Vault privacy · commission bounds · PII exposure.

Founder Principle: every security issue should strengthen Frass permanently.
