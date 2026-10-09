-- Universal Vendor Phase A — RLS + Founder approval behaviour test.
-- One DO block that ALWAYS ends with RAISE EXCEPTION, so every write is rolled
-- back atomically; the results are reported in the exception message.
DO $test$
DECLARE
  founder uuid := (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1);
  tester  uuid := (SELECT user_id FROM public.user_roles WHERE role = 'tester' LIMIT 1);
  vend    uuid := gen_random_uuid();
  other   uuid := gen_random_uuid();
  v_id uuid; p_id uuid; n int; s text;
  res text[] := '{}';
BEGIN
  -- helper: act as a signed-in user
  PERFORM set_config('role', 'authenticated', true);

  -- 1 vendor creates profile trying to self-verify
  PERFORM set_config('request.jwt.claims', json_build_object('sub', vend, 'role','authenticated')::text, true);
  INSERT INTO public.vendor_profiles(owner_id, display_name, verification_status)
    VALUES (vend, 'Test Bag Maker', 'verified') RETURNING id, verification_status INTO v_id, s;
  res := res || ('self-verify-insert-blocked=' || (s = 'pending'));
  UPDATE public.vendor_profiles SET verification_status = 'verified' WHERE id = v_id;
  SELECT verification_status INTO s FROM public.vendor_profiles WHERE id = v_id;
  res := res || ('self-verify-update-blocked=' || (s = 'pending'));

  INSERT INTO public.canonical_products(vendor_id, created_by, title) VALUES (v_id, vend, 'Test Leather Tote') RETURNING id INTO p_id;
  INSERT INTO public.vendor_offers(product_id, vendor_id, sku, unit_cost, fulfillment_mode, lead_time_min_days, lead_time_max_days)
    VALUES (p_id, v_id, 'TOTE-1', 42.00, 'made_to_order', 14, 21);
  INSERT INTO public.product_sources(product_id, source_type, source_ref, created_by) VALUES (p_id, 'artisan', 'test-tote-ref', vend);

  BEGIN
    INSERT INTO public.product_sources(product_id, source_type, source_ref, created_by) VALUES (p_id, 'artisan', 'test-tote-ref', vend);
    res := res || 'duplicate-source-rejected=false'::text;
  EXCEPTION WHEN unique_violation THEN res := res || 'duplicate-source-rejected=true'::text; END;

  BEGIN
    UPDATE public.canonical_products SET draft_status = 'founder_review' WHERE id = p_id;
    res := res || 'unverified-vendor-blocked-from-review=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'unverified-vendor-blocked-from-review=true'::text; END;

  BEGIN
    UPDATE public.canonical_products SET draft_status = 'approved' WHERE id = p_id;
    res := res || 'vendor-cannot-approve=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'vendor-cannot-approve=true'::text; END;

  BEGIN
    UPDATE public.canonical_products SET publication_status = 'published' WHERE id = p_id;
    res := res || 'vendor-cannot-publish=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'vendor-cannot-publish=true'::text; END;

  BEGIN
    PERFORM public.founder_decide_product(p_id, 'approved', '');
    res := res || 'vendor-cannot-call-founder-decision=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'vendor-cannot-call-founder-decision=true'::text; END;

  -- 2 other member and tester see nothing
  PERFORM set_config('request.jwt.claims', json_build_object('sub', other, 'role','authenticated')::text, true);
  SELECT (SELECT count(*) FROM public.canonical_products WHERE id = p_id)
       + (SELECT count(*) FROM public.vendor_offers WHERE product_id = p_id)
       + (SELECT count(*) FROM public.product_sources WHERE product_id = p_id)
       + (SELECT count(*) FROM public.vendor_profiles WHERE id = v_id) INTO n;
  res := res || ('other-member-sees-nothing=' || (n = 0));
  PERFORM set_config('request.jwt.claims', json_build_object('sub', tester, 'role','authenticated')::text, true);
  SELECT (SELECT count(*) FROM public.canonical_products WHERE id = p_id)
       + (SELECT count(*) FROM public.vendor_offers WHERE product_id = p_id) INTO n;
  res := res || ('tester-sees-nothing=' || (n = 0));
  BEGIN
    PERFORM public.founder_set_vendor_verification(v_id, 'verified', '');
    res := res || 'tester-cannot-verify-vendor=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'tester-cannot-verify-vendor=true'::text; END;

  -- 3 Founder verifies vendor -> ledger
  PERFORM set_config('request.jwt.claims', json_build_object('sub', founder, 'role','authenticated')::text, true);
  PERFORM public.founder_set_vendor_verification(v_id, 'verified', 'phase A test');
  SELECT count(*) INTO n FROM public.founder_audit_ledger WHERE card_key = 'vendor-verification:' || v_id;
  res := res || ('founder-verification-writes-ledger=' || (n = 1));

  -- 4 vendor submits; offers locked
  PERFORM set_config('request.jwt.claims', json_build_object('sub', vend, 'role','authenticated')::text, true);
  UPDATE public.canonical_products SET draft_status = 'founder_review' WHERE id = p_id;
  BEGIN
    UPDATE public.vendor_offers SET unit_cost = 1 WHERE product_id = p_id;
    res := res || 'offers-locked-during-review=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'offers-locked-during-review=true'::text; END;

  -- 5 Founder approves atomically; stays unpublished
  PERFORM set_config('request.jwt.claims', json_build_object('sub', founder, 'role','authenticated')::text, true);
  PERFORM public.founder_decide_product(p_id, 'approved', 'phase A test');
  SELECT count(*) INTO n FROM public.founder_audit_ledger WHERE card_key = 'product-decision:' || p_id;
  SELECT draft_status || '/' || publication_status INTO s FROM public.canonical_products WHERE id = p_id;
  res := res || ('founder-approval-with-ledger-unpublished=' || (n = 1 AND s = 'approved/unpublished'));

  -- 6 anonymous visitors: no table privilege
  PERFORM set_config('role', 'anon', true);
  BEGIN
    PERFORM 1 FROM public.canonical_products LIMIT 1;
    res := res || 'anon-no-access=false'::text;
  EXCEPTION WHEN insufficient_privilege THEN res := res || 'anon-no-access=true'::text; END;

  RAISE EXCEPTION 'PHASE_A_RESULTS total=% failures=% :: %',
    array_length(res, 1),
    (SELECT count(*) FROM unnest(res) x WHERE x LIKE '%=false'),
    array_to_string(res, ' | ');
END
$test$;
