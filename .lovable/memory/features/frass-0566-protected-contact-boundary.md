---
name: FRASS-0566 Protected Contact Boundary
description: Members are discoverable, their contact details are not — public profiles show identity and work only, contact runs through 📨 Contact Builder
type: constraint
---

**Members should be discoverable. Their private contact information should not be.**

Public profiles may display: Builder name, business name, portfolio, products, public social links, public website.

Never exposed publicly: email address, phone number, internal identifiers, any private contact detail.

Instead, every public surface offers a secure **📨 Contact Builder** flow — the message passes through Frass and the member chooses whether to reply.

Deprecated: publishing a personal email address anywhere a secure contact flow is available.

Systems updated: Artist Galleries (anon grants column-scoped, `contact_email` private), Commission Requests (insert policy proves identity: signed-out with no account attached, or exactly `auth.uid()`), Link Checker (host denylist for loopback/private/link-local/CGNAT/multicast/cloud-metadata before any fetch).
Unchanged: Marketplace, First Partner privacy, Gift Wall, Founder analytics, member profiles.

**How to apply:** use `src/lib/security/protected-contact-boundary.ts` (`assertContactSafe`, `publicProfileProjection`, `PUBLIC_PROFILE_FIELDS`) on every public profile read; four permanent regression tests in `src/lib/security/regressions.ts`; checklist in `SECURITY_REVIEW_STANDARD.md` section 11. Pairs with FRASS-0565.
