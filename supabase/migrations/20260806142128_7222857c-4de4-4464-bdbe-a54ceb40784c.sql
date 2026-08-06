DROP POLICY IF EXISTS "Anon can view public profile cards" ON public.profiles;
REVOKE ALL ON public.profiles FROM anon;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
SELECT id, display_name, handle, avatar_url, bio, builder_stage, primary_district, created_at, updated_at
FROM public.profiles
WHERE is_public = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;