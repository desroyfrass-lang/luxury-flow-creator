CREATE TABLE public.fashion_design_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.canonical_product_variants(id) ON DELETE CASCADE,
  concept text NOT NULL DEFAULT '' CHECK (char_length(concept) <= 4000),
  styling_direction text NOT NULL DEFAULT '' CHECK (char_length(styling_direction) <= 4000),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 4000),
  created_by uuid NOT NULL,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, variant_id)
);

GRANT SELECT, INSERT, UPDATE ON public.fashion_design_briefs TO authenticated;
GRANT ALL ON public.fashion_design_briefs TO service_role;
ALTER TABLE public.fashion_design_briefs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_fashion_brief(_product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR EXISTS (
    SELECT 1 FROM public.canonical_products p JOIN public.vendor_profiles v ON v.id = p.vendor_id
    WHERE p.id = _product_id AND v.owner_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.can_access_fashion_brief(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_fashion_brief(uuid) TO authenticated, service_role;

CREATE POLICY "Founder or owner reads fashion briefs" ON public.fashion_design_briefs
  FOR SELECT TO authenticated USING (public.can_access_fashion_brief(product_id));
CREATE POLICY "Founder or owner creates fashion briefs" ON public.fashion_design_briefs
  FOR INSERT TO authenticated WITH CHECK (public.can_access_fashion_brief(product_id) AND created_by = auth.uid() AND updated_by = auth.uid());
CREATE POLICY "Founder or owner updates fashion briefs" ON public.fashion_design_briefs
  FOR UPDATE TO authenticated USING (public.can_access_fashion_brief(product_id)) WITH CHECK (public.can_access_fashion_brief(product_id) AND updated_by = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_fashion_brief()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.canonical_product_variants WHERE id = NEW.variant_id AND product_id = NEW.product_id) THEN
    RAISE EXCEPTION 'Variant does not belong to this product';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.canonical_products WHERE id = NEW.product_id AND publication_status = 'unpublished' AND draft_status <> 'rejected') THEN
    RAISE EXCEPTION 'Design briefs are for open private drafts only';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.product_id := OLD.product_id; NEW.variant_id := OLD.variant_id;
    NEW.created_by := OLD.created_by; NEW.created_at := OLD.created_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_fashion_brief BEFORE INSERT OR UPDATE ON public.fashion_design_briefs
  FOR EACH ROW EXECUTE FUNCTION public.guard_fashion_brief();