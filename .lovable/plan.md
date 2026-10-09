# Read-only security audit: Founder identity and role granting (before any super_admin grant)

Nothing was changed. Database checks were read-only lookups.

## Current state (verified)
- Role holders: admin = 1 account, super_admin = **0**, tester = 2. No other roles held.
- The one admin account has a confirmed email and last signed in today (2026-10-09). This audit cannot prove that account belongs to the Founder. Only the Founder can confirm that (see "What the Founder must verify").
- Roles live only in `public.user_roles`. Signed-in users and visitors have no write access to that table at all, and the only read rule is "you may see your own roles". Nobody can write roles directly from a browser.
- Signing up (`handle_new_user`) creates a profile only. It never gives a role and never reads user-supplied details to decide privileges.
- `has_role` reads the table live with elevated database rights. Roles are never taken from the login token (JWT), the browser, storage or cookies.
- The old "claim site ownership" shortcut has been removed (`src/lib/admin.functions.ts`). There is no self-service bootstrap path.
- The key with full database rights (service role) is used only inside server functions (about 20 `*.functions.ts` / `*.server.ts` files) and is loaded inside handlers. It is not sent to the browser.
- Founder-only pages check access on the server (`src/lib/founder/route-guard.ts` -> `checkIsAdmin`, which accepts admin OR super_admin). The Control Room adds an identity re-check (`IdentityGate`).
- Teleport (`src/lib/founder/teleport-session.ts`) only remembers navigation in the browser. It does not impersonate other users or change who the server thinks you are.
- Restriction approval (`founder_decide_restriction_rule` and the matching guard) requires super_admin inside the database. Because nobody holds super_admin, nobody can approve rules today.

## Risks found
1. **High — any admin can promote anyone to super_admin, including themselves.** `grantRole` in `src/lib/roles.functions.ts` accepts admin OR super_admin, then writes with full database rights for any role in the list, super_admin included. The new "super_admin only" approval rule therefore holds only while no extra admin exists. `revokeRole` has the same gap, so an admin could also remove the Founder's super_admin role.
2. **Medium — role changes leave no audit trail.** `grantRole` and `revokeRole` write nothing to `founder_audit_ledger` or any history table, so there is no record of who granted what, or when.
3. **Medium — self-lockout is possible.** Nothing stops revoking the last super_admin or the last admin.
4. **Low — admin and super_admin are treated the same almost everywhere.** Page guards, `listUsersWithRoles` and `listPageFeedback` accept either role. That is acceptable for viewing, but it is the reason risk 1 exists.
5. **Low — the Roles screen shows every member's email to every admin.** `listUsersWithRoles` returns up to 200 accounts with their emails. That is fine while the only admin is the Founder.
6. **Note — the role tables have no row-level rules for writing.** Writes are blocked because signed-in users have no write access to the table, not by a written policy. Safe today, but fragile if someone later adds write access by mistake.

## Recommended safe steps (each needs separate Founder approval)
1. **Lock role granting (small migration + code change):** add a database function `founder_set_role(user, role, grant/revoke, note)` that:
   - requires super_admin to grant or revoke admin or super_admin;
   - refuses removing the last super_admin;
   - writes `founder_audit_ledger` in the same step.
   Then switch `grantRole`/`revokeRole` to call it instead of writing with full database rights. Admins could still manage lower roles, and that would be audited too.
2. **One-time Founder elevation via a reviewed migration**, after step 1. It inserts super_admin only for the account the Founder has confirmed, only if no super_admin exists yet, and writes an audit-ledger entry. The account's ID appears only inside the migration, never in chat. This is the only bootstrap path, because without step 1 any grant through the Roles screen would rely on the gap in risk 1.
3. Afterwards, decide whether the Founder keeps the admin role as well. Recommended: keep it, so nothing else breaks.
4. Add tests:
   - an admin trying to grant super_admin is refused;
   - an admin trying to revoke the Founder is refused;
   - removing the last super_admin is refused;
   - every role change appears in the audit ledger.
5. Update the R2 test script so its approval step runs as super_admin.

## What the Founder must verify personally
- In Preview, signed in, that the account shown on your Account / Identity page is yours: your email and sign-in method. Confirm it in chat as "yes, the signed-in admin account is mine". Do not paste the email.
- That you have access to that email inbox and that two-step sign-in or a passkey is turned on, if available.
- That no one else knows the password, and that none of the 2 tester accounts are yours unintentionally.
- That you approve step 1 before step 2. Elevation should not happen while risk 1 is still open.

## Approval boundary
- This audit: complete, no changes.
- Next, if approved: step 1 (lock role granting, plus tests). Estimate 2–4 credits.
- Then: step 2 (one-time super_admin grant to the confirmed Founder account), only after your explicit go-ahead.
