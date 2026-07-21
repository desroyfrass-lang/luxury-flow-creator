REVOKE EXECUTE ON FUNCTION public.ensure_affiliate_profile() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_affiliate_profile() FROM anon;
REVOKE EXECUTE ON FUNCTION public.ensure_affiliate_profile() FROM authenticated;