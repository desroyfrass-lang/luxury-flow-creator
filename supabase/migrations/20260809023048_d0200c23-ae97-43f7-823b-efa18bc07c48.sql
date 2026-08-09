CREATE POLICY "Members upload own launch feedback files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'launch-feedback' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members read own launch feedback files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'launch-feedback' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Admins delete launch feedback files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'launch-feedback' AND (
      public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
    )
  );
