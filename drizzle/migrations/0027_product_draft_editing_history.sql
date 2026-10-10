-- P2a: Founder + owner editing of saved drafts, with immutable private history.
CREATE TABLE public.canonical_product_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  actor_id uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  before_title text, after_title text,
  before_primary_store text, after_primary_store text,
  before_category_key text, after_category_key text
);
CREATE INDEX canonical_product_history_product_idx ON public.canonical_product_history(product_id, changed_at DESC);
ALTER TABLE public.canonical_product_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.canonical_product_history FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.canonical_product_history TO authenticated;
GRANT ALL ON public.canonical_product_history TO service_role;
CREATE POLICY "Owners and Founder read product history" ON public.canonical_product_history
  FOR SELECT TO authenticated USING (public.owns_canonical_product(product_id) OR public.has_role(auth.uid(),'admin'));

-- History is written only by this trigger, on every path that changes name/category.
CREATE OR REPLACE FUNCTION public.log_canonical_product_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.category_key IS NULL AND NEW.title IS NOT DISTINCT FROM OLD.title THEN RETURN NEW; END IF; -- initial classification at creation
  IF NEW.title IS DISTINCT FROM OLD.title OR NEW.primary_store IS DISTINCT FROM OLD.primary_store OR NEW.category_key IS DISTINCT FROM OLD.category_key THEN
    INSERT INTO public.canonical_product_history(product_id, actor_id, before_title, after_title, before_primary_store, after_primary_store, before_category_key, after_category_key)
    VALUES (NEW.id, auth.uid(), OLD.title, NEW.title, OLD.primary_store, NEW.primary_store, OLD.category_key, NEW.category_key);
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.log_canonical_product_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER log_canonical_product_change AFTER UPDATE ON public.canonical_products
  FOR EACH ROW EXECUTE FUNCTION public.log_canonical_product_change();

-- Provenance never changes: original supplier name (once set), vendor, sources, supplier photos, variants.
CREATE OR REPLACE FUNCTION public.guard_product_provenance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.supplier_original_name IS NOT NULL AND NEW.supplier_original_name IS DISTINCT FROM OLD.supplier_original_name THEN
    RAISE EXCEPTION 'The original supplier name cannot be changed';
  END IF;
  IF NEW.vendor_id IS DISTINCT FROM OLD.vendor_id THEN RAISE EXCEPTION 'The vendor of a product cannot be changed'; END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_product_provenance() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_product_provenance BEFORE UPDATE ON public.canonical_products
  FOR EACH ROW EXECUTE FUNCTION public.guard_product_provenance();

CREATE OR REPLACE FUNCTION public.guard_supplier_records()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'canonical_product_media' AND OLD.source <> 'supplier' THEN RETURN OLD; END IF;
  IF current_user = 'service_role' THEN RETURN OLD; END IF;
  RAISE EXCEPTION 'Supplier photos, variants and sources are permanent provenance records';
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_supplier_records() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_supplier_media BEFORE UPDATE OR DELETE ON public.canonical_product_media
  FOR EACH ROW EXECUTE FUNCTION public.guard_supplier_records();
CREATE TRIGGER guard_supplier_variants BEFORE UPDATE OR DELETE ON public.canonical_product_variants
  FOR EACH ROW EXECUTE FUNCTION public.guard_supplier_records();
CREATE TRIGGER guard_product_sources BEFORE UPDATE OR DELETE ON public.product_sources
  FOR EACH ROW EXECUTE FUNCTION public.guard_supplier_records();

-- The one door for editing a saved draft's name and classification (one transaction; history via trigger).
CREATE OR REPLACE FUNCTION public.update_classified_product_draft(_product_id uuid, _title text, _primary_store text, _category_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); p public.canonical_products%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF NOT (public.has_role(uid,'admin') OR public.has_role(uid,'super_admin')) THEN RAISE EXCEPTION 'Founder access only'; END IF;
  SELECT * INTO p FROM public.canonical_products WHERE id = _product_id FOR UPDATE;
  IF NOT FOUND OR NOT public.owns_vendor(p.vendor_id) THEN RAISE EXCEPTION 'Product not found'; END IF;
  IF p.draft_status NOT IN ('draft','prepared') OR p.publication_status <> 'unpublished' THEN
    RAISE EXCEPTION 'Only private drafts can be edited (this one is in review, approved or published)';
  END IF;
  _title := btrim(coalesce(_title,''));
  IF length(_title) < 3 OR length(_title) > 120 THEN RAISE EXCEPTION 'Name must be 3 to 120 characters'; END IF;
  IF coalesce(_primary_store,'') = '' OR coalesce(_category_key,'') = '' THEN RAISE EXCEPTION 'Department and category are required'; END IF;
  IF split_part(_category_key,'/',1) <> _primary_store THEN RAISE EXCEPTION 'Category does not belong to the department'; END IF;
  UPDATE public.canonical_products SET title = _title, primary_store = _primary_store, category_key = _category_key, updated_at = now()
    WHERE id = _product_id;
  RETURN jsonb_build_object('id', _product_id, 'title', _title, 'primary_store', _primary_store, 'category_key', _category_key);
END $$;
REVOKE EXECUTE ON FUNCTION public.update_classified_product_draft(uuid,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_classified_product_draft(uuid,text,text,text) TO authenticated;