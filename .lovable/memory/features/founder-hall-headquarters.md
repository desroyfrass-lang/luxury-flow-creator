---
name: Founder Hall headquarters architecture
description: Founder Hall (/founder) is the single Founder/Admin headquarters; Control Room and Onboarding Room are separate protected rooms reached from it
type: feature
---
ONE HEADQUARTERS, MANY PROTECTED ROOMS.

- Founder Hall at `/founder` is the only Founder/Admin home. Never create another
  admin home, founder dashboard or competing headquarters.
- It is a navigation + attention layer only. Never render every admin tool on it.
- Control Room (`/control-room`) is a major protected ROOM, not the front door.
  Never merge it into onboarding, never delete it, never expose it.
- The Onboarding Room (`/onboarding`) is the members' system. Never make a
  Founder-only copy; the Founder reaches the real one through Founder Hall/TP.
- Founder TP pins quick jumps (Onboarding Room, Control Room, Studios, Vaults,
  Security & Access, Site Management) and always offers a way back to HQ.
- Every room verifies authorization server-side on its own. Menu visibility is
  never security. Unauthorized visitors go to the Welcome Hall, never sideways
  into another Founder route.
- Founder Hall always offers an intentional "Enter Frass Hill" door into the
  member experience, kept visually separate from administration.
- Never fabricate an admin area to satisfy a heading; report it as missing.
