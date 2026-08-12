-- live_broadcasts: hide monetised affiliate link from anonymous visitors
REVOKE SELECT (affiliate_url) ON public.live_broadcasts FROM anon;

-- live_comments: hide author handle from anonymous visitors
REVOKE SELECT (author_handle) ON public.live_comments FROM anon;

-- live_gifts: hide financial detail from anonymous visitors
REVOKE SELECT (amount, currency, credits, note) ON public.live_gifts FROM anon;

-- card_orders: buyer email is server-side only
REVOKE SELECT (buyer_email) ON public.card_orders FROM anon, authenticated;
GRANT ALL ON public.card_orders TO service_role;