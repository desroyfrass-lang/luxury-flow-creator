-- Live tables stay publicly readable (a livestream is a public place),
-- but the raw auth.users identifiers behind each row are not part of the
-- public UI and must not be broadcast to anonymous visitors.

-- 1. Make the public read policies explicit about who they serve.
DROP POLICY IF EXISTS "Broadcasts are visible to everyone" ON public.live_broadcasts;
CREATE POLICY "Broadcasts are visible to everyone"
  ON public.live_broadcasts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Live comments are visible to everyone" ON public.live_comments;
CREATE POLICY "Live comments are visible to everyone"
  ON public.live_comments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Gift wall is visible to everyone" ON public.live_gifts;
CREATE POLICY "Gift wall is visible to everyone"
  ON public.live_gifts FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Column-level privileges hide the identifiers. RLS decides which rows are
--    visible; these grants decide which columns come back with them.

-- live_broadcasts ----------------------------------------------------------
REVOKE SELECT ON public.live_broadcasts FROM anon, authenticated;

GRANT SELECT (
  id, host_name, host_handle, destination, purpose, title, summary, status,
  viewer_count, cover_url, product_links, affiliate_url, scheduled_for,
  started_at, ended_at, replay_url, repurposed_as, created_at, updated_at
) ON public.live_broadcasts TO anon;

-- Signed-in members additionally read host_id so a host can recognise their
-- own broadcast and see the host controls.
GRANT SELECT (
  id, host_id, host_name, host_handle, destination, purpose, title, summary,
  status, viewer_count, cover_url, product_links, affiliate_url, scheduled_for,
  started_at, ended_at, replay_url, repurposed_as, created_at, updated_at
) ON public.live_broadcasts TO authenticated;

-- live_comments ------------------------------------------------------------
REVOKE SELECT ON public.live_comments FROM anon, authenticated;

GRANT SELECT (id, broadcast_id, author_name, body, created_at)
  ON public.live_comments TO anon, authenticated;

-- live_gifts ---------------------------------------------------------------
REVOKE SELECT ON public.live_gifts FROM anon, authenticated;

GRANT SELECT (id, broadcast_id, sender_name, gift_key, credits, amount, currency, note, created_at)
  ON public.live_gifts TO anon, authenticated;

-- 3. Writes are unchanged: members still post as themselves, hosts still
--    manage their own broadcasts. Trusted server code keeps full access.
GRANT INSERT, UPDATE, DELETE ON public.live_broadcasts TO authenticated;
GRANT INSERT, DELETE ON public.live_comments TO authenticated;
GRANT INSERT ON public.live_gifts TO authenticated;

GRANT ALL ON public.live_broadcasts TO service_role;
GRANT ALL ON public.live_comments TO service_role;
GRANT ALL ON public.live_gifts TO service_role;