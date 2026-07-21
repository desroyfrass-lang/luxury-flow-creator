
CREATE TABLE public.partner_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT partner_vendors_user_vendor_unique UNIQUE (user_id, vendor_id)
);

CREATE INDEX partner_vendors_user_active_idx
  ON public.partner_vendors (user_id)
  WHERE status = 'active';

CREATE INDEX partner_vendors_vendor_active_idx
  ON public.partner_vendors (vendor_id)
  WHERE status = 'active';

GRANT SELECT ON public.partner_vendors TO authenticated;
GRANT ALL ON public.partner_vendors TO service_role;

ALTER TABLE public.partner_vendors ENABLE ROW LEVEL SECURITY;

-- Partners see only their own active mappings.
CREATE POLICY "Partners view own active mappings"
  ON public.partner_vendors
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND status = 'active'
  );

-- Admins and super admins see every mapping (active and revoked, for audit).
CREATE POLICY "Admins view all partner mappings"
  ON public.partner_vendors
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- NO insert / update / delete policies for authenticated:
-- all writes must go through server functions using the service-role client,
-- which authorize the caller as admin FIRST and then emit an audit event.

-- Helper: return the vendor_ids a partner is currently allowed to access.
-- Every partner-scoped server tool must call this rather than trusting client input.
CREATE OR REPLACE FUNCTION public.get_active_partner_vendor_ids(_user_id UUID)
RETURNS TEXT[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(vendor_id ORDER BY vendor_id), ARRAY[]::TEXT[])
  FROM public.partner_vendors
  WHERE user_id = _user_id AND status = 'active';
$$;

REVOKE ALL ON FUNCTION public.get_active_partner_vendor_ids(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_partner_vendor_ids(UUID) TO authenticated, service_role;
