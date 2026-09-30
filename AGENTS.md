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
