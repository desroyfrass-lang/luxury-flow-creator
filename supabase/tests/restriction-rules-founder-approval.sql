-- Founder-only approval test. Ends with RAISE EXCEPTION so everything rolls back.
DO $test$
DECLARE
  adm uuid := (SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin','super_admin')) ORDER BY id LIMIT 1);
  fdr uuid := (SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin','super_admin')) ORDER BY id OFFSET 1 LIMIT 1);
  rid uuid; s text; n int; res text[] := '{}';
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (adm, 'admin'), (fdr, 'super_admin');
  PERFORM set_config('role', 'authenticated', true);

  -- Ordinary admin drafts
  PERFORM set_config('request.jwt.claims', json_build_object('sub', adm, 'role','authenticated')::text, true);
  INSERT INTO public.restriction_rules(target_level,target_ref,country,effect,reason,evidence_source,evidence_reference,verified_at,created_by)
    VALUES ('listing','t','JM','prohibit','legal_prohibition','Test Act','s.1', now() - interval '1 day', adm) RETURNING id INTO rid;
  res := res || 'admin-draft=true'::text;
  BEGIN PERFORM public.founder_decide_restriction_rule(rid,'approved','');
    res := res || 'admin-approve-blocked=false'::text;
  EXCEPTION WHEN raise_exception THEN res := res || 'admin-approve-blocked=true'::text; END;
  -- Spoof via session flag
  PERFORM set_config('frass.restriction_decision','on',true);
  UPDATE public.restriction_rules SET approval='approved', approved_by=adm WHERE id=rid;
  PERFORM set_config('frass.restriction_decision','',true);
  SELECT approval INTO s FROM public.restriction_rules WHERE id=rid; res := res || ('admin-spoof-blocked=' || (s='pending'));
  BEGIN INSERT INTO public.restriction_rule_history(rule_id,action,snapshot) VALUES (rid,'fake','{}');
    res := res || 'history-insert-blocked=false'::text;
  EXCEPTION WHEN insufficient_privilege THEN res := res || 'history-insert-blocked=true'::text; END;
  BEGIN DELETE FROM public.restriction_rule_history WHERE rule_id=rid;
    res := res || 'history-delete-blocked=false'::text;
  EXCEPTION WHEN insufficient_privilege THEN res := res || 'history-delete-blocked=true'::text; END;

  -- Founder approves
  PERFORM set_config('request.jwt.claims', json_build_object('sub', fdr, 'role','authenticated')::text, true);
  PERFORM public.founder_decide_restriction_rule(rid,'approved','ok');
  SELECT approval INTO s FROM public.restriction_rules WHERE id=rid; res := res || ('founder-approve=' || (s='approved'));
  -- Edit resets approval
  PERFORM set_config('request.jwt.claims', json_build_object('sub', adm, 'role','authenticated')::text, true);
  UPDATE public.restriction_rules SET evidence_reference='s.2' WHERE id=rid;
  SELECT approval INTO s FROM public.restriction_rules WHERE id=rid; res := res || ('edit-resets=' || (s='pending'));
  PERFORM set_config('role', 'postgres', true);
  SELECT count(*) INTO n FROM public.restriction_rule_history WHERE rule_id=rid; res := res || ('history-rows=' || n);
  SELECT count(*) INTO n FROM public.founder_audit_ledger WHERE card_key='restriction-decision:'||rid; res := res || ('ledger-rows=' || n);
  RAISE EXCEPTION 'RESULT %', res;
END $test$;
