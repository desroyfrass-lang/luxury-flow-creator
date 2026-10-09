-- Restriction rules R2 — RLS, role-spoofing and approval behaviour test.
-- Always ends with RAISE EXCEPTION so every write is rolled back.
DO $test$
DECLARE
  founder uuid := (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1);
  stranger uuid := gen_random_uuid();
  rid uuid; s text; n int;
  res text[] := '{}';
BEGIN
  PERFORM set_config('role', 'authenticated', true);

  -- Non-admin cannot read or write
  PERFORM set_config('request.jwt.claims', json_build_object('sub', stranger, 'role','authenticated')::text, true);
  SELECT count(*) INTO n FROM public.restriction_rules; res := res || ('stranger-read-zero=' || (n = 0));
  BEGIN
    INSERT INTO public.restriction_rules(target_level,target_ref,country,effect,reason) VALUES ('listing','x','JM','allow','verified_permitted');
    res := res || 'stranger-insert-blocked=false'::text;
  EXCEPTION WHEN insufficient_privilege THEN res := res || 'stranger-insert-blocked=true'::text; END;
  BEGIN
    PERFORM public.founder_decide_restriction_rule(gen_random_uuid(), 'approved', '');
    res := res || 'stranger-decide-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'stranger-decide-blocked=true'::text; END;

  -- Founder drafts a rule trying to self-approve via insert
  PERFORM set_config('request.jwt.claims', json_build_object('sub', founder, 'role','authenticated')::text, true);
  INSERT INTO public.restriction_rules(target_level,target_ref,country,effect,reason,approval,approved_by)
    VALUES ('listing','test-ref','JM','allow','verified_permitted','approved',founder) RETURNING id, approval INTO rid, s;
  res := res || ('insert-approval-forced-pending=' || (s = 'pending'));
  UPDATE public.restriction_rules SET approval = 'approved' WHERE id = rid;
  SELECT approval INTO s FROM public.restriction_rules WHERE id = rid;
  res := res || ('direct-update-approval-blocked=' || (s = 'pending'));

  BEGIN
    PERFORM public.founder_decide_restriction_rule(rid, 'approved', 'no evidence');
    res := res || 'approval-without-evidence-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'approval-without-evidence-blocked=true'::text; END;

  UPDATE public.restriction_rules SET evidence_source='Test', evidence_reference='doc', verified_at=now() WHERE id = rid;
  PERFORM public.founder_decide_restriction_rule(rid, 'approved', 'test');
  SELECT approval INTO s FROM public.restriction_rules WHERE id = rid;
  res := res || ('founder-approval-works=' || (s = 'approved'));
  SELECT count(*) INTO n FROM public.founder_audit_ledger WHERE card_key = 'restriction-decision:' || rid;
  res := res || ('audit-written=' || (n = 1));

  UPDATE public.restriction_rules SET country = 'US' WHERE id = rid;
  SELECT approval INTO s FROM public.restriction_rules WHERE id = rid;
  res := res || ('edit-resets-approval=' || (s = 'pending'));
  SELECT count(*) INTO n FROM public.restriction_rule_history WHERE rule_id = rid;
  res := res || ('history-rows=' || n);

  -- Anonymous cannot read
  PERFORM set_config('role', 'anon', true);
  BEGIN
    SELECT count(*) INTO n FROM public.restriction_rules;
    res := res || 'anon-read-blocked=false'::text;
  EXCEPTION WHEN insufficient_privilege THEN res := res || 'anon-read-blocked=true'::text; END;

  RAISE EXCEPTION 'TEST RESULTS: %', array_to_string(res, ' | ');
END $test$;
