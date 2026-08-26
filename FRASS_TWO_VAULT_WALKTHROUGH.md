# FRASS HILL — TWO-VAULT USER WALKTHROUGH (AUDIT ONLY)

User: josiahejj@gmail.com (account exists since 2026-08-05, signed in once, never returned)
Date: 2026-08-25 · Discovery only — nothing was rebuilt, deleted, merged or connected.

---

## 0. HEADLINE FINDING (read this first)

**Neither vault exists in Frass Hill today.**

- There is no "Salon Grid Studios" anywhere in the codebase or the database.
- There is no "Music Artist Vault". The closest thing is a **Music Creator Vault**, which is a
  *template pathway* (a list of suggested steps), not a workspace he owns.
- His account holds **0 vault records, 0 products, 0 assets, 0 vault items**. Only a profile,
  one journey record and one business card row exist.

Plain English: Frass Hill currently offers **descriptions of businesses**, not **containers for a
business**. A vault today is a suggested to-do pathway. It is not a place with his logo, his
clients, his songs and his files inside it.

Because of that, most of the requested walkthrough steps (client journey, campaign journey,
catalog, song workflow, rights, release management, vault switching) **could not be performed** —
the screens do not exist. That is itself the audit result, and it is recorded below as findings,
not as failures of the test.

---

## 1. ENTRY EXPERIENCE (what actually happened)

Walked from the real front door, signed in as him, desktop (1280) and mobile (390).

| Asked for | Landed on | Observation |
|---|---|---|
| `/` | `/` — "WELCOME TO FRASSKICKS", three doors | Shop-first arrival. A signed-in Builder gets no "continue to my work" door. |
| `/welcome-hall` | Welcome Hall, "Good morning, josiahejj" | Works. Warm. Clear. |
| `/room` (his workspace) | **redirected to `/welcome-hall?welcome=daily`** | He cannot reach his own workspace directly; the daily ceremony intercepts. |
| `/business-vaults` | "Future Business Vaults" | Loads. Shows *other people's* priority businesses (Wellness Brand, Coco Vintage, Faceless Content, Affiliate Marketing, Podcast) — none are his. |
| `/vault` | Builder Vault — "Your Vault is empty." | Generic notes/ideas archive, not per-business. |
| `/workspace` | **Biometric "Identity Check" wall** + onboarding concierge overlay on top | A first-time member is stopped by a security prompt before seeing anything. |
| `/money-moves` | Money Moves, pre-launch mode | Works, speaks in his name. |

No JavaScript errors on any page, desktop or mobile.

---

## VAULT 1 — SALON GRID STUDIOS

### What works
- Nothing specific to Salon Grid Studios exists, so nothing can be credited.
- Generic scaffolding that *could* host it: Business Builder, Money Moves, Frass Card,
  Services Marketplace, Builder Vault, Financial Center.

### What is confusing
- The word **"Vault"** carries three different meanings at once: a business pathway template
  (Business Vaults), a personal notes archive (`/vault`), and a shelf of parked ideas
  (Future Business Vaults). A real user cannot tell these apart.
- `/business-vaults` opens on "Getting all the attention right now" listing five businesses that
  are not his. It reads as if Frass has decided his priorities for him.

### What is broken
- No route, record or screen named Salon Grid Studios. Nothing to open.

### What is missing (for a marketing business)
| Category | Status |
|---|---|
| Business profile (name, logo, description, services, contact, website, socials) | MISSING as a business record — only a personal Frass Card exists |
| Brand assets / creative assets / files | PARTIAL — Builder Vault stores loose items, not per-client folders |
| Clients / leads / prospects | MISSING |
| Projects / deliverables / approvals | MISSING |
| Campaigns / platforms / schedule / results | MISSING |
| Content & social publishing | EXISTS BUT ELSEWHERE — Frassy Studios (Founder/Admin only, he cannot access it) |
| Tasks / deadlines / calendar | PARTIAL — Money Moves is personal, not client-scoped |
| Notes / meetings | PARTIAL — Builder Vault notes |
| Invoices / payments / revenue / expenses | PARTIAL — Financial Center + Payment Requests exist platform-wide, not per-business |
| Analytics | MISSING for a marketing agency |

### Findings
- **P0** — Salon Grid Studios cannot be created, named or entered. No owner workspace exists.
- **P0** — `/workspace` is blocked behind a biometric identity check on first visit.
- **P1** — `/room` (his home) redirects away to the Welcome Hall ceremony; he cannot get "home".
- **P1** — "Business Vaults" shows other people's priorities as if they were his.
- **P2** — Three unrelated things are all called "Vault".
- **P3** — Root arrival is shop-first with no "continue to my work" for signed-in Builders.

---

## VAULT 2 — MUSIC ARTIST VAULT

### What exists
A **Music Creator Vault template** in `src/lib/business/vault-family.ts` — six suggested steps
(define the sound, pick a release date, master a track, cover art, submit to Frass Radio, list in
Marketplace). It is text and links. There is no artist record, no catalog, no files.

### Findings by area
| Area | Status |
|---|---|
| Artist name / image / bio / genre | MISSING (only a personal Frass Card) |
| Streaming profiles, press kit, management contacts | MISSING |
| Songs / singles / albums / EPs / features / unreleased | MISSING — no catalog of any kind |
| Song workflow (idea → mastered → released) | MISSING |
| Audio files, masters, stems, artwork, videos, lyrics | MISSING — Builder Vault is text-first, no audio handling |
| Rights, splits, publishing, contracts | MISSING for members (a `studio_rights` system exists but is Founder/Admin-only) |
| Release management, release date, distribution | MISSING for members |
| Streams, royalties, show income, merch | MISSING — no connected data, and none must ever be simulated |

### Findings
- **P0** — He cannot answer "what music do I have, what is released, what am I working on."
- **P0** — No audio/file storage he can find again.
- **P1** — Frass Radio submission is suggested as a step but there is no catalog to submit from.
- **P2** — Rights/release tooling already exists in Frassy Studios but is walled off to Founder/Admin;
  the capability is built, the audience is wrong.

---

## PART 3 — TWO-VAULT EXPERIENCE

- **Vault switcher: does not exist.** No "Switch Vault" control appears on any page, desktop or mobile.
- **Current vault indicator: does not exist.** Every page says "Good morning, josiahejj" — the person,
  never the business.
- **Data separation:** not applicable yet — with no vault containers, everything he creates lands in
  one shared personal pile (Builder Vault, Money Moves, Frass Card). Marketing work and music work
  would mix immediately.
- **Shared identity:** consistent and correct (one account, one name, one card).
- **Permissions:** correct — he sees no Founder links anywhere. Verified.
- **Back / Welcome Hall:** breadcrumb "📍 PLACE NAME" and a footer "← Back to Builder Hall" appear
  consistently. This part is genuinely good.
- **Mobile:** identical routing and content to desktop, no layout breakage, no errors observed.

---

## USER JOURNEY MAP (honest version, today)

- When I want to manage Salon Grid Studios → **nowhere. It does not exist.**
- When I want to work on my music → **nowhere. Only a suggested checklist at /business-vaults.**
- When I want to switch businesses → **no switcher exists.**
- When I get lost → **/welcome-hall works, and the site pushes me there anyway.**

---

## RECOMMENDED CHANGES (awaiting Founder approval — nothing implemented)

### FIX NOW
1. Stop `/room` redirecting a member away from their own workspace.
2. Remove or postpone the biometric Identity Check on a member's first `/workspace` visit.
3. Stop showing other members' priority businesses on his Business Vaults page.

### IMPROVE NEXT
4. Settle the word "Vault" — one meaning, rename the other two.
5. Show the active business name in the header, not just the person's name.

### BUILD LATER (needs a real decision, not a quick patch)
6. **A real vault container**: one owned record per business (name, logo, description, contacts,
   assets, money), so "Salon Grid Studios" and "Music Artist" can actually exist and be entered.
7. A vault switcher plus strict data separation between vaults.
8. Marketing workflow: clients → projects → deliverables → approval → invoice.
9. Music workflow: catalog → song status → files/masters → rights/splits → release.
10. Permission-controlled hand-off: Music Artist Vault → marketing request → Salon Grid Studios.
    Never automatic, never exposing private music files.

### DO NOT BUILD / NOT NEEDED YET
- Streaming, distributor, social or bank integrations. Fake numbers are worse than none.
- Merging the two vaults. They are two working identities.
- A second navigation system.

---

## HIS OWN ANSWERS (to be recorded separately)

Not captured — the live session with him has not happened yet. The questions in sections 8 and 19
(what you like / dislike / find confusing / would never use / need every day / want on your home
screen) still need to be asked to him directly, and his words recorded here verbatim, apart from
these automated findings.
