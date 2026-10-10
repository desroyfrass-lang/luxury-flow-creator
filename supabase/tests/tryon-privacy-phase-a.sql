-- Phase A try-on privacy: owner-only access to customer photos and results.
-- Run inside a transaction; everything is rolled back.
BEGIN;
DO $$
DECLARE
  owner_id uuid;
  other_id uuid;
  admin_id uuid;
  n int;
BEGIN
  -- Policies: only owner policies remain.
  SELECT count(*) INTO n FROM pg_policies
   WHERE tablename IN ('customer_photos','tryon_looks') AND qual ILIKE '%has_role%';
  IF n <> 0 THEN RAISE EXCEPTION 'admin read policy still present'; END IF;

  -- Uses an existing photo owner; inserts a temporary look (rolled back).
  SELECT user_id INTO owner_id FROM public.customer_photos LIMIT 1;
  IF owner_id IS NULL THEN RAISE NOTICE 'no customer photo to test with; skipped'; RETURN; END IF;
  SELECT user_id INTO admin_id FROM public.user_roles WHERE role='admin' LIMIT 1;
  SELECT id INTO other_id FROM public.profiles WHERE id<>owner_id AND id IS DISTINCT FROM admin_id LIMIT 1;
  INSERT INTO public.tryon_looks (user_id, source_photo_url, cart_items, status) VALUES (owner_id, 'x', '[]', 'ready');
  -- A plain member's temporary photo and look, to prove admins cannot read them.
  INSERT INTO public.customer_photos (user_id, image_url) VALUES (other_id, 'member-x');
  INSERT INTO public.tryon_looks (user_id, source_photo_url, cart_items, status) VALUES (other_id, 'member-x', '[]', 'ready');

  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM public.customer_photos; IF n < 1 THEN RAISE EXCEPTION 'owner cannot see own photo'; END IF;
  SELECT count(*) INTO n FROM public.tryon_looks; IF n < 1 THEN RAISE EXCEPTION 'owner cannot see own look'; END IF;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', other_id, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM public.customer_photos WHERE user_id = owner_id; IF n <> 0 THEN RAISE EXCEPTION 'cross-account photo leak'; END IF;
  SELECT count(*) INTO n FROM public.tryon_looks WHERE user_id = owner_id; IF n <> 0 THEN RAISE EXCEPTION 'cross-account look leak'; END IF;
  IF admin_id IS NOT NULL THEN
    PERFORM set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role','authenticated')::text, true);
    SELECT count(*) INTO n FROM public.customer_photos WHERE user_id = other_id; IF n <> 0 THEN RAISE EXCEPTION 'admin can still see customer photo'; END IF;
    SELECT count(*) INTO n FROM public.tryon_looks WHERE user_id = other_id; IF n <> 0 THEN RAISE EXCEPTION 'admin can still see customer look'; END IF;
  END IF;
  RAISE NOTICE 'tryon privacy phase A: PASS';
END $$;
ROLLBACK;
