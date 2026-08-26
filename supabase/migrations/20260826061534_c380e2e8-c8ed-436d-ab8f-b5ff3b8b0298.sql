DROP POLICY IF EXISTS "Anyone can browse live listings" ON public.card_listings;
DROP POLICY IF EXISTS "Published verified feedback is readable" ON public.verified_feedback;

REVOKE SELECT ON public.card_listings FROM anon;
REVOKE SELECT ON public.verified_feedback FROM anon;