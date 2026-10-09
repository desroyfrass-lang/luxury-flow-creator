# Read-only audit: where a Founder Global Restrictions dashboard belongs

## Verdict
No restrictions dashboard exists today. The best home is the existing **Founder Control Room** (`/control-room`), inside its **Business → Commissioning** section, as one new inline panel. No new page, route or menu door is needed.

## Verified current state (R2)
- Database: `restriction_rules` = 0 rows, `restriction_rule_history` = 0 rows, `founder_audit_ledger` = 0 rows. Nothing seeded.
- Row rules present: rules — read/insert/update for signed-in users, limited by admin checks; history — read only. No delete rule (deletion blocked).
- Approval only through database function `founder_decide_restriction_rule` (writes audit ledger in the same step).
- Code: `src/lib/compliance/restriction-policy.ts` (decision logic), `restriction-preflight.ts` + `restriction-preflight.functions.ts` (checkout check, only `restrictionPreflight` exported), wired into `src/routes/checkout.tsx`.
- UI: **none**. No screen lists, edits, approves or shows history of rules. No server functions exist for listing/editing rules.

## Candidates compared
| Place | Fit | Why |
|---|---|---|
| Founder Control Room `/control-room` → Commissioning | Best | Already Founder-only twice (server door `requireFounderRoute` + `IdentityGate`), registry-driven (`src/lib/founder/command-center.ts`), already lists Payment Providers and Global Operations as launch-commerce tools |
| Global Operations `/global-operations` | Second | Founder-guarded, market-themed, but its settings are stored only in the browser; mixing server-audited rules there invites confusion |
| Founder Hall `/founder` | No | Navigation layer only, by rule never hosts tools |
| `/admin/*` console | No | Redirects into Control Room; would create a second home |
| Onboarding Room `/onboarding` | No | Member system, not administration |

## Recommended future implementation (not authorized)
1. Register one tool `global-restrictions` (kind: panel) in the Commissioning section of `command-center.ts`; render it in `control-room.tsx` like other panels.
2. New panel `src/components/founder/restrictions-panel.tsx`: rule list (status, country/region, target, reason, evidence, expiry), draft/edit form, Approve/Reject buttons, history view, current enforcement mode (off / shadow / enforce) shown read-only.
3. New Founder-only server functions `src/lib/compliance/restriction-rules.functions.ts`: list, create draft, edit, decide (calls `founder_decide_restriction_rule`), history. Each re-checks admin on the server; relies on existing row rules.
4. Add a link card from Global Operations to the panel (optional, no duplicate UI).
5. No database migration expected.

## Security concerns
- Admin vs Founder: `checkIsAdmin` treats admin and super_admin the same. Approval of legal rules should stay that way only if Founder accepts it; otherwise approval must check super_admin inside the database function (would need a migration — separate approval).
- Control Room uses `IdentityGate` re-confirmation; keep it for approve actions.
- Enforcement mode stays a server setting; the panel must never let anyone switch it.
- Never show buyer data; rules contain no personal info.

## Approval boundary
- Phase R2-UI (panel + server functions + tests): needs explicit Founder approval. Estimated 3–6 credits.
- Separately approved: super_admin-only approval change, enforcement activation, R3 (Shopify direct-checkout bypass), seeding real rules.
