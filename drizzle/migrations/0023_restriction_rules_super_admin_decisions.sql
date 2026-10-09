CREATE OR REPLACE FUNCTION public.founder_decide_restriction_rule(_rule_id uuid, _decision text, _note text DEFAULT ''::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE uid uuid := auth.uid(); r record;
BEGIN
  -- Final approval/rejection is Founder (super_admin) only. Ordinary admins may draft.
  IF uid IS NULL OR NOT public.has_role(uid, 'super_admin') THEN RAISE EXCEPTION 'Founder access only'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT * INTO r FROM public.restriction_rules WHERE id = _rule_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Rule not found'; END IF;
  IF _decision = 'approved' THEN
    IF length(btrim(coalesce(r.evidence_source,''))) < 3 OR length(btrim(coalesce(r.evidence_reference,''))) < 3 OR r.verified_at IS NULL THEN
      RAISE EXCEPTION 'Evidence source, reference and verified date are required before approval';
    END IF;
    IF r.verified_at > now() THEN RAISE EXCEPTION 'Verified date cannot be in the future'; END IF;
    IF r.reason = 'age_gated' AND (r.min_age IS NULL OR r.min_age <= 0) THEN RAISE EXCEPTION 'Age rules need a minimum age'; END IF;
    IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN RAISE EXCEPTION 'Rule has already expired'; END IF;
  END IF;
  PERFORM set_config('frass.restriction_decision','on',true);
  UPDATE public.restriction_rules SET approval = _decision, approved_by = uid, approved_at = now() WHERE id = _rule_id;
  PERFORM set_config('frass.restriction_decision','',true);
  INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
  VALUES (uid, 'restriction-decision:' || _rule_id, 0,
          'Restriction rule ' || _decision || ': ' || r.country || ' ' || r.target_level || ' ' || r.reason,
          '/control-room', 'user',
          left('Restriction rule ' || _rule_id || ' ' || _decision || '. ' || coalesce(_note,''), 20000));
  RETURN jsonb_build_object('rule_id', _rule_id, 'approval', _decision);
END $function$;

CREATE OR REPLACE FUNCTION public.guard_restriction_rule()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE in_decision boolean := coalesce(current_setting('frass.restriction_decision', true), '') = 'on'
                               AND public.has_role(auth.uid(), 'super_admin');
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.approval := 'pending'; NEW.approved_by := NULL; NEW.approved_at := NULL;
    NEW.created_by := coalesce(auth.uid(), NEW.created_by);
  ELSE
    NEW.id := OLD.id; NEW.created_by := OLD.created_by; NEW.created_at := OLD.created_at;
    IF NOT in_decision THEN
      NEW.approval := OLD.approval; NEW.approved_by := OLD.approved_by; NEW.approved_at := OLD.approved_at;
      IF (NEW.target_level, NEW.target_ref, NEW.country, NEW.subdivision, NEW.effect, NEW.reason, NEW.applies_to,
          NEW.min_age, NEW.evidence_source, NEW.evidence_reference, NEW.verified_at, NEW.expires_at)
         IS DISTINCT FROM
         (OLD.target_level, OLD.target_ref, OLD.country, OLD.subdivision, OLD.effect, OLD.reason, OLD.applies_to,
          OLD.min_age, OLD.evidence_source, OLD.evidence_reference, OLD.verified_at, OLD.expires_at) THEN
        NEW.approval := 'pending'; NEW.approved_by := NULL; NEW.approved_at := NULL;
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $function$;

DROP POLICY IF EXISTS "Founder reads restriction rules" ON public.restriction_rules;
DROP POLICY IF EXISTS "Founder drafts restriction rules" ON public.restriction_rules;
DROP POLICY IF EXISTS "Founder edits restriction rules" ON public.restriction_rules;
DROP POLICY IF EXISTS "Founder reads restriction history" ON public.restriction_rule_history;

CREATE POLICY "Founder reads restriction rules" ON public.restriction_rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Founder drafts restriction rules" ON public.restriction_rules FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')) AND created_by = auth.uid());
CREATE POLICY "Founder edits restriction rules" ON public.restriction_rules FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Founder reads restriction history" ON public.restriction_rule_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.restriction_rule_history FROM anon, authenticated;
REVOKE DELETE, TRUNCATE ON public.restriction_rules FROM anon, authenticated;
REVOKE ALL ON public.restriction_rules, public.restriction_rule_history FROM anon;