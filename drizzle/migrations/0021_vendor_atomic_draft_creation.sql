-- Atomic draft creation: product + source (+ optional offer) succeed or fail together.
-- SECURITY INVOKER so every insert still passes the caller's row rules and guard triggers.
CREATE OR REPLACE FUNCTION public.create_product_draft(
  _vendor_id uuid, _title text, _description text, _source_type text, _source_ref text, _offer jsonb DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); pid uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  INSERT INTO public.canonical_products(vendor_id, created_by, title, description)
    VALUES (_vendor_id, uid, _title, coalesce(_description, '')) RETURNING id INTO pid;
  INSERT INTO public.product_sources(product_id, source_type, source_ref, created_by)
    VALUES (pid, _source_type, _source_ref, uid);
  IF _offer IS NOT NULL THEN
    INSERT INTO public.vendor_offers(product_id, vendor_id, sku, unit_cost, currency, stock_quantity,
      lead_time_min_days, lead_time_max_days, fulfillment_mode, ip_protection_level)
    VALUES (pid, _vendor_id, _offer->>'sku', (_offer->>'unit_cost')::numeric, coalesce(_offer->>'currency','USD'),
      (_offer->>'stock_quantity')::int, (_offer->>'lead_time_min_days')::int, (_offer->>'lead_time_max_days')::int,
      coalesce(_offer->>'fulfillment_mode','stocked'), coalesce(_offer->>'ip_protection_level','standard'));
  END IF;
  RETURN pid;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_product_draft(uuid,text,text,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_product_draft(uuid,text,text,text,text,jsonb) TO authenticated;