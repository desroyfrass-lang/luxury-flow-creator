DROP POLICY IF EXISTS "Anyone can view live listings" ON public.card_listings;
REVOKE SELECT ON public.card_listings FROM anon;