DROP POLICY "Public read product images" ON public.product_images;
CREATE POLICY "Public read active product images"
ON public.product_images FOR SELECT
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND p.status = 'active'));

DROP POLICY "Public read product options" ON public.product_options;
CREATE POLICY "Public read active product options"
ON public.product_options FOR SELECT
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_options.product_id AND p.status = 'active'));

DROP POLICY "Public read variants" ON public.product_variants;
CREATE POLICY "Public read active product variants"
ON public.product_variants FOR SELECT
USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_variants.product_id AND p.status = 'active'));