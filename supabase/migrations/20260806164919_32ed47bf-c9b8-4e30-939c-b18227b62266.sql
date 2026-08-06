
-- 1) Affiliate links: block self-service changes to commission-affecting columns
CREATE OR REPLACE FUNCTION public.protect_affiliate_link_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.commission_rate := NULL;
    NEW.status := 'pending';
    NEW.clicks := 0;
    NEW.last_click_at := NULL;
    RETURN NEW;
  END IF;

  NEW.commission_rate := OLD.commission_rate;
  NEW.status := OLD.status;
  NEW.expires_at := OLD.expires_at;
  NEW.clicks := OLD.clicks;
  NEW.last_click_at := OLD.last_click_at;
  NEW.user_id := OLD.user_id;
  NEW.token := OLD.token;
  NEW.destination_type := OLD.destination_type;
  NEW.destination_handle := OLD.destination_handle;
  NEW.destination_url := OLD.destination_url;
  NEW.discount_code := OLD.discount_code;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS affiliate_links_protect_fields ON public.affiliate_links;
CREATE TRIGGER affiliate_links_protect_fields
BEFORE INSERT OR UPDATE ON public.affiliate_links
FOR EACH ROW EXECUTE FUNCTION public.protect_affiliate_link_fields();

-- 2) Reward coupons: remove self-update ability entirely
DROP POLICY IF EXISTS "own coupon update" ON public.reward_coupons;

CREATE POLICY "Admins manage reward coupons"
ON public.reward_coupons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Prevent inserting self-chosen discount values
CREATE OR REPLACE FUNCTION public.protect_reward_coupon_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.percent_off := LEAST(COALESCE(NEW.percent_off, 40), 40);
    NEW.redeemed_at := NULL;
    NEW.order_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reward_coupons_protect_fields ON public.reward_coupons;
CREATE TRIGGER reward_coupons_protect_fields
BEFORE INSERT ON public.reward_coupons
FOR EACH ROW EXECUTE FUNCTION public.protect_reward_coupon_fields();
