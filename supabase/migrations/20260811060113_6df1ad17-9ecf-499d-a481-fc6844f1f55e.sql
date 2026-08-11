REVOKE ALL ON FUNCTION public.platform_domain_paused(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_platform_protection() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_domain_paused(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.enforce_platform_protection() TO service_role;