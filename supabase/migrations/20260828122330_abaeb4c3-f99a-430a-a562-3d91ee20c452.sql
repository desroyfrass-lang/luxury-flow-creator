-- 1. Commission requests: anon may only submit, never read/modify.
REVOKE ALL ON public.commission_requests FROM anon;
GRANT INSERT ON public.commission_requests TO anon;

-- 2. Reward coupons: no anonymous access at all.
REVOKE ALL ON public.reward_coupons FROM anon;

-- 3. Verified feedback: signed-in authors only, tied to a real transaction.
REVOKE ALL ON public.verified_feedback FROM anon;

DROP POLICY IF EXISTS "Authors write their own verified feedback" ON public.verified_feedback;
CREATE POLICY "Authors write their own verified feedback"
ON public.verified_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND source_id IS NOT NULL
  AND source IN ('marketplace_order','service','shipping','commission','project')
  AND subject_id IS DISTINCT FROM author_id
);

-- 4. has_role only answers about the caller, unless the caller is an admin.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  AND (
    auth.uid() IS NULL
    OR _user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin'::app_role, 'super_admin'::app_role)
    )
  );
$function$;