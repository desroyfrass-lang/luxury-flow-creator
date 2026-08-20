DROP POLICY IF EXISTS "Anyone can submit a commission request" ON public.commission_requests;

REVOKE EXECUTE ON FUNCTION public.gallery_own_contact_email(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gallery_own_contact_email(uuid) TO service_role;