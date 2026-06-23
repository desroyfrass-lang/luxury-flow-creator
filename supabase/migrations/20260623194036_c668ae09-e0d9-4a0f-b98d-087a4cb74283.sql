CREATE TABLE public.customer_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  label text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_photos TO authenticated;
GRANT ALL ON public.customer_photos TO service_role;

ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own photos"
  ON public.customer_photos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all photos"
  ON public.customer_photos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX customer_photos_user_idx ON public.customer_photos (user_id, created_at DESC);

CREATE TRIGGER update_customer_photos_updated_at
  BEFORE UPDATE ON public.customer_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tryon_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_photo_id uuid REFERENCES public.customer_photos(id) ON DELETE SET NULL,
  source_photo_url text NOT NULL,
  result_url text,
  cart_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tryon_looks TO authenticated;
GRANT ALL ON public.tryon_looks TO service_role;

ALTER TABLE public.tryon_looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own looks"
  ON public.tryon_looks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all looks"
  ON public.tryon_looks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX tryon_looks_user_idx ON public.tryon_looks (user_id, created_at DESC);

CREATE TRIGGER update_tryon_looks_updated_at
  BEFORE UPDATE ON public.tryon_looks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users read own tryon files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tryon-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own tryon files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tryon-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own tryon files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tryon-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own tryon files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tryon-photos' AND (storage.foldername(name))[1] = auth.uid()::text);