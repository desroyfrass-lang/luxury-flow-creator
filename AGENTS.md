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
- Canonical Daily mounts presentation-only DailyFrassy with its dedicated original asset pointer and CSS-only perimeter mask; after docking, the saved test video shares that mask with static loading/error fallback, while FrassyChat retains daily text presentation and phones reserve a viewport companion dock. Why: preserve original identity and real work without overlap, changing other wardrobe surfaces, duplicating conversation, or replaying Welcome Hall.
- Universal vendor products live in canonical_products + vendor_offers + product_sources + vendor_profiles (src/lib/vendors/products.functions.ts); source tables (cj_import_queue, merch, etc.) are never modified by drafting, and approval/verification change only inside founder_* database functions that write founder_audit_ledger atomically. Why: one product per real item, many vendor offers, and approvals that cannot be self-granted or separated from their audit record.
