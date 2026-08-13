-- 1. founding_partners: partners-tier rows only visible to actual founding partners
CREATE OR REPLACE FUNCTION public.is_founding_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.founding_partners fp WHERE fp.user_id = _user_id);
$$;

REVOKE ALL ON FUNCTION public.is_founding_partner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_founding_partner(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Members see partners-only and their own record" ON public.founding_partners;
CREATE POLICY "Members see partners-only and their own record"
ON public.founding_partners FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR visibility = 'public'
  OR (visibility = 'partners' AND public.is_founding_partner(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- internal founder-only commentary: never readable through the Data API
REVOKE SELECT ON public.founding_partners FROM anon, authenticated;
GRANT SELECT (id, user_id, sequence, invited_at, accepted_at, invited_by, visibility,
  show_on_card, story_why, story_hoped, story_journey, story_lessons, story_public,
  created_at, updated_at) ON public.founding_partners TO authenticated;
GRANT SELECT (id, user_id, sequence, invited_at, accepted_at, visibility, show_on_card,
  story_why, story_hoped, story_journey, story_lessons, story_public, created_at, updated_at)
  ON public.founding_partners TO anon;
GRANT ALL ON public.founding_partners TO service_role;

-- 2. live_gifts: anonymous visitors no longer see spending amounts or sender identity
REVOKE SELECT ON public.live_gifts FROM anon, authenticated;
GRANT SELECT (id, broadcast_id, sender_name, gift_key, created_at) ON public.live_gifts TO anon;
GRANT SELECT (id, broadcast_id, sender_id, sender_name, sender_handle, gift_key, credits,
  amount, currency, note, created_at) ON public.live_gifts TO authenticated;
GRANT INSERT ON public.live_gifts TO authenticated;
GRANT ALL ON public.live_gifts TO service_role;