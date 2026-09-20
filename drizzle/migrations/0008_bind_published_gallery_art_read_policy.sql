-- Gallery art files: readable only when they are the exact file referenced by a
-- genuinely published artwork in a published gallery. Suffix matching replaces
-- the old LIKE pattern so a crafted object name cannot widen the match.
DROP POLICY IF EXISTS "Published gallery art is readable" ON storage.objects;

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
      AND (
        right(a.image_url, char_length(storage.objects.name) + 1) = '/' || storage.objects.name
        OR right(a.thumb_url, char_length(storage.objects.name) + 1) = '/' || storage.objects.name
      )
  )
);