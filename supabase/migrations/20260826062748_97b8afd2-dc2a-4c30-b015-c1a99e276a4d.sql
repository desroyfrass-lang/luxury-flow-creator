
-- 1) has_role: real lookup for any user, no self-only short circuit
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) commission_requests: identity enforced per role
DROP POLICY IF EXISTS "Anyone can request a commission from a published gallery" ON public.commission_requests;

CREATE POLICY "Visitors can request a commission anonymously"
ON public.commission_requests FOR INSERT TO anon
WITH CHECK (
  gallery_is_public(gallery_id)
  AND status = 'new'
  AND artist_note IS NULL
  AND requester_user_id IS NULL
);

CREATE POLICY "Members request commissions as themselves"
ON public.commission_requests FOR INSERT TO authenticated
WITH CHECK (
  gallery_is_public(gallery_id)
  AND status = 'new'
  AND artist_note IS NULL
  AND requester_user_id = auth.uid()
);

-- 3) product_visual_embeddings: no direct public read (search runs server-side)
DROP POLICY IF EXISTS "Public can read catalog visual embeddings" ON public.product_visual_embeddings;
REVOKE ALL ON TABLE public.product_visual_embeddings FROM anon;
GRANT ALL ON TABLE public.product_visual_embeddings TO service_role;

-- 4) studio_platform_credentials: explicit fail-closed
REVOKE ALL ON TABLE public.studio_platform_credentials FROM anon, authenticated;
GRANT ALL ON TABLE public.studio_platform_credentials TO service_role;
ALTER TABLE public.studio_platform_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform credentials are never client readable" ON public.studio_platform_credentials;
CREATE POLICY "Platform credentials are never client readable"
ON public.studio_platform_credentials FOR SELECT TO authenticated
USING (false);
