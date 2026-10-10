-- Try-On Phase B: private Founder/admin readiness records, one per canonical variant.
CREATE TABLE public.tryon_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL UNIQUE REFERENCES public.canonical_product_variants(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_ready' CHECK (status IN ('not_ready','in_review','ready','needs_rereview','not_supported')),
  method text CHECK (method IN ('full_body_garment','feet_legs','head_shoulders')),
  approved_image_url text,
  current_fingerprint text NOT NULL DEFAULT '',
  approved_fingerprint text,
  review_note text NOT NULL DEFAULT '' CHECK (char_length(review_note) <= 2000),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tryon_readiness TO authenticated;
GRANT ALL ON public.tryon_readiness TO service_role;
ALTER TABLE public.tryon_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder staff read try-on readiness" ON public.tryon_readiness
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- Fingerprint = what matters for try-on: size label, variant photo, product photos, category. Never price or stock.
CREATE OR REPLACE FUNCTION public.tryon_variant_fingerprint(_variant_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(coalesce(v.option_label,'') || '|' || coalesce(v.image_url,'') || '|' || coalesce(p.category_key,'') || '|' ||
    coalesce((SELECT string_agg(m.url, ',' ORDER BY m.position, m.url) FROM public.canonical_product_media m WHERE m.product_id = v.product_id),''))
  FROM public.canonical_product_variants v JOIN public.canonical_products p ON p.id = v.product_id
  WHERE v.id = _variant_id
$$;
REVOKE ALL ON FUNCTION public.tryon_variant_fingerprint(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.tryon_refresh_product(_product_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.tryon_readiness(product_id, variant_id, current_fingerprint)
  SELECT v.product_id, v.id, public.tryon_variant_fingerprint(v.id)
  FROM public.canonical_product_variants v WHERE v.product_id = _product_id
  ON CONFLICT (variant_id) DO NOTHING;
  UPDATE public.tryon_readiness r SET
    current_fingerprint = public.tryon_variant_fingerprint(r.variant_id),
    status = CASE WHEN r.status IN ('ready','in_review') AND r.approved_fingerprint IS DISTINCT FROM public.tryon_variant_fingerprint(r.variant_id)
                  THEN 'needs_rereview' ELSE r.status END,
    updated_at = now()
  WHERE r.product_id = _product_id AND r.current_fingerprint IS DISTINCT FROM public.tryon_variant_fingerprint(r.variant_id);
END $$;
REVOKE ALL ON FUNCTION public.tryon_refresh_product(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.tryon_on_variant_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.tryon_refresh_product(coalesce(NEW.product_id, OLD.product_id)); RETURN NULL; END $$;
CREATE TRIGGER tryon_variant_queue AFTER INSERT OR UPDATE OF option_label, image_url ON public.canonical_product_variants
  FOR EACH ROW EXECUTE FUNCTION public.tryon_on_variant_change();
CREATE TRIGGER tryon_media_rereview AFTER INSERT OR UPDATE OR DELETE ON public.canonical_product_media
  FOR EACH ROW EXECUTE FUNCTION public.tryon_on_variant_change();

CREATE OR REPLACE FUNCTION public.tryon_on_product_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.tryon_refresh_product(NEW.id); RETURN NULL; END $$;
CREATE TRIGGER tryon_category_rereview AFTER UPDATE OF category_key ON public.canonical_products
  FOR EACH ROW EXECUTE FUNCTION public.tryon_on_product_change();

-- The only way to change a status: audited, Founder/admin only.
CREATE OR REPLACE FUNCTION public.founder_decide_tryon_readiness(_variant_id uuid, _status text, _method text, _note text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); r record; v record; p record;
BEGIN
  IF uid IS NULL OR NOT (public.has_role(uid,'admin') OR public.has_role(uid,'super_admin')) THEN RAISE EXCEPTION 'Founder access only'; END IF;
  IF _status NOT IN ('not_ready','in_review','ready','not_supported') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF _method IS NOT NULL AND _method NOT IN ('full_body_garment','feet_legs','head_shoulders') THEN RAISE EXCEPTION 'Invalid method'; END IF;
  SELECT * INTO r FROM public.tryon_readiness WHERE variant_id = _variant_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Not in the preparation queue'; END IF;
  SELECT * INTO v FROM public.canonical_product_variants WHERE id = _variant_id;
  SELECT * INTO p FROM public.canonical_products WHERE id = v.product_id;
  IF _status = 'ready' THEN
    IF _method IS DISTINCT FROM 'full_body_garment' THEN RAISE EXCEPTION 'Only full-body garment try-on can be marked ready in this phase'; END IF;
    IF coalesce(p.category_key,'') ~* '(kids|shape|swim|intimate|bridal)' THEN RAISE EXCEPTION 'This category is not approved for try-on yet'; END IF;
    IF v.image_url IS NULL OR v.image_url !~ '^https://' THEN RAISE EXCEPTION 'A verified variant photo is required'; END IF;
    IF length(btrim(coalesce(_note,''))) < 10 THEN RAISE EXCEPTION 'Write a short review note (what you checked)'; END IF;
  END IF;
  UPDATE public.tryon_readiness SET
    status = _status, method = _method,
    approved_image_url = CASE WHEN _status = 'ready' THEN v.image_url ELSE NULL END,
    approved_fingerprint = CASE WHEN _status IN ('ready','in_review') THEN public.tryon_variant_fingerprint(_variant_id) ELSE NULL END,
    current_fingerprint = public.tryon_variant_fingerprint(_variant_id),
    review_note = left(coalesce(_note,''), 2000), reviewed_by = uid, reviewed_at = now(), updated_at = now()
  WHERE id = r.id;
  INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
  VALUES (uid, 'tryon-readiness:' || _variant_id, 0,
          'Try-on readiness ' || r.status || ' → ' || _status || ': ' || coalesce(p.title,'') || ' / ' || coalesce(v.option_label,''),
          '/admin/tryon-prep', 'user', left('Variant ' || _variant_id || ' method ' || coalesce(_method,'none') || '. ' || coalesce(_note,''), 20000));
  RETURN jsonb_build_object('variant_id', _variant_id, 'status', _status);
END $$;
REVOKE ALL ON FUNCTION public.founder_decide_tryon_readiness(uuid,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_decide_tryon_readiness(uuid,text,text,text) TO authenticated, service_role;

-- Backfill: queue every existing variant as not ready.
INSERT INTO public.tryon_readiness(product_id, variant_id, current_fingerprint)
SELECT v.product_id, v.id, public.tryon_variant_fingerprint(v.id) FROM public.canonical_product_variants v
ON CONFLICT (variant_id) DO NOTHING;