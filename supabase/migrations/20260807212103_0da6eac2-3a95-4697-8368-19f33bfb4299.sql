ALTER TABLE public.product_visual_embeddings
  ADD CONSTRAINT product_visual_embeddings_source_type_catalog_only
  CHECK (source_type IN ('product', 'viral_product'));

DROP POLICY IF EXISTS "Anyone can read product visual embeddings" ON public.product_visual_embeddings;

CREATE POLICY "Public can read catalog visual embeddings"
ON public.product_visual_embeddings
FOR SELECT
USING (source_type IN ('product', 'viral_product'));