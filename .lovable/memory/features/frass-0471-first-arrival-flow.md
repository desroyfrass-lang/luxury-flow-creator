---
name: FRASS-0471 First-Time Arrival Flow
description: frasskicks.com always shows "Welcome to FrassKicks" with two doors; Shop requires a FrassKicks profile first, Hill goes to the Welcome Hall; one account covers both; visible Sign Out in nav plus profile menu; /fresh-start for clean tests
type: feature
---

# FRASS-0471 — First-Time Arrival Flow

- `/` **never auto-redirects**. Typing frasskicks.com always shows
  "Welcome to FrassKicks" with exactly two choices: 🛍 Shop Frass District and
  🏞 Enter Frass Hill. The old "skip entrance" preference and one-hour TTL
  redirect were removed.
- **Shop door**: signed out → `/join/frasskicks` (Frassy: "Before we begin
  shopping, let's create your FrassKicks profile"), then `/frass-district`.
  Signed in → straight to `/frass-district`.
- **Hill door**: signed out → `/join/frass-hill` (the Welcome Hall
  registration, which states plainly that joining creates BOTH the Frass Hill
  membership and the FrassKicks customer profile). Signed in → `/welcome`,
  the only place that decides first-time vs returning.
- **Sign out**: one secure logout (`useSecureSignOut`), two access points —
  the always-visible button on the nav bar (`NavSignOutButton` in
  gateway-nav, `HeaderSignOut` in site-shell) and the existing profile-menu
  entry. Never add a third logout implementation.
- **`/fresh-start`**: clean-arrival test route. Global sign-out plus
  localStorage/sessionStorage wipe, so a tester experiences the platform as a
  brand-new visitor.

Founder Principle: every first-time visitor experiences Frass exactly as
designed — from the first welcome screen to the first Daily. No one should
have to discover the experience by clicking around.
