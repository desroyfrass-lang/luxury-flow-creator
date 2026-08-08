-- 1) has_role: switch to SECURITY INVOKER (self-scoped reads rely on user_roles RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'authenticated' AND _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$function$;

-- 2) reward_coupons: constrain self-inserted coupon values
DROP POLICY IF EXISTS "own coupon insert" ON public.reward_coupons;
CREATE POLICY "own coupon insert"
ON public.reward_coupons
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND percent_off > 0
  AND percent_off <= 40
  AND redeemed_at IS NULL
  AND order_id IS NULL
);

-- 3) affiliate_links: constrain commission_rate to policy bounds
CREATE OR REPLACE FUNCTION public.affiliate_rate_within_policy(_rate numeric)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT _rate IS NULL OR EXISTS (
    SELECT 1 FROM public.affiliate_policy p
    WHERE _rate >= p.min_commission_rate AND _rate <= p.max_commission_rate
  );
$function$;

REVOKE ALL ON FUNCTION public.affiliate_rate_within_policy(numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.affiliate_rate_within_policy(numeric) TO authenticated, service_role;

DROP POLICY IF EXISTS "Affiliate creates own links" ON public.affiliate_links;
CREATE POLICY "Affiliate creates own links"
ON public.affiliate_links
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.affiliate_rate_within_policy(commission_rate)
);

DROP POLICY IF EXISTS "Affiliate updates own links" ON public.affiliate_links;
CREATE POLICY "Affiliate updates own links"
ON public.affiliate_links
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.affiliate_rate_within_policy(commission_rate)
);