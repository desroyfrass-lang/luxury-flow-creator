-- Enforce commission bounds inside the existing BEFORE trigger instead of a policy helper function
CREATE OR REPLACE FUNCTION public.enforce_affiliate_link_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_rate numeric;
  min_rate numeric;
  max_rate numeric;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT ap.default_commission_rate INTO default_rate
  FROM public.affiliate_profiles ap
  WHERE ap.user_id = NEW.user_id;

  SELECT p.min_commission_rate, p.max_commission_rate
    INTO min_rate, max_rate
  FROM public.affiliate_policy p
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    NEW.commission_rate := COALESCE(default_rate, 10.00);
    NEW.status := 'active';
  ELSE
    NEW.commission_rate := OLD.commission_rate;
    NEW.status := OLD.status;
    NEW.clicks := OLD.clicks;
  END IF;

  IF NEW.commission_rate IS NOT NULL THEN
    NEW.commission_rate := LEAST(
      GREATEST(NEW.commission_rate, COALESCE(min_rate, 0)),
      COALESCE(max_rate, NEW.commission_rate)
    );
  END IF;

  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Affiliate creates own links" ON public.affiliate_links;
CREATE POLICY "Affiliate creates own links"
ON public.affiliate_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Affiliate updates own links" ON public.affiliate_links;
CREATE POLICY "Affiliate updates own links"
ON public.affiliate_links
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.affiliate_rate_within_policy(numeric);