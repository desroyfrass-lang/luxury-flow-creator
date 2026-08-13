-- 1. daily_layout_presets: hide owner_id, remove write access from anonymous visitors
REVOKE ALL ON public.daily_layout_presets FROM anon;
REVOKE ALL ON public.daily_layout_presets FROM authenticated;
GRANT SELECT (id, name, prefs, shared, created_at) ON public.daily_layout_presets TO anon;
GRANT SELECT (id, name, prefs, shared, created_at) ON public.daily_layout_presets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_layout_presets TO authenticated;
GRANT ALL ON public.daily_layout_presets TO service_role;

-- 2. founding_partners: internal Founder note is service-role/admin only
REVOKE SELECT (note) ON public.founding_partners FROM anon;
REVOKE SELECT (note) ON public.founding_partners FROM authenticated;
REVOKE SELECT (invited_by) ON public.founding_partners FROM anon;
GRANT ALL ON public.founding_partners TO service_role;

-- 3. live_broadcasts: host_id / affiliate_url never reach anonymous visitors
REVOKE SELECT (host_id, affiliate_url) ON public.live_broadcasts FROM anon;
GRANT ALL ON public.live_broadcasts TO service_role;

-- 4. live_comments: commenter identifiers never reach anonymous visitors
REVOKE SELECT (author_id, author_handle) ON public.live_comments FROM anon;
GRANT ALL ON public.live_comments TO service_role;

-- 5. live_gifts: sender identity and money values never reach anonymous visitors
REVOKE SELECT (sender_id, sender_handle, credits, amount, currency, note) ON public.live_gifts FROM anon;
GRANT ALL ON public.live_gifts TO service_role;

-- 6. First Partner membership check becomes self-only: no probing other members
CREATE OR REPLACE FUNCTION public.is_founding_partner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.founding_partners WHERE user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.is_founding_partner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_founding_partner() TO authenticated, service_role;

DROP POLICY IF EXISTS "Members see partners-only and their own record" ON public.founding_partners;
CREATE POLICY "Members see partners-only and their own record"
ON public.founding_partners FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR visibility = 'public'
  OR (visibility = 'partners' AND public.is_founding_partner())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP FUNCTION IF EXISTS public.is_founding_partner(uuid);

-- Public founding-partner policy scoped explicitly to anonymous visitors
DROP POLICY IF EXISTS "Public founding partners are visible to everyone" ON public.founding_partners;
CREATE POLICY "Public founding partners are visible to everyone"
ON public.founding_partners FOR SELECT TO anon
USING (visibility = 'public');
