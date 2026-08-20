-- 1) Artist contact emails are no longer part of any readable gallery row.
REVOKE SELECT ON public.artist_galleries FROM anon, authenticated;

GRANT SELECT (
  id, user_id, handle, display_name, disciplines, biography, artist_statement,
  hero_url, avatar_url, location, current_exhibition, commission_status,
  commission_note, commission_from_price, currency, theme, accent,
  is_published, created_at, updated_at, accepts_frass_messages
) ON public.artist_galleries TO authenticated;

GRANT SELECT (id) ON public.artist_galleries TO anon;

-- Owner-only, server-verified access to a gallery's own contact email.
CREATE OR REPLACE FUNCTION public.gallery_own_contact_email(_gallery_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.contact_email
  FROM public.artist_galleries g
  WHERE g.id = _gallery_id
    AND (g.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
$$;

REVOKE ALL ON FUNCTION public.gallery_own_contact_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gallery_own_contact_email(uuid) TO authenticated;

-- 2) A reward coupon can only ever carry the signed-in member's own email.
DROP POLICY IF EXISTS "own coupon insert" ON public.reward_coupons;
CREATE POLICY "own coupon insert" ON public.reward_coupons
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND percent_off > 0
  AND percent_off <= 40
  AND redeemed_at IS NULL
  AND order_id IS NULL
  AND email IS NOT NULL
  AND lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);