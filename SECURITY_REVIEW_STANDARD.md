# FRASS-0449 — Security Review Standard

Constitutional. Founder approved. This file is the working checklist that FRASS-0449 requires.

> The client may request. The server verifies. The payment processor confirms.
> Only then does money move.
>
> Plain English: the till can only print a ticket marked *unpaid* — the bank stamps it,
> not the shopkeeper.

## 1. When a review is required

Before any of these systems is called "complete", and again before launch:

| System | Attacker review | Financial review | Privacy review |
| --- | --- | --- | --- |
| Payments | required | required | required |
| Wallet | required | required | required |
| Frass Card | required | required | required |
| Marketplace | required | required | required |
| Affiliate | required | required | — |
| Recruitment | required | required | required |
| Brand Partnerships | required | required | — |
| Live Streaming | required | — | required |
| FV Studios | required | required | — |
| File Uploads | required | — | required |
| Messaging | required | — | required |
| Authentication | required | — | required |
| Permissions | required | — | required |
| Financial Center | required | required | required |

## 2. The eight questions

Run these against every system under review. A "yes" blocks launch.

1. Can someone create money?
2. Can someone access another member's data?
3. Can someone bypass permissions?
4. Can someone alter protected information?
5. Can someone replay or duplicate a transaction?
6. Can someone gain access they shouldn't have?
7. Can someone impersonate another member?
8. Can someone create inconsistent data?

## 3. Severity

- **Critical** — finances, identity, or platform integrity compromised. Fix before launch.
- **High** — protected information exposed or an important control bypassed. Fix, or the
  Founder formally accepts the risk in writing.
- **Medium** — functional or privacy weakness with limited impact.
- **Low** — hardening and best practice.

## 4. Founder report format

Every review returns these five sections, in plain English as well as technical detail:

1. What was tested
2. What passed
3. What failed
4. What was changed
5. Why the change improves the platform

## 5. Definition of done for every future feature

- [ ] Functional testing
- [ ] User experience review
- [ ] Performance testing
- [ ] Security review (the eight questions)
- [ ] Privacy review
- [ ] Financial integrity review, where money is involved

## 6. Launch gate

- [ ] All Critical findings resolved
- [ ] All High findings resolved or formally accepted by the Founder
- [ ] Financial architecture verified end to end
- [ ] Identity architecture verified
- [ ] Permissions model verified

## 7. Pre-launch full platform audit (requested, not yet run)

Not security only — the whole platform:

- [ ] Functional completeness — every requested capability exists and works
- [ ] No duplicate implementations
- [ ] No orphaned pages or components
- [ ] Correct navigation and return trail for every district
- [ ] Consistent visual identity
- [ ] Performance and responsiveness
- [ ] Accessibility
- [ ] Security and privacy
- [ ] Financial integrity

## 8. Review log

| Date | System | Findings | Outcome |
| --- | --- | --- | --- |
| FRASS-0448 | Financial boundaries (wallet, receipts, payment requests, card orders) | 2 Critical: fabricated settled receipts; pre-paid payment requests | Fixed — creation-authority triggers, server-recomputed net, DELETE revoked, granular policies |
