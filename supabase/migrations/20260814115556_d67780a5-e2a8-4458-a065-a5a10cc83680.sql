-- FRASS-0566 Protected Contact Boundary
-- 1. Artist galleries: no anonymous access to contact_email.
REVOKE SELECT ON public.artist_galleries FROM anon;

GRANT SELECT (
  id, handle, display_name, disciplines, biography, artist_statement,
  hero_url, avatar_url, location, current_exhibition,
  commission_status, commission_note, commission_from_price, currency,
  theme, accent, is_published, created_at, updated_at
) ON public.artist_galleries TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_galleries TO authenticated;
GRANT ALL ON public.artist_galleries TO service_role;

-- 2. Contact happens through Frass, not through a published address.
ALTER TABLE public.artist_galleries
  ADD COLUMN IF NOT EXISTS accepts_frass_messages boolean NOT NULL DEFAULT true;

GRANT SELECT (accepts_frass_messages) ON public.artist_galleries TO anon;

COMMENT ON COLUMN public.artist_galleries.contact_email IS
  'FRASS-0566: private. Never granted to anon. Contact runs through the Frass Contact Builder flow.';

-- 3. Commission requests: identity can never be spoofed.
DROP POLICY IF EXISTS "Anyone can submit a commission request" ON public.commission_requests;
CREATE POLICY "Anyone can submit a commission request"
ON public.commission_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (requester_user_id IS NULL AND auth.uid() IS NULL)
  OR requester_user_id = auth.uid()
);

COMMENT ON TABLE public.commission_requests IS
  'FRASS-0566: requester_user_id is either NULL (signed-out visitor) or exactly auth.uid(); an anonymous request can never claim another member''s account. Readable only by the gallery owner or the requester.';