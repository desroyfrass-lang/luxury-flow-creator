# Read-only navigation trace: Founder Feedback and Roles & Access

No changes made. This is a report based on the current code. Nothing was run as Nicolle, and her identity check was not bypassed.

## A. Founder Feedback (/admin/feedback): reachable, but hard to find
- **Profile menu:** not listed. The Founder group in the profile menu has only Control Room, Frassy Studios, Site Management and Roles & Access.
- **Founder Hall:** no Feedback card.
- **Visible path 1 (Control Room):** open the profile menu (top right, same on desktop and in the mobile menu) → **Founder Control Room** → the **Business** door → **Commissioning** section → the **Builder insights** card. That card opens Page feedback.
- **Visible path 2 (her own Daily, Founder view only):** My Workspace → the Founder tab **Launch Feedback** → **Page feedback**.
- **Visible path 3:** inside any other admin page (for example Roles & Access), the gold row of links at the top includes **Feedback**.
- **Tester reports:** yes, this is the same inbox. Tester reports show here with a gold label "Tester · Works / Problem / Confused". The two saved test reports should appear. Only admin or super_admin accounts can open it, and the server checks this live.

## B. Roles & Access (/admin/roles): visible
- **Profile menu:** top right → group **Founder Hall** → **Roles & Access**. The same list appears in the mobile menu sheet. It only shows when the account holds admin or super_admin.
- **Founder Hall** (/founder): the **Security & Access** card.
- **Control Room:** Business → Commissioning → the **Admin roles** card.
- **Daily Founder tab:** Founder Control Room → **Roles**.

## C. What Nicolle should click right now
1. Sign in and open the **profile / account menu** (top right; on a phone it is inside the menu).
2. Under **Founder Hall**, click **Roles & Access**. (Pass the identity check if it asks.)
3. On that page, in the gold link row near the top, click **Feedback**.

Both pages are reached in two clicks, with no hunting needed. She can also type the addresses `/admin/roles` and `/admin/feedback` directly.

## D. Navigation defects found (reported, not fixed)
1. **"Site Management" / "Admin" is a loop.** It points to `/admin`, but that address sends you straight back to the Control Room. So the gold admin link row, which is the only full list including Feedback, never appears unless you first enter a specific admin page. This is most likely why Nicolle could not find Feedback.
2. **Feedback has no entry in the profile menu or Founder Hall.** It is only reachable through a card labelled "Builder insights", which doesn't use the word Feedback, or through the Daily Founder tabs.
3. **Founder Hall itself isn't in the profile menu.** The menu group is named "Founder Hall", but it has no link to the Founder Hall page. The only link to it is inside the Teleporter panel.
4. Minor: the "Owner · Operator" role summary lists "Admin Console" pointing to the Control Room, which duplicates the entry above it.

## Technical details
- Profile menu: `src/lib/navigation/account-menu.ts` (Founder group appears only for admin or super_admin).
- Founder Hall cards: `src/lib/founder/founder-hall.ts` ("security" → /admin/roles; "site-management" → /admin; no feedback entry).
- `/admin` redirect: `src/routes/_authenticated/admin.index.tsx` → /control-room.
- Admin link row: `src/routes/_authenticated/admin.tsx` (it only draws on /admin/* child pages).
- Control Room cards: `src/components/founder/commissioning-panel.tsx` (Builder insights, Admin roles), under the Business group in `src/lib/founder/command-center.ts`.
- Daily Founder tabs: `src/lib/workspace/founder-os.ts` (feedback, command).

No Step 9 repair, no Sheldon assignment, no deployment.
