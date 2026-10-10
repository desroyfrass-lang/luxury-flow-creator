<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Identity-dependent caches (Founder/role queries, identity re-confirmations) are keyed to the signed-in user id and purged by the single root AuthIdentityWatcher (src/lib/auth/identity-watch.tsx); every exit uses secureSignOutCleanup. Why: one account's authorization must never carry to another.
- The four front-door choices in `src/routes/index.tsx` reuse existing shop, authenticated Opportunity Center, public Frass Hill town, and Kids routes; signed-out Opportunity visitors continue through `/auth?next=/opportunity`. Why: one entrance must not create another gateway or bypass first-arrival protections.
- Animation in FV Studios runs on the Frass-owned Motion Rig (src/lib/studio/motion-rig.ts, provider slug frass_motion_rig_v1): renders on the member's device, checked for playback in-browser and by WebM signature on the server, then registered by finalize_frass_native_motion_rig into studio_assets + studio_animations. Why: one owned animation path through the existing job queue and check-before-charge rule, never a parallel pipeline.
- The Studio commissioning control uses the dedicated exact Daily-source pointer for its ivory-suit disposable test through the existing waived Motion Rig path; Daily only reads that exact saved private test via owner-scoped authenticated access, never commissions another. Why: distinguish source identity and test evidence from the earlier Studio-outfit artifact without creating another engine or charging for playback.
- Canonical Daily uses its dedicated original asset and saved test while the shared FrassyChat retains conversation; Fashion Studio also presents that one chat through its approved Fashionista look with server-verified handoff context only. Why: preserve one Frassy and truthful room identity without duplicate assistants or trusted browser product metadata.

- Product taxonomy derives from existing catalogs in taxonomy/registry.ts; hierarchy.ts derives intake cascades/breadcrumbs; client/server share isPilotCategoryAllowed. Services never hold products; overlays never primary stores. Why: one classification map and explicit pilot limits.

- Restriction decisions come from the pure evaluator in src/lib/compliance/restriction-policy.ts (ALLOWED/RESTRICTED/REVIEW_REQUIRED); unverified or missing rules never yield ALLOWED and advisory trade keywords never change a decision. Why: one auditable policy model before any cart/checkout wiring.

- Checkout restriction preflight runs server-side in src/lib/compliance/restriction-preflight.functions.ts: cart lines come from Shopify, approved rules from restriction_rules (Founder-only, approval only via founder_decide_restriction_rule with audit ledger); mode is host-resolved (production off unless RESTRICTIONS_ENFORCEMENT_PRODUCTION=enforce, preview shadow unless RESTRICTIONS_ENFORCEMENT_PREVIEW=enforce). Why: staged activation without breaking live checkout.

- Global restriction rules are managed only in the Founder Control Room Commissioning panel (src/components/founder/restrictions-panel.tsx via restriction-rules.functions.ts); admins may draft, but approve/reject is super_admin-only inside founder_decide_restriction_rule and its trigger. Why: final legal decisions cannot be granted by UI or by ordinary admin rights.
- Admin and super_admin roles change only through the database function founder_set_role (super_admin required, last super_admin protected, audited in founder_audit_ledger); a trigger on user_roles blocks every other path, including server code with the service key. Lower roles may be managed by admins through the same function. Why: no admin can elevate themselves or remove the Founder.

