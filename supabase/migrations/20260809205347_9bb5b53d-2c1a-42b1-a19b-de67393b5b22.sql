-- Affiliate campaigns: clamp commission_rate to the platform policy bounds.
CREATE OR REPLACE FUNCTION public.enforce_affiliate_campaign_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  min_rate numeric;
  max_rate numeric;
  default_rate numeric;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT p.min_commission_rate, p.max_commission_rate, p.default_commission_rate
    INTO min_rate, max_rate, default_rate
  FROM public.affiliate_policy p
  LIMIT 1;

  IF NEW.commission_rate IS NULL THEN
    NEW.commission_rate := COALESCE(default_rate, 0);
  END IF;

  NEW.commission_rate := LEAST(
    GREATEST(NEW.commission_rate, COALESCE(min_rate, 0)),
    COALESCE(max_rate, NEW.commission_rate)
  );

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_affiliate_campaign_rate_trg ON public.affiliate_campaigns;
CREATE TRIGGER enforce_affiliate_campaign_rate_trg
BEFORE INSERT OR UPDATE ON public.affiliate_campaigns
FOR EACH ROW EXECUTE FUNCTION public.enforce_affiliate_campaign_rate();

-- Reward coupons: the email is derived from the account, never from client input.
CREATE OR REPLACE FUNCTION public.protect_reward_coupon_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_email text;
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.percent_off := LEAST(COALESCE(NEW.percent_off, 40), 40);
    NEW.redeemed_at := NULL;
    NEW.order_id := NULL;

    SELECT u.email INTO account_email FROM auth.users u WHERE u.id = NEW.user_id;
    IF account_email IS NULL THEN
      SELECT p.email INTO account_email FROM public.profiles p WHERE p.id = NEW.user_id;
    END IF;
    IF account_email IS NULL THEN
      RAISE EXCEPTION 'Cannot issue a reward coupon without a verified account email';
    END IF;
    NEW.email := account_email;
  ELSE
    NEW.email := OLD.email;
    NEW.user_id := OLD.user_id;
    NEW.percent_off := OLD.percent_off;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reward_coupons_protect_fields_update ON public.reward_coupons;
CREATE TRIGGER reward_coupons_protect_fields_update
BEFORE UPDATE ON public.reward_coupons
FOR EACH ROW EXECUTE FUNCTION public.protect_reward_coupon_fields();

-- Affiliate links: belt and braces — hard bound on stored commission rates.
ALTER TABLE public.affiliate_links
  DROP CONSTRAINT IF EXISTS affiliate_links_commission_rate_bounds;
ALTER TABLE public.affiliate_links
  ADD CONSTRAINT affiliate_links_commission_rate_bounds
  CHECK (commission_rate IS NULL OR (commission_rate >= 0 AND commission_rate <= 100));

ALTER TABLE public.affiliate_campaigns
  DROP CONSTRAINT IF EXISTS affiliate_campaigns_commission_rate_bounds;
ALTER TABLE public.affiliate_campaigns
  ADD CONSTRAINT affiliate_campaigns_commission_rate_bounds
  CHECK (commission_rate >= 0 AND commission_rate <= 100);