-- 1. Profiles: remove broad row-level public reads, use column-limited anon access
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by anon" ON public.profiles;

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, display_name, handle, avatar_url, bio, builder_stage, primary_district, is_public, created_at, updated_at)
  ON public.profiles TO anon;

CREATE POLICY "Anon can view public profile cards"
  ON public.profiles FOR SELECT TO anon
  USING (is_public = true);

-- 2. Partner vendor lookup: run as caller, relying on partner_vendors RLS
CREATE OR REPLACE FUNCTION public.get_active_partner_vendor_ids(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(array_agg(vendor_id ORDER BY vendor_id), ARRAY[]::TEXT[])
  FROM public.partner_vendors
  WHERE user_id = _user_id AND status = 'active';
$function$;