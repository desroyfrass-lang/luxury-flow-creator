-- 1. affiliate_policy: restrict reads to admins and affiliates only
DROP POLICY IF EXISTS "Anyone signed in can read the affiliate framework" ON public.affiliate_policy;

CREATE POLICY "Admins and affiliates read the affiliate framework"
ON public.affiliate_policy
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'affiliate'::app_role)
  OR public.has_role(auth.uid(), 'partner'::app_role)
  OR public.has_role(auth.uid(), 'ambassador'::app_role)
);

-- 2. affiliate_clicks: click recording is server-side only (service role).
-- Make the fail-closed posture explicit so no client can forge click rows.
REVOKE INSERT, UPDATE, DELETE ON public.affiliate_clicks FROM anon, authenticated;
GRANT SELECT ON public.affiliate_clicks TO authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;