CREATE TABLE public.pricing_room_worksheets (
  product_id uuid PRIMARY KEY REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  destination text NOT NULL DEFAULT 'US',
  final_price numeric(12,2) CHECK (final_price IS NULL OR final_price > 0),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pricing_room_worksheets TO authenticated;
GRANT ALL ON public.pricing_room_worksheets TO service_role;
ALTER TABLE public.pricing_room_worksheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder/admin read pricing worksheets" ON public.pricing_room_worksheets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Founder/admin create pricing worksheets" ON public.pricing_room_worksheets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND updated_by = auth.uid());
CREATE POLICY "Founder/admin update pricing worksheets" ON public.pricing_room_worksheets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') AND updated_by = auth.uid());
COMMENT ON TABLE public.pricing_room_worksheets IS 'Founder Pricing Room private worksheet (overrides + last calculation). Never a product price; never shown to shoppers.';