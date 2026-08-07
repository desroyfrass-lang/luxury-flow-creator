CREATE OR REPLACE FUNCTION public.enforce_affiliate_link_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_rate numeric;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT ap.default_commission_rate INTO default_rate
  FROM public.affiliate_profiles ap
  WHERE ap.user_id = NEW.user_id;

  IF TG_OP = 'INSERT' THEN
    NEW.commission_rate := COALESCE(default_rate, 10.00);
    NEW.status := 'active';
  ELSE
    NEW.commission_rate := OLD.commission_rate;
    NEW.status := OLD.status;
    NEW.clicks := OLD.clicks;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_affiliate_link_rate_trg ON public.affiliate_links;
CREATE TRIGGER enforce_affiliate_link_rate_trg
BEFORE INSERT OR UPDATE ON public.affiliate_links
FOR EACH ROW EXECUTE FUNCTION public.enforce_affiliate_link_rate();