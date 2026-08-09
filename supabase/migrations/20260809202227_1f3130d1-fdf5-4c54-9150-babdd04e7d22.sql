CREATE POLICY "Members upload own card media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'card-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Members read own card media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'card-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Members update own card media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'card-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Members delete own card media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'card-media' AND (storage.foldername(name))[1] = (auth.uid())::text);