# Unlock 40% OFF — First Purchase Rewards

A guided 4-step rewards flow that walks new customers through Profile, Newsletter, Email Verify, and Social Follow to earn a one-time `FIRST40` coupon, then hands them off to Capsules and Try-On.

## User flow

1. Floating "Unlock 40% OFF" ribbon + hero banner on home → opens Rewards drawer/page.
2. Rewards page shows 4 checkpoints with progress bar (0/40 → 40/40).
3. Each step has a clear CTA that navigates the user and auto-marks complete when the action is verified server-side.
4. On 100%, reveal coupon `FIRST40`, copy button, and two follow-up cards: **Explore Capsules** and **Try It On**.
5. Coupon is enforced at checkout: single-use, one-per-email, first order only, no stacking.

## Steps & unlock logic

| # | Step | +% | Unlocks when |
|---|------|----|--------------|
| 1 | Create profile + fill info (name, birthday optional, style prefs, gender, favorite categories) | 10 | All required profile fields saved |
| 2 | Join newsletter | 10 | `newsletter_opt_in = true` |
| 3 | Verify email | 10 | `auth.users.email_confirmed_at` present |
| 4 | Follow TikTok + Instagram + Facebook | 10 | User clicks each icon (opens new tab) and confirms "I Followed" |

Progress auto-saves. Signed-out users see steps but must sign in to start step 1.

## Data model (Lovable Cloud)

Extend `profiles` (or create if absent) with:
- `full_name`, `birthday`, `gender`, `style_preferences text[]`, `favorite_categories text[]`
- `newsletter_opt_in bool`, `social_followed bool`
- `reward_coupon_code text`, `reward_unlocked_at timestamptz`, `reward_redeemed_at timestamptz`

New table `newsletter_subscribers(email unique, user_id, created_at)`.

New table `reward_coupons(code unique = 'FIRST40'-per-user, user_id unique, email unique, unlocked_at, redeemed_at, order_id)` to enforce one-per-email/one-time.

RLS: users can read/update own profile & coupon; insert own newsletter row.

## Files

**New**
- `src/routes/rewards.tsx` — public Rewards page with 4 step cards, progress bar, coupon reveal, capsules/try-on CTAs.
- `src/components/rewards-ribbon.tsx` — dismissible top ribbon on home.
- `src/components/rewards-progress.tsx` — reusable progress + checklist.
- `src/lib/rewards.functions.ts` — server fns: `getRewardStatus`, `updateProfileInfo`, `subscribeNewsletter`, `confirmSocialFollow`, `claimCoupon`, `validateCouponAtCheckout`.
- `supabase/migrations/*_rewards.sql` — schema + RLS + grants.

**Edited**
- `src/routes/index.tsx` — mount `<RewardsRibbon />`.
- `src/routes/_authenticated/route.tsx` unchanged; profile edit lives at `/rewards` (works signed-in).
- `src/routes/checkout.tsx` — apply coupon field; validate + mark redeemed on order create.
- `src/components/frassy-chat.tsx` — Frassy learns about the offer; adds "Unlock 40% OFF" quick action.

## Design

Keep dark streetwear aesthetic (per memory). Chrome/gold accents on the reward badges, block-letter headers ("UNLOCK 40%"), progress bar with gold fill on dark card. Social icons row: TikTok / Instagram / Facebook, large tap targets.

## Rules enforced

- Coupon only issued after all 4 = true.
- `reward_coupons.email` unique → one per email.
- Checkout rejects if `redeemed_at` set, or if user has any prior paid order.
- Not combinable (checkout ignores other promo when `FIRST40` applied).

## Out of scope (ask if wanted)

- Real email verification emails (uses Supabase's built-in confirmation status).
- Automated verification that a user actually followed on TikTok/IG/FB (uses self-attestation, industry standard).
- Newsletter delivery integration (stores opt-in only).

Confirm and I'll build it.
