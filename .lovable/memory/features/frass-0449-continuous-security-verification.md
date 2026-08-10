---
name: FRASS-0449 Continuous Security Verification Constitution
description: Attacker-mindset review is mandatory before any major system is called complete; severity levels, launch gate, and the plain-English founder report format
type: feature
---

# FRASS-0449 — Continuous Security Verification Constitution

Status: Founder Approved · Constitutional · Applies to the entire Frass ecosystem.

## Mental model (adopt for every financial feature)
**The client may request. The server verifies. The payment processor confirms. Only then does money move.**
Plain English: *the till can only print a ticket marked unpaid — the bank stamps it, not the shopkeeper.*

## Principle
Never assume a system is secure because no one reported a problem. Every major feature is
challenged by trying to misuse it. If it can be abused, it is redesigned before public release.

## Systems requiring an attacker-mindset review before "complete"
Payments · Wallet · Frass Card · Marketplace · Affiliate · Recruitment · Brand Partnerships ·
Live Streaming · FV Studios · File Uploads · Messaging · Authentication · Permissions ·
Financial Center.

## The eight questions (asked of every system)
1. Can someone create money?
2. Can someone access another member's data?
3. Can someone bypass permissions?
4. Can someone alter protected information?
5. Can someone replay or duplicate a transaction?
6. Can someone gain access they shouldn't have?
7. Can someone impersonate another member?
8. Can someone create inconsistent data?

Any "yes" means the feature is not launch-ready.

## Severity
- **Critical** — finances, identity, or platform integrity compromised.
- **High** — protected information exposed or an important control bypassed.
- **Medium** — functional or privacy weakness, limited impact.
- **Low** — hardening / best practice.

Every Critical and High must be resolved before launch.

## Founder report format (always)
What was tested · What passed · What failed · What was changed · Why the change improves the
platform. Technical layer first, then the plain-English layer with an analogy.

## Launch gate
Frass is not launch-ready until: all Critical resolved; all High resolved or formally accepted by
the Founder; financial architecture verified end to end; identity architecture verified;
permissions model verified.

## Standard definition of done for every future feature
Functional testing · UX review · Performance testing · Security review · Privacy review ·
Financial integrity review (where money is involved).

## Pending founder request
One complete end-to-end platform audit (not only security) before final polish and public launch:
functional completeness, no duplicate implementations, no orphaned pages/components, correct
navigation per district, consistent visual identity, performance/responsiveness, accessibility,
security and privacy, financial integrity. Checklist lives in `SECURITY_REVIEW_STANDARD.md`.
