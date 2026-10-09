-- Universal Vendor Phase A — RLS + approval behaviour test.
-- Runs entirely inside one transaction and ROLLS BACK: nothing is kept.
-- Usage: psql -v ON_ERROR_STOP=1 -f supabase/tests/universal-vendor-phase-a.sql
BEGIN;

CREATE TEMP TABLE t_results(name text, ok boolean) ON COMMIT DROP;
GRANT ALL ON t_results TO authenticated, anon;

-- Founder = an existing admin; tester = an existing tester; vendor/other = fake ids.
CREATE TEMP TABLE t_ids ON COMMIT DROP AS SELECT
  (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1) AS founder,
  (SELECT user_id FROM public.user_roles WHERE role = 'tester' LIMIT 1) AS tester,
  gen_random_uuid() AS vendor_user,
  gen_random_uuid() AS other_user;
GRANT SELECT ON t_ids TO authenticated;

CREATE OR REPLACE FUNCTION pg_temp.act_as(_uid uuid) RETURNS void LANGUAGE sql AS $$
  SELECT set_config('request.jwt.claims', json_build_object('sub', _uid, 'role', 'authenticated')::text, true);
$$;

SET LOCAL ROLE authenticated;

-- Vendor creates profile (status forced to pending) and a draft product.
SELECT pg_temp.act_as(vendor_user) FROM t_ids;
INSERT INTO public.vendor_profiles(owner_id, display_name, verification_status)
  SELECT vendor_user, 'Test Bag Maker', 'verified' FROM t_ids;
INSERT INTO t_results SELECT 'vendor cannot self-verify on insert',
  (SELECT verification_status FROM public.vendor_profiles WHERE display_name = 'Test Bag Maker') = 'pending';

UPDATE public.vendor_profiles SET verification_status = 'verified' WHERE display_name = 'Test Bag Maker';
INSERT INTO t_results SELECT 'vendor cannot self-verify on update',
  (SELECT verification_status FROM public.vendor_profiles WHERE display_name = 'Test Bag Maker') = 'pending';

INSERT INTO public.canonical_products(vendor_id, created_by, title)
  SELECT v.id, i.vendor_user, 'Test Leather Tote' FROM public.vendor_profiles v, t_ids i WHERE v.display_name = 'Test Bag Maker';
INSERT INTO public.vendor_offers(product_id, vendor_id, sku, unit_cost, fulfillment_mode, lead_time_min_days, lead_time_max_days)
  SELECT p.id, p.vendor_id, 'TOTE-1', 42.00, 'made_to_order', 14, 21 FROM public.canonical_products p WHERE p.title = 'Test Leather Tote';
INSERT INTO public.product_sources(product_id, source_type, source_ref, created_by)
  SELECT p.id, 'artisan', 'test-tote-ref', i.vendor_user FROM public.canonical_products p, t_ids i WHERE p.title = 'Test Leather Tote';

-- Duplicate source rejected.
DO $$ BEGIN
  INSERT INTO public.product_sources(product_id, source_type, source_ref, created_by)
    SELECT p.id, 'artisan', 'test-tote-ref', i.vendor_user FROM public.canonical_products p, t_ids i WHERE p.title = 'Test Leather Tote';
  INSERT INTO t_results VALUES ('duplicate source rejected', false);
EXCEPTION WHEN unique_violation THEN INSERT INTO t_results VALUES ('duplicate source rejected', true); END $$;

-- Unverified vendor cannot submit for review.
DO $$ BEGIN
  UPDATE public.canonical_products SET draft_status = 'founder_review' WHERE title = 'Test Leather Tote';
  INSERT INTO t_results VALUES ('unverified vendor blocked from review', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO t_results VALUES ('unverified vendor blocked from review', true); END $$;

-- Vendor cannot approve, cannot publish.
DO $$ BEGIN
  UPDATE public.canonical_products SET draft_status = 'approved' WHERE title = 'Test Leather Tote';
  INSERT INTO t_results VALUES ('vendor cannot approve', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO t_results VALUES ('vendor cannot approve', true); END $$;
DO $$ BEGIN
  UPDATE public.canonical_products SET publication_status = 'published' WHERE title = 'Test Leather Tote';
  INSERT INTO t_results VALUES ('vendor cannot publish', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO t_results VALUES ('vendor cannot publish', true); END $$;
DO $$ BEGIN
  PERFORM public.founder_decide_product((SELECT id FROM public.canonical_products WHERE title = 'Test Leather Tote'), 'approved', '');
  INSERT INTO t_results VALUES ('vendor cannot call Founder decision', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO t_results VALUES ('vendor cannot call Founder decision', true); END $$;

-- Other vendor / tester see nothing (no cost leakage).
SELECT pg_temp.act_as(other_user) FROM t_ids;
INSERT INTO t_results SELECT 'other member sees no products/offers/sources',
  (SELECT count(*) FROM public.canonical_products WHERE title = 'Test Leather Tote') = 0
  AND (SELECT count(*) FROM public.vendor_offers WHERE sku = 'TOTE-1') = 0
  AND (SELECT count(*) FROM public.product_sources WHERE source_ref = 'test-tote-ref') = 0;
SELECT pg_temp.act_as(tester) FROM t_ids;
INSERT INTO t_results SELECT 'tester sees no products/offers',
  (SELECT count(*) FROM public.canonical_products WHERE title = 'Test Leather Tote') = 0
  AND (SELECT count(*) FROM public.vendor_offers WHERE sku = 'TOTE-1') = 0;

-- Founder verifies vendor (ledger entry atomically).
SELECT pg_temp.act_as(founder) FROM t_ids;
SELECT public.founder_set_vendor_verification((SELECT id FROM public.vendor_profiles WHERE display_name = 'Test Bag Maker'), 'verified', 'test');
INSERT INTO t_results SELECT 'Founder verification writes ledger',
  (SELECT count(*) FROM public.founder_audit_ledger l, public.vendor_profiles v
     WHERE v.display_name = 'Test Bag Maker' AND l.card_key = 'vendor-verification:' || v.id) = 1;

-- Vendor submits for review; offers then locked.
SELECT pg_temp.act_as(vendor_user) FROM t_ids;
UPDATE public.canonical_products SET draft_status = 'founder_review' WHERE title = 'Test Leather Tote';
DO $$ BEGIN
  UPDATE public.vendor_offers SET unit_cost = 1 WHERE sku = 'TOTE-1';
  INSERT INTO t_results VALUES ('offers locked during review', false);
EXCEPTION WHEN raise_exception THEN INSERT INTO t_results VALUES ('offers locked during review', true); END $$;

-- Founder approves; ledger entry; still unpublished.
SELECT pg_temp.act_as(founder) FROM t_ids;
SELECT public.founder_decide_product((SELECT id FROM public.canonical_products WHERE title = 'Test Leather Tote'), 'approved', 'test');
INSERT INTO t_results SELECT 'Founder approval atomic with ledger and stays unpublished',
  (SELECT draft_status = 'approved' AND publication_status = 'unpublished' FROM public.canonical_products WHERE title = 'Test Leather Tote')
  AND (SELECT count(*) FROM public.founder_audit_ledger l, public.canonical_products p
         WHERE p.title = 'Test Leather Tote' AND l.card_key = 'product-decision:' || p.id) = 1;

-- Anonymous visitors have no table access at all.
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  PERFORM 1 FROM public.canonical_products LIMIT 1;
  INSERT INTO t_results VALUES ('anon has no access', false);
EXCEPTION WHEN insufficient_privilege THEN INSERT INTO t_results VALUES ('anon has no access', true); END $$;
RESET ROLE;

SELECT name, ok FROM t_results ORDER BY name;
SELECT CASE WHEN bool_and(ok) AND count(*) = 14 THEN 'ALL PASS' ELSE 'FAILURES' END AS summary FROM t_results;
ROLLBACK;
