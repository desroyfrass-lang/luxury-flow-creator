-- 1. Governance policy (singleton)
CREATE TABLE public.affiliate_policy (
  id boolean PRIMARY KEY DEFAULT true,
  platform_allocation_rate numeric NOT NULL DEFAULT 8.00,
  min_commission_rate numeric NOT NULL DEFAULT 3.00,
  max_commission_rate numeric NOT NULL DEFAULT 25.00,
  default_commission_rate numeric NOT NULL DEFAULT 12.00,
  default_min_margin_pct numeric NOT NULL DEFAULT 20.00,
  promo_label text,
  promo_max_commission_rate numeric,
  promo_starts_at timestamptz,
  promo_ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT affiliate_policy_singleton CHECK (id)
);

GRANT SELECT ON public.affiliate_policy TO authenticated;
GRANT ALL ON public.affiliate_policy TO service_role;

ALTER TABLE public.affiliate_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read the affiliate framework"
  ON public.affiliate_policy FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage the affiliate framework"
  ON public.affiliate_policy FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.affiliate_policy (id) VALUES (true);

CREATE TRIGGER affiliate_policy_touch_updated_at
  BEFORE UPDATE ON public.affiliate_policy
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Product economics
CREATE TABLE public.product_economics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_ref text NOT NULL,
  title text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  selling_price numeric NOT NULL DEFAULT 0,
  cost_of_goods numeric NOT NULL DEFAULT 0,
  packaging_cost numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  other_cost numeric NOT NULL DEFAULT 0,
  payment_fee_pct numeric NOT NULL DEFAULT 2.9,
  payment_fee_fixed numeric NOT NULL DEFAULT 0.30,
  marketplace_fee_pct numeric NOT NULL DEFAULT 0,
  tax_pct numeric NOT NULL DEFAULT 0,
  discount_pct numeric NOT NULL DEFAULT 0,
  target_margin_pct numeric NOT NULL DEFAULT 20,
  estimated_monthly_units integer NOT NULL DEFAULT 0,
  affiliate_enabled boolean NOT NULL DEFAULT false,
  commission_rate numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_ref)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_economics TO authenticated;
GRANT ALL ON public.product_economics TO service_role;

ALTER TABLE public.product_economics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders manage their own product economics"
  ON public.product_economics FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can review product economics"
  ON public.product_economics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER product_economics_touch_updated_at
  BEFORE UPDATE ON public.product_economics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Affiliate campaigns
CREATE TABLE public.affiliate_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  economics_id uuid REFERENCES public.product_economics(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'standard',
  commission_rate numeric NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_campaigns TO authenticated;
GRANT ALL ON public.affiliate_campaigns TO service_role;

ALTER TABLE public.affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders manage their own affiliate campaigns"
  ON public.affiliate_campaigns FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can review affiliate campaigns"
  ON public.affiliate_campaigns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER affiliate_campaigns_touch_updated_at
  BEFORE UPDATE ON public.affiliate_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();