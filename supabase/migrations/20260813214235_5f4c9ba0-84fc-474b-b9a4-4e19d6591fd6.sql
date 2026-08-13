REVOKE ALL ON FUNCTION public.protect_founding_partner_self_update() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.protect_founding_partner_self_update() TO service_role;