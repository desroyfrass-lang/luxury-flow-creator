CREATE TABLE public.hidden_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venture text NOT NULL DEFAULT 'coin-collection',
  category text NOT NULL DEFAULT 'coins',
  name text NOT NULL,
  notes text,
  country text,
  year_text text,
  denomination text,
  markings text,
  condition_note text,
  front_path text,
  back_path text,
  research_notes text,
  estimated_low numeric(12,2),
  estimated_high numeric(12,2),
  appraisal_recommended boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'documented',
  listing_title text,
  listing_description text,
  listing_price numeric(12,2),
  sold_amount numeric(12,2),
  sold_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hidden_assets_status_check CHECK (status IN ('documented','identified','valued','listed','sold','kept')),
  CONSTRAINT hidden_assets_estimate_check CHECK (
    (estimated_low IS NULL OR estimated_low >= 0)
    AND (estimated_high IS NULL OR estimated_high >= 0)
    AND (estimated_low IS NULL OR estimated_high IS NULL OR estimated_high >= estimated_low)
  ),
  CONSTRAINT hidden_assets_money_check CHECK (
    (listing_price IS NULL OR (listing_price >= 0 AND listing_price <= 1000000))
    AND (sold_amount IS NULL OR (sold_amount >= 0 AND sold_amount <= 1000000))
  )
);

CREATE INDEX hidden_assets_user_idx ON public.hidden_assets (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hidden_assets TO authenticated;
GRANT ALL ON public.hidden_assets TO service_role;

ALTER TABLE public.hidden_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own hidden assets"
  ON public.hidden_assets FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER hidden_assets_updated_at
  BEFORE UPDATE ON public.hidden_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members read their own asset photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'hidden-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members upload their own asset photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hidden-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members update their own asset photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hidden-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members delete their own asset photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hidden-assets' AND (storage.foldername(name))[1] = auth.uid()::text);