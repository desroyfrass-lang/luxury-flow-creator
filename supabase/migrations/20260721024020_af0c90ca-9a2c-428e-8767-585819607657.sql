-- Spec 036 Phase 1: Affiliate Workspace foundation
ALTER TABLE public.viral_products
  ADD COLUMN IF NOT EXISTS approved_for_promotion boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visual_indexing_approved boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2);

-- affiliate_profiles
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  default_commission_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  payout_method text,
  payout_destination_masked text,
  payout_status text NOT NULL DEFAULT 'unverified',
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.affiliate_profiles TO authenticated;
GRANT ALL ON public.affiliate_profiles TO service_role;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate reads own profile" ON public.affiliate_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Affiliate updates own profile" ON public.affiliate_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage affiliate profiles" ON public.affiliate_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER affiliate_profiles_touch_updated_at BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- affiliate_links
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  label text,
  destination_type text NOT NULL,
  destination_handle text NOT NULL,
  destination_url text NOT NULL,
  discount_code text,
  campaign_id uuid,
  commission_rate numeric(5,2),
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  clicks int NOT NULL DEFAULT 0,
  last_click_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliate_links_user_idx ON public.affiliate_links(user_id, status);
GRANT SELECT, INSERT, UPDATE ON public.affiliate_links TO authenticated;
GRANT ALL ON public.affiliate_links TO service_role;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate reads own links" ON public.affiliate_links FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Affiliate creates own links" ON public.affiliate_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Affiliate updates own links" ON public.affiliate_links FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all links" ON public.affiliate_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER affiliate_links_touch_updated_at BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- commissions (append-only)
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_id uuid REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
  shopify_order_id text NOT NULL,
  shopify_order_name text,
  shopify_line_item_id text,
  order_total numeric(12,2) NOT NULL,
  commissionable_amount numeric(12,2) NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  attribution_source text NOT NULL,
  order_created_at timestamptz NOT NULL,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Idempotency: one commission per (order, line). NULL line = order-level.
CREATE UNIQUE INDEX IF NOT EXISTS commissions_order_line_uniq
  ON public.commissions (shopify_order_id, COALESCE(shopify_line_item_id, ''));
CREATE INDEX IF NOT EXISTS commissions_user_idx
  ON public.commissions(user_id, status, order_created_at DESC);
GRANT SELECT ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate reads own commissions" ON public.commissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage commissions" ON public.commissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- commission_adjustments (append-only)
CREATE TABLE IF NOT EXISTS public.commission_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL REFERENCES public.commissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta_amount numeric(12,2) NOT NULL,
  reason text NOT NULL,
  reason_note text,
  adjusted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS commission_adjustments_commission_idx
  ON public.commission_adjustments(commission_id);
GRANT SELECT ON public.commission_adjustments TO authenticated;
GRANT ALL ON public.commission_adjustments TO service_role;
ALTER TABLE public.commission_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate reads own adjustments" ON public.commission_adjustments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage adjustments" ON public.commission_adjustments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- affiliate_clicks
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id bigserial PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  country text,
  device text
);
CREATE INDEX IF NOT EXISTS affiliate_clicks_link_time_idx
  ON public.affiliate_clicks(link_id, clicked_at DESC);
GRANT SELECT ON public.affiliate_clicks TO authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate reads own clicks" ON public.affiliate_clicks FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.affiliate_links l
    WHERE l.id = affiliate_clicks.link_id
      AND (l.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "Admins manage clicks" ON public.affiliate_clicks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-provision affiliate profile on role grant
CREATE OR REPLACE FUNCTION public.ensure_affiliate_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'affiliate' THEN
    INSERT INTO public.affiliate_profiles (user_id) VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_ensure_affiliate ON public.user_roles;
CREATE TRIGGER user_roles_ensure_affiliate
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_affiliate_profile();

INSERT INTO public.affiliate_profiles (user_id)
SELECT user_id FROM public.user_roles WHERE role = 'affiliate'
ON CONFLICT (user_id) DO NOTHING;