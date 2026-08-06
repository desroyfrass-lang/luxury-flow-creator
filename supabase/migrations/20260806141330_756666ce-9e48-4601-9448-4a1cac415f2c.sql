DROP POLICY IF EXISTS "Public can read site-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read site-media" ON storage.objects;

CREATE POLICY "Admins can read site-images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read site-media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'::app_role));