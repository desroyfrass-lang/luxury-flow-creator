CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_founding_partner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.founding_partners WHERE user_id = auth.uid()
  )
$function$;

REVOKE ALL ON FUNCTION private.is_founding_partner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_founding_partner() TO authenticated, service_role;

DROP POLICY IF EXISTS "Members see partners-only and their own record" ON public.founding_partners;

CREATE POLICY "Members see partners-only and their own record"
ON public.founding_partners
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR visibility = 'public'
  OR (visibility = 'partners' AND private.is_founding_partner())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP FUNCTION IF EXISTS public.is_founding_partner();