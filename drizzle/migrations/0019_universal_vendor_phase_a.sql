-- Universal Vendor Phase A: canonical products, vendors, offers, source provenance.
CREATE TABLE public.vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 160),
  vendor_kind text NOT NULL DEFAULT 'artisan' CHECK (vendor_kind IN ('supplier','artisan','pod','frass_brand','designer')),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','suspended')),
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vendor_profiles_owner_idx ON public.vendor_profiles(owner_id);

CREATE TABLE public.canonical_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '',
  primary_store text,
  overlays text[] NOT NULL DEFAULT '{}',
  draft_status text NOT NULL DEFAULT 'draft' CHECK (draft_status IN ('draft','prepared','founder_review','approved','rejected')),
  publication_status text NOT NULL DEFAULT 'unpublished' CHECK (publication_status IN ('unpublished','published')),
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX canonical_products_vendor_idx ON public.canonical_products(vendor_id);

CREATE TABLE public.vendor_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE RESTRICT,
  sku text,
  unit_cost numeric(12,2) CHECK (unit_cost IS NULL OR unit_cost >= 0),
  currency text NOT NULL DEFAULT 'USD',
  stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  lead_time_min_days integer CHECK (lead_time_min_days IS NULL OR lead_time_min_days >= 0),
  lead_time_max_days integer CHECK (lead_time_max_days IS NULL OR lead_time_max_days >= 0),
  fulfillment_mode text NOT NULL DEFAULT 'stocked' CHECK (fulfillment_mode IN ('stocked','dropship','pod','made_to_order','made_to_measure')),
  ip_protection_level text NOT NULL DEFAULT 'standard',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (lead_time_min_days IS NULL OR lead_time_max_days IS NULL OR lead_time_min_days <= lead_time_max_days),
  UNIQUE (vendor_id, sku)
);
CREATE INDEX vendor_offers_product_idx ON public.vendor_offers(product_id);

CREATE TABLE public.product_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('cj','artisan','pod','manual','frass_brand')),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 1 AND 300),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_ref)
);
CREATE INDEX product_sources_product_idx ON public.product_sources(product_id);

-- Grants (authenticated only; nothing public in Phase A)
GRANT SELECT, INSERT, UPDATE ON public.vendor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.canonical_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_offers TO authenticated;
GRANT SELECT, INSERT ON public.product_sources TO authenticated;
GRANT ALL ON public.vendor_profiles, public.canonical_products, public.vendor_offers, public.product_sources TO service_role;

ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sources ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.owns_vendor(_vendor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.vendor_profiles WHERE id = _vendor_id AND owner_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.owns_canonical_product(_product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.canonical_products p JOIN public.vendor_profiles v ON v.id = p.vendor_id
    WHERE p.id = _product_id AND v.owner_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.owns_vendor(uuid), public.owns_canonical_product(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_vendor(uuid), public.owns_canonical_product(uuid) TO authenticated;

-- Policies
CREATE POLICY "Vendor owners read own profile; Founder reads all" ON public.vendor_profiles
  FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members create own vendor profile" ON public.vendor_profiles
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Vendor owners update own profile" ON public.vendor_profiles
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Vendor owners read own products; Founder reads all" ON public.canonical_products
  FOR SELECT TO authenticated USING (public.owns_vendor(vendor_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Vendor owners create products for own vendor" ON public.canonical_products
  FOR INSERT TO authenticated WITH CHECK (public.owns_vendor(vendor_id) AND created_by = auth.uid());
CREATE POLICY "Vendor owners edit own products" ON public.canonical_products
  FOR UPDATE TO authenticated USING (public.owns_vendor(vendor_id)) WITH CHECK (public.owns_vendor(vendor_id));

CREATE POLICY "Offer owners and Founder read offers" ON public.vendor_offers
  FOR SELECT TO authenticated USING (public.owns_vendor(vendor_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Vendor owners add offers to own products" ON public.vendor_offers
  FOR INSERT TO authenticated WITH CHECK (public.owns_vendor(vendor_id) AND public.owns_canonical_product(product_id));
CREATE POLICY "Vendor owners edit own offers" ON public.vendor_offers
  FOR UPDATE TO authenticated USING (public.owns_vendor(vendor_id)) WITH CHECK (public.owns_vendor(vendor_id) AND public.owns_canonical_product(product_id));
CREATE POLICY "Vendor owners remove own offers" ON public.vendor_offers
  FOR DELETE TO authenticated USING (public.owns_vendor(vendor_id));

CREATE POLICY "Product owners and Founder read sources" ON public.product_sources
  FOR SELECT TO authenticated USING (public.owns_canonical_product(product_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Product owners record sources" ON public.product_sources
  FOR INSERT TO authenticated WITH CHECK (public.owns_canonical_product(product_id) AND created_by = auth.uid());

-- Guard triggers: protected fields change only inside Founder decision functions.
CREATE OR REPLACE FUNCTION public.guard_vendor_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE in_decision boolean := coalesce(current_setting('frass.vendor_decision', true), '') = 'on';
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.verification_status := 'pending'; NEW.verified_by := NULL; NEW.verified_at := NULL;
  ELSE
    NEW.owner_id := OLD.owner_id;
    IF NOT (in_decision AND public.has_role(auth.uid(),'admin')) THEN
      NEW.verification_status := OLD.verification_status;
      NEW.verified_by := OLD.verified_by; NEW.verified_at := OLD.verified_at;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_vendor_profile BEFORE INSERT OR UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_vendor_profile();

CREATE OR REPLACE FUNCTION public.guard_canonical_product()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  in_decision boolean := coalesce(current_setting('frass.product_decision', true), '') = 'on'
                         AND public.has_role(auth.uid(),'admin');
  v_status text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.draft_status NOT IN ('draft','prepared') THEN
      RAISE EXCEPTION 'New products start as draft or prepared';
    END IF;
    NEW.publication_status := 'unpublished'; NEW.decided_by := NULL; NEW.decided_at := NULL;
  ELSE
    NEW.vendor_id := OLD.vendor_id; NEW.created_by := OLD.created_by; NEW.created_at := OLD.created_at;
    -- Publication is reserved for the future Shopify phase: nobody can change it now.
    IF NEW.publication_status IS DISTINCT FROM OLD.publication_status THEN
      RAISE EXCEPTION 'Publication status cannot be changed in this phase';
    END IF;
    IF NOT in_decision THEN
      NEW.decided_by := OLD.decided_by; NEW.decided_at := OLD.decided_at;
      IF OLD.draft_status IN ('approved','founder_review') AND NEW IS DISTINCT FROM OLD THEN
        RAISE EXCEPTION 'Products in Founder review or approved cannot be edited';
      END IF;
      IF NEW.draft_status IN ('approved','rejected') AND NEW.draft_status IS DISTINCT FROM OLD.draft_status THEN
        RAISE EXCEPTION 'Only the Founder decision can approve or reject';
      END IF;
      IF NEW.draft_status = 'founder_review' AND OLD.draft_status <> 'founder_review' THEN
        SELECT verification_status INTO v_status FROM public.vendor_profiles WHERE id = NEW.vendor_id;
        IF v_status IS DISTINCT FROM 'verified' THEN
          RAISE EXCEPTION 'Vendor must be verified before Founder review';
        END IF;
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_canonical_product BEFORE INSERT OR UPDATE ON public.canonical_products
  FOR EACH ROW EXECUTE FUNCTION public.guard_canonical_product();

-- Offers on approved/in-review products are frozen for vendors.
CREATE OR REPLACE FUNCTION public.guard_vendor_offer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s text;
BEGIN
  SELECT draft_status INTO s FROM public.canonical_products WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  IF s IN ('founder_review','approved') AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Offers are locked while the product is in review or approved';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_vendor_offer BEFORE INSERT OR UPDATE OR DELETE ON public.vendor_offers
  FOR EACH ROW EXECUTE FUNCTION public.guard_vendor_offer();

-- Founder decisions: status change + audit ledger entry in ONE transaction.
CREATE OR REPLACE FUNCTION public.founder_set_vendor_verification(_vendor_id uuid, _status text, _note text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); v record;
BEGIN
  IF uid IS NULL OR NOT public.has_role(uid,'admin') THEN RAISE EXCEPTION 'Founder access only'; END IF;
  IF _status NOT IN ('verified','suspended','pending') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  PERFORM set_config('frass.vendor_decision','on',true);
  UPDATE public.vendor_profiles SET verification_status = _status,
    verified_by = CASE WHEN _status = 'verified' THEN uid ELSE NULL END,
    verified_at = CASE WHEN _status = 'verified' THEN now() ELSE NULL END
  WHERE id = _vendor_id RETURNING id, display_name INTO v;
  PERFORM set_config('frass.vendor_decision','',true);
  IF v.id IS NULL THEN RAISE EXCEPTION 'Vendor not found'; END IF;
  INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
  VALUES (uid, 'vendor-verification:' || _vendor_id, 0, 'Vendor ' || _status || ': ' || v.display_name,
          '/admin/vendors', 'user', left('Vendor ' || _vendor_id || ' set to ' || _status || '. ' || coalesce(_note,''), 20000));
  RETURN jsonb_build_object('vendor_id', _vendor_id, 'status', _status);
END $$;

CREATE OR REPLACE FUNCTION public.founder_decide_product(_product_id uuid, _decision text, _note text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); p record;
BEGIN
  IF uid IS NULL OR NOT public.has_role(uid,'admin') THEN RAISE EXCEPTION 'Founder access only'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT cp.id, cp.title, cp.draft_status, vp.verification_status INTO p
    FROM public.canonical_products cp JOIN public.vendor_profiles vp ON vp.id = cp.vendor_id
    WHERE cp.id = _product_id FOR UPDATE OF cp;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Product not found'; END IF;
  IF p.draft_status <> 'founder_review' THEN RAISE EXCEPTION 'Product is not awaiting Founder review'; END IF;
  IF _decision = 'approved' AND p.verification_status <> 'verified' THEN RAISE EXCEPTION 'Vendor is not verified'; END IF;
  PERFORM set_config('frass.product_decision','on',true);
  UPDATE public.canonical_products SET draft_status = _decision, decided_by = uid, decided_at = now() WHERE id = _product_id;
  PERFORM set_config('frass.product_decision','',true);
  INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
  VALUES (uid, 'product-decision:' || _product_id, 0, 'Product ' || _decision || ': ' || p.title,
          '/admin/products', 'user', left('Product ' || _product_id || ' ' || _decision || '. ' || coalesce(_note,''), 20000));
  RETURN jsonb_build_object('product_id', _product_id, 'draft_status', _decision);
END $$;

REVOKE EXECUTE ON FUNCTION public.founder_set_vendor_verification(uuid,text,text), public.founder_decide_product(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_set_vendor_verification(uuid,text,text), public.founder_decide_product(uuid,text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_vendor_profile(), public.guard_canonical_product(), public.guard_vendor_offer() FROM PUBLIC, anon, authenticated;