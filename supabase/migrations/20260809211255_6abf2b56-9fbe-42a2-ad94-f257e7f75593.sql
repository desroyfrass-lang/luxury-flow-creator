-- 1. Trigger-only function should never be callable through the API.
REVOKE ALL ON FUNCTION public.enforce_affiliate_campaign_rate() FROM PUBLIC, anon, authenticated;

-- 2. trust_verifications: badges are public facts, notes are not.
DROP POLICY IF EXISTS "Trust badges are public" ON public.trust_verifications;

REVOKE SELECT ON public.trust_verifications FROM anon;
REVOKE SELECT ON public.trust_verifications FROM authenticated;
GRANT SELECT (id, user_id, badge, created_at, updated_at) ON public.trust_verifications TO authenticated;
GRANT ALL ON public.trust_verifications TO service_role;

CREATE POLICY "Members see their own trust badges"
ON public.trust_verifications
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);