-- Roles & Access Step 1 test. Ends with RAISE EXCEPTION so every write rolls back.
DO $test$
DECLARE
  adm uuid := (SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_roles) ORDER BY id LIMIT 1);
  sup uuid := (SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_roles) ORDER BY id OFFSET 1 LIMIT 1);
  tgt uuid := (SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_roles) ORDER BY id OFFSET 2 LIMIT 1);
  res text[] := '{}'; n int;
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (adm,'admin'), (sup,'super_admin');
  PERFORM set_config('role','authenticated',true);

  PERFORM set_config('request.jwt.claims', json_build_object('sub',adm,'role','authenticated')::text, true);
  BEGIN PERFORM public.founder_set_role(adm,'super_admin',true,''); res := res||'admin-self-elevate-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'admin-self-elevate-blocked=true'::text; END;
  BEGIN PERFORM public.founder_set_role(tgt,'admin',true,''); res := res||'admin-grant-admin-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'admin-grant-admin-blocked=true'::text; END;
  BEGIN PERFORM public.founder_set_role(sup,'super_admin',false,''); res := res||'admin-revoke-super-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'admin-revoke-super-blocked=true'::text; END;
  PERFORM public.founder_set_role(tgt,'tester',true,'');

  PERFORM set_config('request.jwt.claims', json_build_object('sub',tgt,'role','authenticated')::text, true);
  BEGIN PERFORM public.founder_set_role(tgt,'admin',true,''); res := res||'member-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'member-blocked=true'::text; END;

  PERFORM set_config('request.jwt.claims', json_build_object('sub',sup,'role','authenticated')::text, true);
  BEGIN PERFORM public.founder_set_role(sup,'super_admin',false,''); res := res||'last-super-protected=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'last-super-protected=true'::text; END;
  PERFORM public.founder_set_role(tgt,'admin',true,'');

  PERFORM set_config('role','service_role',true);
  BEGIN INSERT INTO public.user_roles(user_id,role) VALUES (tgt,'super_admin'); res := res||'service-direct-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'service-direct-blocked=true'::text; END;

  BEGIN DELETE FROM public.user_roles WHERE user_id=sup AND role='super_admin'; res := res||'service-delete-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res||'service-delete-blocked=true'::text; END;
  PERFORM set_config('role','postgres',true);
  res := res||('admin-lower-role-ok='||EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=tgt AND role='tester'));
  res := res||('super-grant-admin-ok='||EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=tgt AND role='admin'));
  SELECT count(*) INTO n FROM public.founder_audit_ledger WHERE card_key LIKE 'role-change:'||tgt||'%';
  res := res||('audit-rows='||n);
  RAISE EXCEPTION 'RESULT %', res;
END $test$;
