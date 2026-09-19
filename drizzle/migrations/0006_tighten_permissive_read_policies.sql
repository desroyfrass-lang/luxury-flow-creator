-- Gift price list: only active gifts are public
DROP POLICY IF EXISTS "Gift price list is public" ON public.live_gift_catalog;
CREATE POLICY "Active gift price list is public"
ON public.live_gift_catalog
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Broadcasts: hide drafts/unpublished from the public; hosts always see their own
DROP POLICY IF EXISTS "Broadcasts are visible to everyone" ON public.live_broadcasts;
CREATE POLICY "Published broadcasts are visible"
ON public.live_broadcasts
FOR SELECT
TO anon, authenticated
USING (
  status IN ('scheduled', 'live', 'ended', 'replay')
  OR auth.uid() = host_id
);

-- Live comments: only on broadcasts the caller can actually see
DROP POLICY IF EXISTS "Live comments are visible to everyone" ON public.live_comments;
CREATE POLICY "Comments on visible broadcasts are readable"
ON public.live_comments
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.live_broadcasts b
    WHERE b.id = live_comments.broadcast_id
      AND (b.status IN ('scheduled', 'live', 'ended', 'replay') OR b.host_id = auth.uid())
  )
);

-- Gift wall: only on broadcasts the caller can actually see
DROP POLICY IF EXISTS "Gift wall is visible to everyone" ON public.live_gifts;
CREATE POLICY "Gift wall on visible broadcasts is readable"
ON public.live_gifts
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.live_broadcasts b
    WHERE b.id = live_gifts.broadcast_id
      AND (b.status IN ('scheduled', 'live', 'ended', 'replay') OR b.host_id = auth.uid())
  )
);

-- Launch programme settings: public sees only enabled notices; admins see all
DROP POLICY IF EXISTS "Anyone can read launch program settings" ON public.launch_program_settings;
CREATE POLICY "Public reads enabled launch program settings"
ON public.launch_program_settings
FOR SELECT
TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Admins read all launch program settings"
ON public.launch_program_settings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Repair patterns are internal diagnostics: staff/admin only
DROP POLICY IF EXISTS "Signed-in members read repair patterns" ON public.repair_patterns;
CREATE POLICY "Staff read repair patterns"
ON public.repair_patterns
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'staff'::app_role)
);

-- Gallery art storage: split owner-bound reads from published-artwork reads
DROP POLICY IF EXISTS "Gallery art visible when published or owned" ON storage.objects;

CREATE POLICY "Owners read their own gallery art"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'gallery-art'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

CREATE POLICY "Published gallery art is readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'gallery-art'
  AND EXISTS (
    SELECT 1
    FROM public.gallery_artworks a
    JOIN public.artist_galleries g ON g.id = a.gallery_id
    WHERE a.is_published = true
      AND g.is_published = true
      AND (a.image_url LIKE '%' || objects.name OR a.thumb_url LIKE '%' || objects.name)
  )
);
