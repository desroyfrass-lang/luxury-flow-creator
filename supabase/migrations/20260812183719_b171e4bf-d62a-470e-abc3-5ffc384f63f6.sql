-- FRASS-0485 — gallery-art bucket access.
CREATE POLICY "Gallery art is viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-art');

CREATE POLICY "Artists upload their own gallery art"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery-art' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Artists update their own gallery art"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery-art' AND (storage.foldername(name))[1] = (auth.uid())::text)
  WITH CHECK (bucket_id = 'gallery-art' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Artists delete their own gallery art"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery-art' AND (storage.foldername(name))[1] = (auth.uid())::text);