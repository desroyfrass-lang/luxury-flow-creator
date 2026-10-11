CREATE TABLE public.cj_shipping_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.canonical_product_variants(id) ON DELETE CASCADE,
  cj_vid text NOT NULL,
  dest_country text NOT NULL,
  method text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'USD',
  aging_days text,
  source text NOT NULL DEFAULT 'cj_freight_calculate',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  fetched_by uuid NOT NULL
);
CREATE INDEX cj_shipping_quotes_lookup ON public.cj_shipping_quotes (variant_id, dest_country, fetched_at DESC);
GRANT SELECT, INSERT ON public.cj_shipping_quotes TO authenticated;
GRANT ALL ON public.cj_shipping_quotes TO service_role;
ALTER TABLE public.cj_shipping_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder/admin read shipping quotes" ON public.cj_shipping_quotes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Founder/admin record shipping quotes" ON public.cj_shipping_quotes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND fetched_by = auth.uid());