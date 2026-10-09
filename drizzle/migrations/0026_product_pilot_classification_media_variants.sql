ALTER TABLE public.canonical_products
  ADD COLUMN IF NOT EXISTS category_key text CHECK (category_key IS NULL OR length(category_key) BETWEEN 3 AND 200),
  ADD COLUMN IF NOT EXISTS supplier_original_name text CHECK (supplier_original_name IS NULL OR length(supplier_original_name) <= 500);
COMMENT ON COLUMN public.canonical_products.supplier_original_name IS 'Private: original supplier title, never shown publicly.';

CREATE TABLE public.canonical_product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  url text NOT NULL CHECK (url ~ '^https://' AND length(url) <= 1000),
  position int NOT NULL DEFAULT 0 CHECK (position BETWEEN 0 AND 50),
  source text NOT NULL DEFAULT 'supplier' CHECK (source IN ('supplier','vendor_upload')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, url)
);
CREATE TABLE public.canonical_product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  source_variant_ref text NOT NULL CHECK (length(source_variant_ref) BETWEEN 1 AND 120),
  sku text CHECK (sku IS NULL OR length(sku) <= 120),
  option_label text CHECK (option_label IS NULL OR length(option_label) <= 200),
  supplier_cost numeric(12,2) CHECK (supplier_cost IS NULL OR supplier_cost >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (length(currency) = 3),
  weight_grams numeric(10,2) CHECK (weight_grams IS NULL OR weight_grams >= 0),
  image_url text CHECK (image_url IS NULL OR image_url ~ '^https://'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, source_variant_ref)
);
GRANT SELECT, INSERT, DELETE ON public.canonical_product_media, public.canonical_product_variants TO authenticated;
GRANT ALL ON public.canonical_product_media, public.canonical_product_variants TO service_role;
ALTER TABLE public.canonical_product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and Founder read media" ON public.canonical_product_media FOR SELECT TO authenticated
  USING (public.owns_canonical_product(product_id) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Owners add media" ON public.canonical_product_media FOR INSERT TO authenticated
  WITH CHECK (public.owns_canonical_product(product_id));
CREATE POLICY "Owners remove media" ON public.canonical_product_media FOR DELETE TO authenticated
  USING (public.owns_canonical_product(product_id));
CREATE POLICY "Owners and Founder read variants" ON public.canonical_product_variants FOR SELECT TO authenticated
  USING (public.owns_canonical_product(product_id) OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Owners add variants" ON public.canonical_product_variants FOR INSERT TO authenticated
  WITH CHECK (public.owns_canonical_product(product_id));
CREATE POLICY "Owners remove variants" ON public.canonical_product_variants FOR DELETE TO authenticated
  USING (public.owns_canonical_product(product_id));

-- Atomic sorted draft: product + classification + source + offer + media + variants together.
-- SECURITY INVOKER: every insert passes the caller's row rules and guard triggers.
CREATE OR REPLACE FUNCTION public.create_classified_product_draft(
  _vendor_id uuid, _title text, _description text, _source_type text, _source_ref text,
  _primary_store text, _category_key text, _supplier_original_name text,
  _offer jsonb DEFAULT NULL, _media jsonb DEFAULT '[]'::jsonb, _variants jsonb DEFAULT '[]'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE pid uuid; m jsonb; v jsonb; i int := 0;
BEGIN
  IF coalesce(_primary_store,'') = '' OR coalesce(_category_key,'') = '' THEN RAISE EXCEPTION 'Department and category are required'; END IF;
  IF split_part(_category_key,'/',1) <> _primary_store THEN RAISE EXCEPTION 'Category does not belong to the department'; END IF;
  IF jsonb_array_length(coalesce(_media,'[]')) > 20 OR jsonb_array_length(coalesce(_variants,'[]')) > 100 THEN RAISE EXCEPTION 'Too many photos or variants'; END IF;
  pid := public.create_product_draft(_vendor_id, _title, _description, _source_type, _source_ref, _offer);
  UPDATE public.canonical_products SET primary_store = _primary_store, category_key = _category_key,
    supplier_original_name = _supplier_original_name WHERE id = pid;
  FOR m IN SELECT * FROM jsonb_array_elements(coalesce(_media,'[]')) LOOP
    INSERT INTO public.canonical_product_media(product_id, url, position) VALUES (pid, m->>'url', i) ON CONFLICT DO NOTHING;
    i := i + 1;
  END LOOP;
  FOR v IN SELECT * FROM jsonb_array_elements(coalesce(_variants,'[]')) LOOP
    INSERT INTO public.canonical_product_variants(product_id, source_variant_ref, sku, option_label, supplier_cost, weight_grams, image_url)
    VALUES (pid, v->>'ref', v->>'sku', v->>'label', (v->>'cost')::numeric, (v->>'weight')::numeric, nullif(v->>'image',''));
  END LOOP;
  RETURN pid;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_classified_product_draft(uuid,text,text,text,text,text,text,text,jsonb,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_classified_product_draft(uuid,text,text,text,text,text,text,text,jsonb,jsonb,jsonb) TO authenticated;