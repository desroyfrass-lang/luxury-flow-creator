CREATE OR REPLACE FUNCTION public.enforce_affiliate_profile_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  min_rate numeric;
  max_rate numeric;
  default_rate numeric;
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT p.min_commission_rate, p.max_commission_rate, p.default_commission_rate
    INTO min_rate, max_rate, default_rate
  FROM public.affiliate_policy p
  LIMIT 1;

  IF NEW.default_commission_rate IS NULL THEN
    NEW.default_commission_rate := COALESCE(default_rate, 10.00);
  END IF;

  NEW.default_commission_rate := LEAST(
    GREATEST(NEW.default_commission_rate, COALESCE(min_rate, 0)),
    COALESCE(max_rate, NEW.default_commission_rate)
  );

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
    NEW.payout_status := OLD.payout_status;
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_affiliate_profile_rate_trg ON public.affiliate_profiles;
CREATE TRIGGER enforce_affiliate_profile_rate_trg
BEFORE INSERT OR UPDATE ON public.affiliate_profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_affiliate_profile_rate();

DROP POLICY IF EXISTS "Affiliate updates own profile" ON public.affiliate_profiles;
CREATE POLICY "Affiliate updates own profile"
ON public.affiliate_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND default_commission_rate >= COALESCE((SELECT p.min_commission_rate FROM public.affiliate_policy p LIMIT 1), 0)
  AND default_commission_rate <= COALESCE((SELECT p.max_commission_rate FROM public.affiliate_policy p LIMIT 1), 100)
);

DROP POLICY IF EXISTS "Builders manage their own affiliate campaigns" ON public.affiliate_campaigns;
CREATE POLICY "Builders manage their own affiliate campaigns"
ON public.affiliate_campaigns FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND commission_rate >= COALESCE((SELECT p.min_commission_rate FROM public.affiliate_policy p LIMIT 1), 0)
  AND commission_rate <= COALESCE((SELECT p.max_commission_rate FROM public.affiliate_policy p LIMIT 1), 100)
);