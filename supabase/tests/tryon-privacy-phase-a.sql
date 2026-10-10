-- Phase A try-on privacy: owner-only access to customer photos and results.
-- Run inside a transaction; everything is rolled back.
BEGIN;
DO $$
DECLARE
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  n int;
BEGIN
  -- Policies: only owner policies remain.
  SELECT count(*) INTO n FROM pg_policies
   WHERE tablename IN ('customer_photos','tryon_looks') AND qual ILIKE '%has_role%';
  IF n <> 0 THEN RAISE EXCEPTION 'admin read policy still present'; END IF;

  INSERT INTO auth.users (id, email) VALUES (owner_id, owner_id||'@t.test'), (other_id, other_id||'@t.test');
  INSERT INTO public.customer_photos (user_id, image_url) VALUES (owner_id, 'x');
  INSERT INTO public.tryon_looks (user_id, source_photo_url, cart_items, status) VALUES (owner_id, 'x', '[]', 'ready');

  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM public.customer_photos; IF n <> 1 THEN RAISE EXCEPTION 'owner cannot see own photo'; END IF;
  SELECT count(*) INTO n FROM public.tryon_looks; IF n <> 1 THEN RAISE EXCEPTION 'owner cannot see own look'; END IF;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', other_id, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM public.customer_photos; IF n <> 0 THEN RAISE EXCEPTION 'cross-account photo leak'; END IF;
  SELECT count(*) INTO n FROM public.tryon_looks; IF n <> 0 THEN RAISE EXCEPTION 'cross-account look leak'; END IF;
  RAISE NOTICE 'tryon privacy phase A: PASS';
END $$;
ROLLBACK;
