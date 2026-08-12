-- 1) Remove elevated privileges from publicly-callable helpers
CREATE OR REPLACE FUNCTION public.owns_gallery(_gallery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.artist_galleries g
    WHERE g.id = _gallery_id AND g.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.gallery_is_public(_gallery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.artist_galleries g
    WHERE g.id = _gallery_id AND g.is_published = true
  )
$$;

-- 2) Ensure the roles can reach the RLS-protected tables the helpers read
GRANT SELECT ON public.artist_galleries TO anon, authenticated;
GRANT SELECT ON public.gallery_artworks TO anon, authenticated;
GRANT ALL ON public.artist_galleries TO service_role;
GRANT ALL ON public.gallery_artworks TO service_role;

-- 3) Scope gallery-art file reads to published artwork or the owning artist
DROP POLICY IF EXISTS "Gallery art is viewable by everyone" ON storage.objects;

CREATE POLICY "Gallery art visible when published or owned"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'gallery-art'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      SELECT 1
      FROM public.gallery_artworks a
      JOIN public.artist_galleries g ON g.id = a.gallery_id
      WHERE a.is_published = true
        AND g.is_published = true
        AND (
          a.image_url LIKE '%' || storage.objects.name
          OR a.thumb_url LIKE '%' || storage.objects.name
        )
    )
  )
);