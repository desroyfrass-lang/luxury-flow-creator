DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

REVOKE ALL ON FUNCTION public.purge_expired_visual_uploads() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_visual_uploads() TO service_role;

REVOKE ALL ON FUNCTION public.get_active_partner_vendor_ids(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_partner_vendor_ids(uuid) TO authenticated, service_role;